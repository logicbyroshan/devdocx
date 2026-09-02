// --- FILE: frontend/src/contexts/AuthContext.jsx ---

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState('');

  // Hydrate session and CSRF on app load
  useEffect(() => {
    async function initAuth() {
      try {
        await authApi.getCsrfToken();
        const response = await authApi.getCurrentUser();
        if (response?.success && response?.user) {
          setUser(response.user);
        }
      } catch (err) {
        // User is unauthenticated - expected on initial public visit
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res?.success && res?.user) {
      setUser(res.user);
    }
    return res;
  };

  const signup = async (userData) => {
    const res = await authApi.signup(userData);
    if (res?.success) {
      setPendingEmail(res.email || userData.email);
    }
    return res;
  };

  const verifyOtp = async (otp) => {
    const res = await authApi.verifyOtp(otp);
    if (res?.success && res?.user) {
      setUser(res.user);
      setPendingEmail('');
    }
    return res;
  };

  const resendOtp = async () => {
    return authApi.resendOtp();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    if (res?.success && res?.user) {
      setUser(res.user);
    }
    return res;
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res?.success && res?.user) {
        setUser(res.user);
      }
    } catch {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isStaff: !!user?.is_staff,
    isSuperuser: !!user?.is_superuser,
    pendingEmail,
    setPendingEmail,
    login,
    signup,
    verifyOtp,
    resendOtp,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
