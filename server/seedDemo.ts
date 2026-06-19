import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Demo Account...');

  const email = 'demo@gmail.com';
  const password = await bcrypt.hash('password123', 10);

  // Check if demo user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Demo user already exists. Cleaning up old data...');
    await prisma.communicationReport.deleteMany({ where: { profile: { userId: existingUser.id } } });
    await prisma.userProfile.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // Create User and Profile
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Rohit Shukla',
      password,
      role: 'USER',
      profile: {
        create: {
          personalInfo: JSON.stringify({ phone: '+1 234 567 8900', location: 'San Francisco, CA', bio: 'Passionate software engineer building scalable web applications.' }),
          education: JSON.stringify([{ degree: 'B.S. Computer Science', institution: 'Tech University', year: '2022' }]),
          skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker']),
          experience: JSON.stringify([{ role: 'Frontend Engineer', company: 'Startup Inc', years: '2022-2024' }]),
          targetJobRole: 'Full Stack Developer',
          careerGoals: 'To become a technical lead and build impactful SaaS products.',
          onboardingCompleted: true,
          completionPercentage: 100,
          technicalScore: 85,
          grammarScore: 92,
          aptitudeScore: 78,
        }
      }
    },
    include: { profile: true }
  });

  const profileId = user.profile!.id;

  // Create Mock Resume Report
  await prisma.resumeReport.create({
    data: {
      profileId,
      fileName: 'Rohit_Shukla_Resume.pdf',
      atsScore: 88,
      missingKeywords: JSON.stringify(['GraphQL', 'AWS']),
      grammarScore: 95,
      suggestions: JSON.stringify(['Add more quantified metrics to your experience section.']),
    }
  });

  // Create Mock Communication Report
  await prisma.communicationReport.create({
    data: {
      profileId,
      fluencyScore: 89,
      confidenceScore: 85,
      speakingSpeed: 135,
      fillerWords: 3,
      clarityScore: 91,
      suggestions: JSON.stringify(['Great pacing.', 'Try to pause slightly longer between key points.']),
    }
  });

  console.log(`Demo account seeded successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: password123`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
