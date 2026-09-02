// --- FILE: frontend/src/components/ui/Callout.jsx ---

import React from 'react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle, Lightbulb } from 'lucide-react';

export function Callout({ type = 'note', title, children, className = '' }) {
  const configs = {
    note: {
      border: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-200',
      iconColor: 'text-cyan-400',
      defaultTitle: 'NOTE',
      Icon: Info,
    },
    tip: {
      border: 'border-teal-500/30 bg-teal-950/20 text-teal-200',
      iconColor: 'text-teal-400',
      defaultTitle: 'TIP',
      Icon: Lightbulb,
    },
    warning: {
      border: 'border-amber-500/30 bg-amber-950/20 text-amber-200',
      iconColor: 'text-amber-400',
      defaultTitle: 'WARNING',
      Icon: AlertTriangle,
    },
    danger: {
      border: 'border-red-500/30 bg-red-950/20 text-red-200',
      iconColor: 'text-red-400',
      defaultTitle: 'IMPORTANT',
      Icon: AlertOctagon,
    },
    success: {
      border: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200',
      iconColor: 'text-emerald-400',
      defaultTitle: 'SUCCESS',
      Icon: CheckCircle,
    },
  };

  const config = configs[type.toLowerCase()] || configs.note;
  const { Icon, defaultTitle, border, iconColor } = config;

  return (
    <aside className={`my-4 p-4 rounded-lg border ${border} ${className}`} role="note">
      <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs tracking-wider uppercase text-title-color">
        <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
        <span>{title || defaultTitle}</span>
      </div>
      <div className="text-sm leading-relaxed text-slate-300 [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
