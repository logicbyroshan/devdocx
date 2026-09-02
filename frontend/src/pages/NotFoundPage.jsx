// --- FILE: frontend/src/pages/NotFoundPage.jsx ---

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-2">
        <Compass className="w-8 h-8" />
      </div>
      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
        404 // Resource Missing
      </span>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-title-color">
        Page Not Found
      </h1>
      <p className="text-sm text-muted-color max-w-sm leading-relaxed">
        The requested URL does not exist or has been relocated in the developer knowledge base.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="primary" size="md" icon={ArrowLeft}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
