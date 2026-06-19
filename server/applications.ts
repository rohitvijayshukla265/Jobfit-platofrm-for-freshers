import express from 'express';
import { PrismaClient, AppStatus } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// GET /api/applications - List all applications and get dashboard analytics
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      include: { job: { include: { company: true } }, activityLog: true, interviewRounds: true, offer: true },
      orderBy: { updatedAt: 'desc' }
    });

    // Compute Dashboard Analytics
    const total = applications.length;
    const offers = applications.filter(a => a.status === 'OFFER').length;
    const interviews = applications.filter(a => a.status === 'INTERVIEW').length;
    const rejections = applications.filter(a => a.status === 'REJECTED').length;
    
    // Response rate: anything that got past "APPLIED" (Online Test, Interview, Offer, Rejected)
    const responses = applications.filter(a => ['ONLINE_TEST', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(a.status)).length;
    const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;

    const analytics = {
      total, responseRate, interviews, offers, rejections,
      statusBreakdown: applications.reduce((acc: any, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {})
    };

    sendSuccess(res, { applications, analytics });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/applications - Create new application
router.post('/', authMiddleware, async (req: any, res: any) => {
  try {
    const { jobId, companyName, role, status, appliedDate, notes, resumeUsed } = req.body;
    
    const app = await prisma.application.create({
      data: {
        userId: req.userId, jobId, companyName, role,
        status: status || 'WISHLIST',
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
        notes, resumeUsed
      }
    });

    // Add initial activity log
    await prisma.appActivity.create({
      data: {
        applicationId: app.id,
        toStatus: app.status,
        note: 'Application tracked'
      }
    });

    sendSuccess(res, app, 'Application added successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// PUT /api/applications/:id/status - Update Kanban status
router.put('/:id/status', authMiddleware, async (req: any, res: any) => {
  try {
    const { status, note } = req.body;
    const existing = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) return sendError(res, 404, 'Application not found', 'NOT_FOUND');

    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: { status }
    });

    await prisma.appActivity.create({
      data: {
        applicationId: existing.id,
        fromStatus: existing.status,
        toStatus: status,
        note: note || `Moved to ${status}`
      }
    });

    sendSuccess(res, updated, `Status updated to ${status}`);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Missing Feature: Interview Round Tracker
router.post('/:id/rounds', authMiddleware, async (req: any, res: any) => {
  try {
    const { roundNumber, title, scheduledAt, notes } = req.body;
    const existing = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) return sendError(res, 404, 'Not found', 'NOT_FOUND');

    const round = await prisma.interviewRound.create({
      data: { applicationId: existing.id, roundNumber, title, scheduledAt: scheduledAt ? new Date(scheduledAt) : null, notes }
    });

    sendSuccess(res, round, 'Interview round scheduled');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Missing Feature: Offer Tracker for Offer Comparison
router.post('/:id/offer', authMiddleware, async (req: any, res: any) => {
  try {
    const { ctc, location, joiningDate, benefits } = req.body;
    const existing = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) return sendError(res, 404, 'Not found', 'NOT_FOUND');

    const offer = await prisma.jobOffer.upsert({
      where: { applicationId: existing.id },
      update: { ctc, location, joiningDate: joiningDate ? new Date(joiningDate) : null, benefits: JSON.stringify(benefits) },
      create: { applicationId: existing.id, ctc, location, joiningDate: joiningDate ? new Date(joiningDate) : null, benefits: JSON.stringify(benefits) }
    });

    // Auto update status to OFFER
    await prisma.application.update({ where: { id: existing.id }, data: { status: 'OFFER' } });

    sendSuccess(res, offer, 'Offer recorded successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Missing Feature: Rejection Analysis
router.get('/rejection-analysis', authMiddleware, async (req: any, res: any) => {
  try {
    const apps = await prisma.application.findMany({
      where: { userId: req.userId, status: 'REJECTED' },
      include: { activityLog: true }
    });

    if (apps.length < 5) return sendSuccess(res, { analysis: 'Not enough data. Keep applying!' });

    // Mock AI Analysis determining the drop-off stage
    const dropOffStages: Record<string, number> = { APPLIED: 0, ONLINE_TEST: 0, INTERVIEW: 0 };
    apps.forEach(a => {
      // Find the last status before REJECTED
      const logs = a.activityLog.sort((x, y) => x.timestamp.getTime() - y.timestamp.getTime());
      const prevStatus = logs.length > 1 ? logs[logs.length - 2].toStatus : 'APPLIED';
      if (dropOffStages[prevStatus] !== undefined) dropOffStages[prevStatus]++;
    });

    const analysis = `Most of your rejections (${Math.max(...Object.values(dropOffStages))}) occurred after the ${Object.keys(dropOffStages).reduce((a, b) => dropOffStages[a] > dropOffStages[b] ? a : b)} stage. Focus on improving your skills for that specific round.`;

    sendSuccess(res, { dropOffStages, analysis });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
