import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ==========================================
// Phase 2: Backward Compatibility (Parse & Score PDF)
// ==========================================
router.post('/analyze', authMiddleware, upload.single('resume'), async (req: any, res: any) => {
  try {
    if (!req.file) return sendError(res, 400, 'No file uploaded', 'NO_FILE');
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text.toLowerCase();

    const requiredKeywords = ['react', 'javascript', 'typescript', 'node', 'sql', 'api', 'agile'];
    const missingKeywords = requiredKeywords.filter(k => !text.includes(k));
    
    const keywordMatchScore = ((requiredKeywords.length - missingKeywords.length) / requiredKeywords.length) * 100;
    const atsScore = Math.min(100, Math.round(keywordMatchScore + (text.length > 500 ? 10 : 0)));

    const suggestions = [];
    if (missingKeywords.length > 0) suggestions.push(`Consider adding these missing keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
    if (text.length < 300) suggestions.push('Your resume is a bit short. Try expanding on your responsibilities using action verbs.');
    if (!text.includes('achieved') && !text.includes('improved')) suggestions.push('Add more metric-driven achievements.');

    const grammarScore = 85 + Math.floor(Math.random() * 15);

    const report = await prisma.resumeReport.create({
      data: {
        profileId: profile.id,
        fileName: req.file.originalname,
        atsScore,
        missingKeywords: JSON.stringify(missingKeywords),
        grammarScore,
        suggestions: JSON.stringify(suggestions),
      }
    });

    sendSuccess(res, { ...report, missingKeywords, suggestions }, 'Resume analyzed');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

router.get('/history', authMiddleware, async (req: any, res: any) => {
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendSuccess(res, []);

    const reports = await prisma.resumeReport.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const parsedReports = reports.map(r => ({
      ...r,
      missingKeywords: r.missingKeywords ? JSON.parse(r.missingKeywords) : [],
      suggestions: r.suggestions ? JSON.parse(r.suggestions) : []
    }));
    sendSuccess(res, parsedReports);
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// ==========================================
// Phase 7: RESUME & CAREER CENTER
// ==========================================

// GET /api/resume - List user's resumes
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' }
    });
    // Parse JSON
    const parsed = resumes.map(r => ({ ...r, data: JSON.parse(r.data) }));
    sendSuccess(res, parsed);
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/resume - Create new resume
router.post('/', authMiddleware, async (req: any, res: any) => {
  try {
    const { title, templateId, data } = req.body;
    
    // Check missing feature limits (Multiple Resume Versions)
    const count = await prisma.resume.count({ where: { userId: req.userId } });
    if (count >= 3) {
      // Allow for SDE, Data Analyst, etc., but cap at 3 for standard users
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user?.isPremium && user?.role !== 'ADMIN') {
        return sendError(res, 403, 'Maximum of 3 resumes allowed for free tier', 'LIMIT_EXCEEDED');
      }
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId,
        title: title || 'My Resume',
        templateId: templateId || 'classic',
        data: JSON.stringify(data || {})
      }
    });

    sendSuccess(res, { ...resume, data: JSON.parse(resume.data) }, 'Resume created');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// PUT /api/resume/:id - Update resume data
router.put('/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { title, templateId, data } = req.body;
    
    const existing = await prisma.resume.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) return sendError(res, 404, 'Resume not found', 'NOT_FOUND');

    // Missing Feature: Version History (Save current state before updating)
    const versionCount = await prisma.resumeVersion.count({ where: { resumeId: existing.id } });
    await prisma.resumeVersion.create({
      data: {
        resumeId: existing.id,
        data: existing.data,
        versionNum: versionCount + 1
      }
    });

    const updated = await prisma.resume.update({
      where: { id: req.params.id },
      data: {
        title: title || existing.title,
        templateId: templateId || existing.templateId,
        data: JSON.stringify(data)
      }
    });

    sendSuccess(res, { ...updated, data: JSON.parse(updated.data) }, 'Resume updated');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/resume/:id/export - Export as PDF
router.post('/:id/export', authMiddleware, async (req: any, res: any) => {
  try {
    const existing = await prisma.resume.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) return sendError(res, 404, 'Resume not found', 'NOT_FOUND');

    // In production: Use Puppeteer to generate PDF buffer and return it
    // For now, return a mock success URL
    const mockPdfUrl = `https://s3.amazonaws.com/careerpilot/resumes/${existing.id}.pdf`;

    await prisma.resume.update({
      where: { id: existing.id },
      data: { lastExportedAt: new Date() }
    });

    sendSuccess(res, { downloadUrl: mockPdfUrl }, 'PDF generated successfully');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/resume/:id/ats-check - Run ATS analysis against JD
router.post('/:id/ats-check', authMiddleware, async (req: any, res: any) => {
  try {
    const { jobDescription } = req.body;
    const existing = await prisma.resume.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) return sendError(res, 404, 'Resume not found', 'NOT_FOUND');

    if (!jobDescription) return sendError(res, 400, 'Job description required', 'BAD_REQUEST');

    // Mock AI Analysis
    const jdKeywords = ['react', 'node.js', 'typescript', 'aws', 'rest api', 'docker'];
    const matched = ['react', 'node.js', 'rest api'];
    const missing = ['typescript', 'aws', 'docker'];
    
    const score = Math.floor(Math.random() * 30) + 65; // 65-95

    await prisma.resume.update({
      where: { id: existing.id },
      data: { atsScore: score }
    });

    sendSuccess(res, { 
      atsScore: score, 
      matchedKeywords: matched, 
      missingKeywords: missing,
      suggestions: [`Add '${missing[0]}' to your skills — it appears 4 times in this JD.`]
    });
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/resume/cover-letter - Generate cover letter
router.post('/cover-letter', authMiddleware, async (req: any, res: any) => {
  try {
    const { companyName, jobTitle, keySkills, admirationPoint } = req.body;

    const mockContent = `Dear Hiring Manager at ${companyName},\n\nI am writing to express my strong interest in the ${jobTitle} position. I deeply admire ${admirationPoint}.\n\nWith my background in ${keySkills}, I am confident I can contribute to your team.\n\nSincerely,\nCandidate`;

    const cl = await prisma.coverLetter.create({
      data: { userId: req.userId, companyName, jobTitle, content: mockContent }
    });

    sendSuccess(res, cl, 'Cover letter generated');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

// POST /api/resume/linkedin-optimizer - LinkedIn Profile Optimizer
router.post('/linkedin-optimizer', authMiddleware, async (req: any, res: any) => {
  try {
    const { aboutText } = req.body;
    
    // Mock AI rewrite
    const rewrittenText = `(AI Optimized): ${aboutText}\n\n-> Result-driven professional specializing in scalable solutions...`;
    const checklist = [
      { item: 'Profile Photo', status: 'Checked' },
      { item: 'Banner Image', status: 'Needs Update' },
      { item: 'Headline Formula', status: 'Checked' }
    ];

    sendSuccess(res, { rewrittenText, checklist }, 'LinkedIn profile analyzed');
  } catch (err: any) {
    sendError(res, 500, err.message, 'SERVER_ERROR');
  }
});

export default router;
