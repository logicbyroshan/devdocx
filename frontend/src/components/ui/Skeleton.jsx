// --- FILE: frontend/src/components/ui/Skeleton.jsx ---

import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-800/80 rounded-md ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-panel flex flex-col gap-4">
      <Skeleton className="w-full h-44 rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="w-16 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>
      <Skeleton className="w-4/5 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-2/3 h-4" />
      <div className="flex items-center justify-between pt-2 border-t border-border-color">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-border-color/60">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="px-4 py-3.5">
          <Skeleton className="w-full h-5" />
        </td>
      ))}
    </tr>
  );
}
