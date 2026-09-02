// --- FILE: frontend/src/components/navigation/Sidebar.jsx ---

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Activity,
  Layers,
  Compass,
  ArrowLeft,
  X,
} from 'lucide-react';

export function Sidebar({
  type = 'docs', // 'docs' | 'admin'
  docsList = [],
  isOpen = false,
  onClose,
}) {
  const location = useLocation();

  const adminNavLinks = [
    { label: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Post Management', path: '/admin/posts', icon: FileText },
    { label: 'Write / New Post', path: '/admin/posts/new', icon: PenSquare },
    { label: 'Activity & Moderation', path: '/admin/activity', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-bg-dark border-r border-border-color/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-border-color lg:hidden">
          <span className="text-xs font-semibold text-title-color uppercase tracking-wider font-mono">
            {type === 'admin' ? 'Admin Navigation' : 'Documentation Index'}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-muted-color hover:text-white rounded-md hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {type === 'admin' ? (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2 px-2.5">
                Admin Control
              </div>
              <nav className="space-y-1">
                {adminNavLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-teal-950/70 text-teal-300 border border-teal-800/60 shadow-sm'
                          : 'text-paragraph-color hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-6 mt-6 border-t border-border-color/60">
                <NavLink
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Public Site</span>
                </NavLink>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2 px-2.5">
                Technical Guides
              </div>
              <nav className="space-y-1">
                <NavLink
                  to="/docs"
                  end
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/docs'
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-800/40'
                      : 'text-paragraph-color hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Documentation Overview</span>
                </NavLink>

                {docsList.map((doc) => {
                  const docPath = `/docs/${doc.slug}`;
                  const isActive = location.pathname === docPath;
                  return (
                    <NavLink
                      key={doc.slug}
                      to={docPath}
                      onClick={() => onClose && onClose()}
                      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-cyan-400 border border-cyan-800/40'
                          : 'text-paragraph-color hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 mt-1.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="leading-snug">{doc.title}</span>
                        {doc.category && (
                          <span className="text-[10px] text-muted-color font-mono">{doc.category}</span>
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-6 mt-6 border-t border-border-color/60">
                <NavLink
                  to="/articles"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Articles</span>
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
