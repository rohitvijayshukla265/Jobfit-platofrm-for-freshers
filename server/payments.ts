import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// POST /api/payments/create-order
router.post('/create-order', authMiddleware, async (req: any, res: any) => {
  try {
    const { planType } = req.body;
    let amount = 0;
    
    if (planType === 'MONTHLY') amount = 499;
    else if (planType === 'SIX_MONTHS') amount = 2999;
    else return sendError(res, 400, 'Invalid plan type', 'INVALID_PLAN');

    // Simulate Razorpay Order creation
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 10)}`;

    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        amount,
        planType,
        razorpayOrderId
      }
    });

    sendSuccess(res, { orderId: razorpayOrderId, amount: payment.amount, currency: payment.currency });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/payments/verify
router.post('/verify', authMiddleware, async (req: any, res: any) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId } });
    if (!payment || payment.userId !== req.userId) return sendError(res, 404, 'Order not found', 'NOT_FOUND');

    // Simulate signature verification
    const isValid = true; 

    if (isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS', razorpayPaymentId, razorpaySignature }
      });

      // Calculate premium expiration
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      const currentExp = user?.premiumUntil && user.premiumUntil > new Date() ? user.premiumUntil : new Date();
      const newExp = new Date(currentExp);
      
      if (payment.planType === 'MONTHLY') newExp.setMonth(newExp.getMonth() + 1);
      else if (payment.planType === 'SIX_MONTHS') newExp.setMonth(newExp.getMonth() + 6);

      await prisma.user.update({
        where: { id: req.userId },
        data: { isPremium: true, premiumUntil: newExp }
      });

      // Check if user was referred, upgrade referrer
      const referral = await prisma.referral.findFirst({ where: { referredUserId: req.userId, status: 'PENDING' } });
      if (referral) {
        await prisma.referral.update({ where: { id: referral.id }, data: { status: 'CONVERTED' } });
        
        const referrer = await prisma.user.findUnique({ where: { id: referral.referrerId } });
        if (referrer) {
          const refExp = referrer.premiumUntil && referrer.premiumUntil > new Date() ? referrer.premiumUntil : new Date();
          refExp.setMonth(refExp.getMonth() + 1);
          await prisma.user.update({ where: { id: referrer.id }, data: { isPremium: true, premiumUntil: refExp } });
        }
      }

      sendSuccess(res, { isPremium: true, premiumUntil: newExp }, 'Payment successful and Premium activated!');
    } else {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
      sendError(res, 400, 'Invalid payment signature', 'INVALID_SIGNATURE');
    }
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/payments/affiliate - Affiliate Dashboard
router.get('/affiliate', authMiddleware, async (req: any, res: any) => {
  try {
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return sendError(res, 404, 'User not found', 'NOT_FOUND');

    if (!user.referralCode) {
      const referralCode = `CP_${user.id.substring(0, 6).toUpperCase()}_${Math.floor(Math.random() * 1000)}`;
      user = await prisma.user.update({ where: { id: user.id }, data: { referralCode } });
    }

    const referrals = await prisma.referral.findMany({ where: { referrerId: req.userId }, include: { referredUser: { select: { id: true, email: true, isPremium: true } } } });
    
    const totalReferrals = referrals.length;
    const converted = referrals.filter(r => r.status === 'CONVERTED').length;

    sendSuccess(res, {
      referralCode: user.referralCode,
      totalReferrals,
      converted,
      freeMonthsEarned: converted,
      referrals
    });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
