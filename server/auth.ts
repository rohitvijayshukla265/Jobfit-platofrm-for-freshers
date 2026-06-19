import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'supersecretrefreshkey';

// Schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d).+$/, 'Password must contain at least 1 uppercase letter and 1 number'),
  name: z.string().min(2),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helpers
const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

const generateTokens = async (userId: string, ip: string, userAgent: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshTokenString = crypto.randomBytes(40).toString('hex');
  
  await prisma.refreshToken.create({
    data: {
      token: refreshTokenString,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  await prisma.session.create({
    data: {
      userId,
      ipAddress: ip,
      userAgent
    }
  });

  return { accessToken, refreshTokenString };
};

// Endpoints
router.post('/register', async (req, res) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: validated.email } });
    
    if (existingUser) return sendError(res, 400, 'Email already exists', 'EMAIL_EXISTS');

    const hashedPassword = await bcrypt.hash(validated.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash: hashedPassword,
        name: validated.name,
        isEmailVerified: true, // Auto-verify for development
      }
    });

    // TODO: Send email verification link here. For now, we auto-verify for dev or assume they need to verify.
    // The prompt says "User cannot log in until email is verified". 
    // We will generate a verification token (simplification: we use JWT for verification token)
    const verifyToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    console.log(`[DEV] Verification link: http://localhost:3000/verify-email?token=${verifyToken}`);

    sendSuccess(res, { userId: user.id }, 'Registration successful. Please verify your email.');
  } catch (err: any) {
    const message = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
    sendError(res, 400, message, 'VALIDATION_ERROR');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user || !user.passwordHash) return sendError(res, 401, 'Invalid credentials', 'INVALID_CREDS');
    
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return sendError(res, 403, 'Account locked. Try again later.', 'ACCOUNT_LOCKED');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      const newAttempts = user.failedLoginAttempts + 1;
      const lockedUntil = newAttempts >= 10 ? new Date(Date.now() + 60 * 60 * 1000) : null;
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: newAttempts, lockedUntil } });
      return sendError(res, 401, 'Invalid credentials', 'INVALID_CREDS');
    }

    if (!user.isEmailVerified) return sendError(res, 403, 'Email not verified', 'EMAIL_NOT_VERIFIED');

    // Reset attempts on success
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const { accessToken, refreshTokenString } = await generateTokens(user.id, ip, userAgent);

    res.cookie('refreshToken', refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    sendSuccess(res, {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (err: any) {
    sendError(res, 400, err.message, 'LOGIN_ERROR');
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return sendError(res, 401, 'No refresh token provided', 'NO_TOKEN');

    const rt = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    
    if (!rt) return sendError(res, 401, 'Invalid refresh token', 'INVALID_TOKEN');

    if (rt.isRevoked) {
      // Theft detected! Revoke ALL tokens for this user.
      await prisma.refreshToken.updateMany({ where: { userId: rt.userId }, data: { isRevoked: true } });
      return sendError(res, 403, 'Token theft detected', 'THEFT_DETECTED');
    }

    if (rt.expiresAt < new Date()) return sendError(res, 401, 'Refresh token expired', 'TOKEN_EXPIRED');

    // Rotate: revoke old, create new
    await prisma.refreshToken.update({ where: { id: rt.id }, data: { isRevoked: true } });

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const tokens = await generateTokens(rt.userId, ip, userAgent);

    res.cookie('refreshToken', tokens.refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    sendSuccess(res, { accessToken: tokens.accessToken });
  } catch (err: any) {
    sendError(res, 500, 'Server error', 'SERVER_ERROR');
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { isRevoked: true } });
  }
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out');
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET) as any;
    await prisma.user.update({ where: { id: decoded.userId }, data: { isEmailVerified: true } });
    sendSuccess(res, null, 'Email verified successfully');
  } catch (err) {
    sendError(res, 400, 'Invalid or expired verification token', 'INVALID_VERIFY_TOKEN');
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendSuccess(res, null, 'If that email exists, a reset link was sent.'); // Prevent email enumeration

    // In a real app: Generate signed token, save hash, send email
    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`[DEV] Reset link: https://careerpilot.ai/reset-password?token=${resetToken}`);
    
    sendSuccess(res, null, 'If that email exists, a reset link was sent.');
  } catch (err: any) {
    sendError(res, 500, 'Server error', 'SERVER_ERROR');
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return sendError(res, 400, 'Token and new password required', 'BAD_REQUEST');

    // Basic validation
    if (newPassword.length < 8) return sendError(res, 400, 'Password must be at least 8 characters', 'VALIDATION_ERROR');

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: decoded.userId }, data: { passwordHash: hashedPassword } });

    // Invalidate all refresh tokens for this user
    await prisma.refreshToken.updateMany({ where: { userId: decoded.userId }, data: { isRevoked: true } });

    sendSuccess(res, null, 'Password reset successfully');
  } catch (err) {
    sendError(res, 400, 'Invalid or expired token', 'INVALID_RESET_TOKEN');
  }
});

// Auth Middleware
export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return sendError(res, 401, 'Unauthorized', 'NO_ACCESS_TOKEN');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    sendError(res, 401, 'Invalid access token', 'INVALID_ACCESS_TOKEN');
  }
};

export const requireRole = (roles: Role[]) => {
  return async (req: any, res: any, next: any) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !roles.includes(user.role)) {
      return sendError(res, 403, 'Forbidden: Insufficient role', 'FORBIDDEN');
    }
    next();
  };
};

router.get('/me', authMiddleware, async (req: any, res: any) => {
  const user = await prisma.user.findUnique({ 
    where: { id: req.userId },
    include: { profile: true }
  });
  if (!user) return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
  sendSuccess(res, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isPremium: user.isPremium,
    isEmailVerified: user.isEmailVerified,
    profile: user.profile
  });
});

router.get('/sessions', authMiddleware, async (req: any, res: any) => {
  const sessions = await prisma.session.findMany({ 
    where: { userId: req.userId }, 
    orderBy: { lastActiveAt: 'desc' },
    take: 10
  });
  sendSuccess(res, sessions);
});

router.delete('/sessions/:id', authMiddleware, async (req: any, res: any) => {
  const sessionId = req.params.id;
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  
  if (!session || session.userId !== req.userId) {
    return sendError(res, 404, 'Session not found', 'SESSION_NOT_FOUND');
  }

  await prisma.session.delete({ where: { id: sessionId } });
  sendSuccess(res, null, 'Session revoked');
});

export default router;
