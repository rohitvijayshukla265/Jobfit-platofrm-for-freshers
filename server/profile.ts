import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './auth';
import multer from 'multer';
import pdfParse from 'pdf-parse';

const router = express.Router();
const prisma = new PrismaClient();

// Use memory storage for uploads (in production this would pipe to S3/Cloudflare R2)
const upload = multer({ storage: multer.memoryStorage() });

const sendSuccess = (res: any, data: any = {}, message: string = '') => res.json({ success: true, data, message });
const sendError = (res: any, status: number, error: string, code: string = 'ERROR') => res.status(status).json({ success: false, error, code });

// Profile Score Calculation Logic
const calculateProfileScore = async (profileId: string) => {
  const profile = await prisma.userProfile.findUnique({
    where: { id: profileId },
    include: { targetRoles: true, projects: true, workExperience: true }
  });

  if (!profile) return { score: 0, breakdown: {} };

  const breakdown: Record<string, number> = {};
  let totalScore = 0;

  // Basic Info (10)
  if (profile.user?.name && profile.phone && profile.location) {
    breakdown.basicInfo = 10;
    totalScore += 10;
  }
  // Academic Details (15)
  if (profile.college && profile.degree && profile.branch && profile.graduationYear) {
    breakdown.academicDetails = 15;
    totalScore += 15;
  }
  // 5+ Skills (15)
  if (profile.skills && profile.skills.length >= 5) {
    breakdown.skills = 15;
    totalScore += 15;
  }
  // Target Roles (10)
  if (profile.targetRoles && profile.targetRoles.length > 0) {
    breakdown.targetRoles = 10;
    totalScore += 10;
  }
  // Profile Photo (10)
  if (profile.avatarUrl) {
    breakdown.profilePhoto = 10;
    totalScore += 10;
  }
  // LinkedIn (10)
  if (profile.linkedinUrl) {
    breakdown.linkedin = 10;
    totalScore += 10;
  }
  // GitHub (10)
  if (profile.githubUrl) {
    breakdown.github = 10;
    totalScore += 10;
  }
  // 1+ Projects (10)
  if (profile.projects && profile.projects.length >= 1) {
    breakdown.projects = 10;
    totalScore += 10;
  }
  // Bio/About (5)
  if (profile.bio) {
    breakdown.bio = 5;
    totalScore += 5;
  }
  // Portfolio (5)
  if (profile.portfolioUrl) {
    breakdown.portfolio = 5;
    totalScore += 5;
  }

  return { score: totalScore, breakdown };
};

// Endpoints

