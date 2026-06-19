import React, { useState } from 'react';
import { 
  MessageSquare, ThumbsUp, Briefcase, 
  Send, MapPin, DollarSign, Calendar, Flame,
  Share2, Search, Loader2, CheckCircle2
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  tags: string[];
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  time: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  type: string;
  applied: boolean;
  applying?: boolean;
}

const SoftwareHome = () => {
  // Feed/Post States
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Rohit Vijay Shukla',
      role: 'Software Developer',
      avatar: 'R',
      content: 'Just cracked my technical round at a top consulting firm! Focus heavily on system design basics, React hooks optimization (useMemo, useCallback), and database indexing strategies.',
      tags: ['InterviewPrep', 'React', 'SuccessStory'],
      likes: 24,
      hasLiked: false,
      time: '2 hours ago',
      comments: [
        { id: 'c1', author: 'Ananya Sharma', avatar: 'A', text: 'Congratulations Rohit! Super helpful advice.', time: '1 hour ago' }
      ]
    },
    {
      id: '2',
      author: 'Siddharth Mehta',
      role: 'Lead Architect',
      avatar: 'S',
      content: 'What is your go-to backend framework for building highly scaleable microservices in 2026? Node.js with Fastify vs Go? Let\'s debate in the comments!',
      tags: ['Backend', 'Go', 'NodeJS', 'SystemDesign'],
      likes: 42,
      hasLiked: false,
      time: '4 hours ago',
      comments: []
    }
  ]);

  const [newPostText, setNewPostText] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Jobs States
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'j1',
      title: 'Frontend React Engineer',
      company: 'TechNovus Solutions',
      location: 'Mumbai, MH (Hybrid)',
      salary: '₹12 - ₹18 LPA',
      experience: '1-3 Years',
      type: 'Full-time',
      applied: false
    },
    {
      id: 'j2',
      title: 'Backend Node.js Developer',
      company: 'LogiScale Labs',
      location: 'Bengaluru, KA (Remote)',
      salary: '₹15 - ₹22 LPA',
      experience: '2-5 Years',
      type: 'Full-time',
      applied: false
    },
    {
      id: 'j3',
      title: 'Software Development Engineer I (SDE-1)',
      company: 'Aura AI',
      location: 'Pune, MH (On-site)',
      salary: '₹8 - ₹12 LPA',
      experience: '0-2 Years',
      type: 'Full-time',
      applied: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Handlers for Feed
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const tagsArray = newPostTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const createdPost: Post = {
      id: Date.now().toString(),
      author: 'Rohit Vijay Shukla',
      role: 'Software Developer',
      avatar: 'R',
      content: newPostText,
      tags: tagsArray.length > 0 ? tagsArray : ['General'],
      likes: 0,
      hasLiked: false,
      time: 'Just now',
      comments: []
    };

    setPosts([createdPost, ...posts]);
    setNewPostText('');
    setNewPostTags('');
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
          hasLiked: !post.hasLiked
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Rohit Vijay Shukla',
      avatar: 'R',
      text,
      time: 'Just now'
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Job Application Simulation
  const handleApplyJob = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return { ...job, applying: true };
      }
      return job;
    }));

    setTimeout(() => {
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return { ...job, applying: false, applied: true };
        }
        return job;
      }));
    }, 800);
  };

  // Filters
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-gray-800 pb-16">
      
      {/* Sticky Premium Header Bar */}
      <div className="bg-white border-b border-slate-100 p-6 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Software Home</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Connect with developers, join discussions, and find engineering opportunities.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto flex-shrink-0">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search posts or topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 bg-[#f8f9fc] outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Community Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Start a Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                placeholder="What's on your mind? Share interview queries, project updates, or tech opinions..."
                rows={3}
                required
                className="w-full px-4 py-3 bg-[#f8f9fc] border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none font-medium"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Tags (comma separated, e.g. React, NodeJS)"
                  value={newPostTags}
                  onChange={e => setNewPostTags(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#f8f9fc] border border-slate-100 rounded-xl text-xs outline-none focus:border-purple-500 font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors self-end sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" /> Post Discussion
                </button>
              </div>
            </form>
          </div>

          {/* Tags Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 mr-2 flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" /> Hot Topics:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedTag === null 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-white border border-slate-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              All Posts
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedTag === tag 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-100 text-gray-500 hover:border-purple-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Post Feed */}
          <div className="space-y-5">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <div key={post.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300">
                  
                  {/* Post Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 font-semibold flex items-center justify-center text-base shadow-sm border border-purple-100">
                      {post.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{post.author}</h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{post.role} • {post.time}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-650 leading-relaxed font-medium">
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold text-purple-600 bg-purple-50/50 px-2.5 py-0.5 rounded border border-purple-100/30">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-6 pt-3.5 border-t border-slate-50 text-xs font-semibold text-gray-400">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 hover:text-purple-600 transition-colors ${post.hasLiked ? 'text-purple-600' : ''}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.hasLiked ? 'fill-purple-600 stroke-purple-600' : ''}`} />
                      <span>{post.likes} Likes</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments.length} Comments</span>
                    </div>
                    <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors ml-auto">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.comments.length > 0 && (
                    <div className="bg-[#f8f9fc]/80 rounded-2xl p-4.5 space-y-3.5 border border-slate-50">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 items-start text-xs">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center flex-shrink-0">
                            {comment.avatar}
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-gray-800">{comment.author}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{comment.time}</span>
                            </div>
                            <p className="text-gray-600 font-medium mt-0.5 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <form 
                    onSubmit={e => {
                      e.preventDefault();
                      handleAddComment(post.id, commentInputs[post.id] || '');
                    }}
                    className="flex gap-2 pt-1"
                  >
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-[#f8f9fc] border border-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-500 transition-all font-medium"
                    />
                    <button type="submit" className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-gray-400 font-medium text-sm shadow-sm">
                No discussions matching your query.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Available Jobs Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-36 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-50 pb-3">
              <Briefcase className="w-4.5 h-4.5 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recommended Jobs</h3>
            </div>

            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="p-4.5 bg-white border border-slate-100 hover:border-purple-100/70 hover:shadow-md rounded-2xl flex flex-col justify-between transition-all duration-300">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm leading-snug">{job.title}</h4>
                    <p className="text-xs font-semibold text-purple-600 mt-1">{job.company}</p>
                    
                    <div className="space-y-1.5 mt-3.5 text-xs text-gray-400 font-medium">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" /> {job.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" /> {job.salary}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" /> Experience: {job.experience}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded">
                      {job.type}
                    </span>
                    {job.applied ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                        <CheckCircle2 className="w-4 h-4 fill-green-50/50" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyJob(job.id)}
                        disabled={job.applying}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        {job.applying && <Loader2 className="w-3 h-3 animate-spin" />}
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SoftwareHome;
