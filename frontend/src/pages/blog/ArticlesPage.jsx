// --- FILE: frontend/src/pages/blog/ArticlesPage.jsx ---

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Heart, MessageSquare, BookOpen } from 'lucide-react';
import { blogApi } from '../../api/blog';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await blogApi.getCategories();
        if (res?.success) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Articles on query changes
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError(null);
        const res = await blogApi.getPosts({
          page: currentPage,
          category: currentCategory,
          search: currentSearch,
        });

        if (res?.results) {
          setPosts(res.results);
          setTotalCount(res.count);
          setTotalPages(Math.ceil(res.count / 9) || 1);
        } else {
          setPosts([]);
          setTotalCount(0);
        }
      } catch (err) {
        setError(err?.message || 'Failed to retrieve articles.');
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [currentPage, currentCategory, currentSearch]);

  const handleCategorySelect = (catName) => {
    const params = new URLSearchParams(searchParams);
    if (catName === 'all') {
      params.delete('category');
    } else {
      params.set('category', catName);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-title-color">
          Article Archive & Knowledge Base
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Explore technical write-ups, architecture breakdowns, developer guides, and coding patterns.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-border-color">
        {/* Category Pills (with 320px safe horizontal scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentCategory === 'all'
                ? 'bg-gradient-to-r from-accent-start to-accent-end text-slate-950 font-bold shadow-sm'
                : 'bg-card-bg border border-border-color text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Articles
          </button>
          {categories.map((cat) => {
            const isActive = currentCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-start to-accent-end text-slate-950 font-bold shadow-sm'
                    : 'bg-card-bg border border-border-color text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                {cat.posts_count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-900/30 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {cat.posts_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-muted-color absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-900/90 border border-border-color focus:border-accent-start rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-title-color placeholder:text-muted-color focus:outline-none transition-colors"
          />
        </form>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Error Loading Articles" message={error} onRetry={() => handlePageChange(currentPage)} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No articles match your criteria"
          description={
            currentSearch
              ? `No articles found for search term "${currentSearch}".`
              : 'There are no published articles in this category yet.'
          }
          icon={BookOpen}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchInput('');
            setSearchParams({});
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/article/${post.slug}`}
                className="card-interactive flex flex-col justify-between group p-5"
              >
                <div className="space-y-3">
                  {post.thumbnail_url ? (
                    <div className="w-full h-44 rounded-lg overflow-hidden bg-slate-900">
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-mono text-xs">
                      [Architecture Blueprint]
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {post.tags?.map((tag) => (
                      <Badge key={tag.id} variant="tag" size="xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-base font-bold text-title-color group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  {post.subtitle && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {post.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-color text-xs text-muted-color">
                  <span className="font-mono text-[11px] flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.formatted_date}
                  </span>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {post.total_appreciations}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      {post.comments_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