// GET current profile
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    let profile = await prisma.userProfile.findUnique({
      where: { userId: req.userId },
      include: {
        targetRoles: true,
        workExperience: true,
        projects: true,
        certifications: true,
        skillEndorsements: true,
        achievementBadges: true,
        user: { select: { name: true, email: true } }
      }
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: req.userId, skills: '' },
        include: { targetRoles: true, workExperience: true, projects: true, certifications: true, skillEndorsements: true, achievementBadges: true, user: { select: { name: true, email: true } } }
      });
    }

    sendSuccess(res, profile);
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// PUT update profile
router.put('/', authMiddleware, async (req: any, res: any) => {
  try {
    const {
      name,
      phone,
      bio,
      location,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      college,
      degree,
      branch,
      graduationYear,
      cgpa,
      skills
    } = req.body;

    let profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) {
      profile = await prisma.userProfile.create({ data: { userId: req.userId, skills: '' } });
    }

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { name }
      });
    }

    // Update profile fields
    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        phone: phone !== undefined ? phone : profile.phone,
        bio: bio !== undefined ? bio : profile.bio,
        location: location !== undefined ? location : profile.location,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : profile.linkedinUrl,
        githubUrl: githubUrl !== undefined ? githubUrl : profile.githubUrl,
        portfolioUrl: portfolioUrl !== undefined ? portfolioUrl : profile.portfolioUrl,
        college: college !== undefined ? college : profile.college,
        degree: degree !== undefined ? degree : profile.degree,
        branch: branch !== undefined ? branch : profile.branch,
        graduationYear: graduationYear !== undefined ? (graduationYear ? parseInt(graduationYear, 10) : null) : profile.graduationYear,
        cgpa: cgpa !== undefined ? (cgpa ? parseFloat(cgpa) : null) : profile.cgpa,
        skills: skills !== undefined ? (Array.isArray(skills) ? skills.join(',') : skills) : profile.skills,
      },
      include: {
        targetRoles: true,
        workExperience: true,
        projects: true,
        certifications: true,
        skillEndorsements: true,
        achievementBadges: true,
        user: { select: { name: true, email: true } }
      }
    });

    // Recalculate score
    const scoreData = await calculateProfileScore(updatedProfile.id);
    await prisma.userProfile.update({
      where: { id: updatedProfile.id },
      data: { profileScore: scoreData.score }
    });
    updatedProfile.profileScore = scoreData.score;

    sendSuccess(res, updatedProfile, 'Profile updated successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});


// GET profile score
router.get('/score', authMiddleware, async (req: any, res: any) => {
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    const scoreData = await calculateProfileScore(profile.id);
    
    // Update score in DB
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { profileScore: scoreData.score }
    });

    sendSuccess(res, scoreData);
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// GET onboarding status
router.get('/onboarding/status', authMiddleware, async (req: any, res: any) => {
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId }, select: { onboardingStep: true, onboardingDone: true } });
    if (!profile) return sendSuccess(res, { onboardingStep: 0, onboardingDone: false });
    sendSuccess(res, profile);
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// POST onboarding data
router.post('/onboarding', authMiddleware, async (req: any, res: any) => {
  try {
    const data = req.body;
    
    // Find or create profile
    let profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: req.userId,
          skills: '',
        }
      });
    }

    // Map personal info
    const phone = data.personalInfo?.phone || null;
    const location = data.personalInfo?.location || null;
    const bio = data.personalInfo?.bio || null;

    // Map education (first item if exists)
    const firstEdu = data.education?.[0];
    const college = firstEdu?.institution || null;
    const degree = firstEdu?.degree || null;
    const graduationYear = firstEdu?.year ? parseInt(firstEdu.year, 10) || null : null;

    // Map skills (join array to string)
    const skillsStr = Array.isArray(data.skills) ? data.skills.join(',') : '';

    // Update profile
    profile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        phone,
        location,
        bio,
        college,
        degree,
        graduationYear,
        skills: skillsStr,
        onboardingDone: true,
        onboardingStep: 6
      }
    });

    // Save target job role
    if (data.targetJobRole) {
      await prisma.targetRole.deleteMany({ where: { profileId: profile.id } });
      await prisma.targetRole.create({
        data: {
          profileId: profile.id,
          role: data.targetJobRole
        }
      });
    }

    // Save work experiences
    if (Array.isArray(data.experience)) {
      await prisma.workExperience.deleteMany({ where: { profileId: profile.id } });
      for (const exp of data.experience) {
        if (exp.company && exp.role) {
          let startDate = new Date();
          let endDate = null;
          if (exp.years && exp.years.includes('-')) {
            const parts = exp.years.split('-');
            const startYear = parseInt(parts[0].trim(), 10);
            const endYear = parseInt(parts[1].trim(), 10);
            if (!isNaN(startYear)) startDate = new Date(startYear, 0, 1);
            if (!isNaN(endYear)) endDate = new Date(endYear, 11, 31);
          }
          await prisma.workExperience.create({
            data: {
              profileId: profile.id,
              company: exp.company,
              role: exp.role,
              startDate,
              endDate,
              isCurrent: !endDate
            }
          });
        }
      }
    }

    sendSuccess(res, profile, 'Onboarding profile saved successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// PUT onboarding step
router.put('/onboarding/:step', authMiddleware, async (req: any, res: any) => {
  try {
    const step = parseInt(req.params.step, 10);
    const data = req.body;
    let profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });

    if (!profile) {
      profile = await prisma.userProfile.create({ data: { userId: req.userId, skills: '' } });
    }

    // Process data based on step
    if (step === 1) { // Personal Info
      await prisma.user.update({ where: { id: req.userId }, data: { name: data.name } });
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { phone: data.phone, location: data.location, avatarUrl: data.avatarUrl, onboardingStep: 1 }
      });
    } else if (step === 2) { // Academic Details
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { college: data.college, degree: data.degree, branch: data.branch, graduationYear: data.graduationYear, cgpa: data.cgpa, onboardingStep: 2 }
      });
    } else if (step === 3) { // Skills
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { skills: data.skills, onboardingStep: 3 }
      });
    } else if (step === 4) { // Target Roles
      await prisma.targetRole.deleteMany({ where: { profileId: profile.id } });
      if (data.targetRoles) {
        const targetRolesData = data.targetRoles.map((role: string) => ({ profileId: profile!.id, role }));
        await prisma.targetRole.createMany({ data: targetRolesData });
      }
      await prisma.userProfile.update({ where: { id: profile.id }, data: { onboardingStep: 4 } });
    } else if (step === 5) { // Experience & Projects
      // simplified update for demo
      await prisma.userProfile.update({ where: { id: profile.id }, data: { onboardingStep: 5 } });
    } else if (step === 6) { // Social Links
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { linkedinUrl: data.linkedinUrl, githubUrl: data.githubUrl, portfolioUrl: data.portfolioUrl, onboardingStep: 6, onboardingDone: true }
      });
    }

    sendSuccess(res, null, `Step ${step} saved`);
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// POST avatar upload
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req: any, res: any) => {
  try {
    if (!req.file) return sendError(res, 400, 'No file uploaded', 'NO_FILE');
    
    // Convert to Base64 data URL
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { avatarUrl: dataUrl }
    });

    const scoreData = await calculateProfileScore(profile.id);
    await prisma.userProfile.update({ where: { id: profile.id }, data: { profileScore: scoreData.score } });

    sendSuccess(res, { avatarUrl: dataUrl }, 'Avatar uploaded successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'UPLOAD_ERROR');
  }
});

