import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';
import multer from 'multer';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for audio/video
});

// Helper to shuffle array
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// 1. Start Interview Session
router.post('/start', authMiddleware, async (req: any, res: any) => {
  try {
    const { type, companyId } = req.body;
    
    if (!type) return sendError(res, 400, 'Interview type is required', 'BAD_REQUEST');

    // Pull 8-12 random questions based on criteria
    const questions = await prisma.interviewQuestion.findMany({
      where: { type, companyId: companyId || undefined }
    });

    if (questions.length === 0) return sendError(res, 404, 'No questions found for this criteria', 'NOT_FOUND');

    const shuffled = shuffleArray(questions).slice(0, 10); // Take up to 10 questions

    const session = await prisma.interviewSession.create({
      data: {
        userId: req.userId,
        type,
        companyId,
        status: 'IN_PROGRESS'
      }
    });

    // Strip out sampleAnswers and keyPoints before sending to client
    const clientQuestions = shuffled.map(q => ({ id: q.id, question: q.question, difficulty: q.difficulty }));

    sendSuccess(res, { sessionId: session.id, questions: clientQuestions }, 'Interview session started');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 2. Submit Answer for a Question (Auto-Save)
router.post('/:sessionId/answer', authMiddleware, upload.single('audio'), async (req: any, res: any) => {
  try {
    const { sessionId } = req.params;
    const { questionId, textAnswer, timeTaken } = req.body;
    let audioUrl = null;
    let transcript = null;
    let confidenceScore = null;

    const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== req.userId || session.status !== 'IN_PROGRESS') {
      return sendError(res, 403, 'Invalid or completed session', 'INVALID_SESSION');
    }

    if (req.file) {
      // Simulate S3 upload and transcription
      audioUrl = `https://s3.amazonaws.com/careerpilot/interviews/${req.userId}_${Date.now()}.webm`;
      transcript = "Simulated transcription of the user's voice answer.";
      confidenceScore = Math.floor(Math.random() * 40) + 60; // Mock Confidence Meter
    }

    const response = await prisma.interviewResponse.upsert({
      where: { id: req.body.responseId || 'temp-id' }, // Typically would need a unique constraint on sessionId_questionId
      update: { textAnswer, audioUrl, transcript, timeTaken: timeTaken ? parseInt(timeTaken) : null, confidenceScore },
      create: { sessionId, questionId, textAnswer, audioUrl, transcript, timeTaken: timeTaken ? parseInt(timeTaken) : null, confidenceScore }
    });

    sendSuccess(res, response, 'Answer saved');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 3. Submit Session & Trigger Evaluation
router.post('/:sessionId/submit', authMiddleware, async (req: any, res: any) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.interviewSession.findUnique({ where: { id: sessionId }, include: { responses: { include: { question: true } } } });

    if (!session || session.userId !== req.userId) return sendError(res, 403, 'Invalid session', 'INVALID_SESSION');

    // Mark as EVALUATING
    await prisma.interviewSession.update({ where: { id: sessionId }, data: { status: 'EVALUATING', completedAt: new Date() } });

    // In a real application, we'd trigger a Bull Queue worker here. 
    // Since we need to demonstrate the result, we'll run a mocked evaluation synchronously.
    
    let totalScoreAcc = 0;
    const strengths = ['Good structured communication', 'Confident delivery'];
    const weaknesses = ['Sometimes drifted off-topic', 'Missed a few technical keywords'];
    const improvements = ['Use the STAR method more consistently', 'Include more specific metrics in examples'];

    for (const response of session.responses) {
      const q = response.question;
      // Mock evaluation based on random values for demo purposes
      const relevanceScore = Math.floor(Math.random() * 5) + 5; // 5-10
      const depthScore = Math.floor(Math.random() * 5) + 5;
      const communicationScore = response.confidenceScore ? Math.floor(response.confidenceScore / 10) : (Math.floor(Math.random() * 5) + 5);
      
      const questionTotal = (relevanceScore + depthScore + communicationScore) / 3;
      totalScoreAcc += questionTotal;

      const evalData = {
        relevanceScore, depthScore, communicationScore,
        keywordCoverage: { found: ['agile', 'leadership'], missing: ['conflict resolution'] },
        sampleAnswer: q.sampleAnswer || 'A good sample answer goes here.'
      };

      await prisma.interviewResponse.update({
        where: { id: response.id },
        data: { evaluation: JSON.stringify(evalData) }
      });
    }

    const overallScore = session.responses.length > 0 ? (totalScoreAcc / session.responses.length) : 0;

    await prisma.interviewReport.create({
      data: {
        sessionId,
        strengths,
        weaknesses,
        improvements,
        totalScore: overallScore,
        reportData: JSON.stringify({ recommendedStudy: ['STAR Method', 'System Design Basics'] })
      }
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', overallScore }
    });

    sendSuccess(res, { overallScore, status: 'COMPLETED' }, 'Interview evaluated successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// 4. Get Report
router.get('/:sessionId/report', authMiddleware, async (req: any, res: any) => {
  try {
    const report = await prisma.interviewReport.findUnique({
      where: { sessionId: req.params.sessionId },
      include: { session: { include: { responses: { include: { question: true } } } } }
    });

    if (!report || report.session.userId !== req.userId) return sendError(res, 404, 'Report not found', 'NOT_FOUND');

    const parsedData = {
      ...report,
      reportData: JSON.parse(report.reportData),
      session: {
        ...report.session,
        responses: report.session.responses.map(r => ({ ...r, evaluation: r.evaluation ? JSON.parse(r.evaluation) : null }))
      }
    };

    sendSuccess(res, parsedData);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Missing Feature: Submit Company Interview Experience
router.post('/experiences', authMiddleware, async (req: any, res: any) => {
  try {
    const { companyId, role, status, questions, experience } = req.body;
    const exp = await prisma.companyInterviewExperience.create({
      data: { userId: req.userId, companyId, role, status, questions, experience }
    });
    sendSuccess(res, exp, 'Experience shared successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Missing Feature: Peer Interview Scheduling
router.post('/peer/schedule', authMiddleware, async (req: any, res: any) => {
  try {
    const { scheduledAt } = req.body;
    const session = await prisma.peerInterviewSession.create({
      data: { hostUserId: req.userId, scheduledAt: new Date(scheduledAt) }
    });
    sendSuccess(res, session, 'Peer interview scheduled. Awaiting a partner to join.');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
