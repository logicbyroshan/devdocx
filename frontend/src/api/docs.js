// --- FILE: frontend/src/api/docs.js ---

import { apiClient } from './client';

export const docsApi = {
  getDocsList: async () => {
    return apiClient('/blog/docs/');
  },

  getDocDetail: async (slug) => {
    return apiClient(`/blog/docs/${slug}/`);
  },
};
