import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// Utility to calculate match score
const calculateMatchScore = (job: any, userProfile: any) => {
  if (!userProfile) return 0;
  
  let score = 0;
  // Skills Match (60%)
  const required = job.requiredSkills || [];
  const userSkills = userProfile.skills || [];
  const matchedSkills = required.filter((s: string) => userSkills.includes(s));
  
  const skillsScore = required.length > 0 ? (matchedSkills.length / required.length) * 60 : 60;
  score += skillsScore;

  // Experience Match (20%) - Mock logic
  score += 20; // Assume perfect match for demo

  // Role Match (20%) - Mock logic
  score += 20; // Assume perfect match for demo

  return Math.round(score);
};

// GET /api/jobs - List jobs with filters + match scores
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: { company: true },
      take: 50 // Limit for performance
    });

    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });

    const scoredJobs = jobs.map(job => {
      const matchScore = calculateMatchScore(job, profile);
      const userSkills = profile?.skills || [];
      const matched = job.requiredSkills.filter(s => userSkills.includes(s));
      const missing = job.requiredSkills.filter(s => !userSkills.includes(s));
      
      return { ...job, matchScore, matchedKeywords: matched, missingKeywords: missing };
    });

    // Sort by match score descending
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    sendSuccess(res, scoredJobs);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/jobs/saved - List saved jobs
router.get('/saved', authMiddleware, async (req: any, res: any) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { userId: req.userId },
      include: { job: { include: { company: true } } }
    });
    sendSuccess(res, saved);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/jobs/skills-gap - Skills Gap Dashboard
router.get('/skills-gap', authMiddleware, async (req: any, res: any) => {
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    const jobs = await prisma.job.findMany({ where: { isActive: true }, take: 100 });
    
    const userSkills = new Set(profile?.skills || []);
    const missingFreq: Record<string, number> = {};
    
    jobs.forEach(j => {
      j.requiredSkills.forEach(s => {
        if (!userSkills.has(s)) {
          missingFreq[s] = (missingFreq[s] || 0) + 1;
        }
      });
    });

    const topMissing = Object.entries(missingFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    sendSuccess(res, topMissing, `The top skills you're missing from target jobs.`);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET /api/jobs/:id - Get job details
router.get('/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true }
    });
    if (!job) return sendError(res, 404, 'Job not found', 'NOT_FOUND');

    // Missing Feature: Salary Estimation (mock data if not present)
    const estimatedSalaryMin = job.estimatedSalaryMin || 400000; // 4 LPA
    const estimatedSalaryMax = job.estimatedSalaryMax || 800000; // 8 LPA

    sendSuccess(res, { ...job, estimatedSalaryMin, estimatedSalaryMax });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/jobs/:id/save - Save/unsave job
router.post('/:id/save', authMiddleware, async (req: any, res: any) => {
  try {
    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: req.userId, jobId: req.params.id } }
    });

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } });
      sendSuccess(res, { saved: false }, 'Job unsaved');
    } else {
      await prisma.savedJob.create({ data: { userId: req.userId, jobId: req.params.id } });
      sendSuccess(res, { saved: true }, 'Job saved');
    }
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/jobs/:id/apply - Apply Tracker Integration
router.post('/:id/apply', authMiddleware, async (req: any, res: any) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { company: true } });
    if (!job) return sendError(res, 404, 'Job not found', 'NOT_FOUND');

    // Creates a record in the Application Tracker (Phase 9 prep)
    const app = await prisma.application.create({
      data: {
        userId: req.userId,
        jobId: job.id,
        companyName: job.company.name,
        roleTitle: job.title,
        status: 'APPLIED'
      }
    });

    sendSuccess(res, app, 'Job added to Application Tracker');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
