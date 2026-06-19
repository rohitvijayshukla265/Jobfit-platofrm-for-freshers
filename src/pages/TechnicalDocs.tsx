import { useState } from 'react';
import { Code2, Cpu, Database, Search, Terminal } from 'lucide-react';

const TechnicalDocs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const articles = [
    {
      category: 'System Design',
      title: 'Scalability Fundamentals',
      description: 'Understanding load balancers, horizontal scaling, caching strategies, and CDN architecture.',
      icon: Cpu,
      readTime: '8 min read',
      difficulty: 'Intermediate'
    },
    {
      category: 'Algorithms',
      title: 'Dynamic Programming Patterns',
      description: 'Master the 5 common DP paradigms: Knapsack, LCS, LIS, Interval DP, and Grid-based DP.',
      icon: Code2,
      readTime: '12 min read',
      difficulty: 'Advanced'
    },
    {
      category: 'Database Systems',
      title: 'SQL vs NoSQL: Deep Dive',
      description: 'ACID properties, CAP theorem, indexing techniques, sharding, and replication protocols.',
      icon: Database,
      readTime: '6 min read',
      difficulty: 'Intermediate'
    },
    {
      category: 'Web Tech',
      title: 'How Browsers Render Pages',
      description: 'Critical Rendering Path: HTML parsing, CSSOM tree creation, layout calculations, and paint stages.',
      icon: Terminal,
      readTime: '5 min read',
      difficulty: 'Beginner'
    }
  ];

  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pb-12 max-w-6xl">
      <header className="mb-8">
        <div className="text-sm text-gray-400 font-medium mb-2">Favorites / <span className="text-gray-900">Technical Docs</span></div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Technical Reference Library</h1>
        <p className="text-gray-500 mt-2">Comprehensive documentation and quick cheatsheets for your technical interview prep.</p>
      </header>

      {/* Search bar */}
      <div className="relative mb-8 max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search topics, concepts, or difficulty..." 
          className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((art) => {
          const Icon = art.icon;
          return (
            <div key={art.title} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">{art.category}</span>
                  <span className="text-xs text-gray-400">{art.difficulty}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">{art.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{art.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>{art.readTime}</span>
                  <button className="text-purple-600 font-semibold hover:underline">Read Article →</button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No articles found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalDocs;
