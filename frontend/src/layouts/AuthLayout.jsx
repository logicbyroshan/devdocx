// --- FILE: frontend/src/layouts/AuthLayout.jsx ---

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-start to-accent-end p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-gradient">D</span>
            </div>
          </div>
          <span className="font-heading font-bold text-title-color group-hover:text-cyan-400 transition-colors text-base">
            DevDocs
          </span>
        </Link>


        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Auth Card Area */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <Outlet />
      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-md mx-auto text-center text-[11px] text-slate-500">
        Secured with session authentication & 2FA OTP verification.
      </div>
    </div>
  );
}
