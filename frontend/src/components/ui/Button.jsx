// --- FILE: frontend/src/components/ui/Button.jsx ---

import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent-start/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-accent-start to-accent-end text-slate-950 font-semibold hover:brightness-110 shadow-sm shadow-cyan-500/10',
    outline: 'border border-border-color bg-card-bg/70 text-title-color hover:bg-slate-700/60 hover:border-slate-500',
    secondary: 'bg-slate-800 border border-border-color text-paragraph-color hover:bg-slate-700 hover:text-white',
    danger: 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30',
    ghost: 'text-paragraph-color hover:text-title-color hover:bg-slate-800/60',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {!loading && Icon && <Icon className="w-4 h-4 text-current flex-shrink-0" />}
      {children}
    </button>
  );
}
