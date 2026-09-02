// --- FILE: frontend/src/pages/admin/ActivityPage.jsx ---

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  Mail,
  Heart,
  Pin,
  Trash2,
  Filter,
} from 'lucide-react';

import { adminApi } from '../../api/admin';
import { useToast } from '../../contexts/ToastContext';
import { DataTable } from '../../components/tables/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Pagination';

export function ActivityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'users' | 'subscribers'
  const [selectedPostId, setSelectedPostId] = useState('');

  // Delete comment modal state
  const [deleteModalComment, setDeleteModalComment] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);

  const { addToast } = useToast();

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getActivity(selectedPostId || null);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      addToast(err?.message || 'Failed to fetch activity metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [selectedPostId]);

  const handleTogglePin = async (commentId) => {
    try {
      const res = await adminApi.togglePinComment(commentId);
      if (res?.success) {
        addToast(res.message, 'success');
        fetchActivity();
      }
    } catch (err) {
      addToast(err?.message || 'Failed to toggle pin state.', 'error');
    }
  };

  const handleDeleteCommentConfirm = async () => {
    if (!deleteModalComment) return;
    try {
      setDeletingComment(true);
      const res = await adminApi.deleteComment(deleteModalComment.id);
      if (res?.success) {
        addToast(res.message, 'success');
        setDeleteModalComment(null);
        fetchActivity();
      }
    } catch (err) {
      addToast(err?.message || 'Failed to delete comment.', 'error');
    } finally {
      setDeletingComment(false);
    }
  };

  const { stats, comments = [], registered_users = [], subscribers = [], posts_with_comments = [] } = data || {};

  const commentColumns = [
    {
      key: 'author_name',
      label: 'Author & Date',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={row.author_avatar || `https://ui-avatars.com/api/?name=${row.author_username}&background=1e293b&color=22d3ee`}
            alt={row.author_username}
            className="w-7 h-7 rounded-md object-cover"
          />
          <div>
            <div className="font-semibold text-title-color text-xs">{row.author_name || row.author_username}</div>
            <div className="text-[10px] text-muted-color font-mono">{row.formatted_date}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'post_title',
      label: 'Article Reference',
      render: (postTitle) => (
        <span className="text-xs font-medium text-slate-300 line-clamp-1 max-w-xs">{postTitle}</span>
      ),
    },
    {
      key: 'body',
      label: 'Comment Content',
      render: (body, row) => (
        <div className="space-y-1">
          <p className="text-xs text-slate-300 line-clamp-2 max-w-md">{body}</p>
          {row.is_pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-mono">
              <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Moderation',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleTogglePin(row.id)}
            className={`px-2.5 py-1 text-xs rounded-md border font-mono flex items-center gap-1 transition-colors ${
              row.is_pinned
                ? 'bg-teal-950 text-teal-300 border-teal-800/60'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle pin status"
          >
            <Pin className="w-3 h-3" />
            <span>{row.is_pinned ? 'Pinned' : 'Pin'}</span>
          </button>

          <button
            onClick={() => setDeleteModalComment(row)}
            className="p-1.5 text-muted-color hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
            title="Delete comment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const userColumns = [
    {
      key: 'username',
      label: 'Username / Full Name',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-title-color text-xs">{row.username}</div>
          <div className="text-[11px] text-muted-color">{row.full_name}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      render: (email) => <span className="font-mono text-xs text-slate-300">{email}</span>,
    },
    {
      key: 'is_staff',
      label: 'Role',
      render: (isStaff) => (
        <Badge variant={isStaff ? 'success' : 'default'} size="xs">
          {isStaff ? 'Staff Admin' : 'Community Member'}
        </Badge>
      ),
    },
    {
      key: 'formatted_date_joined',
      label: 'Joined Date',
      render: (date) => <span className="font-mono text-xs text-muted-color">{date}</span>,
    },
  ];

  const subscriberColumns = [
    {
      key: 'email',
      label: 'Subscriber Email',
      render: (email) => <span className="font-mono text-xs text-title-color">{email}</span>,
    },
    {
      key: 'formatted_date',
      label: 'Subscribed Date',
      render: (date) => <span className="font-mono text-xs text-muted-color">{date}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <Badge variant="published" size="xs">
          Active Subscriber
        </Badge>
      ),
    },
  ];

  const activityTabs = [
    { id: 'comments', label: 'Comments Moderation', count: comments.length },
    { id: 'users', label: 'Registered Users', count: registered_users.length },
    { id: 'subscribers', label: 'Newsletter Subscribers', count: subscribers.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-border-color">
        <h1 className="font-heading text-2xl font-bold text-title-color">
          Community Activity & Moderation
        </h1>
        <p className="text-xs text-muted-color">
          Review discussions, manage user accounts, and track newsletter subscriptions.
        </p>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-title-color">{stats.total_appreciations}</div>
              <div className="text-[11px] text-muted-color">Total Likes</div>
            </div>
          </div>

          <div className="card-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-title-color">{stats.total_comments}</div>
              <div className="text-[11px] text-muted-color">Total Comments</div>
            </div>
          </div>

          <div className="card-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-title-color">{stats.registered_users_count}</div>
              <div className="text-[11px] text-muted-color">Registered Users</div>
            </div>
          </div>

          <div className="card-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-title-color">{stats.subscribers_count}</div>
              <div className="text-[11px] text-muted-color">Subscribers</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs tabs={activityTabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'comments' && posts_with_comments.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-color" />
            <select
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="bg-slate-900 border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Articles</option>
              {posts_with_comments.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Data Views */}
      {activeTab === 'comments' && (
        <DataTable
          columns={commentColumns}
          data={comments}
          loading={loading}
          emptyTitle="No comments found"
          emptyDescription="There are no comments matching the filter."
        />
      )}

      {activeTab === 'users' && (
        <DataTable
          columns={userColumns}
          data={registered_users}
          loading={loading}
          emptyTitle="No registered users"
        />
      )}

      {activeTab === 'subscribers' && (
        <DataTable
          columns={subscriberColumns}
          data={subscribers}
          loading={loading}
          emptyTitle="No subscribers yet"
        />
      )}

      {/* Delete Comment Modal */}
      <Modal
        isOpen={!!deleteModalComment}
        onClose={() => setDeleteModalComment(null)}
        title="Confirm Comment Deletion"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <p>
            Are you sure you want to delete this comment by{' '}
            <span className="font-semibold text-white">
              {deleteModalComment?.author_username}
            </span>
            ?
          </p>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs italic text-slate-400">
            "{deleteModalComment?.body}"
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-color">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalComment(null)}
              disabled={deletingComment}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deletingComment}
              onClick={handleDeleteCommentConfirm}
            >
              Delete Comment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
