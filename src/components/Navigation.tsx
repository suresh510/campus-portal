import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Building, 
  ClipboardCheck, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard,
  User as UserIcon,
  CircleCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { initSocket, disconnectSocket } from '../services/socket';
import { cn } from '../lib/utils';

// --- Shared Components ---

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: { 
  activeTab: string, 
  setActiveTab: (t: string) => void, 
  isOpen: boolean,
  setIsOpen: (o: boolean) => void
}) => {
  const { user, logout } = useAuth();
  
  const studentLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Available Jobs', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  const adminLinks = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: TrendingUp },
    { id: 'jobs-manage', label: 'Manage Jobs', icon: Briefcase },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'reports', label: 'Placement Reports', icon: ClipboardCheck },
  ];

  const recruiterLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs-post', label: 'Post a Job', icon: Briefcase },
    { id: 'applicants', label: 'View Applicants', icon: Users },
  ];

  const links = user?.role === 'STUDENT' ? studentLinks : user?.role === 'ADMIN' ? adminLinks : recruiterLinks;

  return (
    <>
      <div className={cn(
        "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsOpen(false)} />
      
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-slate-900 text-white w-64 z-50 transition-transform duration-300 transform lg:translate-x-0 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">PolyPlace</span>
          </div>

          <nav className="space-y-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => { setActiveTab(link.id); setIsOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                  activeTab === link.id 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center uppercase text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ title, setIsSidebarOpen }: { title: string, setIsSidebarOpen: (o: boolean) => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const socket = initSocket((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });
    return () => disconnectSocket();
  }, []);

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-slate-100 rounded-lg relative"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white shadow-xl border rounded-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <span className="font-bold text-sm">Notifications</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b hover:bg-slate-50 transition-colors">
                        <p className="text-sm text-slate-800 mb-1">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export { Sidebar, Header };
