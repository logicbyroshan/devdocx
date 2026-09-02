// --- FILE: frontend/src/components/tables/DataTable.jsx ---

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { TableRowSkeleton } from '../ui/Skeleton';

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records available',
  emptyDescription = 'There are no items matching the current criteria.',
  rowKey = 'id',
  onRowClick,
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-border-color bg-card-bg shadow-sm ${className}`}>
      {/* Responsive Horizontal Scroll Container (320px safe) */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[550px]">
          <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-border-color">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-4 py-3.5 select-none ${col.headerClassName || ''} ${
                    col.sortable ? 'cursor-pointer hover:text-slate-200 transition-colors' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-slate-500">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/60 font-sans">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={columns.length} />
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => {
                const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || rowIdx;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key || colIdx}
                        className={`px-4 py-3.5 text-slate-300 text-sm align-middle ${
                          col.cellClassName || ''
                        }`}
                      >
                        {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
