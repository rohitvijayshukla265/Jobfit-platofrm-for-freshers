import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// Learning Streak Logic
const updateStreak = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const now = new Date();
  const lastActive = profile.lastActivityDate;
  let currentStreak = profile.currentStreak;
  let longestStreak = profile.longestStreak;

  if (!lastActive) {
    currentStreak = 1;
    longestStreak = 1;
  } else {
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      // Still active today, do nothing to streak count but update date
    } else if (diffHours < 48) {
      // Completed a chapter the next day
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      // Streak broken (more than 48 hours without activity)
      currentStreak = 1;
    }
  }

  await prisma.userProfile.update({
    where: { userId },
    data: { currentStreak, longestStreak, lastActivityDate: now }
  });
};

// GET /api/courses - List all courses (with filters)
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const courses = await prisma.course.findMany({
      include: { company: true }
    });
    sendSuccess(res, courses);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/courses/:id - Get course details + modules + chapters
router.get('/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        modules: {
          include: {
            chapters: {
              include: { lessons: true }
            }
          }
        }
      }
    });
    if (!course) return sendError(res, 404, 'Course not found', 'NOT_FOUND');
    sendSuccess(res, course);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/courses/:id/enroll - Enroll in a course
router.post('/:id/enroll', authMiddleware, async (req: any, res: any) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return sendError(res, 404, 'Course not found', 'NOT_FOUND');

    if (course.isPremium) {
      // Check if user is premium
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user?.isPremium && user?.role !== 'PREMIUM_STUDENT') {
        return sendError(res, 403, 'Payment required for premium course', 'PAYMENT_REQUIRED');
      }
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.userId, courseId: req.params.id } },
      update: {},
      create: { userId: req.userId, courseId: req.params.id }
    });
    sendSuccess(res, enrollment, 'Successfully enrolled');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/courses/:id/progress - Get user's progress for a course
router.get('/:id/progress', authMiddleware, async (req: any, res: any) => {
  try {
    // Collect all chapter progress for chapters in this course
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { modules: { include: { chapters: true } } }
    });
    if (!course) return sendError(res, 404, 'Course not found', 'NOT_FOUND');

    const chapterIds = course.modules.flatMap(m => m.chapters.map(c => c.id));
    const progress = await prisma.chapterProgress.findMany({
      where: { userId: req.userId, chapterId: { in: chapterIds } }
    });

    const totalChapters = chapterIds.length;
    const completedChapters = progress.filter(p => p.isCompleted).length;

    sendSuccess(res, { totalChapters, completedChapters, progress });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
