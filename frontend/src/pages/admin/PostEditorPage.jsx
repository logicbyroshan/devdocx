// --- FILE: frontend/src/pages/admin/PostEditorPage.jsx ---

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Send,
  Clock,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  Calendar,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { useToast } from '../../contexts/ToastContext';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { MarkdownContent } from '../../components/content/MarkdownContent';
import { Badge } from '../../components/ui/Badge';

export function PostEditorPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('DF');

  // Load existing post if editing
  useEffect(() => {
    if (isEditing) {
      async function loadPost() {
        try {
          setLoading(true);
          const res = await adminApi.getPost(id);
          if (res?.success && res?.post) {
            const p = res.post;
            setTitle(p.title || '');
            setSubtitle(p.subtitle || '');
            setSlug(p.slug || '');
            setMetaDescription(p.meta_description || '');
            setTags(p.tags_string || '');
            setContent(p.content || '');
            setCurrentStatus(p.status || 'DF');
            if (p.publish_date) {
              setScheduleDate(new Date(p.publish_date).toISOString().slice(0, 16));
            }
            if (p.thumbnail_url) {
              setThumbnailPreview(p.thumbnail_url);
            }
          }
        } catch (err) {
          addToast(err?.message || 'Failed to load post for editing.', 'error');
        } finally {
          setLoading(false);
        }
      }
      loadPost();
    }
  }, [id, isEditing]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (actionType = 'draft') => {
    if (!title.trim()) {
      addToast('Post title is required.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subtitle', subtitle.trim());
      formData.append('content', content);
      formData.append('meta_description', metaDescription.trim());
      formData.append('tags', tags);
      formData.append('action', actionType);

      if (actionType === 'schedule' && scheduleDate) {
        formData.append('schedule_date', scheduleDate);
      }

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      let res;
      if (isEditing) {
        res = await adminApi.updatePost(id, formData);
      } else {
        res = await adminApi.createPost(formData);
      }

      if (res?.success) {
        addToast(res.message || 'Post saved successfully!', 'success');
        navigate('/admin/posts');
      }
    } catch (err) {
      addToast(err?.message || 'Failed to save post.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-1/3 bg-slate-800 rounded" />
        <div className="h-12 w-full bg-slate-800/60 rounded-xl" />
        <div className="h-64 w-full bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-color">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/posts"
            className="p-1.5 rounded-lg text-muted-color hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-title-color">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-xs text-muted-color font-mono">
              {isEditing ? `Editing Post #${id} (${slug})` : 'Drafting a new technical write-up'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            icon={Save}
            onClick={() => handleSave('draft')}
          >
            Save Draft
          </Button>

          <Button
            variant="outline"
            size="sm"
            loading={saving}
            icon={Clock}
            onClick={() => handleSave('schedule')}
          >
            Schedule
          </Button>

          <Button
            variant="primary"
            size="sm"
            loading={saving}
            icon={Send}
            onClick={() => handleSave('publish')}
          >
            Publish Now
          </Button>
        </div>
      </div>

      {/* Main Grid: Form Left, Metadata Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            label="Article Title"
            required
            placeholder="e.g. Architecting Distributed Systems with Django & React"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Subtitle / Headline"
            placeholder="A deep dive into clean architectures, REST API contracts, and state synchronization..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          {/* Write / Preview Tab switcher */}
          <div className="card-panel p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-border-color">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'write'
                      ? 'bg-slate-800 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Markdown Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-slate-800 text-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>
              <span className="text-[10px] font-mono text-muted-color">Supports Mermaid & Code</span>
            </div>

            {activeTab === 'write' ? (
              <textarea
                rows={16}
                placeholder="Write your article in Markdown. You can include:&#10;&#10;```python&#10;def example():&#10;    return 'code highlighted!'&#10;```&#10;&#10;```mermaid&#10;graph TD&#10;    A[React] --> B[Django]&#10;```&#10;&#10;:::note&#10;Important note block!&#10;:::"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 p-4 text-sm font-mono text-slate-200 focus:outline-none placeholder:text-slate-700 leading-relaxed resize-y"
              />
            ) : (
              <div className="p-6 bg-slate-950/60 min-h-[360px] overflow-y-auto">
                {content ? (
                  <MarkdownContent content={content} />
                ) : (
                  <div className="text-xs text-muted-color text-center py-12 font-mono">
                    Nothing to preview yet. Start typing in the Markdown Editor.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Metadata & Thumbnail */}
        <div className="space-y-4">
          {/* Metadata Card */}
          <div className="card-panel space-y-4 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Article Configuration
            </h3>

            <Input
              label="Tags (Comma Separated)"
              placeholder="Django, React, Systems, Architecture"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              helpText="Separate each category tag with a comma."
            />

            <Textarea
              label="SEO Meta Description"
              rows={3}
              placeholder="Short description for search engines and social cards..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              helpText="Max 160 characters recommended."
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Schedule Release Date</span>
              </label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-slate-900 border border-border-color focus:border-accent-start rounded-lg px-3 py-2 text-xs text-title-color focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Thumbnail Upload Card */}
          <div className="card-panel space-y-3 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cover Thumbnail</span>
            </h3>

            {thumbnailPreview ? (
              <div className="space-y-2">
                <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                  }}
                  className="text-[11px] text-red-400 hover:text-red-300 font-mono"
                >
                  Remove Cover Image
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-border-color hover:border-cyan-500/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40">
                <ImageIcon className="w-8 h-8 text-muted-color mb-2" />
                <span className="text-xs text-slate-300 font-medium">Click to upload cover image</span>
                <span className="text-[10px] text-muted-color mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
