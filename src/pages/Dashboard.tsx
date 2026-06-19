import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight,
  Target, Zap, BookOpen, MapPin, Phone, Mail,
  GraduationCap
} from 'lucide-react';

const mockProgressData1 = [
  { name: 'W1', score: 30 }, { name: 'W2', score: 45 }, { name: 'W3', score: 55 }, { name: 'W4', score: 85 }
];
const mockProgressData2 = [
  { name: 'W1', score: 50 }, { name: 'W2', score: 40 }, { name: 'W3', score: 65 }, { name: 'W4', score: 70 }
];
const mockProgressData3 = [
  { name: 'W1', score: 60 }, { name: 'W2', score: 70 }, { name: 'W3', score: 80 }, { name: 'W4', score: 92 }
];

const Dashboard = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'draft' | 'in_progress' | 'archived'>('draft');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProfile(data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard profile:', err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);
  
  if (!user?.profile?.onboardingDone) {
    return <Navigate to="/onboarding" />;
  }

  const p = profile || user?.profile || {};
  const overallScore = Math.round(((p.technicalScore || 0) + (p.aptitudeScore || 0) + (p.grammarScore || 0)) / 3) || 0;
  const avatarUrl = p.avatarUrl;

  const MetricProgressCard = ({ title, score, change, isPositive, data, color }: any) => (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-all duration-300">
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
          <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}%
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-gray-800">{score}%</span>
          <span className="text-xs text-gray-400 font-medium">Average</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ backgroundColor: color, width: `${score}%` }} />
        </div>
      </div>
      <div className="w-20 h-12 flex-shrink-0 opacity-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="score" stroke={color} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-16">
        {/* Simple Breadcrumbs & Title */}
        <div className="px-8 pt-8 pb-4 max-w-[1400px] mx-auto">
          <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">
            Overview / <span className="text-purple-600">Dashboard</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Candidate Dashboard</h1>
        </div>

        {/* Content area */}
        <div className="px-8 py-2 w-full max-w-[1400px] mx-auto space-y-6">
          
          {/* 1. Large Top Profile Overview Card (Full Width) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white p-0.5 border border-slate-200 flex-shrink-0 shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-purple-50 text-purple-700 flex items-center justify-center font-semibold text-3xl rounded-full">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-semibold text-gray-800">{user?.name || 'User'}</h2>
                    <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider">Candidate</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">{p.targetRoles?.[0]?.role || p.targetJobRole || 'Software Engineer'}</p>
                </div>
                
                {/* Meta data row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-400 font-medium pt-1">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</span>
                  {p.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {p.phone}</span>}
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {p.location || 'Not Specified'}</span>
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {p.college || 'No Education details'}</span>
                </div>
              </div>
            </div>

            {/* Right block of Profile Header: Readiness Gauge & Skills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 lg:border-l lg:border-slate-100 lg:pl-8 flex-shrink-0 w-full lg:w-auto">
              {/* Overall Score widget */}
              <div className="bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100/50 flex flex-col gap-2 min-w-[200px]">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span>Readiness Score</span>
                  <span className="text-purple-600 font-bold text-base">{overallScore}%</span>
                </div>
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${overallScore}%` }} />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  <span>Profile status</span>
                  <span>Active</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2 flex-1 sm:max-w-[200px]">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Top Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {p.skills ? (
                    p.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean).slice(0, 3).map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-gray-600 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">No skills added</span>
                  )}
                  {p.skills && p.skills.split(',').length > 3 && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-bold self-center">
                      +{p.skills.split(',').length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Split section: Recent Assessments (Left) and Score Cards (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recent Assessments Section */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-6">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent assessments</h2>
                    
                    {/* Segmented Tab Pill Control */}
                    <div className="flex bg-gray-50/80 p-1 rounded-xl border border-gray-100">
                      <button 
                        onClick={() => setActiveTab('draft')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                          activeTab === 'draft' 
                            ? 'bg-white text-purple-600 shadow-sm border border-gray-150/30' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Draft <span className={`ml-1 py-0.5 px-1.5 rounded-full text-xs ${activeTab === 'draft' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>2</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('in_progress')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                          activeTab === 'in_progress' 
                            ? 'bg-white text-purple-600 shadow-sm border border-gray-150/30' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        In Progress <span className={`ml-1 py-0.5 px-1.5 rounded-full text-xs ${activeTab === 'in_progress' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>2</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('archived')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                          activeTab === 'archived' 
                            ? 'bg-white text-purple-600 shadow-sm border border-gray-150/30' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Archived <span className={`ml-1 py-0.5 px-1.5 rounded-full text-xs ${activeTab === 'archived' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>1</span>
                      </button>
                    </div>
                  </div>
                  <a href="#" className="text-sm font-semibold text-gray-400 hover:text-purple-600 transition-colors">View All</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Card 1 */}
                  <div className="bg-white border border-slate-100 hover:border-blue-100/80 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100/50">
                          <Target className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-base mb-2 leading-snug">Mastering System Design for Senior Roles</h3>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed">Elevate your architectural patterns and scaling fundamentals.</p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-gray-400">
                      <span className="font-medium text-gray-400">Not Started</span>
                      <span className="font-medium text-xs">Updated: Apr 10</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-slate-100 hover:border-yellow-100/80 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shadow-inner border border-yellow-100/50">
                          <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-yellow-600 bg-yellow-50/80 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-base mb-2 leading-snug">Boost your performance: Behavioral Mock</h3>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed">Nail mock behavioral rounds with AI-powered body and voice feedback.</p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-slate-50 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span>Start: Jun 1</span>
                        <span>Ends: Aug 1</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-1/3 rounded-full"></div>
                      </div>
                      <div className="text-xs text-gray-400 font-medium">Updated: July 10</div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-slate-100 hover:border-purple-100/80 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner border border-purple-100/50">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50/80 px-2 py-0.5 rounded-full uppercase tracking-wider">Assessed</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-base mb-2 leading-snug">The power of storytelling: Communication test</h3>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed">Refine your storytelling format and clear communication flow.</p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-gray-400">
                      <span className="font-medium text-gray-400">Ended: <span className="text-gray-500 font-semibold">Jun 11</span></span>
                      <span className="font-medium text-xs">Updated: Apr 10</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column (1/3 width): Stats & Score list */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Skill Assessment Scores</h3>
                  <Link to="/profile" className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline">
                    Manage
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <MetricProgressCard 
                    title="Technical Score" 
                    score={p.technicalScore || 0} 
                    change={15} 
                    isPositive={true} 
                    data={mockProgressData1} 
                    color="#8B5CF6"
                  />
                  
                  <MetricProgressCard 
                    title="Aptitude Score" 
                    score={p.aptitudeScore || 0} 
                    change={4} 
                    isPositive={false} 
                    data={mockProgressData2} 
                    color="#F97316"
                  />

                  <MetricProgressCard 
                    title="Grammar Score" 
                    score={p.grammarScore || 0} 
                    change={8} 
                    isPositive={true} 
                    data={mockProgressData3} 
                    color="#EC4899"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
    </div>
  );
};

export default Dashboard;
