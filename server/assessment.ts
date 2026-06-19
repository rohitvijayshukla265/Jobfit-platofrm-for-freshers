import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get Assessment Catalog
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Single Assessment with Questions
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });
    
    if (!assessment) return res.status(404).json({ error: 'Not found' });

    const isMock = assessment.title.toLowerCase().includes('tcs') || 
                   assessment.title.toLowerCase().includes('infosys') || 
                   assessment.title.toLowerCase().includes('wipro') ||
                   assessment.title.toLowerCase().includes('mock');

    let displayQuestions = assessment.questions;

    if (isMock) {
      // 1. Fetch only IDs of all questions (extremely fast, low memory footprint)
      const allQuestionIds = await prisma.question.findMany({
        select: { id: true }
      });
      
      if (allQuestionIds.length > 0) {
        // 2. Shuffle IDs in memory (blazing fast for 10k items)
        const shuffledIds = allQuestionIds.map(q => q.id);
        for (let i = shuffledIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }
        const selectedIds = shuffledIds.slice(0, 50);

        // 3. Fetch only the 50 selected questions and options (fast indexed query)
        displayQuestions = await prisma.question.findMany({
          where: { id: { in: selectedIds } },
          include: { options: true }
        });
      }
    }

    // Remove correctOptId before sending to client
    const safeAssessment = {
      ...assessment,
      questions: displayQuestions.map(q => {
        const { correctOptId, ...safeQuestion } = q;
        return safeQuestion;
      })
    };

    res.json(safeAssessment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit Assessment Attempt
router.post('/:id/submit', authMiddleware, async (req: any, res: any) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.userId;
    const { answers } = req.body; // { [questionId]: selectedOptionId }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) return res.status(404).json({ error: 'Not found' });

    // Fetch answered questions directly from database to grade dynamic shuffled questions
    const answeredQuestionIds = Object.keys(answers || {});
    const questions = await prisma.question.findMany({
      where: { id: { in: answeredQuestionIds } },
      include: { options: true }
    });

    let score = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0) || 1;

    // Auto grade MultipleChoice questions
    for (const q of questions) {
      if (q.type === 'MultipleChoice' && answers[q.id] === q.correctOptId) {
        score += q.points;
      }
    }

    const percentage = (score / maxScore) * 105; // Cap it properly at 100 later or use raw percentage
    const finalPercentage = Math.min(percentage, 100);

    const attempt = await prisma.attempt.create({
      data: {
        userId,
        assessmentId,
        score: finalPercentage,
        status: 'COMPLETED',
        completedAt: new Date(),
      }
    });

    // Update Profile Score based on category
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (profile) {
      const updateData: any = {};
      if (assessment.category === 'Aptitude') {
        updateData.aptitudeScore = Math.max(profile.aptitudeScore || 0, finalPercentage);
      } else if (assessment.category === 'Grammar') {
        updateData.grammarScore = Math.max(profile.grammarScore || 0, finalPercentage);
      } else if (assessment.category === 'Technical') {
        updateData.technicalScore = Math.max(profile.technicalScore || 0, finalPercentage);
      }
      
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: updateData
      });
    }

    const questionsReview = questions.map(q => {
      const userAnswerId = answers[q.id];
      const correctOption = q.options.find(opt => opt.id === q.correctOptId);
      const userOption = q.options.find(opt => opt.id === userAnswerId);
      return {
        id: q.id,
        content: q.content,
        options: q.options.map(o => ({ id: o.id, text: o.text })),
        userAnswerId: userAnswerId || null,
        userAnswerText: userOption ? userOption.text : null,
        correctAnswerId: q.correctOptId,
        correctAnswerText: correctOption ? correctOption.text : 'Not Specified',
        isCorrect: q.correctOptId === userAnswerId,
        points: q.points
      };
    });

    res.json({ attempt, percentage: finalPercentage, questionsReview });
  } catch (error) {
    console.error('Submit error', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
