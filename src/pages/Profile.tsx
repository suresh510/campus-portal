import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User as UserIcon, GraduationCap, Code, FileText, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { analyzeResume } from '../services/ai';

export const Profile = () => {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeResume(resumeText);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Bio & Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
            <div className="flex justify-center gap-2">
               <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-900">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold">Education</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Branch</p>
                <p className="text-sm font-semibold">{user?.branch}</p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current CGPA</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(user?.cgpa || 0) * 10}%` }} 
                    />
                  </div>
                  <span className="text-sm font-bold">{user?.cgpa}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-900">
              <Code className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.skills?.map(skill => (
                <span key={skill} className="px-2 py-1 bg-slate-50 border text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Resume Analyzer */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="w-32 h-32 text-indigo-600" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Resume Analyzer</h3>
                <p className="text-sm text-slate-500">Paste your resume text below to get instant AI-powered feedback.</p>
              </div>
            </div>

            <textarea 
              className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none mb-4"
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />

            <button 
              onClick={handleAIAnalysis}
              disabled={analyzing || !resumeText.trim()}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {analyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Sparkles className="w-5 h-5" /> Analyze with AI</>
              )}
            </button>

            {analysis && (
              <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="p-6 bg-slate-900 rounded-2xl text-white">
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-4">AI Analysis Report</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Key Skills Detected</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.KeySkills?.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recommended Roles</p>
                      <ul className="text-sm space-y-1">
                        {analysis.RecommendedJobRoles?.map((r: string) => (
                          <li key={r} className="flex items-center gap-2">
                             <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                             {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Strengths</p>
                    <p className="text-sm text-slate-300 italic">"{analysis.Strengths}"</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Areas for Improvement</p>
                    <p className="text-sm text-slate-300 italic">"{analysis.AreasForImprovement}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
