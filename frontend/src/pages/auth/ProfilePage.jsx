// --- FILE: frontend/src/pages/auth/ProfilePage.jsx ---

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Edit,
  MessageSquare,
  Heart,
  FileText,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export function ProfilePage() {
  const { user, isAuthenticated, loading, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login?next=/profile');
    }
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user, isAuthenticated, loading, navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      setSaving(true);
      const res = await updateProfile(formData);
      if (res?.success) {
        addToast(res.message || 'Profile updated successfully!', 'success');
        setIsEditOpen(false);
      }
    } catch (err) {
      if (err?.errors) {
        setErrors(err.errors);
      } else {
        addToast(err?.message || 'Failed to update profile.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-slate-800/60 rounded-xl" />
          <div className="h-24 bg-slate-800/60 rounded-xl" />
          <div className="h-24 bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = user.activity_stats || {};

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="card-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=1e293b&color=22d3ee&size=160`}
            alt={user.username}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-heading text-2xl font-bold text-title-color">
                {user.full_name || user.username}
              </h1>
              {user.is_staff && (
                <Badge variant="success" size="xs">
                  <ShieldCheck className="w-3 h-3" /> Staff Administrator
                </Badge>
              )}
            </div>
            <p className="text-xs text-cyan-400 font-mono">@{user.username}</p>
            <p className="text-xs text-muted-color font-mono flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            onClick={() => setIsEditOpen(true)}
            className="flex-1 sm:flex-initial"
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            className="flex-1 sm:flex-initial"
          >
            Log Out
          </Button>
        </div>
      </div>

      {/* Activity Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-panel p-5 text-center space-y-1">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto mb-2 border border-cyan-800/60">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-title-color">
            {stats.comments_written ?? 0}
          </div>
          <div className="text-xs text-muted-color">Comments Written</div>
        </div>

        <div className="card-panel p-5 text-center space-y-1">
          <div className="w-9 h-9 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center mx-auto mb-2 border border-rose-800/60">
            <Heart className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-title-color">
            {stats.posts_appreciated ?? 0}
          </div>
          <div className="text-xs text-muted-color">Appreciations Given</div>
        </div>

        <div className="card-panel p-5 text-center space-y-1">
          <div className="w-9 h-9 rounded-lg bg-teal-950 text-teal-400 flex items-center justify-center mx-auto mb-2 border border-teal-800/60">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-title-color">
            {stats.posts_published ?? 0}
          </div>
          <div className="text-xs text-muted-color">Published Articles</div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              error={errors.first_name}
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              error={errors.last_name}
            />
          </div>

          <Input
            type="email"
            label="Email Address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-color">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
