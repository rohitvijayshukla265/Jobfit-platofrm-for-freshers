import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Phone, MapPin, 
  Globe, Award, Plus, X, 
  Edit3, ArrowLeft, Loader2, 
  ChevronRight, Trash2, Download,
  UploadCloud, AlertCircle, Calendar, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Profile = () => {
  const { token, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);

  // Active modal controls: 'personal' | 'headline' | 'skills' | 'experience' | 'education' | 'project' | 'certification' | 'summary' | null
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null); 

  // Forms
  const [personalForm, setPersonalForm] = useState({
    name: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [headlineText, setHeadlineText] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [summaryText, setSummaryText] = useState('');

  // Education Form
  const [educationForm, setEducationForm] = useState({
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
  });

  // Experience Form
  const [experienceForm, setExperienceForm] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  // Project Form
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    techStack: '',
    liveUrl: '',
    repoUrl: '',
  });

  // Certification Form
  const [certificationForm, setCertificationForm] = useState({
    name: '',
    issuer: '',
    issuedDate: '',
    credentialUrl: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const prof = data.data;
          setProfile(prof);
          
          setPersonalForm({
            name: prof.user?.name || '',
            phone: prof.phone || '',
            location: prof.location || '',
            linkedinUrl: prof.linkedinUrl || '',
            githubUrl: prof.githubUrl || '',
            portfolioUrl: prof.portfolioUrl || '',
          });

          setHeadlineText(prof.bio?.split('\n')?.[0] || prof.targetRoles?.[0]?.role || 'Software Developer | Open to Opportunities');
          setSummaryText(prof.bio || '');

          if (prof.skills) {
            setSkillsList(prof.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
          } else {
            setSkillsList([]);
          }

          setEducationForm({
            college: prof.college || '',
            degree: prof.degree || '',
            branch: prof.branch || '',
            graduationYear: prof.graduationYear?.toString() || '',
            cgpa: prof.cgpa?.toString() || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setSaving(true);
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await fetchProfile();
          await refreshUser();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setParsingResume(true);
      const res = await fetch('/api/profile/resume/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert('Resume uploaded and profile features automatically updated!');
          await fetchProfile();
          await refreshUser();
        } else {
          alert(data.error || 'Failed to parse resume');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading resume.');
    } finally {
      setParsingResume(false);
    }
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const saveProfileFields = async (updatedFields: any) => {
    try {
      setSaving(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setActiveModal(null);
          await refreshUser();
        } else {
          alert(data.error || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const endpoint = selectedItem ? `/api/profile/experience/${selectedItem.id}` : '/api/profile/experience';
      const method = selectedItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(experienceForm),
      });

      if (res.ok) {
        await fetchProfile();
        setActiveModal(null);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const res = await fetch(`/api/profile/experience/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const endpoint = selectedItem ? `/api/profile/projects/${selectedItem.id}` : '/api/profile/projects';
      const method = selectedItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        await fetchProfile();
        setActiveModal(null);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/profile/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const endpoint = selectedItem ? `/api/profile/certifications/${selectedItem.id}` : '/api/profile/certifications';
      const method = selectedItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(certificationForm),
      });

      if (res.ok) {
        await fetchProfile();
        setActiveModal(null);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCertification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    try {
      const res = await fetch(`/api/profile/certifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-gray-400 font-semibold text-sm">Syncing profile data...</p>
        </div>
      </div>
    );
  }

  const overallScore = profile?.profileScore || 0;
  
  // Circle Calculations for completion indicator
  const Radius = 44;
  const Circumference = 2 * Math.PI * Radius;
  const strokeDashoffset = Circumference - (overallScore / 100) * Circumference;

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 pb-20">
      
      {/* Sticky Compact Dashboard Navigation Header */}
      <header className="bg-white border-b border-slate-100 p-6 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xs text-gray-400 font-semibold flex items-center gap-2">
            <Link to="/dashboard" className="hover:text-purple-600 transition-colors flex items-center gap-1 text-gray-500 font-semibold">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-purple-600 font-bold">Edit Profile Workspace</span>
          </div>
          <div className="bg-green-50 border border-green-100 px-3.5 py-1.5 rounded-full text-xs font-bold text-green-600 flex items-center gap-1.5 shadow-sm">
            <Award className="w-4 h-4" /> Profile strength: {overallScore}%
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Panel - Sticky Workspace Anchor Links */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 sticky top-48 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-450 text-[11px] uppercase tracking-wider px-2 pb-2 border-b border-slate-50">Profile Sections</h3>
            <nav className="flex flex-col space-y-1">
              {[
                { name: 'Identity Info', id: 'sec-identity' },
                { name: 'Resume File', id: 'sec-resume' },
                { name: 'Headline Summary', id: 'sec-headline' },
                { name: 'Skills Profile', id: 'sec-skills' },
                { name: 'Work History', id: 'sec-employment' },
                { name: 'Education History', id: 'sec-education' },
                { name: 'Side Projects', id: 'sec-projects' },
                { name: 'Professional Bio', id: 'sec-summary' },
                { name: 'Certifications', id: 'sec-certifications' }
              ].map(link => (
                <button
                  key={link.id}
                  onClick={() => handleScrollTo(link.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-650 hover:bg-purple-50/50 hover:text-purple-700 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-purple-500 transition-all" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Panel - Content Sections */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Identity & Avatar Card */}
          <div id="sec-identity" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/10 to-indigo-100/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              {/* Circular Completeness Gauge around Avatar */}
              <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0 group">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r={Radius} className="stroke-slate-100 fill-none" strokeWidth="5" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r={Radius} 
                    className="stroke-purple-600 fill-none transition-all duration-500" 
                    strokeWidth="5" 
                    strokeDasharray={Circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <label className="cursor-pointer w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-sm relative bg-gradient-to-tr from-purple-500 to-indigo-500 hover:shadow-md transition-all">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                    />
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-extrabold text-2xl">
                        {profile?.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="w-4.5 h-4.5 text-white" />
                    </div>
                  </label>
                </div>
              </div>

              {/* Details and Edit Action */}
              <div className="flex-1 text-center md:text-left min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-2xl font-semibold text-slate-800 truncate tracking-tight">{profile?.user?.name || 'User'}</h1>
                  <button 
                    onClick={() => setActiveModal('personal')}
                    className="text-gray-400 hover:text-purple-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Edit Information"
                  >
                    <Edit3 className="w-4.5 h-4.5" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-400 mt-1">{headlineText}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 border-t border-slate-50 pt-5 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <MapPin className="w-4.5 h-4.5 text-gray-400" />
                    <span className="truncate">{profile?.location || 'Add location'}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Phone className="w-4.5 h-4.5 text-gray-400" />
                    <span>{profile?.phone || 'Add phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="w-4.5 h-4.5 text-gray-400" />
                    <span className="truncate">{profile?.user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Alert Banner */}
          <div className="bg-blue-50/40 border border-blue-100/50 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Target Profile Relevancy</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Ensure your location and target role matches match active market opportunities to optimize resume suggestions.
              </p>
            </div>
          </div>

          {/* Resume Upload Workspace */}
          <div id="sec-resume" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">Resume Document</h3>
              <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100/30 uppercase tracking-wider">Verified Sync</span>
            </div>

            {profile?.resumeUrl ? (
              <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-100/50 font-extrabold text-xs">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">rohit_shukla_resume.pdf</p>
                    <p className="text-xs text-gray-400 mt-0.5">Uploaded via profile parsing engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="Download">
                    <Download className="w-4.5 h-4.5" />
                  </a>
                  <button onClick={() => saveProfileFields({ resumeUrl: null })} className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Delete">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-purple-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/10 group relative block">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleResumeUpload} 
                  className="hidden" 
                  disabled={parsingResume}
                />
                {parsingResume ? (
                  <div className="flex flex-col items-center py-4">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
                    <p className="text-sm font-bold text-gray-805 animate-pulse">Analyzing document patterns...</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-gray-450 group-hover:text-purple-500 transition-colors mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Upload your latest Resume</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Supported formats: PDF, DOCX up to 2MB</p>
                    <span className="mt-4 px-4 py-2 bg-white border border-slate-100 hover:border-slate-200 text-xs font-bold text-gray-600 rounded-xl shadow-sm transition-all">
                      Browse Files
                    </span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Headline Workspace */}
          <div id="sec-headline" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">Professional Headline</h3>
              <button onClick={() => setActiveModal('headline')} className="text-gray-400 hover:text-purple-600 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-600 leading-relaxed bg-[#f8f9fc]/50 p-4 rounded-2xl border border-slate-50">
              {headlineText}
            </p>
          </div>

          {/* Skills Workspace */}
          <div id="sec-skills" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">Skills Profile</h3>
              <button onClick={() => setActiveModal('skills')} className="text-gray-400 hover:text-purple-600 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skillsList.length > 0 ? (
                skillsList.map(skill => (
                  <span key={skill} className="px-3.5 py-1.5 bg-[#f8f9fc] border border-slate-100 text-gray-650 rounded-xl text-xs font-bold hover:border-purple-300 transition-colors cursor-default">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No skills listed yet.</p>
              )}
            </div>
          </div>

          {/* Employment Workspace */}
          <div id="sec-employment" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-800">Work History</h3>
              <button 
                onClick={() => {
                  setExperienceForm({ company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' });
                  setSelectedItem(null);
                  setActiveModal('experience');
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" /> Add Job
              </button>
            </div>

            <div className="space-y-6">
              {profile?.workExperience && profile.workExperience.length > 0 ? (
                profile.workExperience.map((exp: any) => (
                  <div key={exp.id} className="group relative border-l border-slate-100 hover:border-purple-500 pl-5 py-1.5 transition-colors">
                    
                    {/* Hover actions */}
                    <div className="absolute right-0 top-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setSelectedItem(exp);
                          setExperienceForm({
                            company: exp.company,
                            role: exp.role,
                            startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
                            endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
                            isCurrent: !!exp.isCurrent,
                            description: exp.description || '',
                          });
                          setActiveModal('experience');
                        }}
                        className="text-gray-450 hover:text-purple-600 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-gray-450 hover:text-red-500 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">{exp.role}</h4>
                    <p className="text-xs font-semibold text-purple-605 mt-1">{exp.company}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - 
                      {exp.isCurrent ? ' Present' : ` ${exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}`}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-500 leading-relaxed mt-3 max-w-2xl bg-[#f8f9fc]/50 p-3 rounded-xl border border-slate-50">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No work experience listed yet.
                </div>
              )}
            </div>
          </div>

          {/* Education Workspace */}
          <div id="sec-education" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-800">Education Details</h3>
              <button 
                onClick={() => setActiveModal('education')}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Edit Education
              </button>
            </div>

            {profile?.college ? (
              <div className="border-l border-slate-100 pl-5 py-1">
                <h4 className="font-semibold text-slate-800 text-sm leading-tight">{profile.college}</h4>
                <p className="text-xs font-semibold text-gray-500 mt-1">{profile.degree} in {profile.branch}</p>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400 font-bold">
                  {profile.graduationYear && <span>Class of {profile.graduationYear}</span>}
                  {profile.cgpa && <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-yellow-505" /> GPA: {profile.cgpa}</span>}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                No education details specified.
              </div>
            )}
          </div>

          {/* Projects Workspace */}
          <div id="sec-projects" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-800">Side Projects</h3>
              <button 
                onClick={() => {
                  setProjectForm({ title: '', description: '', techStack: '', liveUrl: '', repoUrl: '' });
                  setSelectedItem(null);
                  setActiveModal('project');
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" /> Add Project
              </button>
            </div>

            <div className="space-y-6">
              {profile?.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj: any) => (
                  <div key={proj.id} className="group relative border-l border-slate-100 hover:border-purple-500 pl-5 py-1.5 transition-colors">
                    
                    {/* Hover actions */}
                    <div className="absolute right-0 top-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setSelectedItem(proj);
                          setProjectForm({
                            title: proj.title,
                            description: proj.description,
                            techStack: proj.techStack || '',
                            liveUrl: proj.liveUrl || '',
                            repoUrl: proj.repoUrl || '',
                          });
                          setActiveModal('project');
                        }}
                        className="text-gray-455 hover:text-purple-600 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(proj.id)}
                        className="text-gray-455 hover:text-red-500 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">{proj.title}</h4>
                    {proj.techStack && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.techStack.split(',').map((t: string) => (
                          <span key={t} className="px-2 py-0.5 bg-purple-50 border border-purple-100/30 text-[9px] font-bold text-purple-600 rounded-md">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed max-w-2xl bg-[#f8f9fc]/50 p-3 rounded-xl border border-slate-50">
                      {proj.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-[11px] font-bold">
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-1">
                          Live link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.repoUrl && (
                        <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:underline flex items-center gap-1">
                          Repository <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No projects listed yet.
                </div>
              )}
            </div>
          </div>

          {/* Professional Bio Workspace */}
          <div id="sec-summary" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">Professional Bio</h3>
              <button onClick={() => setActiveModal('summary')} className="text-gray-400 hover:text-purple-600 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-650 leading-relaxed whitespace-pre-line bg-[#f8f9fc]/30 p-4 rounded-2xl border border-slate-50/50">
              {summaryText || "No profile summary/bio added yet. Describe your primary strengths and work objectives."}
            </p>
          </div>

          {/* Certifications Workspace */}
          <div id="sec-certifications" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-805">Certifications</h3>
              <button 
                onClick={() => {
                  setCertificationForm({ name: '', issuer: '', issuedDate: '', credentialUrl: '' });
                  setSelectedItem(null);
                  setActiveModal('certification');
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" /> Add Certificate
              </button>
            </div>

            <div className="space-y-6">
              {profile?.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((cert: any) => (
                  <div key={cert.id} className="group relative border-l border-slate-100 hover:border-purple-500 pl-5 py-1.5 transition-colors">
                    
                    {/* Hover actions */}
                    <div className="absolute right-0 top-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setSelectedItem(cert);
                          setCertificationForm({
                            name: cert.name,
                            issuer: cert.issuer,
                            issuedDate: cert.issuedDate ? new Date(cert.issuedDate).toISOString().split('T')[0] : '',
                            credentialUrl: cert.credentialUrl || '',
                          });
                          setActiveModal('certification');
                        }}
                        className="text-gray-455 hover:text-purple-600 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="text-gray-455 hover:text-red-500 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">{cert.name}</h4>
                    <p className="text-xs font-semibold text-gray-500 mt-1">Issued by {cert.issuer}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">
                      Date: {new Date(cert.issuedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-1 font-bold text-[11px] mt-2.5">
                        Verify credential <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No certifications listed yet.
                </div>
              )}
            </div>
          </div>

          {/* Social Presence Web Links */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-5">Social Platforms</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {profile?.linkedinUrl ? (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 p-3.5 bg-[#f8f9fc] border border-slate-50 hover:border-purple-200 rounded-2xl hover:bg-purple-50/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <LinkedinIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">LinkedIn</p>
                    <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-purple-600">Connected</p>
                  </div>
                </a>
              ) : (
                <button onClick={() => setActiveModal('personal')} className="flex items-center gap-3.5 p-3.5 bg-[#f8f9fc] border border-slate-50 hover:border-purple-300 rounded-2xl text-left cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <LinkedinIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">LinkedIn</p>
                    <p className="text-xs font-bold text-purple-600 hover:underline">Link account</p>
                  </div>
                </button>
              )}

              {profile?.githubUrl ? (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 p-3.5 bg-[#f8f9fc] border border-slate-50 hover:border-purple-200 rounded-2xl hover:bg-purple-50/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">GitHub</p>
                    <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-purple-600">Connected</p>
                  </div>
                </a>
              ) : (
                <button onClick={() => setActiveModal('personal')} className="flex items-center gap-3.5 p-3.5 bg-[#f8f9fc] border border-slate-50 hover:border-purple-300 rounded-2xl text-left cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">GitHub</p>
                    <p className="text-xs font-bold text-purple-600 hover:underline">Link account</p>
                  </div>
                </button>
              )}

              {profile?.portfolioUrl ? (
                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 p-3.5 bg-[#f8f9fc] border border-slate-50 hover:border-purple-200 rounded-2xl hover:bg-purple-50/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Portfolio</p>
                    <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-purple-600">Connected</p>
                  </div>
                </a>
              ) : (
                <button onClick={() => setActiveModal('personal')} className="flex items-center gap-3.5 p-3.5 bg-[#f8f9fc] border border-slate-50 hover:border-purple-300 rounded-2xl text-left cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Portfolio</p>
                    <p className="text-xs font-bold text-purple-600 hover:underline">Link website</p>
                  </div>
                </button>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Modal Dialog Panels */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100/80 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-6">
              <h3 className="text-base font-semibold text-slate-800 capitalize">
                {activeModal === 'personal' && 'Edit Personal Info'}
                {activeModal === 'headline' && 'Edit Resume Headline'}
                {activeModal === 'skills' && 'Manage Skills'}
                {activeModal === 'experience' && (selectedItem ? 'Edit Employment' : 'Add Employment')}
                {activeModal === 'education' && 'Edit Education'}
                {activeModal === 'project' && (selectedItem ? 'Edit Project' : 'Add Project')}
                {activeModal === 'certification' && (selectedItem ? 'Edit Certification' : 'Add Certification')}
                {activeModal === 'summary' && 'Edit Profile Summary'}
              </h3>
              <button 
                onClick={() => { setActiveModal(null); setSelectedItem(null); }}
                className="text-gray-400 hover:text-gray-655 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Forms */}
            {activeModal === 'personal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={personalForm.name} 
                    onChange={e => setPersonalForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      value={personalForm.phone} 
                      onChange={e => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Location</label>
                    <input 
                      type="text" 
                      value={personalForm.location} 
                      onChange={e => setPersonalForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">LinkedIn Profile URL</label>
                  <input 
                    type="url" 
                    value={personalForm.linkedinUrl} 
                    onChange={e => setPersonalForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">GitHub URL</label>
                    <input 
                      type="url" 
                      value={personalForm.githubUrl} 
                      onChange={e => setPersonalForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Portfolio URL</label>
                    <input 
                      type="url" 
                      value={personalForm.portfolioUrl} 
                      onChange={e => setPersonalForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button onClick={() => saveProfileFields(personalForm)} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Info
                  </button>
                </div>
              </div>
            )}

            {/* Resume Headline Modal */}
            {activeModal === 'headline' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Headline Text</label>
                  <textarea 
                    value={headlineText} 
                    onChange={e => setHeadlineText(e.target.value)}
                    rows={3}
                    maxLength={150}
                    placeholder="e.g. Frontend Engineer | React Specialist"
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{headlineText.length}/150 characters</p>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button onClick={() => saveProfileFields({ bio: headlineText + (summaryText ? `\n\n${summaryText}` : '') })} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Update Headline
                  </button>
                </div>
              </div>
            )}

            {/* Skills Modal */}
            {activeModal === 'skills' && (
              <div className="space-y-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
                      const updated = [...skillsList, newSkill.trim()];
                      setSkillsList(updated);
                      setNewSkill('');
                    }
                  }} 
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)}
                    placeholder="Enter skill (e.g. Docker, TypeScript)"
                    className="flex-1 px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer">
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 py-4">
                  {skillsList.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f9fc] border border-slate-50 text-gray-700 rounded-xl text-[11px] font-bold">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => setSkillsList(prev => prev.filter(s => s !== skill))} 
                        className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button onClick={() => saveProfileFields({ skills: skillsList.join(',') })} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Skills
                  </button>
                </div>
              </div>
            )}

            {/* Employment Modal */}
            {activeModal === 'experience' && (
              <form onSubmit={handleAddExperience} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Job Title</label>
                    <input 
                      type="text" 
                      required
                      value={experienceForm.role}
                      onChange={e => setExperienceForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                      placeholder="e.g. React Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Company Name</label>
                    <input 
                      type="text" 
                      required
                      value={experienceForm.company}
                      onChange={e => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                      placeholder="e.g. Innovate Tech"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={experienceForm.startDate}
                      onChange={e => setExperienceForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
                    <input 
                      type="date" 
                      disabled={experienceForm.isCurrent}
                      required={!experienceForm.isCurrent}
                      value={experienceForm.endDate}
                      onChange={e => setExperienceForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium text-gray-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isCurrent"
                    checked={experienceForm.isCurrent}
                    onChange={e => setExperienceForm(prev => ({ ...prev, isCurrent: e.target.checked, endDate: e.target.checked ? '' : prev.endDate }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isCurrent" className="text-xs font-semibold text-gray-600 cursor-pointer select-none">I currently work here</label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Role Description</label>
                  <textarea 
                    value={experienceForm.description}
                    onChange={e => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium resize-none"
                    placeholder="Describe your primary role goals, contributions, and key technologies..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Job
                  </button>
                </div>
              </form>
            )}

            {/* Education Modal */}
            {activeModal === 'education' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">College / University</label>
                  <input 
                    type="text" 
                    value={educationForm.college} 
                    onChange={e => setEducationForm(prev => ({ ...prev, college: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Degree</label>
                    <input 
                      type="text" 
                      value={educationForm.degree} 
                      onChange={e => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                      placeholder="e.g. B.Tech, B.S."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Branch / Specialization</label>
                    <input 
                      type="text" 
                      value={educationForm.branch} 
                      onChange={e => setEducationForm(prev => ({ ...prev, branch: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Graduation Year</label>
                    <input 
                      type="number" 
                      value={educationForm.graduationYear} 
                      onChange={e => setEducationForm(prev => ({ ...prev, graduationYear: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">GPA / CGPA</label>
                    <input 
                      type="text" 
                      value={educationForm.cgpa} 
                      onChange={e => setEducationForm(prev => ({ ...prev, cgpa: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button onClick={() => saveProfileFields(educationForm)} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Education
                  </button>
                </div>
              </div>
            )}

            {/* Project Modal */}
            {activeModal === 'project' && (
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Project Title</label>
                  <input 
                    type="text" 
                    required
                    value={projectForm.title}
                    onChange={e => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    placeholder="e.g. E-Commerce Backend"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tech Stack (comma separated)</label>
                  <input 
                    type="text" 
                    value={projectForm.techStack}
                    onChange={e => setProjectForm(prev => ({ ...prev, techStack: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    placeholder="React, Express, Node.js"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Live Demo URL</label>
                    <input 
                      type="url" 
                      value={projectForm.liveUrl}
                      onChange={e => setProjectForm(prev => ({ ...prev, liveUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Repository URL</label>
                    <input 
                      type="url" 
                      value={projectForm.repoUrl}
                      onChange={e => setProjectForm(prev => ({ ...prev, repoUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Project Description</label>
                  <textarea 
                    required
                    value={projectForm.description}
                    onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium resize-none"
                    placeholder="Write a brief overview of key challenges solved..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Project
                  </button>
                </div>
              </form>
            )}

            {/* Certification Modal */}
            {activeModal === 'certification' && (
              <form onSubmit={handleAddCertification} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Certification Name</label>
                  <input 
                    type="text" 
                    required
                    value={certificationForm.name}
                    onChange={e => setCertificationForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    placeholder="e.g. AWS Certified Architect"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Issuing Organization</label>
                    <input 
                      type="text" 
                      required
                      value={certificationForm.issuer}
                      onChange={e => setCertificationForm(prev => ({ ...prev, issuer: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                      placeholder="e.g. Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-405 uppercase tracking-wider mb-1.5">Issue Date</label>
                    <input 
                      type="date" 
                      required
                      value={certificationForm.issuedDate}
                      onChange={e => setCertificationForm(prev => ({ ...prev, issuedDate: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Credential Verification URL</label>
                  <input 
                    type="url" 
                    value={certificationForm.credentialUrl}
                    onChange={e => setCertificationForm(prev => ({ ...prev, credentialUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium"
                    placeholder="https://creds.example.com/..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Certificate
                  </button>
                </div>
              </form>
            )}

            {/* Profile Summary Modal */}
            {activeModal === 'summary' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Profile Summary / Bio</label>
                  <textarea 
                    value={summaryText} 
                    onChange={e => setSummaryText(e.target.value)}
                    rows={6}
                    placeholder="Provide a professional summary of your key skills and achievements..."
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl outline-none focus:border-purple-400 text-sm font-medium resize-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                  <button onClick={() => saveProfileFields({ bio: (headlineText ? `${headlineText}\n\n` : '') + summaryText })} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Update Summary
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
