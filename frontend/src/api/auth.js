// --- FILE: frontend/src/api/auth.js ---

import { apiClient } from './client';

export const authApi = {
  getCsrfToken: async () => {
    return apiClient('/auth/csrf/');
  },

  signup: async (userData) => {
    return apiClient('/auth/signup/', {
      method: 'POST',
      body: userData,
    });
  },

  verifyOtp: async (otp) => {
    return apiClient('/auth/verify-otp/', {
      method: 'POST',
      body: { otp },
    });
  },

  resendOtp: async () => {
    return apiClient('/auth/resend-otp/', {
      method: 'POST',
    });
  },

  login: async (credentials) => {
    return apiClient('/auth/login/', {
      method: 'POST',
      body: credentials,
    });
  },

  logout: async () => {
    return apiClient('/auth/logout/', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiClient('/auth/me/');
  },

  updateProfile: async (profileData) => {
    return apiClient('/auth/me/', {
      method: 'PATCH',
      body: profileData,
    });
  },
};
