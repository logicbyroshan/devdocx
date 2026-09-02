// --- FILE: frontend/src/api/blog.js ---

import { apiClient } from './client';

export const blogApi = {
  getHome: async () => {
    return apiClient('/blog/home/');
  },

  getPosts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/blog/posts/${queryString}`);
  },

  getPostDetail: async (slug) => {
    return apiClient(`/blog/posts/${slug}/`);
  },

  toggleAppreciation: async (slug) => {
    return apiClient(`/blog/posts/${slug}/appreciate/`, {
      method: 'POST',
    });
  },

  addComment: async (slug, body) => {
    return apiClient(`/blog/posts/${slug}/comments/`, {
      method: 'POST',
      body: { body },
    });
  },

  getCategories: async () => {
    return apiClient('/blog/categories/');
  },

  subscribeNewsletter: async (email) => {
    return apiClient('/blog/subscribe/', {
      method: 'POST',
      body: { email },
    });
  },

  getAboutAuthor: async () => {
    return apiClient('/blog/about/');
  },
};
