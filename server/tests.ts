import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// Helper to shuffle array (Randomization missing feature)
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// List Tests
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const tests = await prisma.test.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, category: true, durationMins: true, totalMarks: true, isPremium: true, isWeeklyContest: true }
    });
    sendSuccess(res, tests);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Start a test attempt
router.post('/:id/start', authMiddleware, async (req: any, res: any) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: { questions: { include: { question: true } } }
    });
    
    if (!test) return sendError(res, 404, 'Test not found', 'NOT_FOUND');

    // Adaptive Testing check: in a real app, adjust difficulty based on previous analytics here
    
    // Randomize questions
    const randomizedQuestions = shuffleArray([...test.questions]);

    // Strip out correct answers and explanations for the client
    const clientQuestions = randomizedQuestions.map(tq => {
      let parsedOptions = [];
      try { parsedOptions = JSON.parse(tq.question.options); } catch (e) {}
      
      return {
        id: tq.question.id,
        testQuestionId: tq.id,
        type: tq.question.type,
        question: tq.question.question,
        options: shuffleArray(parsedOptions), // Randomize option order
        marks: tq.marks,
        negativeMarks: tq.negativeMarks
      };
    });

    const attempt = await prisma.testAttempt.create({
      data: {
        userId: req.userId,
        testId: test.id,
        status: 'IN_PROGRESS',
        totalMarks: test.totalMarks
      }
    });

    sendSuccess(res, { attemptId: attempt.id, testDetails: { title: test.title, durationMins: test.durationMins }, questions: clientQuestions });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Auto-save answer
router.post('/attempts/:attemptId/answer', authMiddleware, async (req: any, res: any) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptions, timeSpent, flaggedForReview } = req.body;

    const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== req.userId || attempt.status !== 'IN_PROGRESS') {
      return sendError(res, 403, 'Invalid or completed attempt', 'INVALID_ATTEMPT');
    }

    await prisma.attemptAnswer.upsert({
      where: { id: req.body.answerId || 'temp-id' }, // Simplify: assumes frontend sends answerId if exists, otherwise we'd use a unique constraint
      update: { selectedOptions, timeSpent, flaggedForReview },
      create: { attemptId, questionId, selectedOptions, timeSpent, flaggedForReview, isCorrect: false, marksAwarded: 0 }
    });

    sendSuccess(res, null, 'Answer saved');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// Submit Test & Auto-grade
router.post('/attempts/:attemptId/submit', authMiddleware, async (req: any, res: any) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await prisma.testAttempt.findUnique({ 
      where: { id: attemptId },
      include: { test: { include: { questions: { include: { question: true } } } }, answers: true }
    });
    
    if (!attempt || attempt.userId !== req.userId) return sendError(res, 403, 'Invalid attempt', 'INVALID_ATTEMPT');
    if (attempt.status !== 'IN_PROGRESS') return sendError(res, 400, 'Test already submitted', 'ALREADY_SUBMITTED');

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = attempt.test.questions.length - attempt.answers.length;

    const topicWiseBreakdown: any = {};
    const difficultyBreakdown: any = { EASY: { correct: 0, wrong: 0 }, MEDIUM: { correct: 0, wrong: 0 }, HARD: { correct: 0, wrong: 0 } };
    const timePerQuestion: any = {};

    // Grading Logic
    for (const answer of attempt.answers) {
      const tq = attempt.test.questions.find(q => q.questionId === answer.questionId);
      if (!tq) continue;

      const qBank = tq.question;
      const isCorrect = qBank.correctAnswers.sort().join(',') === answer.selectedOptions.sort().join(',');
      
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = tq.marks;
        correctCount++;
      } else if (answer.selectedOptions.length > 0) {
        marksAwarded = -tq.negativeMarks;
        wrongCount++;
      } else {
        skippedCount++;
      }

      totalScore += marksAwarded;

      await prisma.attemptAnswer.update({
        where: { id: answer.id },
        data: { isCorrect, marksAwarded }
      });

      // Analytics collection
      if (!topicWiseBreakdown[qBank.topic]) topicWiseBreakdown[qBank.topic] = { correct: 0, wrong: 0, total: 0 };
      topicWiseBreakdown[qBank.topic].total++;
      if (isCorrect) {
        topicWiseBreakdown[qBank.topic].correct++;
        difficultyBreakdown[qBank.difficulty].correct++;
      } else {
        topicWiseBreakdown[qBank.topic].wrong++;
        difficultyBreakdown[qBank.difficulty].wrong++;
      }
      
      timePerQuestion[answer.questionId] = answer.timeSpent;
    }

    // Missing Feature: Plagiarism Detection (Very basic mock logic: check if another attempt finished in last 5 mins with exact same score)
    const recentAttempts = await prisma.testAttempt.count({
      where: { testId: attempt.testId, score: totalScore, submittedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } }
    });
    const isFlaggedForPlagiarism = recentAttempts > 1;

    // Update Attempt
    const timeTaken = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
    const percentage = attempt.test.totalMarks > 0 ? (totalScore / attempt.test.totalMarks) * 100 : 0;

    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { status: 'SUBMITTED', submittedAt: new Date(), score: totalScore, percentage, timeTaken, isFlaggedForPlagiarism }
    });

    // Save Analytics
    await prisma.testAnalytics.create({
      data: {
        attemptId,
        correctCount,
        wrongCount,
        skippedCount,
        topicWiseBreakdown: JSON.stringify(topicWiseBreakdown),
        difficultyBreakdown: JSON.stringify(difficultyBreakdown),
        timePerQuestion: JSON.stringify(timePerQuestion)
      }
    });

    sendSuccess(res, { score: totalScore, percentage, flagged: isFlaggedForPlagiarism }, 'Test submitted successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// GET Analytics
router.get('/attempts/:attemptId/analytics', authMiddleware, async (req: any, res: any) => {
  try {
    const analytics = await prisma.testAnalytics.findUnique({
      where: { attemptId: req.params.attemptId },
      include: { attempt: true }
    });
    if (!analytics || analytics.attempt.userId !== req.userId) return sendError(res, 404, 'Analytics not found', 'NOT_FOUND');
    
    // Parse JSON fields
    const data = {
      ...analytics,
      topicWiseBreakdown: JSON.parse(analytics.topicWiseBreakdown),
      difficultyBreakdown: JSON.parse(analytics.difficultyBreakdown),
      timePerQuestion: JSON.parse(analytics.timePerQuestion)
    };

    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
