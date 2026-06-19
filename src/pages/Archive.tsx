import { Archive as ArchiveIcon, Clock, ChevronRight, FileText } from 'lucide-react';

const Archive = () => {
  const archives = [
    {
      id: '1',
      title: 'Speech Analyzer Check',
      category: 'Communication',
      date: 'June 18, 2026',
      score: '84%',
      status: 'Completed'
    },
    {
      id: '2',
      title: 'Resume Review: V1 Draft',
      category: 'Resume',
      date: 'June 17, 2026',
      score: '78%',
      status: 'Reviewed'
    },
    {
      id: '3',
      title: 'Aptitude & Logical Reasoning Mock',
      category: 'Technical',
      date: 'June 15, 2026',
      score: '92%',
      status: 'Passed'
    }
  ];

  return (
    <div className="p-8 pb-12 max-w-6xl">
      <header className="mb-8">
        <div className="text-sm text-gray-400 font-medium mb-2">Main Menu / <span className="text-gray-900">Archive</span></div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your History & Archive</h1>
        <p className="text-gray-500 mt-2">Access past evaluations, scores, uploaded resume versions, and feedback records.</p>
      </header>

      {/* Archive List */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {archives.map((item) => (
            <div key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-snug">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{item.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{item.score}</span>
                  <p className="text-xs text-gray-400">{item.status}</p>
                </div>
                <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {archives.length === 0 && (
            <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-3">
              <ArchiveIcon className="w-12 h-12 text-gray-300 animate-pulse" />
              <span>Your archive is empty. Start recording mock interviews and reviews to build history!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
