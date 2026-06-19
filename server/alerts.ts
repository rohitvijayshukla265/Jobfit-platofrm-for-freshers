import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// GET /api/alerts - List user's alerts
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const alerts = await prisma.jobAlert.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    sendSuccess(res, alerts);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/alerts - Create job alert
router.post('/', authMiddleware, async (req: any, res: any) => {
  try {
    const { keywords, locations, companies } = req.body;
    
    const alert = await prisma.jobAlert.create({
      data: {
        userId: req.userId,
        keywords: keywords || [],
        locations: locations || [],
        companies: companies || []
      }
    });

    sendSuccess(res, alert, 'Job alert created successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const alert = await prisma.jobAlert.findUnique({ where: { id: req.params.id } });
    if (!alert || alert.userId !== req.userId) return sendError(res, 404, 'Alert not found', 'NOT_FOUND');

    await prisma.jobAlert.delete({ where: { id: alert.id } });
    sendSuccess(res, null, 'Job alert deleted');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
