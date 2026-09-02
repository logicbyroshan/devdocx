// --- FILE: frontend/src/components/ui/Badge.jsx ---

import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded',
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-sm px-2.5 py-1 rounded-md font-medium',
  };

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60',
    success: 'bg-teal-950/80 text-teal-300 border border-teal-800/60',
    published: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
    scheduled: 'bg-amber-950/80 text-amber-300 border border-amber-800/60',
    draft: 'bg-slate-800 text-slate-400 border border-slate-700',
    planned: 'bg-purple-950/80 text-purple-300 border border-purple-800/60',
    danger: 'bg-red-950/80 text-red-300 border border-red-800/60',
    tag: 'bg-slate-800/80 text-slate-300 border border-slate-700/80 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center gap-1 ${sizeStyles[size]} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}
