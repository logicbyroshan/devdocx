// --- FILE: frontend/src/pages/admin/PostsListPage.jsx ---

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../contexts/ToastContext';
import { DataTable } from '../../components/tables/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Pagination';

export function PostsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Filter: 'ALL', 'PB', 'SC', 'DF', 'PL'
  const currentStatus = searchParams.get('status') || 'ALL';
  const currentSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Delete Modal State
  const [deleteModalPost, setDeleteModalPost] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPosts({
        status: currentStatus,
        search: currentSearch,
      });
      if (res?.success) {
        setPosts(res.posts);
      }
    } catch (err) {
      addToast(err?.message || 'Failed to fetch posts list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentStatus, currentSearch]);

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
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
    setSearchParams(params);
  };

  const handleToggleActive = async (postId) => {
    try {
      const res = await adminApi.togglePostActive(postId);
      if (res?.success) {
        addToast(res.message, 'success');
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, is_active: res.is_active } : p))
        );
      }
    } catch (err) {
      addToast(err?.message || 'Failed to toggle visibility.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalPost) return;
    try {
      setDeleting(true);
      const res = await adminApi.deletePost(deleteModalPost.id);
      if (res?.success) {
        addToast(res.message, 'success');
        setPosts((prev) => prev.filter((p) => p.id !== deleteModalPost.id));
        setDeleteModalPost(null);
      }
    } catch (err) {
      addToast(err?.message || 'Failed to delete post.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const statusBadgeVariant = {
    PB: 'published',
    SC: 'scheduled',
    DF: 'draft',
    PL: 'planned',
  };

  const columns = [
    {
      key: 'title',
      label: 'Article Title & Tags',
      sortable: true,
      render: (_, row) => (
        <div className="space-y-1 max-w-sm">
          <div className="font-semibold text-title-color line-clamp-1">{row.title}</div>
          <div className="flex flex-wrap items-center gap-1">
            {row.tags?.map((t) => (
              <span key={t.id} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status, row) => (
        <Badge variant={statusBadgeVariant[status] || 'default'} size="xs">
          {row.status_display}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Visibility',
      render: (isActive, row) => (
        <button
          onClick={() => handleToggleActive(row.id)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-colors ${
            isActive
              ? 'bg-teal-950 text-teal-300 hover:bg-teal-900/60'
              : 'bg-red-950 text-red-300 hover:bg-red-900/60'
          }`}
          title="Click to toggle visibility"
        >
          {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{isActive ? 'Active' : 'Hidden'}</span>
        </button>
      ),
    },
    {
      key: 'publish_date',
      label: 'Publish Date',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-xs text-slate-400 whitespace-nowrap">
          {row.formatted_publish_date || '—'}
        </span>
      ),
    },
    {
      key: 'comments_count',
      label: 'Engagement',
      render: (_, row) => (
        <div className="text-xs font-mono text-slate-400 whitespace-nowrap">
          {row.total_appreciations} likes • {row.comments_count} comments
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'PB' && (
            <Link
              to={`/article/${row.slug}`}
              target="_blank"
              className="p-1.5 text-muted-color hover:text-cyan-400 rounded-md hover:bg-slate-800 transition-colors"
              title="View on site"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          <Link
            to={`/admin/posts/edit/${row.id}`}
            className="p-1.5 text-muted-color hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title="Edit post"
          >
            <Edit2 className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setDeleteModalPost(row)}
            className="p-1.5 text-muted-color hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { id: 'ALL', label: 'All Articles' },
    { id: 'PB', label: 'Published' },
    { id: 'SC', label: 'Scheduled' },
    { id: 'DF', label: 'Drafts' },
    { id: 'PL', label: 'Planned' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-color">
        <div>
          <h1 className="font-heading text-2xl font-bold text-title-color">
            Post Management
          </h1>
          <p className="text-xs text-muted-color">
            Filter, edit, schedule, or manage visibility across all blog articles.
          </p>
        </div>

        <Link to="/admin/posts/new">
          <Button variant="primary" size="md" icon={Plus}>
            New Post
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Tabs tabs={filterTabs} activeTab={currentStatus} onChange={handleStatusChange} />

        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-muted-color absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search titles or tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-900 border border-border-color focus:border-accent-start rounded-lg pl-9 pr-3 py-1.5 text-xs text-title-color placeholder:text-muted-color focus:outline-none transition-colors"
          />
        </form>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
        emptyTitle="No articles found"
        emptyDescription="No articles match the selected status or query."
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalPost}
        onClose={() => setDeleteModalPost(null)}
        title="Confirm Post Deletion"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <p>
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-white font-mono">
              "{deleteModalPost?.title}"
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-color">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalPost(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDeleteConfirm}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
