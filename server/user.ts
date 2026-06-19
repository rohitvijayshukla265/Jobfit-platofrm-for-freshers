import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// GET /api/user/bookmarks - List all bookmarks
router.get('/bookmarks', authMiddleware, async (req: any, res: any) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.userId },
      include: {
        chapter: {
          include: { module: { include: { course: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    sendSuccess(res, bookmarks);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/user/streak - Get current streak data
router.get('/streak', authMiddleware, async (req: any, res: any) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.userId },
      select: { currentStreak: true, longestStreak: true, lastActivityDate: true }
    });

    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    sendSuccess(res, profile);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
