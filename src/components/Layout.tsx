import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BrainCircuit, LayoutDashboard, FileText, 
  MessageCircle, HelpCircle, Users, Archive, FileCode2,
  Zap as ZapIcon, FileCode, CheckSquare, Home, User, LogOut, Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.avatarUrl) {
            setAvatarUrl(data.data.avatarUrl);
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const menuItems = [
    {
      title: 'Favorites',
      items: [
        { name: 'Technical Docs', path: '/docs/technical', icon: FileCode2 },
        { name: 'Prep Guidelines', path: '/prep-guidelines', icon: FileText },
        { name: 'Important Rules', path: '/rules', icon: CheckSquare },
      ]
    },
    {
      title: 'Main Menu',
      items: [
        { name: 'Software Home', path: '/software-home', icon: Home },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Assessments', path: '/assessments', icon: BrainCircuit },
        { name: 'Resume Analyzer', path: '/resume', icon: FileCode },
        { name: 'Communication', path: '/communication', icon: MessageCircle },
        { name: 'Support Center', path: '/support', icon: HelpCircle },
        { name: 'Referrals', path: '/referrals', icon: Users },
        { name: 'Archive', path: '/archive', icon: Archive },
      ]
    }
  ];

  // Helper to resolve title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/software-home':
        return 'Software Home';
      case '/dashboard':
        return 'Dashboard Overview';
      case '/profile':
        return 'Candidate Profile';
      case '/assessments':
        return 'Skill Assessments';
      case '/resume':
        return 'AI Resume Analyzer';
      case '/communication':
        return 'AI Communication Analyzer';
      case '/docs/technical':
        return 'Technical Documentation';
      case '/prep-guidelines':
        return 'Preparation Guidelines';
      case '/rules':
        return 'Important Platform Rules';
      case '/support':
        return 'Support & Help Center';
      case '/referrals':
        return 'Referrals & Earnings';
      case '/archive':
        return 'Archived Submissions';
      default:
        return 'InterviewIQ Platform';
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FCFAFF] border-r border-gray-100 flex flex-col h-full flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-bold">
            <ZapIcon className="w-5 h-5" fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight">InterviewIQ</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
          {menuItems.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'text-gray-900 bg-white shadow-sm border border-gray-100'
                          : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-4 mt-auto border-t border-gray-100">
          <button 
            onClick={logout} 
            className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-3 py-2.5 rounded-xl border border-red-100 transition-all flex items-center justify-center gap-2"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content with Top Nav Header */}
      <main className="flex-1 overflow-y-auto bg-[#FDFDFD] flex flex-col h-full">
        {/* Sticky Header Bar */}
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-30 flex-shrink-0 shadow-sm">
          <div className="text-sm font-bold text-gray-800">
            {getPageTitle()}
          </div>
          
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 border border-gray-100 shadow-sm bg-white transition-all group select-none cursor-pointer focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover animate-fadeIn" />
                  ) : (
                    <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="pr-3 text-gray-500 group-hover:text-purple-600 transition-colors">
                  <Menu className="w-5 h-5" />
                </div>
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop overlay for outside click closing */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  
                  {/* Glassmorphic Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08)] py-1.5 z-50 animate-fadeIn transform scale-100 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate font-medium mt-0.5">{user?.email}</p>
                    </div>
 
                    <div className="p-1 space-y-0.5">
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50/50 rounded-xl transition-all group"
                      >
                        <User className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        My Profile
                      </Link>
                      
                      <Link 
                        to="/dashboard" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50/50 rounded-xl transition-all group"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        Dashboard
                      </Link>
 
                      <Link 
                        to="/support" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50/50 rounded-xl transition-all group"
                      >
                        <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        Support Center
                      </Link>
 
                      <Link 
                        to="/referrals" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50/50 rounded-xl transition-all group"
                      >
                        <Users className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        Referrals
                      </Link>
                    </div>
 
                    <div className="border-t border-slate-50 p-1 mt-1">
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all text-left group"
                      >
                        <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
