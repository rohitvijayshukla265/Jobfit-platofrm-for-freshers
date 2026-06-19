import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Assessments from './pages/Assessments';
import TakeAssessment from './pages/TakeAssessment';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CommunicationAnalyzer from './pages/CommunicationAnalyzer';
import Layout from './components/Layout';
import TechnicalDocs from './pages/TechnicalDocs';
import PrepGuidelines from './pages/PrepGuidelines';
import ImportantRules from './pages/ImportantRules';
import SupportCenter from './pages/SupportCenter';
import Referrals from './pages/Referrals';
import Archive from './pages/Archive';
import Profile from './pages/Profile';
import SoftwareHome from './pages/SoftwareHome';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};



const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 animate-pulse" />
          <span className="font-bold text-xl tracking-tight">InterviewIQ AI</span>
        </div>
        <div className="flex gap-6 items-center font-medium text-sm">
          <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#pricing" className="hover:opacity-70 transition-opacity">Pricing</a>
          <Link to="/login" className="hover:opacity-70 transition-opacity">Login</Link>
          <Link to="/signup" className="px-4 py-2 bg-foreground text-background rounded-full hover:scale-105 transition-transform shadow-lg">Get Started</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 text-sm font-medium bg-gray-50 dark:bg-gray-900 shadow-sm"
        >
          ✨ The new standard for interview prep
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight"
        >
          Measure. Improve. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Get Hired.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed"
        >
          AI-driven mock interviews, real-time feedback, and personalized roadmaps to help you land your dream job at top tech companies.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex gap-4"
        >
          <Link to="/signup" className="px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            Start Assessment Free
          </Link>
          <button className="px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-full font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            View Demo
          </button>
        </motion.div>

        {/* Mockup Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-24 w-full h-[600px] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white/50 dark:bg-black/50 backdrop-blur-xl overflow-hidden relative"
        >
           <div className="absolute top-0 w-full h-12 bg-gray-100/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
           </div>
           <div className="p-8 pt-20 grid grid-cols-3 gap-6 h-full">
              <div className="col-span-1 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center">
                 <div className="w-32 h-32 rounded-full border-8 border-purple-500 flex items-center justify-center text-3xl font-bold">85%</div>
                 <p className="mt-4 font-semibold text-gray-500">Readiness Score</p>
              </div>
              <div className="col-span-2 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col gap-4">
                 <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                 <div className="h-12 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                 <div className="h-12 w-5/6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                 <div className="h-32 w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg mt-auto border border-blue-500/30"></div>
              </div>
           </div>
        </motion.div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/software-home" element={
            <ProtectedRoute>
              <Layout>
                <SoftwareHome />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/assessments" element={
            <ProtectedRoute>
              <Layout>
                <Assessments />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/assessments/:id" element={
            <ProtectedRoute>
              <TakeAssessment />
            </ProtectedRoute>
          } />
          <Route path="/resume" element={
            <ProtectedRoute>
              <Layout>
                <ResumeAnalyzer />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/communication" element={
            <ProtectedRoute>
              <Layout>
                <CommunicationAnalyzer />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/docs/technical" element={
            <ProtectedRoute>
              <Layout>
                <TechnicalDocs />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/prep-guidelines" element={
            <ProtectedRoute>
              <Layout>
                <PrepGuidelines />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/rules" element={
            <ProtectedRoute>
              <Layout>
                <ImportantRules />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute>
              <Layout>
                <SupportCenter />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/referrals" element={
            <ProtectedRoute>
              <Layout>
                <Referrals />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/archive" element={
            <ProtectedRoute>
              <Layout>
                <Archive />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
