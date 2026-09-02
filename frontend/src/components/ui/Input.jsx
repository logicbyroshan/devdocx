// --- FILE: frontend/src/components/ui/Input.jsx ---

import React from 'react';

export function Input({
  label,
  error,
  helpText,
  id,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>{label} {required && <span className="text-red-400">*</span>}</span>
        </label>
      )}
      <input
        id={inputId}
        required={required}
        className={`w-full bg-slate-900/80 border ${
          error ? 'border-red-500/80 focus:border-red-500' : 'border-border-color focus:border-accent-start'
        } rounded-lg px-3.5 py-2 text-sm text-title-color placeholder:text-muted-color/60 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-slate-950 ${className}`}
        {...props}
      />
      {helpText && !error && (
        <p className="text-xs text-muted-color">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 font-medium">{Array.isArray(error) ? error[0] : error}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helpText,
  id,
  className = '',
  rows = 4,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full bg-slate-900/80 border ${
          error ? 'border-red-500/80 focus:border-red-500' : 'border-border-color focus:border-accent-start'
        } rounded-lg p-3 text-sm text-title-color placeholder:text-muted-color/60 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-slate-950 ${className}`}
        {...props}
      />
      {helpText && !error && (
        <p className="text-xs text-muted-color">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 font-medium">{Array.isArray(error) ? error[0] : error}</p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  helpText,
  id,
  options = [],
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        id={inputId}
        required={required}
        className={`w-full bg-slate-900/80 border ${
          error ? 'border-red-500/80 focus:border-red-500' : 'border-border-color focus:border-accent-start'
        } rounded-lg px-3.5 py-2 text-sm text-title-color focus:outline-none transition-colors disabled:opacity-50 disabled:bg-slate-950 ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="bg-slate-900 text-slate-200">
              {lbl}
            </option>
          );
        })}
      </select>
      {helpText && !error && (
        <p className="text-xs text-muted-color">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 font-medium">{Array.isArray(error) ? error[0] : error}</p>
      )}
    </div>
  );
}
