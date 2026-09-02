// --- FILE: frontend/src/pages/docs/DocDetailPage.jsx ---

import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { docsApi } from '../../api/docs';
import { Breadcrumbs } from '../../components/ui/Pagination';
import { TableOfContents } from '../../components/navigation/TableOfContents';
import { MarkdownContent } from '../../components/content/MarkdownContent';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';
import { Clock, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export function DocDetailPage() {
  const { slug } = useParams();
  const { docsList = [] } = useOutletContext();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDoc() {
      try {
        setLoading(true);
        setError(null);
        const res = await docsApi.getDocDetail(slug);
        if (res?.success && res?.doc) {
          setDoc(res.doc);
        } else {
          setError(res?.message || 'Guide not found.');
        }
      } catch (err) {
        setError(err?.message || 'Failed to load documentation guide.');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-2/3 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-slate-800/60 rounded animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !doc) {
    return <ErrorState title="Documentation Guide Not Found" message={error || 'The requested guide could not be loaded.'} />;
  }

  const currentIndex = docsList.findIndex((d) => d.slug === slug);
  const prevDoc = currentIndex > 0 ? docsList[currentIndex - 1] : null;
  const nextDoc = currentIndex >= 0 && currentIndex < docsList.length - 1 ? docsList[currentIndex + 1] : null;

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start relative w-full">
      {/* Main Guide Content */}
      <div className="flex-1 min-w-0 w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Documentation', href: '/docs' },
            { label: doc.category || 'Guide', href: '/docs' },
            { label: doc.title },
          ]}
        />

        {/* Document Header */}
        <div className="space-y-3 pb-6 border-b border-border-color">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="xs">
              {doc.category || 'Architecture'}
            </Badge>
            <span className="text-[11px] font-mono text-muted-color flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {doc.read_time || '5 min read'}
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-title-color leading-tight">
            {doc.title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {doc.description}
          </p>
        </div>

        {/* Markdown Content Engine */}
        <main className="py-2">
          <MarkdownContent content={doc.content} />
        </main>

        {/* Prev / Next Document Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-border-color">
          {prevDoc ? (
            <Link
              to={`/docs/${prevDoc.slug}`}
              className="p-4 rounded-xl border border-border-color bg-card-bg/60 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-color flex items-center gap-1 mb-1">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous Guide</span>
              </div>
              <div className="text-xs font-semibold text-title-color group-hover:text-cyan-300 transition-colors">
                {prevDoc.title}
              </div>
            </Link>
          ) : <div />}

          {nextDoc ? (
            <Link
              to={`/docs/${nextDoc.slug}`}
              className="p-4 rounded-xl border border-border-color bg-card-bg/60 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between text-right"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-color flex items-center justify-end gap-1 mb-1">
                <span>Next Guide</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-xs font-semibold text-title-color group-hover:text-cyan-300 transition-colors">
                {nextDoc.title}
              </div>
            </Link>
          ) : <div />}
        </div>
      </div>

      {/* Right-hand Sticky Table of Contents (for xl viewports) */}
      {doc.toc && doc.toc.length > 0 && (
        <aside className="hidden xl:block w-64 sticky top-24 pl-4 border-l border-border-color/60 flex-shrink-0">
          <TableOfContents items={doc.toc} />
        </aside>
      )}
    </div>
  );
}
