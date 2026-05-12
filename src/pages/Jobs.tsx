import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Job, Application } from '../types';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { analyzeResume, getJobRecommendations } from '../services/ai';
import { motion, AnimatePresence } from 'motion/react';

export const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs'),
          user?.role === 'STUDENT' ? fetch('/api/applications/student') : Promise.resolve({ json: () => [] })
        ]);
        const jobsData = await jobsRes.json();
        const appsData = await (appsRes as Response).json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        const newApp = await res.json();
        setApplications([...applications, newApp]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(null);
    }
  };

  const runAIRecommendation = async () => {
    if (!user || user.role !== 'STUDENT') return;
    setAnalyzingAI(true);
    try {
      const result = await getJobRecommendations(user.skills || [], jobs);
      setRecommendations(result.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const isEligible = (job: Job) => {
    if (user?.role !== 'STUDENT') return { overall: true, cgpaOk: true, branchOk: true };
    const cgpaOk = (user.cgpa || 0) >= job.requirements.minCgpa;
    const branchOk = job.requirements.branches.length === 0 || 
                     job.requirements.branches.includes(user.branch || '');
    return { overall: cgpaOk && branchOk, cgpaOk, branchOk };
  };

  const hasApplied = (jobId: string) => applications.some(a => a.jobId === jobId);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Opportunities</h2>
          <p className="text-slate-500">Find and apply to the best placements tailored for your profile.</p>
        </div>
        {user?.role === 'STUDENT' && (
          <button 
            onClick={runAIRecommendation}
            disabled={analyzingAI}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {analyzingAI ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            AI Smart Match
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search roles, companies, or keywords..."
          className="w-full bg-white border border-slate-200 pl-12 pr-12 py-3.5 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-indigo-600 w-5 h-5" />
            <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">AI Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec: any) => {
              const job = jobs.find(j => j.id === rec.jobId);
              if (!job) return null;
              return (
                <div key={rec.jobId} className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <h4 className="font-bold text-slate-900 truncate">{job.title}</h4>
                  <p className="text-xs text-indigo-600 mb-2 font-semibold">{job.company}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic">"{rec.reason}"</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-slate-300 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-500">Try adjusting your search filters or check back later.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const { overall, cgpaOk, branchOk } = isEligible(job);
            const applied = hasApplied(job.id);

            return (
              <motion.div 
                layout
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border-l-4 border-l-transparent hover:border-l-indigo-500"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl border flex items-center justify-center font-bold text-lg text-indigo-600 shrink-0 group-hover:bg-indigo-50 transition-colors">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                        <p className="text-slate-500 text-sm font-medium">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={cn(
                        "text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md",
                        overall ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {overall ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium">Ends {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium">{job.requirements.minCgpa} Min CGPA</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.requirements.skills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-4">
                       {!cgpaOk && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Need {job.requirements.minCgpa} CGPA</p>}
                       {!branchOk && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Branch mismatch</p>}
                    </div>
                    
                    <button 
                      disabled={!overall || applied || applying === job.id}
                      onClick={() => handleApply(job.id)}
                      className={cn(
                        "px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 min-w-[120px]",
                        applied 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : overall 
                            ? "bg-indigo-600 text-white hover:bg-slate-900 shadow-md shadow-indigo-200" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {applying === job.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : applied ? (
                        <>Applied</>
                      ) : (
                        <>Apply Now <ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
