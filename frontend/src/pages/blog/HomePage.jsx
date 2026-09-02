// --- FILE: frontend/src/pages/blog/HomePage.jsx ---

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Heart,
  MessageSquare,
  Calendar,
  Layers,
  Terminal,
} from 'lucide-react';

import { blogApi } from '../../api/blog';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';

export function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHome = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await blogApi.getHome();
      if (res?.success) {
        setData(res);
      } else {
        setError(res?.message || 'Failed to fetch homepage data.');
      }
    } catch (err) {
      setError(err?.message || 'Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="h-64 bg-slate-900/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load home page" message={error} onRetry={fetchHome} />;
  }

  const { hero_posts = [], trending_main, trending_sidebar = [], latest_posts = [], ai_suggestions = [], archive_post } = data || {};

  return (
    <div className="space-y-14 sm:space-y-18">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border-color bg-gradient-to-b from-slate-900 via-card-bg to-bg-dark p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-xs font-mono text-cyan-300">
            <Terminal className="w-3.5 h-3.5" />
            <span>Modern Systems, Architecture & Software Engineering</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-title-color leading-tight">
            Engineering Insights for <span className="text-gradient">Technical Builders</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Deep-dives into scalable software architectures, distributed backends, clean API design, and modern full-stack web applications.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/articles">
              <Button variant="primary" size="md">
                <span>Explore Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="md">
                <Layers className="w-4 h-4" />
                <span>Architecture Blueprints</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Floating Cards */}
        {hero_posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border-color/60">
            {hero_posts.map((post) => (
              <Link
                key={post.id}
                to={`/article/${post.slug}`}
                className="group p-4 rounded-xl bg-slate-950/60 border border-border-color hover:border-cyan-500/50 transition-all hover:-translate-y-0.5"
              >
                <div className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center justify-between">
                  <span>{post.tags?.[0]?.name || 'Architecture'}</span>
                  <span>{post.formatted_date}</span>
                </div>
                <h3 className="text-sm font-semibold text-title-color group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trending & Spotlight Section */}
      {(trending_main || trending_sidebar.length > 0) && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-title-color">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold tracking-tight">Trending Discussions</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Trending Card */}
            {trending_main && (
              <div className="lg:col-span-2">
                <Link
                  to={`/article/${trending_main.slug}`}
                  className="card-interactive flex flex-col justify-between h-full group p-6"
                >
                  <div className="space-y-3">
                    {trending_main.thumbnail_url && (
                      <div className="w-full h-56 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img
                          src={trending_main.thumbnail_url}
                          alt={trending_main.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {trending_main.tags?.map((tag) => (
                        <Badge key={tag.id} variant="tag">{tag.name}</Badge>
                      ))}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-title-color group-hover:text-cyan-400 transition-colors leading-snug">
                      {trending_main.title}
                    </h3>
                    {trending_main.subtitle && (
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {trending_main.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-color text-xs text-muted-color">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-300">{trending_main.author_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {trending_main.formatted_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        {trending_main.total_appreciations}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        {trending_main.comments_count}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Trending Sidebar Column */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {trending_sidebar.map((post) => (
                  <Link
                    key={post.id}
                    to={`/article/${post.slug}`}
                    className="card-panel group hover:border-slate-600 block p-4"
                  >
                    <div className="text-[11px] font-mono text-cyan-400 mb-1">
                      {post.tags?.[0]?.name || 'Article'}
                    </div>
                    <h4 className="text-sm font-semibold text-title-color group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-muted-color font-mono">
                      <span>{post.formatted_date}</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Heart className="w-3 h-3 text-rose-400" /> {post.total_appreciations}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Spotlight Archive Card */}
              {archive_post && (
                <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 uppercase tracking-wider font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Curated Spotlight</span>
                  </div>
                  <Link to={`/article/${archive_post.slug}`} className="block group">
                    <h4 className="text-sm font-semibold text-title-color group-hover:text-teal-300 transition-colors line-clamp-2">
                      {archive_post.title}
                    </h4>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles Section */}
      {latest_posts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-title-color">Latest Publications</h2>
            <Link to="/articles" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latest_posts.map((post) => (
              <Link
                key={post.id}
                to={`/article/${post.slug}`}
                className="card-interactive flex flex-col justify-between group p-4"
              >
                <div className="space-y-2.5">
                  {post.thumbnail_url ? (
                    <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-900">
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-36 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-mono text-xs">
                      [Architecture Blueprint]
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-1">
                    {post.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag.id} variant="tag" size="xs">{tag.name}</Badge>
                    ))}
                  </div>

                  <h3 className="text-sm font-semibold text-title-color group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-color text-[11px] text-muted-color font-mono">
                  <span>{post.formatted_date}</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    {post.total_appreciations}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Topics / AI Explorations */}
      {ai_suggestions.length > 0 && (
        <section className="rounded-2xl border border-border-color bg-slate-900/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-title-color">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold">Recommended Topics for You</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ai_suggestions.map((post) => (
              <Link
                key={post.id}
                to={`/article/${post.slug}`}
                className="p-3.5 rounded-lg bg-card-bg/60 border border-slate-800 hover:border-cyan-500/40 transition-colors group block"
              >
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-[11px] text-muted-color mt-1 font-mono">
                  {post.tags?.[0]?.name || 'Architecture'} • {post.formatted_date}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
