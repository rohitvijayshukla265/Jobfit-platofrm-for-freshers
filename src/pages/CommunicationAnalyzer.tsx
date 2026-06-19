import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Loader2, Volume2, Info, CheckCircle, Activity, AlertTriangle } from 'lucide-react';

const CommunicationAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<any>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/communication/history', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setHistory(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startRecording = async () => {
    try {
      setReport(null);
      setAudioUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        await analyzeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied', err);
      alert('Microphone access is required to use the Communication Analyzer.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    try {
      const res = await fetch('/api/communication/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setReport(data.data.report);
      fetchHistory();
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto flex gap-8 flex-col lg:flex-row">
        
        {/* Main Recording Section */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Communication Analyzer</h1>
               <p className="text-gray-500 mt-2">Record a 1-minute pitch to analyze your speaking confidence and clarity.</p>
             </div>
             <button onClick={() => navigate('/dashboard')} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
               Back
             </button>
          </div>

          {!report && !loading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm"
            >
              <div className="mb-8">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {isRecording ? (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <Mic className="w-12 h-12 text-red-500" />
                    </motion.div>
                  ) : (
                    <Mic className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                {isRecording && <p className="text-2xl font-bold text-red-500 mt-4">{formatTime(recordingTime)}</p>}
              </div>

              {!isRecording ? (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to pitch?</h3>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">Introduce yourself and explain why you're a good fit for your target job role.</p>
                  <button onClick={startRecording} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center w-full max-w-sm mx-auto gap-2">
                    <Mic className="w-5 h-5" /> Start Recording
                  </button>
                </div>
              ) : (
                <div>
                   <p className="text-gray-500 mb-8">Speak clearly into your microphone...</p>
                   <button onClick={stopRecording} className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 flex items-center justify-center w-full max-w-sm mx-auto gap-2">
                     <Square className="w-5 h-5 fill-current" /> Stop & Analyze
                   </button>
                </div>
              )}
            </motion.div>
          ) : loading ? (
             <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-24 text-center shadow-sm flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold">Analyzing your audio...</h3>
                <p className="text-gray-500 mt-2">Extracting speech, detecting filler words, and calculating confidence.</p>
             </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 shrink-0 rounded-full border-8 border-purple-500 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold">{report.confidenceScore}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold text-center leading-tight">Confidence<br/>Score</span>
                </div>
                <div className="flex-1 w-full">
                  <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
                  {audioUrl && (
                    <audio controls src={audioUrl} className="w-full mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  )}
                  <button onClick={() => { setReport(null); setAudioUrl(null); }} className="mt-4 text-blue-600 font-medium hover:underline text-sm">Record another pitch</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                    <Activity className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Fluency</p>
                    <p className="text-xl font-bold">{report.fluencyScore}%</p>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                    <Volume2 className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Clarity</p>
                    <p className="text-xl font-bold">{report.clarityScore}%</p>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                    <Info className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Pace (WPM)</p>
                    <p className="text-xl font-bold">{report.speakingSpeed}</p>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto text-red-500 mb-2" />
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Filler Words</p>
                    <p className="text-xl font-bold">{report.fillerWords}</p>
                 </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold">
                  <CheckCircle className="w-5 h-5" /> AI Feedback & Suggestions
                </div>
                <ul className="space-y-3">
                  {report.suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-blue-800 dark:text-blue-200 text-sm flex gap-2">
                       <div className="mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /></div>
                       {s}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar History */}
        <div className="w-full lg:w-80 space-y-4">
           <h3 className="font-bold text-lg">Past Recordings</h3>
           <div className="space-y-3">
             {history.map((h: any) => (
               <div key={h.id} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 cursor-pointer transition-colors" onClick={() => setReport(h)}>
                 <div className="flex justify-between items-start mb-2">
                   <p className="font-semibold text-sm">Confidence: {h.confidenceScore}%</p>
                   <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                     {h.fillerWords} FILLERS
                   </span>
                 </div>
                 <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString()} at {new Date(h.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
             ))}
             {history.length === 0 && <p className="text-sm text-gray-500">No past recordings.</p>}
           </div>
        </div>

      </div>
    </div>
  );
};

export default CommunicationAnalyzer;
