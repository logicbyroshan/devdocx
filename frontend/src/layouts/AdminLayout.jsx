// --- FILE: frontend/src/layouts/AdminLayout.jsx ---

import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/navigation/Navbar';
import { Sidebar } from '../components/navigation/Sidebar';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AdminLayout() {
  const { user, loading, isAuthenticated, isStaff } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-xs font-mono text-muted-color">Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full text-center border-amber-500/30 bg-amber-950/10 p-8">
            <div className="w-12 h-12 rounded-full bg-amber-900/40 border border-amber-700/60 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-title-color mb-2">Staff Permissions Required</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Your account (<span className="text-white font-mono">{user?.username}</span>) does not have staff permissions to access the control panel.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Navbar
        showSidebarToggle={true}
        onMobileSidebarToggle={() => setMobileSidebarOpen(true)}
      />

      <div className="flex-grow flex w-full max-w-7xl mx-auto">
        {/* Persistent Desktop Sidebar / Off-canvas Mobile Drawer */}
        <Sidebar
          type="admin"
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Admin Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
