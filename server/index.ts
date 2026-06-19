import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './auth';
import profileRoutes from './profile';
import assessmentRoutes from './assessment';
import resumeRoutes from './resume';
import communicationRoutes from './communication';
import coursesRoutes from './courses';
import chaptersRoutes from './chapters';
import userRoutes from './user';
import adminRoutes from './admin';
import testsRoutes from './tests';
import interviewsRoutes from './interviews';
import jobsRoutes from './jobs';
import alertsRoutes from './alerts';
import applicationsRoutes from './applications';
import storiesRoutes from './stories';
import paymentsRoutes from './payments';
import roadmapsRoutes from './roadmaps';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased for development
  message: { success: false, error: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/roadmaps', roadmapsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerPilot AI API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
