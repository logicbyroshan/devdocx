// --- FILE: frontend/src/components/ui/EmptyState.jsx ---

import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No items found',
  description = 'There are currently no records to display.',
  icon: Icon = FileQuestion,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-card-bg/40 border border-dashed border-border-color rounded-xl ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3.5 text-muted-color">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-title-color mb-1">{title}</h4>
      <p className="text-sm text-muted-color max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Failed to load content',
  message = 'An error occurred while communicating with the server.',
  onRetry,
}) {
  return (
    <div className="card-panel border-red-500/30 bg-red-950/10 p-6 flex flex-col items-center text-center my-4">
      <h4 className="text-base font-semibold text-red-300 mb-1">{title}</h4>
      <p className="text-sm text-red-200/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
