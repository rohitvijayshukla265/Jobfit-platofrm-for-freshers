import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Information' },
  { id: 2, title: 'Education' },
  { id: 3, title: 'Skills' },
  { id: 4, title: 'Experience' },
  { id: 5, title: 'Target Job Role' },
  { id: 6, title: 'Career Goals' },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { token, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [personalInfo, setPersonalInfo] = useState({ phone: '', location: '', bio: '' });
  const [education, setEducation] = useState([{ degree: '', institution: '', year: '' }]);
  const [skillsInput, setSkillsInput] = useState('');
  const [experience, setExperience] = useState([{ role: '', company: '', years: '' }]);
  const [targetJobRole, setTargetJobRole] = useState('');
  const [careerGoals, setCareerGoals] = useState('');

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSkip = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personalInfo: { phone: '', location: '', bio: '' },
          education: [],
          skills: [],
          experience: [],
          targetJobRole: '',
          careerGoals: '',
        }),
      });

      if (!res.ok) throw new Error('Failed to skip onboarding');
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error skipping onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personalInfo,
          education: education.filter(e => e.degree && e.institution),
          skills,
          experience: experience.filter(e => e.role && e.company),
          targetJobRole,
          careerGoals,
        }),
      });

      if (!res.ok) throw new Error('Failed to save profile');
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="text" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input type="text" value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Bio</label>
              <textarea value={personalInfo.bio} onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" rows={3} placeholder="Tell us about yourself..." />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={idx} className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
                <input type="text" value={edu.degree} onChange={(e) => { const newEdu = [...education]; newEdu[idx].degree = e.target.value; setEducation(newEdu); }} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Degree (e.g. B.S. Computer Science)" />
                <input type="text" value={edu.institution} onChange={(e) => { const newEdu = [...education]; newEdu[idx].institution = e.target.value; setEducation(newEdu); }} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Institution" />
                <input type="text" value={edu.year} onChange={(e) => { const newEdu = [...education]; newEdu[idx].year = e.target.value; setEducation(newEdu); }} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Graduation Year" />
              </div>
            ))}
            <button onClick={() => setEducation([...education, { degree: '', institution: '', year: '' }])} className="text-blue-500 text-sm font-medium">+ Add another degree</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Skills (Comma separated)</label>
            <textarea value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" rows={4} placeholder="React, Node.js, TypeScript, PostgreSQL..." />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
                <input type="text" value={exp.role} onChange={(e) => { const newExp = [...experience]; newExp[idx].role = e.target.value; setExperience(newExp); }} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Job Title" />
                <input type="text" value={exp.company} onChange={(e) => { const newExp = [...experience]; newExp[idx].company = e.target.value; setExperience(newExp); }} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Company Name" />
                <input type="text" value={exp.years} onChange={(e) => { const newExp = [...experience]; newExp[idx].years = e.target.value; setExperience(newExp); }} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Duration (e.g. 2020-2023)" />
              </div>
            ))}
            <button onClick={() => setExperience([...experience, { role: '', company: '', years: '' }])} className="text-blue-500 text-sm font-medium">+ Add another role</button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Target Job Role</label>
            <select value={targetJobRole} onChange={(e) => setTargetJobRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
              <option value="">Select a role...</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="Data Analyst">Data Analyst</option>
            </select>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Career Goals</label>
            <textarea value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" rows={4} placeholder="Where do you see yourself in 3-5 years? What are you looking to achieve?" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Setup</h1>
            <p className="text-gray-500 mt-2">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleSkip} className="text-sm text-gray-500 hover:text-gray-900 hover:underline font-medium">Skip & Set Up Later</button>
            <span className="text-gray-300">|</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline font-medium">Sign Out</button>
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-lg bg-white dark:bg-gray-900 shadow-lg">
              {Math.round((currentStep / steps.length) * 100)}%
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mb-8">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
        </div>

        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800"
        >
          {renderStep()}

          <div className="mt-8 flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Complete Setup
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
