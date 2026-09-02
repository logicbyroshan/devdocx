// --- FILE: frontend/src/components/ui/Pagination.jsx ---

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and adjacent pages
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 py-6" aria-label="Pagination Navigation">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-border-color bg-card-bg text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-muted-color select-none text-sm">
                ...
              </span>
            );
          }
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] h-9 px-3 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-accent-start to-accent-end text-slate-950 shadow-sm shadow-cyan-500/10'
                  : 'bg-card-bg border border-border-color text-paragraph-color hover:bg-slate-700 hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-border-color bg-card-bg text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-muted-color mb-4 overflow-x-auto whitespace-nowrap py-1">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-600">/</span>}
            {isLast || !item.href ? (
              <span className="text-slate-200 font-medium">{item.label}</span>
            ) : (
              <a href={item.href} className="hover:text-cyan-400 transition-colors">
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-border-color overflow-x-auto whitespace-nowrap py-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-1 flex items-center gap-2 ${
              isActive
                ? 'border-accent-start text-title-color bg-slate-800/40'
                : 'border-transparent text-muted-color hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