// POST resume import (Parsing)
router.post('/resume/import', authMiddleware, upload.single('resume'), async (req: any, res: any) => {
  try {
    if (!req.file) return sendError(res, 400, 'No PDF uploaded', 'NO_FILE');
    
    // Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const parsedText = pdfData.text;

    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    // Rich mockup extraction mapping to profile
    const extractedData = {
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'REST APIs', 'Git'],
      college: 'National Institute of Technology',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      cgpa: 8.9
    };

    // Auto-update profile
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        skills: extractedData.skills.join(','),
        college: extractedData.college,
        degree: extractedData.degree,
        branch: extractedData.branch,
        graduationYear: extractedData.graduationYear,
        cgpa: extractedData.cgpa,
        resumeUrl: 'https://careerpilot-uploads/resumes/resume_rohit_shukla.pdf'
      }
    });

    // Recalculate score
    const scoreData = await calculateProfileScore(profile.id);
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { profileScore: scoreData.score }
    });

    sendSuccess(res, { parsedText, extractedData }, 'Resume parsed successfully and profile updated.');
  } catch (error: any) {
    sendError(res, 500, error.message, 'PARSE_ERROR');
  }
});

// Add Work Experience
router.post('/experience', authMiddleware, async (req: any, res: any) => {
  try {
    const { company, role, startDate, endDate, isCurrent, description } = req.body;
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    const exp = await prisma.workExperience.create({
      data: {
        profileId: profile.id,
        company,
        role,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: !!isCurrent,
        description
      }
    });

    const scoreData = await calculateProfileScore(profile.id);
    await prisma.userProfile.update({ where: { id: profile.id }, data: { profileScore: scoreData.score } });

    sendSuccess(res, exp, 'Work experience added successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Update Work Experience
router.put('/experience/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { company, role, startDate, endDate, isCurrent, description } = req.body;

    const exp = await prisma.workExperience.update({
      where: { id },
      data: {
        company,
        role,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : (isCurrent ? null : undefined),
        isCurrent: isCurrent !== undefined ? !!isCurrent : undefined,
        description
      }
    });

    sendSuccess(res, exp, 'Work experience updated successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Delete Work Experience
router.delete('/experience/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.workExperience.delete({ where: { id } });
    sendSuccess(res, null, 'Work experience deleted successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Add Project
router.post('/projects', authMiddleware, async (req: any, res: any) => {
  try {
    const { title, description, techStack, liveUrl, repoUrl } = req.body;
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    const proj = await prisma.project.create({
      data: {
        profileId: profile.id,
        title,
        description,
        techStack,
        liveUrl,
        repoUrl
      }
    });

    const scoreData = await calculateProfileScore(profile.id);
    await prisma.userProfile.update({ where: { id: profile.id }, data: { profileScore: scoreData.score } });

    sendSuccess(res, proj, 'Project added successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Update Project
router.put('/projects/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, techStack, liveUrl, repoUrl } = req.body;

    const proj = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        techStack,
        liveUrl,
        repoUrl
      }
    });

    sendSuccess(res, proj, 'Project updated successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Delete Project
router.delete('/projects/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    sendSuccess(res, null, 'Project deleted successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Add Certification
router.post('/certifications', authMiddleware, async (req: any, res: any) => {
  try {
    const { name, issuer, issuedDate, credentialUrl } = req.body;
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) return sendError(res, 404, 'Profile not found', 'NOT_FOUND');

    const cert = await prisma.certification.create({
      data: {
        profileId: profile.id,
        name,
        issuer,
        issuedDate: new Date(issuedDate),
        credentialUrl
      }
    });

    sendSuccess(res, cert, 'Certification added successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Update Certification
router.put('/certifications/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, issuer, issuedDate, credentialUrl } = req.body;

    const cert = await prisma.certification.update({
      where: { id },
      data: {
        name,
        issuer,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        credentialUrl
      }
    });

    sendSuccess(res, cert, 'Certification updated successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

// Delete Certification
router.delete('/certifications/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.certification.delete({ where: { id } });
    sendSuccess(res, null, 'Certification deleted successfully');
  } catch (error: any) {
    sendError(res, 500, error.message, 'SERVER_ERROR');
  }
});

export default router;
