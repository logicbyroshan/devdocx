// --- FILE: frontend/src/components/navigation/TableOfContents.jsx ---

import React, { useState, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';

export function TableOfContents({ items = [], className = '' }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);

      const scrollPosition = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading.offsetTop <= scrollPosition) {
          setActiveId(heading.id);
          return;
        }
      }
      if (items.length > 0 && !activeId) {
        setActiveId(items[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
        <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
        <span>On this page</span>
      </div>
      <nav className="space-y-1 text-xs border-l border-slate-800 pl-3">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActiveId(item.id);
                }
              }}
              className={`block py-1 transition-colors ${
                isActive
                  ? 'text-cyan-400 font-medium -ml-[13px] border-l-2 border-cyan-400 pl-3'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.title}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
