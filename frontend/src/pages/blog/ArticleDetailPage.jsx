// --- FILE: frontend/src/pages/blog/ArticleDetailPage.jsx ---

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Calendar,
  Twitter,
  Linkedin,
  Link2,
  Check,
  Pin,
  Send,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MarkdownContent } from '../../components/content/MarkdownContent';
import { ErrorState } from '../../components/ui/EmptyState';

export function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Appreciation & Comment State
  const [userAppreciated, setUserAppreciated] = useState(false);
  const [totalAppreciations, setTotalAppreciations] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await blogApi.getPostDetail(slug);
      if (res?.success && res?.post) {
        setPost(res.post);
        setUserAppreciated(res.post.user_has_appreciated);
        setTotalAppreciations(res.post.total_appreciations);
        setComments(res.post.comments || []);
      } else {
        setError(res?.message || 'Article not found.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load article.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleToggleAppreciation = async () => {
    if (!isAuthenticated) {
      addToast('Please log in to appreciate this article.', 'warning');
      navigate(`/login?next=/article/${slug}`);
      return;
    }

    // Optimistic Update
    const prevAppreciated = userAppreciated;
    const prevCount = totalAppreciations;

    setUserAppreciated(!prevAppreciated);
    setTotalAppreciations(prevAppreciated ? prevCount - 1 : prevCount + 1);

    try {
      const res = await blogApi.toggleAppreciation(slug);
      if (res?.success) {
        setUserAppreciated(res.appreciated);
        setTotalAppreciations(res.total_appreciations);
      }
    } catch (err) {
      // Revert optimistic update
      setUserAppreciated(prevAppreciated);
      setTotalAppreciations(prevCount);
      addToast(err?.message || 'Could not update appreciation.', 'error');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please log in to participate in the discussion.', 'warning');
      navigate(`/login?next=/article/${slug}`);
      return;
    }

    if (!commentBody.trim()) {
      addToast('Comment cannot be empty.', 'warning');
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await blogApi.addComment(slug, commentBody.trim());
      if (res?.success && res?.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setCommentBody('');
        addToast('Comment posted successfully!', 'success');
      }
    } catch (err) {
      addToast(err?.message || 'Failed to submit comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      addToast('Article link copied to clipboard!', 'success');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-10 w-3/4 bg-slate-800 rounded animate-pulse" />
        <div className="h-6 w-1/2 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-72 w-full bg-slate-800/40 rounded-xl animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-800/60 rounded w-full" />
          <div className="h-4 bg-slate-800/60 rounded w-5/6" />
          <div className="h-4 bg-slate-800/60 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorState title="Article Not Found" message={error || 'The requested article could not be loaded.'} onRetry={fetchPost} />
      </div>
    );
  }

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);

  return (
    <article className="max-w-4xl mx-auto space-y-10">
      {/* Back Link */}
      <div>
        <Link
          to="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-color hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* Header Info */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {post.tags?.map((tag) => (
            <Badge key={tag.id} variant="primary" size="sm">
              {tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-title-color leading-tight">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            {post.subtitle}
          </p>
        )}

        {/* Author Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-color text-xs text-muted-color">
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${post.author_name}&background=1e293b&color=22d3ee`}
              alt={post.author_name}
              className="w-9 h-9 rounded-full object-cover border border-border-color"
            />
            <div>
              <div className="font-semibold text-title-color text-sm">{post.author_name}</div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.formatted_date}
                </span>
              </div>
            </div>
          </div>

          {/* Social Share & Copy Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-card-bg border border-border-color hover:text-cyan-400 hover:border-slate-500 transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-card-bg border border-border-color hover:text-blue-400 hover:border-slate-500 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-card-bg border border-border-color hover:text-teal-400 hover:border-slate-500 transition-colors"
              aria-label="Copy Article Link"
            >
              {linkCopied ? <Check className="w-4 h-4 text-teal-400" /> : <Link2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Featured Thumbnail */}
      {post.thumbnail_url && (
        <div className="w-full rounded-2xl overflow-hidden border border-border-color bg-slate-950 max-h-[440px]">
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content Engine */}
      <main className="py-2">
        <MarkdownContent content={post.content} />
      </main>

      {/* Appreciation & Action Banner */}
      <div className="p-6 rounded-2xl border border-border-color bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-title-color text-sm">Did you find this article valuable?</h4>
          <p className="text-xs text-muted-color">Leave an appreciation or join the engineering discussion below.</p>
        </div>

        <button
          onClick={handleToggleAppreciation}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
            userAppreciated
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
              : 'bg-slate-800 border border-slate-700 text-slate-200 hover:border-rose-500/60 hover:text-rose-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${userAppreciated ? 'fill-white' : 'text-rose-400'}`} />
          <span>{totalAppreciations} {totalAppreciations === 1 ? 'Appreciation' : 'Appreciations'}</span>
        </button>
      </div>

      {/* Author Bio Card */}
      <section className="p-6 rounded-2xl border border-border-color bg-card-bg/60 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <img
          src={`https://ui-avatars.com/api/?name=${post.author_name}&background=1e293b&color=22d3ee`}
          alt={post.author_name}
          className="w-14 h-14 rounded-full object-cover border border-cyan-500/40 shadow-md"
        />
        <div className="space-y-1">
          <div className="font-bold text-title-color text-base">Written by {post.author_name}</div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            {post.author_bio || 'Software Engineer and Technical Architect sharing insights into systems, distributed services, and modern UI engineering.'}
          </p>
        </div>
      </section>

      {/* Discussion & Comments Thread */}
      <section id="discussion" className="space-y-6 pt-6 border-t border-border-color">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-title-color">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Community Discussion ({comments.length})</h3>
          </div>
        </div>

        {/* Comment Intake Form */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="card-panel space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Comment as {user?.username}</span>
            </div>
            <textarea
              rows={3}
              placeholder="Share your thoughts, architectural considerations, or questions..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              className="w-full bg-slate-900/90 border border-border-color focus:border-accent-start rounded-lg p-3 text-sm text-title-color placeholder:text-muted-color focus:outline-none transition-colors"
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submittingComment}
                icon={Send}
              >
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-5 rounded-xl border border-dashed border-border-color bg-card-bg/30 text-center space-y-3">
            <p className="text-xs text-muted-color">Sign in to participate in the conversation and share insights.</p>
            <Link to={`/login?next=/article/${slug}`}>
              <Button variant="outline" size="sm">
                Log In to Comment
              </Button>
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-color bg-card-bg/20 rounded-xl border border-border-color/60">
              No comments posted yet. Be the first to start the discussion!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-xl border transition-all ${
                  comment.is_pinned
                    ? 'border-teal-500/40 bg-teal-950/20'
                    : 'border-border-color bg-card-bg/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comment.author_avatar || `https://ui-avatars.com/api/?name=${comment.author_username}&background=1e293b&color=22d3ee`}
                      alt={comment.author_username}
                      className="w-7 h-7 rounded-md object-cover"
                    />
                    <div>
                      <div className="text-xs font-semibold text-title-color flex items-center gap-1.5">
                        <span>{comment.author_name || comment.author_username}</span>
                        {comment.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-mono text-[10px]">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-color font-mono">
                        {comment.formatted_date}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-9">
                  {comment.body}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Articles Section */}
      {post.related_posts?.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-border-color">
          <div className="flex items-center gap-2 text-title-color">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold">Related Engineering Topics</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {post.related_posts.map((related) => (
              <Link
                key={related.id}
                to={`/article/${related.slug}`}
                className="card-panel group p-4 block hover:border-cyan-500/40 transition-colors"
              >
                <div className="text-[11px] font-mono text-cyan-400 mb-1">
                  {related.tags?.[0]?.name || 'Architecture'}
                </div>
                <h4 className="text-xs font-semibold text-title-color group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {related.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
