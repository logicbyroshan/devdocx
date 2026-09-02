// --- FILE: frontend/src/pages/docs/DocsIndexPage.jsx ---

import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Terminal,
  BookOpen,
  Clock,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export function DocsIndexPage() {
  const { docsList = [] } = useOutletContext();

  const iconMap = {
    'system-architecture': Server,
    'rest-api-reference': Terminal,
    'database-schema': Database,
    'authentication-security': ShieldCheck,
    'component-design-system': Cpu,
  };

  return (
    <div className="space-y-10">
      {/* Overview Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-xs font-mono text-cyan-300">
          <Layers className="w-3.5 h-3.5" />
          <span>System Architecture & Technical Manuals</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-title-color">
          Platform Architecture & Engineering Docs
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          Comprehensive developer reference manuals, entity relationship models, data flow sequences, and RESTful API specifications for the platform.
        </p>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {docsList.map((doc) => {
          const Icon = iconMap[doc.slug] || BookOpen;

          return (
            <Link
              key={doc.slug}
              to={`/docs/${doc.slug}`}
              className="card-interactive p-6 flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 group-hover:scale-105 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="primary" size="xs">
                    {doc.category || 'Guide'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-title-color group-hover:text-cyan-300 transition-colors leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {doc.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-color text-xs text-muted-color">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  {doc.read_time || '5 min read'}
                </span>
                <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold text-xs">
                  <span>Read Blueprint</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
