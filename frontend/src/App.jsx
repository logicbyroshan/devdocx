// --- FILE: frontend/src/App.jsx ---

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public & Blog Pages
import { HomePage } from './pages/blog/HomePage';
import { ArticlesPage } from './pages/blog/ArticlesPage';
import { ArticleDetailPage } from './pages/blog/ArticleDetailPage';
import { AboutPage } from './pages/blog/AboutPage';

// Documentation Pages
import { DocsLayout } from './pages/docs/DocsLayout';
import { DocsIndexPage } from './pages/docs/DocsIndexPage';
import { DocDetailPage } from './pages/docs/DocDetailPage';

// Admin Pages
import { DashboardPage } from './pages/admin/DashboardPage';
import { PostsListPage } from './pages/admin/PostsListPage';
import { PostEditorPage } from './pages/admin/PostEditorPage';
import { ActivityPage } from './pages/admin/ActivityPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OtpVerificationPage } from './pages/auth/OtpVerificationPage';
import { ProfilePage } from './pages/auth/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website & Documentation */}
              <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="article/:slug" element={<ArticleDetailPage />} />
                <Route path="about" element={<AboutPage />} />

                {/* Technical Documentation Nested Routes */}
                <Route path="docs" element={<DocsLayout />}>
                  <Route index element={<DocsIndexPage />} />
                  <Route path=":slug" element={<DocDetailPage />} />
                </Route>

                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Authentication Routes */}
              <Route element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="verify-otp" element={<OtpVerificationPage />} />
              </Route>

              {/* Admin Control Panel Routes */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="posts" element={<PostsListPage />} />
                <Route path="posts/new" element={<PostEditorPage />} />
                <Route path="posts/edit/:id" element={<PostEditorPage />} />
                <Route path="activity" element={<ActivityPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
