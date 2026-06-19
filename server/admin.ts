import express from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authMiddleware, requireRole } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// Ensure all routes require ADMIN role
router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

// POST /api/admin/courses - Create a company and course flow
router.post('/courses', async (req: any, res: any) => {
  try {
    const { companyName, title, description, isPremium, modules } = req.body;
    
    // Find or create company
    let company = await prisma.company.findUnique({ where: { name: companyName } });
    if (!company) {
      company = await prisma.company.create({ data: { name: companyName } });
    }

    // Create course with nested modules and chapters
    const course = await prisma.course.create({
      data: {
        companyId: company.id,
        title,
        description,
        isPremium,
        modules: {
          create: modules.map((m: any, index: number) => ({
            title: m.title,
            order: index,
            chapters: {
              create: m.chapters.map((c: any, cIndex: number) => ({
                title: c.title,
                order: cIndex,
                isPremium: c.isPremium || false
              }))
            }
          }))
        }
      },
      include: { modules: { include: { chapters: true } } }
    });

    sendSuccess(res, course, 'Course created successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/admin/lessons - Create lesson + upload content
router.post('/lessons', async (req: any, res: any) => {
  try {
    const { chapterId, title, order, contentType, contentUrl, textContent } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        chapterId,
        title,
        order,
        contentType,
        contentUrl, // Mocked or provided by previous S3 upload step in real scenario
        textContent
      }
    });

    sendSuccess(res, lesson, 'Lesson added successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// ==========================================
// Phase 4: Assessment Engine Admin
// ==========================================

// POST /api/admin/questions/import - Bulk import questions
router.post('/questions/import', async (req: any, res: any) => {
  try {
    const { questions } = req.body; // Expects an array of JSON objects matching QuestionBank
    
    if (!Array.isArray(questions)) return sendError(res, 400, 'Questions must be an array', 'INVALID_FORMAT');

    const created = await prisma.questionBank.createMany({
      data: questions.map(q => ({
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        question: q.question,
        options: JSON.stringify(q.options),
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        tags: q.tags || [],
        isPremium: q.isPremium || false
      }))
    });

    sendSuccess(res, created, `Successfully imported ${created.count} questions`);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/admin/tests - Create a test
router.post('/tests', async (req: any, res: any) => {
  try {
    const { title, description, category, companyId, durationMins, totalMarks, isPremium, isPublished, isWeeklyContest, questionIds } = req.body;

    const test = await prisma.test.create({
      data: {
        title, description, category, companyId, durationMins, totalMarks, isPremium, isPublished, isWeeklyContest,
        questions: {
          create: questionIds.map((qid: string, idx: number) => ({
            questionId: qid,
            order: idx,
            marks: 1, // simplified
            negativeMarks: 0 // simplified
          }))
        }
      }
    });

    sendSuccess(res, test, 'Test created successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
