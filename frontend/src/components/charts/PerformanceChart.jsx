// --- FILE: frontend/src/components/charts/PerformanceChart.jsx ---

import React, { useState } from 'react';

export function PerformanceChart({ chartData, height = 240, className = '' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 text-xs text-muted-color bg-card-bg/40 border border-border-color rounded-xl ${className}`}>
        No activity chart data available yet.
      </div>
    );
  }

  const { labels, datasets = [] } = chartData;
  const maxVal = Math.max(
    ...datasets.flatMap((d) => d.data),
    10
  );

  return (
    <div className={`card-panel ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Post Engagement Analytics
        </h4>
        {/* Dataset Legends */}
        <div className="flex items-center gap-3 text-xs">
          {datasets.map((ds, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: ds.color || '#22d3ee' }}
              />
              <span className="text-slate-300 font-medium">{ds.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Canvas with 320px responsive scroll wrapper */}
      <div className="w-full overflow-x-auto pt-2 pb-1">
        <div className="min-w-[400px] flex items-end gap-6 justify-between px-2" style={{ height: `${height}px` }}>
          {labels.map((label, colIdx) => {
            const isHovered = hoveredIdx === colIdx;

            return (
              <div
                key={colIdx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(colIdx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Bar Group */}
                <div className="w-full flex items-end justify-center gap-1.5 h-full pb-2 relative">
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-md text-[11px] shadow-xl z-20 whitespace-nowrap pointer-events-none">
                      <div className="font-semibold text-title-color mb-0.5">{label}</div>
                      {datasets.map((ds, dIdx) => (
                        <div key={dIdx} className="text-slate-300 flex items-center justify-between gap-2">
                          <span style={{ color: ds.color }}>{ds.label}:</span>
                          <span className="font-mono font-bold text-white">{ds.data[colIdx]}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {datasets.map((ds, dIdx) => {
                    const val = ds.data[colIdx] || 0;
                    const pct = Math.max(4, (val / maxVal) * 100);

                    return (
                      <div
                        key={dIdx}
                        className="w-3 sm:w-4 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                        style={{
                          height: `${pct}%`,
                          backgroundColor: ds.color || '#22d3ee',
                        }}
                      />
                    );
                  })}
                </div>

                {/* X-axis Label */}
                <div className="text-[11px] text-muted-color truncate w-full text-center font-mono group-hover:text-cyan-300 transition-colors pt-1 border-t border-slate-800">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
