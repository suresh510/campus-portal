import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Target,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-lg">
          +{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

import { cn } from '../lib/utils';
import { Job, Application } from '../types';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'ADMIN') {
          const res = await fetch('/api/admin/stats');
          const data = await res.json();
          setStats(data);
        } else if (user?.role === 'STUDENT') {
          const res = await fetch('/api/applications/student');
          const data = await res.json();
          setStats({ applications: Array.isArray(data) ? data : [] });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading stats...</div>;

  if (user?.role === 'ADMIN') {
    const pieData = Object.entries(stats?.branchDistribution || {}).map(([name, value]) => ({ name, value }));
    const COLORS = ['#6366f1', '#60a5fa', '#f472b6', '#34d399', '#fbbf24'];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="bg-indigo-500" trend="12" />
          <StatCard title="Total Jobs" value={stats.totalJobs} icon={Briefcase} color="bg-blue-500" trend="8" />
          <StatCard title="Applications" value={stats.totalApplications} icon={Clock} color="bg-orange-500" />
          <StatCard title="Placed Students" value={stats.placedCount} icon={CheckCircle} color="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Branch Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-600 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Placement Progress</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'STUDENT') {
    const apps = (stats?.applications || []) as Application[];
    const pending = apps.filter(a => a.status === 'PENDING').length;
    const reviewed = apps.filter(a => a.status === 'REVIEWING').length;
    const interviewing = apps.filter(a => a.status === 'INTERVIEWING').length;
    const offered = apps.filter(a => a.status === 'OFFERED').length;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-indigo-100 max-w-md">Your placement journey is looking great. You have {offered > 0 ? 'an offer' : interviewing > 0 ? 'interviews lined up' : 'active applications'}. Keep going!</p>
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-indigo-200 mb-1">Your CGPA</p>
              <p className="text-4xl font-black">{user.cgpa}</p>
            </div>
          </div>
          <Target className="absolute -bottom-12 -right-12 w-64 h-64 text-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Applications" value={apps.length} icon={Briefcase} color="bg-indigo-500" />
          <StatCard title="Under Review" value={reviewed} icon={Clock} color="bg-blue-500" />
          <StatCard title="Interviews" value={interviewing} icon={Target} color="bg-orange-500" />
          <StatCard title="Offers" value={offered} icon={CheckCircle} color="bg-emerald-500" />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Applications</h3>
            <button className="text-sm font-semibold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {apps.slice(0, 3).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center font-bold text-indigo-600">
                    {app.job?.company.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.job?.title}</h4>
                    <p className="text-xs text-slate-500">{app.job?.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                    app.status === 'OFFERED' ? "bg-emerald-100 text-emerald-700" :
                    app.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                    "bg-orange-100 text-orange-700"
                  )}>
                    {app.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {apps.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-slate-300 w-8 h-8" />
                </div>
                <p className="text-slate-500">You haven't applied to any jobs yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
