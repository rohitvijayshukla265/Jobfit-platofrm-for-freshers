import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// Helper to update learning streak
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
      // Activity already recorded today
    } else if (diffHours < 48) {
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 1;
    }
  }

  await prisma.userProfile.update({
    where: { userId },
    data: { currentStreak, longestStreak, lastActivityDate: now }
  });
};

// POST /api/chapters/:id/complete - Mark chapter as complete
router.post('/:id/complete', authMiddleware, async (req: any, res: any) => {
  try {
    const progress = await prisma.chapterProgress.upsert({
      where: { userId_chapterId: { userId: req.userId, chapterId: req.params.id } },
      update: { isCompleted: true, completedAt: new Date(), timeSpent: req.body.timeSpent || 0 },
      create: { userId: req.userId, chapterId: req.params.id, isCompleted: true, completedAt: new Date(), timeSpent: req.body.timeSpent || 0 }
    });

    // Update the daily learning streak
    await updateStreak(req.userId);

    sendSuccess(res, progress, 'Chapter marked as complete');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/chapters/:id/notes - Get user notes for chapter
router.get('/:id/notes', authMiddleware, async (req: any, res: any) => {
  try {
    const notes = await prisma.userNote.findMany({
      where: { userId: req.userId, chapterId: req.params.id },
      orderBy: { updatedAt: 'desc' }
    });
    sendSuccess(res, notes);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/chapters/:id/notes - Save/update note
router.post('/:id/notes', authMiddleware, async (req: any, res: any) => {
  try {
    const { content, noteId } = req.body;
    let note;
    if (noteId) {
      note = await prisma.userNote.update({
        where: { id: noteId },
        data: { content }
      });
    } else {
      note = await prisma.userNote.create({
        data: { userId: req.userId, chapterId: req.params.id, content }
      });
    }
    sendSuccess(res, note, 'Note saved successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/chapters/:id/bookmark - Toggle bookmark
router.post('/:id/bookmark', authMiddleware, async (req: any, res: any) => {
  try {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_chapterId: { userId: req.userId, chapterId: req.params.id } }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      sendSuccess(res, { bookmarked: false }, 'Bookmark removed');
    } else {
      await prisma.bookmark.create({
        data: { userId: req.userId, chapterId: req.params.id }
      });
      sendSuccess(res, { bookmarked: true }, 'Bookmark added');
    }
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
