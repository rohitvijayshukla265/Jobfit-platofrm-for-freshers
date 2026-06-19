import { CheckCircle2, Play, BookOpen, UserCheck } from 'lucide-react';

const PrepGuidelines = () => {
  const phases = [
    {
      title: 'Phase 1: Profile & Resume Polish',
      desc: 'Set up your base parameters, analyze your resume, and align your target roles.',
      icon: BookOpen,
      items: [
        'Complete the profile onboarding wizard',
        'Upload your latest resume to the Resume Analyzer',
        'Apply recommendations for formatting, metrics, and keyword alignment'
      ]
    },
    {
      title: 'Phase 2: Core Concept Mastery',
      desc: 'Revise computer science fundamentals and practice mock assessments.',
      icon: Play,
      items: [
        'Practice data structures (Arrays, Trees, Graphs) and time-complexities',
        'Revise SQL fundamentals (joins, groups, indexes)',
        'Complete at least 3 coding/technical assessments'
      ]
    },
    {
      title: 'Phase 3: Mock Interviews & Behavioral Prep',
      desc: 'Practice communication and simulate real interview pressures.',
      icon: UserCheck,
      items: [
        'Practice answering behavioral questions using the STAR method',
        'Record communication checks with the Speech & Volume Analyzers',
        'Assess feedback logs to correct vocabulary and pacing'
      ]
    }
  ];

  return (
    <div className="p-8 pb-12 max-w-6xl">
      <header className="mb-8">
        <div className="text-sm text-gray-400 font-medium mb-2">Favorites / <span className="text-gray-900">Prep Guidelines</span></div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Interview Prep Roadmaps</h1>
        <p className="text-gray-500 mt-2">Follow our step-by-step guideline to systematically prepare for technical and behavioral interviews.</p>
      </header>

      {/* Guide Timeline */}
      <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
        {phases.map((phase) => {
          const Icon = phase.icon;
          return (
            <div key={phase.title} className="flex gap-6 relative">
              <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold z-10 shadow-md">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{phase.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{phase.desc}</p>
                <div className="space-y-2">
                  {phase.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100/50">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrepGuidelines;
