import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Auth = ({ mode }: { mode: 'LOGIN' | 'REGISTER' }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    branch: 'Computer Engineering',
    cgpa: '0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const branches = [
    "Computer Engineering",
    "Information Technology",
    "Electronics & Telecommunication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cgpa: parseFloat(formData.cgpa),
          skills: ["React", "JavaScript", "Communication"] // Default skills for now
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Auth failed');

      if (mode === 'LOGIN') {
        login(data.user, data.token);
      } else {
        // Switch to login mode after successful registration
        window.location.reload(); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100"
      >
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h2 className="text-3xl font-black mb-2">{mode === 'LOGIN' ? 'Welcome Back' : 'Join PolyPlace'}</h2>
          <p className="text-indigo-100 text-sm font-medium">
            {mode === 'LOGIN' ? 'Sign in to access your placement dashboard' : 'Create an account to start your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="email"
                placeholder="email@college.edu"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div className="grid grid-cols-1 gap-5 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
                <div className="flex gap-2">
                  {[
                    { id: 'STUDENT', label: 'Student', icon: GraduationCap },
                    { id: 'RECRUITER', label: 'Recruiter', icon: Briefcase }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({...formData, role: r.id})}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                        formData.role === r.id ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                      )}
                    >
                      <r.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.role === 'STUDENT' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Branch</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    >
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Current CGPA</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-100 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{mode === 'LOGIN' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <div className="text-center pt-4">
             <button 
              type="button"
              onClick={() => window.location.href = mode === 'LOGIN' ? '/register' : '/login'}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
             >
                {mode === 'LOGIN' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
             </button>
          </div>
        </form>
        
        <div className="bg-slate-50 px-8 py-4 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Enrollment Portal</span>
        </div>
      </motion.div>
    </div>
  );
};
