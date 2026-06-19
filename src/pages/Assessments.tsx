import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Play, Clock, BookOpen } from 'lucide-react';

const Assessments = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch('/api/assessments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAssessments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Technical: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100/50' },
    Aptitude: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100/50' },
    Grammar: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100/50' },
    Communication: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100/50' }
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-16">
      <div className="max-w-[1400px] mx-auto px-8 pt-8">
        
        {/* Header Navigation Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">
              Overview / <span className="text-purple-600">Assessments</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Assessment Catalog</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Test your domain expertise, critical thinking, and communication flow.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-4 py-2 border border-slate-100 bg-white hover:border-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Assessments Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((a: any) => {
            const colors = categoryColors[a.category] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
            return (
              <div 
                key={a.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {a.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-850 mb-2 leading-snug group-hover:text-purple-600 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">
                    {a.description || 'Practice behavioral questions and technical assessments to track improvement in your profile score.'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 text-xs text-gray-450 font-medium">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> {a.duration} mins</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-gray-400" /> {a._count?.questions || 0} Questions</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/assessments/${a.id}`)}
                    className="w-10 h-10 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-purple-100/50 cursor-pointer"
                  >
                    <Play className="w-4.5 h-4.5 ml-0.5 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}

          {assessments.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm text-gray-400 font-medium text-sm">
              No assessments available yet. Check back later!
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Assessments;
