// --- FILE: frontend/src/layouts/MainLayout.jsx ---

import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Github, Twitter, Linkedin, Heart, ShieldCheck, Layers, BookOpen, Compass } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { blogApi } from '../api/blog';

export function MainLayout() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'warning');
      return;
    }

    try {
      setSubscribing(true);
      const res = await blogApi.subscribeNewsletter(email);
      if (res?.success) {
        addToast(res.message || 'Thank you for subscribing!', 'success');
        setEmail('');
      } else {
        addToast(res?.message || 'Subscription failed.', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'Could not subscribe. Please try again.', 'error');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-paragraph-color">
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <Outlet />
      </main>

      {/* Professional Developer Footer */}
      <footer className="border-t border-border-color bg-slate-950/80 text-xs text-muted-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand & Bio */}
            <div className="md:col-span-2 space-y-3">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-title-color">
                  DevDocs
                </span>
              </Link>
              <p className="text-slate-400 max-w-md leading-relaxed text-xs">
                A modern technical publication and engineering documentation platform exploring software architecture, backend systems, fullstack engineering, and distributed systems.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://github.com/logicbyroshan/blog-website-react"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-slate-600 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-slate-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h5 className="font-semibold text-title-color uppercase tracking-wider text-[11px] mb-3 font-mono">
                Platform Index
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/articles" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> All Articles
                  </Link>
                </li>
                <li>
                  <Link to="/docs" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> System Architecture
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> About DevDocs
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Newsletter Intake */}
            <div>
              <h5 className="font-semibold text-title-color uppercase tracking-wider text-[11px] mb-3 font-mono">
                Developer Newsletter
              </h5>
              <p className="text-slate-400 mb-3 text-xs leading-relaxed">
                Receive curated deep-dives into system designs and clean code practices.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full btn-primary text-xs py-1.5 font-semibold"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="border-t border-border-color/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-slate-500">
              © {new Date().getFullYear()} DevDocs Platform. Built with Django 5.2 + React.js & Tailwind CSS.
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Crafted for developers & technical builders</span>
              <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500/20" />
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
