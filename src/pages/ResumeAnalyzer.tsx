import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/resume/history', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setHistory(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setReport(data.data);
      fetchHistory();
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto flex gap-8 flex-col lg:flex-row">
        
        {/* Main Upload Section */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Analyzer</h1>
               <p className="text-gray-500 mt-2">Upload your PDF resume to get an instant ATS score.</p>
             </div>
             <button onClick={() => navigate('/dashboard')} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
               Back
             </button>
          </div>

          {!report ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="mx-auto w-24 h-24 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <UploadCloud className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag & Drop your Resume</h3>
              <p className="text-gray-500 mb-8">PDF format, up to 5MB.</p>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
              
              {file ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between max-w-sm mx-auto mb-6">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="text-blue-500 shrink-0" />
                    <span className="truncate text-sm font-medium">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-gray-500 hover:text-red-500"><XCircle className="w-5 h-5"/></button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90">
                  Browse Files
                </button>
              )}

              {file && (
                <button 
                  onClick={handleAnalyze} 
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center w-full max-w-sm mx-auto mt-4 gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-8">
                <div className="w-32 h-32 rounded-full border-8 border-green-500 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold">{report.atsScore}</span>
                  <span className="text-xs text-gray-500 uppercase">ATS Score</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
                  <p className="text-gray-500">File: {report.fileName}</p>
                  <p className="text-gray-500 mt-1">Grammar Score: <span className="font-medium text-foreground">{report.grammarScore}/100</span></p>
                  <button onClick={() => { setReport(null); setFile(null); }} className="mt-4 text-blue-600 font-medium hover:underline text-sm">Analyze another resume</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                  <div className="flex items-center gap-2 mb-4 text-red-700 dark:text-red-400 font-bold">
                    <AlertTriangle className="w-5 h-5" /> Missing Keywords
                  </div>
                  <ul className="space-y-2">
                    {report.missingKeywords.length > 0 ? report.missingKeywords.map((k: string, i: number) => (
                      <li key={i} className="text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                        <XCircle className="w-4 h-4 shrink-0" /> {k}
                      </li>
                    )) : <p className="text-sm text-green-600">No major keywords missing!</p>}
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold">
                    <CheckCircle className="w-5 h-5" /> Improvement Suggestions
                  </div>
                  <ul className="space-y-3">
                    {report.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-blue-800 dark:text-blue-200 text-sm">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar History */}
        <div className="w-full lg:w-80 space-y-4">
           <h3 className="font-bold text-lg">Past Reports</h3>
           <div className="space-y-3">
             {history.map((h: any) => (
               <div key={h.id} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 cursor-pointer transition-colors" onClick={() => setReport(h)}>
                 <div className="flex justify-between items-start mb-2">
                   <p className="font-semibold text-sm truncate">{h.fileName}</p>
                   <span className={`px-2 py-1 rounded text-xs font-bold ${h.atsScore > 75 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{h.atsScore}%</span>
                 </div>
                 <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString()}</p>
               </div>
             ))}
             {history.length === 0 && <p className="text-sm text-gray-500">No past reports.</p>}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalyzer;
