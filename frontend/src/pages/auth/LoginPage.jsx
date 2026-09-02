// --- FILE: frontend/src/pages/auth/LoginPage.jsx ---

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !password) {
      setFormError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ username: username.trim(), password });
      if (res?.success) {
        addToast(res.message || 'Logged in successfully!', 'success');
        navigate(nextUrl);
      }
    } catch (err) {
      setFormError(err?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-panel p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-1.5">
        <h2 className="font-heading text-2xl font-bold text-title-color">
          Welcome Back
        </h2>
        <p className="text-xs text-muted-color">
          Sign in to access your profile, save bookmarks, and join technical discussions.
        </p>
      </div>

      {formError && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium text-center">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          required
          placeholder="e.g. dev_engineer"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"

        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          icon={LogIn}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-border-color text-center text-xs text-muted-color">
        <span>Don't have an account yet? </span>
        <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1">
          <span>Create an account</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
