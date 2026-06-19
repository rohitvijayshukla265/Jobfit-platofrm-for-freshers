import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, Clock, CheckCircle2, XCircle, ArrowLeft, ArrowRight, 
  ShieldAlert, AlertCircle, Lightbulb
} from 'lucide-react';

const TakeAssessment = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Test states
  const [assessment, setAssessment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Layout states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAssessment(data);
          setTimeLeft((data.duration || 30) * 60);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id, token]);

  useEffect(() => {
    if (timeLeft === null || result !== null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, result]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Explanation lookup for core topics
  const getExplanation = (questionText: string, correctAnswerText: string) => {
    if (questionText.includes('15% of 200')) {
      return 'To find 15% of 200, compute: (15 / 100) * 200. This simplifies to 0.15 * 200 = 30. Therefore, 30 is the correct answer.';
    }
    if (questionText.includes('x + y = 10')) {
      return 'Add the two equations directly: (x + y) + (x - y) = 10 + 4 => 2x = 14 => x = 7. If x = 7, then y = 3.';
    }
    if (questionText.toLowerCase().includes('react')) {
      return 'React memoization hooks target render cycles. useMemo caches computed values, while useCallback caches function instances. This prevents children re-renders when parent states mutate.';
    }
    return `Correct option matches "${correctAnswerText}". Review foundational concepts of this category to reinforce understanding.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] text-center px-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-semibold text-gray-800">Assessment Not Found</h2>
        <button onClick={() => navigate('/assessments')} className="mt-6 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer">
          Back to Catalog
        </button>
      </div>
    );
  }

  // ==========================================
  // 1. REDESIGNED REPORT PAGE (Interactive Workspace Style)
  // ==========================================
  if (result) {
    const percentage = Math.round(result.percentage || 0);
    const questionsReview = result.questionsReview || [];
    const correctCount = questionsReview.filter((q: any) => q.isCorrect).length;
    const incorrectCount = questionsReview.length - correctCount;
    const activeReviewQuestion = questionsReview[selectedReviewIndex];

    return (
      <div className="bg-[#f8f9fc] min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Summary Banner */}
        <div className="bg-white border-b border-slate-100 px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-bold tracking-wider uppercase">
                Assessments / <span className="text-purple-600">Performance Report</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">{assessment.title}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-gray-400 font-semibold block">SCORE</span>
                <span className={`text-2xl font-bold ${percentage >= 50 ? 'text-green-600' : 'text-orange-500'}`}>{percentage}%</span>
              </div>
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <button 
                onClick={() => navigate('/assessments')} 
                className="px-4 py-2 border border-slate-100 bg-white hover:border-gray-200 text-gray-600 font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Catalog
              </button>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left Column: Questions List (1/3 width) */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col h-[600px]">
            <div className="border-b border-slate-50 pb-3 mb-4">
              <span className="text-xs font-bold text-gray-450 uppercase tracking-wider block">Question Navigator</span>
              <div className="flex justify-between items-center mt-2.5 text-xs text-gray-450 font-medium">
                <span className="text-green-600 font-semibold">{correctCount} Correct</span>
                <span className="text-red-500 font-semibold">{incorrectCount} Incorrect</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {questionsReview.map((q: any, idx: number) => {
                const isActive = idx === selectedReviewIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedReviewIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isActive 
                        ? 'border-purple-500 bg-purple-50/20' 
                        : 'border-slate-100 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="mt-0.5">
                      {q.isCorrect ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-green-500 fill-green-50/50 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4.5 h-4.5 text-red-400 fill-red-50/50 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Question {idx + 1}</span>
                      <p className="text-sm font-semibold text-gray-700 truncate mt-0.5">{q.content}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Question Details Inspector (2/3 width) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between h-[600px] overflow-y-auto">
            {activeReviewQuestion ? (
              <div className="space-y-6">
                
                {/* Question Info Header */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Question {selectedReviewIndex + 1} details
                  </span>
                  
                  {activeReviewQuestion.isCorrect ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100/30">
                      <CheckCircle2 className="w-4 h-4 fill-green-50/50" /> Correct Answer
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100/30">
                      <XCircle className="w-4 h-4 fill-red-50/50" /> Incorrect Answer
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-805 leading-snug">
                    {activeReviewQuestion.content}
                  </h2>
                </div>

                {/* Options Layout */}
                <div className="space-y-3">
                  {activeReviewQuestion.options.map((opt: any) => {
                    const isUserSelected = activeReviewQuestion.userAnswerId === opt.id;
                    const isCorrectOption = activeReviewQuestion.correctAnswerId === opt.id;
                    
                    let bgBorder = 'border-slate-100 bg-white';

                    if (isCorrectOption) {
                      bgBorder = 'border-green-300 bg-green-50/30';
                    } else if (isUserSelected && !activeReviewQuestion.isCorrect) {
                      bgBorder = 'border-red-300 bg-red-50/30';
                    }

                    return (
                      <div 
                        key={opt.id} 
                        className={`p-4 border rounded-2xl flex items-center justify-between text-sm font-medium ${bgBorder}`}
                      >
                        <span className="text-gray-700">{opt.text}</span>
                        {isCorrectOption && (
                          <span className="text-xs font-semibold text-green-600">Correct Choice</span>
                        )}
                        {isUserSelected && !activeReviewQuestion.isCorrect && (
                          <span className="text-xs font-semibold text-red-500">Your Selection</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Lightbulb className="w-4.5 h-4.5 text-yellow-500" />
                    <span>Explanation</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {getExplanation(activeReviewQuestion.content, activeReviewQuestion.correctAnswerText)}
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-gray-400">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Select a question to view full details</p>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // 2. REDESIGNED EXAM PAPER (Workspace Layout Style)
  // ==========================================
  const questions = assessment.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="bg-[#f8f9fc] min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Test Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between z-10">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{assessment.category} Test</span>
          <h1 className="text-base font-semibold text-gray-800 leading-tight mt-0.5">{assessment.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active Timer Pill */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
            <Clock className={`w-4.5 h-4.5 ${timeLeft !== null && timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <span className={`text-sm font-bold ${timeLeft !== null && timeLeft < 120 ? 'text-red-500 font-black' : 'text-gray-700'}`}>
              {timeLeft !== null ? formatTime(timeLeft) : '30:00'}
            </span>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Exit test? Progress will not be saved.")) {
                navigate('/assessments');
              }
            }}
            className="px-3.5 py-1.5 border border-slate-100 bg-white hover:border-gray-200 text-gray-500 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
          >
            Exit
          </button>
        </div>
      </div>

      {totalQuestions > 0 && currentQuestion ? (
        <div className="flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden">
          
          {/* Left Panel: Question Context / Prompt (1/2 width) */}
          <div className="w-full lg:w-1/2 bg-white border-r border-slate-100 p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-gray-400 font-medium">Points: {currentQuestion.points || 1}</span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-805 leading-relaxed pt-4">
                {currentQuestion.content}
              </h2>
            </div>

            {/* Question status index quick list */}
            <div className="pt-8 border-t border-slate-50 mt-12">
              <span className="text-xs font-bold text-gray-450 uppercase tracking-wider block mb-3">Navigator Index</span>
              <div className="flex flex-wrap gap-1.5">
                {questions.map((q: any, idx: number) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  
                  let badge = 'border-slate-100 text-gray-400';
                  if (isCurrent) {
                    badge = 'bg-purple-600 text-white border-purple-600 font-bold';
                  } else if (isAnswered) {
                    badge = 'bg-purple-50 border-purple-100 text-purple-600 font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs transition-all cursor-pointer ${badge}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Multiple Choice Options (1/2 width) */}
          <div className="w-full lg:w-1/2 bg-[#f8f9fc] p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-455 uppercase tracking-wider block mb-3">Select your choice</span>
              
              <div className="space-y-3">
                {currentQuestion.options?.map((opt: any, optIdx: number) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D...

                  return (
                    <button 
                      key={opt.id} 
                      onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                      className={`w-full text-left p-4.5 border rounded-2xl flex items-center gap-4 transition-all duration-250 cursor-pointer ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50/20 shadow-sm' 
                          : 'border-slate-100 hover:border-purple-200 bg-white hover:bg-slate-50/30'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-purple-600 border-purple-600 text-white shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-gray-500'
                      }`}>
                        {letter}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Panel Actions */}
            <div className="pt-8 mt-12 flex justify-between items-center border-t border-slate-100/50">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-100 bg-white hover:border-gray-200 disabled:opacity-30 disabled:pointer-events-none text-gray-500 font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer select-none"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-3">
                {!isLastQuestion ? (
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer select-none"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer select-none"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Submit Exam
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm text-gray-400 font-medium text-sm">
          No questions in this assessment.
        </div>
      )}

    </div>
  );
};

export default TakeAssessment;
