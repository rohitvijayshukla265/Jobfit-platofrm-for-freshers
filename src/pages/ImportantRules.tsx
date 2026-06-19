import { ShieldAlert, Award, FileWarning } from 'lucide-react';

const ImportantRules = () => {
  const categories = [
    {
      title: 'Assessment Integrity',
      icon: ShieldAlert,
      color: 'text-red-600 bg-red-50 border-red-100',
      rules: [
        'No external search engines or browser tabs may be opened during tests.',
        'Copy-pasting code into or out of the assessment window is strictly disabled.',
        'Screen capturing or screen sharing is tracked and will flag the system.'
      ]
    },
    {
      title: 'Interview Etiquette',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      rules: [
        'Keep your video camera and microphone enabled and fully operational.',
        'Speak clearly and loud enough; maintain a steady posture facing the lens.',
        'Answer questions using professional vocabulary and structure.'
      ]
    },
    {
      title: 'General Guidelines',
      icon: FileWarning,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      rules: [
        'Review the test syllabus and duration limits before starting.',
        'Ensure you have a stable high-speed internet connection (min 5 Mbps).',
        'Tests cannot be paused once started. Ensure a quiet environment.'
      ]
    }
  ];

  return (
    <div className="p-8 pb-12 max-w-6xl">
      <header className="mb-8">
        <div className="text-sm text-gray-400 font-medium mb-2">Favorites / <span className="text-gray-900">Important Rules</span></div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Code of Conduct & Rules</h1>
        <p className="text-gray-500 mt-2">Read through the guidelines and assessment rules carefully to guarantee fairness and readiness scores accuracy.</p>
      </header>

      {/* Rules list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.title} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{cat.title}</h3>
                <ul className="space-y-3">
                  {cat.rules.map((rule, idx) => (
                    <li key={idx} className="flex gap-2.5 text-sm text-gray-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImportantRules;
