// --- FILE: frontend/src/components/diagrams/MermaidDiagram.jsx ---

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0f172a',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#38bdf8',
    secondaryColor: '#334155',
    tertiaryColor: '#1e293b',
    fontFamily: '"JetBrains Mono", monospace',
  },
  securityLevel: 'loose',
});

export function MermaidDiagram({ chart = '', title, className = '' }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function renderChart() {
      if (!chart.trim()) return;
      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError('Failed to render diagram blueprint.');
        }
      }
    }
    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className={`my-6 rounded-xl border border-border-color bg-slate-950/90 overflow-hidden shadow-lg ${className}`}>
      {/* Title Header */}
      {title && (
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-border-color text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="font-mono text-cyan-400"># DIAGRAM // {title}</span>
          <span className="text-[10px] text-muted-color uppercase font-mono">Mermaid Engine</span>
        </div>
      )}

      {/* Diagram Canvas with 320px responsive scroll container */}
      <div className="p-4 md:p-6 overflow-x-auto flex items-center justify-center min-h-[140px]">
        {error ? (
          <div className="text-xs text-red-400 font-mono p-3 bg-red-950/20 border border-red-500/20 rounded-md">
            {error}
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto transition-all"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-xs text-muted-color animate-pulse font-mono">
            Rendering architectural blueprint...
          </div>
        )}
      </div>
    </div>
  );
}
