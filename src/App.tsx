/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, Header } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

const AppContent = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Simple routing for auth pages
    const path = window.location.pathname;
    if (path === '/register') return <Auth mode="REGISTER" />;
    return <Auth mode="LOGIN" />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'jobs': return <Jobs />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Placement Dashboard';
      case 'jobs': return 'Job Opportunities';
      case 'profile': return 'My Professional Profile';
      default: return 'PolyPlace';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <Header title={getTitle()} setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="p-4 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        <footer className="py-6 px-8 border-t bg-white text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          &copy; 2024 Polytechnic College Placement Cell • Empowering Careers
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
