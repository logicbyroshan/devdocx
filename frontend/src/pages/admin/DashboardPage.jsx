// --- FILE: frontend/src/pages/admin/DashboardPage.jsx ---

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Lightbulb,
  Plus,
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { ErrorState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Planned post inline form
  const [plannedTitle, setPlannedTitle] = useState('');
  const [planningPost, setPlanningPost] = useState(false);

  // Post tabs
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' | 'latest' | 'recommended'

  const { addToast } = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getDashboard();
      if (res?.success) {
        setData(res);
      } else {
        setError(res?.message || 'Failed to fetch admin dashboard.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!plannedTitle.trim()) {
      addToast('Please enter an idea title.', 'warning');
      return;
    }

    try {
      setPlanningPost(true);
      const res = await adminApi.planPost(plannedTitle.trim());
      if (res?.success) {
        addToast(res.message || 'Idea planned successfully!', 'success');
        setPlannedTitle('');
        fetchDashboard();
      }
    } catch (err) {
      addToast(err?.message || 'Failed to plan idea.', 'error');
    } finally {
      setPlanningPost(false);
    }
  };

  const handleToggleRecommend = async (postId) => {
    try {
      const res = await adminApi.togglePostRecommend(postId);
      if (res?.success) {
        addToast(res.message, 'success');
        fetchDashboard();
      }
    } catch (err) {
      addToast(err?.message || 'Failed to toggle recommendation.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState title="Dashboard Error" message={error} onRetry={fetchDashboard} />;
  }

  const { metrics, chart_data, calendar: cal, planned_posts = [], popular_posts = [], latest_posts = [], recommended_posts = [], non_recommended_posts = [] } = data;

  const currentTabPosts =
    activeTab === 'popular'
      ? popular_posts
      : activeTab === 'latest'
      ? latest_posts
      : recommended_posts;

  return (
    <div className="space-y-8">
      {/* Top Header & Write Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-color">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-title-color">
            Editorial Control Center
          </h1>
          <p className="text-xs text-muted-color">
            Monitor article performance, schedule upcoming releases, and manage publishing workflows.
          </p>
        </div>

        <Link to="/admin/posts/new">
          <Button variant="primary" size="md" icon={Plus}>
            Write New Post
          </Button>
        </Link>
      </div>

      {/* Metrics Row (4 Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center gap-3.5 border-emerald-500/30 bg-emerald-950/10">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-title-color">{metrics.published_count}</div>
            <div className="text-xs text-muted-color">Published Posts</div>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3.5 border-amber-500/30 bg-amber-950/10">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-title-color">{metrics.scheduled_count}</div>
            <div className="text-xs text-muted-color">Scheduled Posts</div>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3.5 border-slate-700 bg-slate-800/40">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-title-color">{metrics.draft_count}</div>
            <div className="text-xs text-muted-color">Draft Articles</div>
          </div>
        </div>

        <div className="card-panel p-4 flex items-center gap-3.5 border-purple-500/30 bg-purple-950/10">
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-title-color">{metrics.planned_count}</div>
            <div className="text-xs text-muted-color">Planned Ideas</div>
          </div>
        </div>
      </div>

      {/* Grid: Analytics Chart & Planned Ideas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Bar Chart (2 cols) */}
        <div className="lg:col-span-2">
          <PerformanceChart chartData={chart_data} height={220} />
        </div>

        {/* Quick Planned Ideas Manager (1 col) */}
        <div className="card-panel flex flex-col justify-between p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-title-color font-semibold text-xs uppercase tracking-wider font-mono">
              <Lightbulb className="w-4 h-4 text-purple-400" />
              <span>Quick Idea Planner</span>
            </div>

            {/* Inline Intake Form */}
            <form onSubmit={handlePlanSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Topic / article idea title..."
                value={plannedTitle}
                onChange={(e) => setPlannedTitle(e.target.value)}
                className="w-full bg-slate-900 border border-border-color focus:border-purple-400 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted-color focus:outline-none transition-colors"
                required
              />
              <Button type="submit" variant="primary" size="sm" loading={planningPost}>
                Plan
              </Button>
            </form>

            {/* Planned Posts List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {planned_posts.length === 0 ? (
                <p className="text-xs text-muted-color text-center py-4">No planned ideas yet.</p>
              ) : (
                planned_posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-slate-300 font-medium truncate">{post.title}</span>
                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex-shrink-0"
                    >
                      Draft &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/admin/posts?status=PL"
            className="text-[11px] text-muted-color hover:text-cyan-400 flex items-center justify-between pt-2 border-t border-border-color"
          >
            <span>View all planned ideas</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* High Performance Editorial Calendar */}
      {cal && (
        <section className="card-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-title-color font-semibold text-xs uppercase tracking-wider font-mono">
              <CalendarIcon className="w-4 h-4 text-cyan-400" />
              <span>Editorial Calendar — {cal.month_name} {cal.year}</span>
            </div>
            <span className="text-xs text-muted-color font-mono">Single-Query Matrix</span>
          </div>

          {/* Calendar Grid Container (320px safe horizontal scroll) */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] border border-border-color rounded-xl overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-slate-900/90 border-b border-border-color text-center text-xs font-semibold text-slate-400 py-2">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Weeks & Days */}
              <div className="divide-y divide-border-color/60 bg-slate-950/40">
                {cal.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-cols-7 divide-x divide-border-color/60 min-h-[72px]">
                    {week.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        className={`p-1.5 flex flex-col justify-between ${
                          day.is_current_month ? 'bg-card-bg/20' : 'bg-slate-950/60 opacity-40'
                        } ${day.is_today ? 'ring-1 ring-cyan-400/80 bg-cyan-950/20' : ''}`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className={`font-semibold ${day.is_today ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                            {day.day > 0 ? day.day : ''}
                          </span>
                          {day.is_today && (
                            <span className="text-[9px] px-1 bg-cyan-950 text-cyan-300 rounded font-mono">
                              Today
                            </span>
                          )}
                        </div>

                        {/* Scheduled / Published Badges on day */}
                        <div className="space-y-1 mt-1">
                          {day.posts.map((p) => (
                            <Link
                              key={p.id}
                              to={`/admin/posts/edit/${p.id}`}
                              className={`block text-[10px] p-1 rounded font-mono truncate transition-opacity hover:opacity-80 ${
                                p.status === 'PB'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              }`}
                              title={p.title}
                            >
                              {p.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabbed Posts Showcase (Popular, Latest, Recommended) */}
      <section className="card-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-color pb-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'popular'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'text-muted-color hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Most Popular</span>
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'latest'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'text-muted-color hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latest Published</span>
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'recommended'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'text-muted-color hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Spotlight</span>
            </button>
          </div>

          <Link
            to="/admin/posts"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
          >
            <span>All Posts Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* List of Tab Posts */}
        <div className="space-y-2">
          {currentTabPosts.length === 0 ? (
            <p className="text-xs text-muted-color text-center py-6">No articles found in this category.</p>
          ) : (
            currentTabPosts.map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-border-color flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-title-color">{post.title}</span>
                    <Badge variant={post.status === 'PB' ? 'published' : 'scheduled'} size="xs">
                      {post.status_display}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-color font-mono">
                    Published on {post.formatted_publish_date} • {post.total_appreciations} likes • {post.comments_count} comments
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRecommend(post.id)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 font-mono ${
                      post.is_recommended
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span>{post.is_recommended ? 'Spotlighted' : 'Recommend'}</span>
                  </button>

                  <Link to={`/admin/posts/edit/${post.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
