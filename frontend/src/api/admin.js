// --- FILE: frontend/src/api/admin.js ---

import { apiClient } from './client';

export const adminApi = {
  getDashboard: async () => {
    return apiClient('/admin/dashboard/');
  },

  getPosts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/admin/posts/${queryString}`);
  },

  getPost: async (id) => {
    return apiClient(`/admin/posts/${id}/`);
  },

  createPost: async (postData) => {
    return apiClient('/admin/posts/', {
      method: 'POST',
      body: postData,
    });
  },

  updatePost: async (id, postData) => {
    return apiClient(`/admin/posts/${id}/`, {
      method: 'PATCH',
      body: postData,
    });
  },

  deletePost: async (id) => {
    return apiClient(`/admin/posts/${id}/`, {
      method: 'DELETE',
    });
  },

  togglePostActive: async (id) => {
    return apiClient(`/admin/posts/${id}/toggle-active/`, {
      method: 'POST',
    });
  },

  togglePostRecommend: async (id) => {
    return apiClient(`/admin/posts/${id}/toggle-recommend/`, {
      method: 'POST',
    });
  },

  planPost: async (title) => {
    return apiClient('/admin/posts/plan/', {
      method: 'POST',
      body: { title },
    });
  },

  getActivity: async (postId = null) => {
    const query = postId ? `?post_id=${postId}` : '';
    return apiClient(`/admin/activity/${query}`);
  },

  togglePinComment: async (commentId) => {
    return apiClient(`/admin/comments/${commentId}/toggle-pin/`, {
      method: 'POST',
    });
  },

  deleteComment: async (commentId) => {
    return apiClient(`/admin/comments/${commentId}/`, {
      method: 'DELETE',
    });
  },
};
