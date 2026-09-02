// --- FILE: frontend/src/contexts/ToastContext.jsx ---

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          let bg = 'bg-slate-900 border-slate-700 text-slate-200';
          let Icon = Info;
          let iconColor = 'text-cyan-400';

          if (toast.type === 'success') {
            bg = 'bg-slate-900 border-teal-500/40 text-teal-100';
            Icon = CheckCircle2;
            iconColor = 'text-teal-400';
          } else if (toast.type === 'error') {
            bg = 'bg-slate-900 border-red-500/40 text-red-100';
            Icon = AlertCircle;
            iconColor = 'text-red-400';
          } else if (toast.type === 'warning') {
            bg = 'bg-slate-900 border-amber-500/40 text-amber-100';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
              role="status"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-grow text-sm font-medium leading-snug break-words">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-0.5 -mr-1 -mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
