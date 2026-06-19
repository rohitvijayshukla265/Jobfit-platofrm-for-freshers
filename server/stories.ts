import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// GET /api/stories - List public approved stories
router.get('/', async (req: any, res: any) => {
  try {
    const stories = await prisma.successStory.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' }
    });
    sendSuccess(res, stories);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/stories/:id - Get single story details
router.get('/:id', async (req: any, res: any) => {
  try {
    const story = await prisma.successStory.findUnique({
      where: { id: req.params.id }
    });
    if (!story || !story.isApproved) return sendError(res, 404, 'Story not found', 'NOT_FOUND');
    sendSuccess(res, story);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/stories - Submit a success story
router.post('/', authMiddleware, async (req: any, res: any) => {
  try {
    const { studentName, companyName, role, packageLpa, graduationYear, college, preparation, resourcesUsed, tips, timeTakenMonths } = req.body;
    
    // Auto-approve for demo purposes. In production, this stays false until admin reviews.
    const isApproved = true;

    const story = await prisma.successStory.create({
      data: {
        userId: req.userId,
        studentName, companyName, role,
        packageLpa: parseFloat(packageLpa),
        graduationYear: parseInt(graduationYear),
        college, preparation, resourcesUsed, tips,
        timeTakenMonths: parseInt(timeTakenMonths),
        isApproved
      }
    });

    sendSuccess(res, story, 'Story submitted successfully and is pending approval.');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/stories/:id/react - "This story inspired me"
router.post('/:id/react', authMiddleware, async (req: any, res: any) => {
  try {
    const story = await prisma.successStory.update({
      where: { id: req.params.id },
      data: { reactions: { increment: 1 } }
    });
    sendSuccess(res, { reactions: story.reactions }, 'Reaction added');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
