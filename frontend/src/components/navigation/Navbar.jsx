// --- FILE: frontend/src/components/navigation/Navbar.jsx ---

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';

export function Navbar({ onMobileSidebarToggle, showSidebarToggle = false }) {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Articles', path: '/articles', icon: BookOpen },
    { label: 'Architecture Docs', path: '/docs', icon: Layers },
    { label: 'About', path: '/about', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-color/80 bg-bg-dark/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <button
              onClick={onMobileSidebarToggle}
              className="lg:hidden p-2 rounded-lg text-muted-color hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-accent-start to-accent-end p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <span className="font-heading text-lg font-bold text-gradient">D</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold text-title-color leading-tight group-hover:text-cyan-400 transition-colors">
                DevDocs
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-color -mt-0.5">
                Engineering Platform
              </span>
            </div>
          </Link>

        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 font-medium text-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-cyan-400 bg-slate-800/80 font-semibold'
                    : 'text-paragraph-color hover:text-title-color hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isStaff && (
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                location.pathname.startsWith('/admin')
                  ? 'text-teal-400 bg-teal-950/40 border border-teal-800/50'
                  : 'text-teal-300/90 hover:text-teal-200 hover:bg-teal-950/20'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Right Side: Theme, Auth, Mobile Menu */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border-color/60 bg-card-bg/60 text-muted-color hover:text-title-color hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-border-color bg-card-bg hover:bg-slate-800 transition-colors"
                aria-expanded={userMenuOpen}
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=1e293b&color=22d3ee`}
                  alt={user.username}
                  className="w-7 h-7 rounded-md object-cover"
                />
                <span className="hidden sm:inline text-xs font-semibold text-title-color max-w-[100px] truncate">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-color" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-slate-900 border border-border-color rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-border-color/60">
                    <p className="text-xs font-semibold text-title-color truncate">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-[11px] text-muted-color truncate font-mono">
                      {user.email}
                    </p>
                    {isStaff && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-mono">
                        <ShieldCheck className="w-3 h-3" /> Staff Administrator
                      </span>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-paragraph-color hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>

                  {isStaff && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-teal-300 hover:bg-teal-950/40 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="border-t border-border-color/60 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" className="hidden sm:inline-flex">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg text-muted-color hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileNavOpen && (
        <div className="md:hidden border-b border-border-color bg-slate-900/95 px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-slate-800 text-cyan-400' : 'text-paragraph-color hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isStaff && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-teal-300 bg-teal-950/40 border border-teal-800/40"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-border-color flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileNavOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileNavOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
