// --- FILE: frontend/src/pages/blog/AboutPage.jsx ---

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Server,
  Layers,
  Cpu,
  Github,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  BookOpen,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { blogApi } from '../../api/blog';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function AboutPage() {
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthor() {
      try {
        const res = await blogApi.getAboutAuthor();
        if (res?.success && res?.author) {
          setAuthor(res.author);
        }
      } catch (err) {
        console.error('Failed to load author data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuthor();
  }, []);

  const stack = [
    { title: 'Backend Core', desc: 'Django 5.2, Python 3.11, Django REST Framework, WhiteNoise', icon: Server },
    { title: 'Frontend & UI', desc: 'React.js, Tailwind CSS, Vite, PrismJS, Mermaid.js', icon: Code2 },
    { title: 'Data & Persistence', desc: 'PostgreSQL, SQLite, Composite Indexing, ORM Aggregations', icon: Layers },
    { title: 'Infrastructure', desc: 'Docker, Gunicorn, RESTful APIs, Session & CSRF Security', icon: Cpu },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Bio Header */}
      <section className="card-panel p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-accent-start to-accent-end p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
          <img
            src="https://ui-avatars.com/api/?name=DevDocs+Engineering&background=0f172a&color=22d3ee&size=200"
            alt="DevDocs Engineering"
            className="w-full h-full object-cover rounded-[14px]"
          />
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
            <MapPin className="w-3 h-3" />
            <span>Open Source • Technical Systems & Architecture</span>
          </div>

          <h1 className="font-heading text-3xl font-bold text-title-color">
            {author?.name || 'DevDocs Engineering'}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            {author?.bio || 'Dedicated to building robust, high-throughput distributed systems, clean decoupled architectures, and state-of-the-art developer documentation.'}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            <a
              href={author?.social_links?.github || 'https://github.com/logicbyroshan/blog-website-react'}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm" icon={Github}>
                GitHub Repository
              </Button>
            </a>
            <a
              href="mailto:contact@devdocs.io"
            >
              <Button variant="secondary" size="sm" icon={Mail}>
                Contact Team
              </Button>
            </a>
          </div>
        </div>
      </section>


      {/* Metrics Row */}
      {author?.metrics && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-panel p-5 text-center space-y-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto mb-2 border border-cyan-800/60">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="font-mono text-2xl font-bold text-title-color">
              {author.metrics.total_articles}
            </div>
            <div className="text-xs text-muted-color">Published Articles</div>
          </div>

          <div className="card-panel p-5 text-center space-y-1">
            <div className="w-8 h-8 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center mx-auto mb-2 border border-rose-800/60">
              <Heart className="w-4 h-4" />
            </div>
            <div className="font-mono text-2xl font-bold text-title-color">
              {author.metrics.total_appreciations}
            </div>
            <div className="text-xs text-muted-color">Community Appreciations</div>
          </div>

          <div className="card-panel p-5 text-center space-y-1">
            <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 flex items-center justify-center mx-auto mb-2 border border-teal-800/60">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="font-mono text-2xl font-bold text-title-color">
              {author.metrics.total_comments}
            </div>
            <div className="text-xs text-muted-color">Discussion Comments</div>
          </div>
        </section>
      )}

      {/* Tech Stack Pillars */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-title-color">Platform Technical Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stack.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="card-panel p-5 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-title-color mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Skills Badges */}
      <section className="card-panel p-6 space-y-3">
        <h3 className="text-sm font-semibold text-title-color uppercase tracking-wider font-mono">
          Core Competencies & Technologies
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Python', 'Django 5.2', 'React.js', 'JavaScript (ES6+)', 'Tailwind CSS', 'Django REST Framework', 'PostgreSQL', 'SQLite', 'Docker', 'Vite', 'Git', 'Mermaid.js', 'REST APIs', 'System Architecture'].map((skill) => (
            <Badge key={skill} variant="tag" size="md">
              {skill}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
