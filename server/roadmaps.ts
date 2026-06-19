import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// GET /api/roadmaps/personalized
router.get('/personalized', authMiddleware, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { profile: true } });
    if (!user) return sendError(res, 404, 'User not found', 'NOT_FOUND');

    if (!user.isPremium) {
      return sendError(res, 403, 'Personalized roadmaps are a Premium feature.', 'PREMIUM_REQUIRED');
    }

    // Generate dynamic mock roadmap based on user profile
    const roadmap = [
      { week: 'Week 1-2', title: 'Aptitude Fundamentals', description: 'Master quantitative and logical reasoning.', link: '/courses' },
      { week: 'Week 3-4', title: 'Reasoning + Verbal', description: 'Advanced problem solving and grammar rules.', link: '/courses' },
      { week: 'Week 5-6', title: 'Company-Specific Prep', description: `Focus on patterns for your target roles.`, link: '/tests' },
      { week: 'Week 7', title: 'Mock Interviews', description: 'Schedule peer interviews and AI mock sessions.', link: '/interviews' },
      { week: 'Week 8', title: 'Final Revision + Apply', description: 'Build your resume and apply to saved jobs.', link: '/jobs' }
    ];

    sendSuccess(res, roadmap, 'Roadmap generated successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
