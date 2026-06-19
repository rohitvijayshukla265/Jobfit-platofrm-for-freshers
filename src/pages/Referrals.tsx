import { useState } from 'react';
import { Gift, Copy, Check, Users, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Referrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const referralLink = `https://interviewiq.ai/signup?ref=${user?.id || 'rohit-shukla'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const milestones = [
    { referrals: 1, reward: '1 Free Premium Resume Review', completed: true },
    { referrals: 5, reward: '7 Days of Premium Membership', completed: false },
    { referrals: 10, reward: '1-on-1 Mock Interview with Expert', completed: false }
  ];

  return (
    <div className="p-8 pb-12 max-w-6xl">
      <header className="mb-8">
        <div className="text-sm text-gray-400 font-medium mb-2">Main Menu / <span className="text-gray-900">Referrals</span></div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Refer & Earn</h1>
        <p className="text-gray-500 mt-2">Invite your peers to InterviewIQ and unlock premium features, mock interviews, and resume reviews.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total Referrals</p>
            <h3 className="text-2xl font-bold text-gray-900">1</h3>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Rewards Unlocked</p>
            <h3 className="text-2xl font-bold text-gray-900">1</h3>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Current Rank</p>
            <h3 className="text-2xl font-bold text-gray-900">Bronze</h3>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-8 mb-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
        <div className="max-w-xl z-10 relative">
          <h2 className="text-2xl font-extrabold mb-2">Share your link</h2>
          <p className="text-indigo-200 text-sm mb-6">Send this link to your friends. When they register and verify their email, you both earn rewards!</p>
          <div className="flex gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="bg-transparent border-none text-white text-sm px-3 flex-1 focus:outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 bg-white text-gray-900 font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Milestones list */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Rewards & Milestones</h2>
        <div className="space-y-4">
          {milestones.map((ms) => (
            <div key={ms.referrals} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${ms.completed ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  {ms.referrals}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{ms.reward}</h4>
                  <p className="text-xs text-gray-400">Requires {ms.referrals} {ms.referrals === 1 ? 'referral' : 'referrals'}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ms.completed ? 'text-green-700 bg-green-50 border border-green-100' : 'text-gray-500 bg-gray-50'}`}>
                {ms.completed ? 'Claimed' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Referrals;
