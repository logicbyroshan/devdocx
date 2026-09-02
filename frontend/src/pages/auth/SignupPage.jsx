// --- FILE: frontend/src/pages/auth/SignupPage.jsx ---

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.password_confirm) {
      setErrors({ password_confirm: 'Passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      const res = await signup(formData);
      if (res?.success) {
        addToast(res.message || 'Verification code sent to your email.', 'info');
        navigate('/verify-otp');
      }
    } catch (err) {
      if (err?.errors) {
        setErrors(err.errors);
      } else {
        addToast(err?.message || 'Registration failed. Please check form errors.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-panel p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-1.5">
        <h2 className="font-heading text-2xl font-bold text-title-color">
          Create Developer Account
        </h2>
        <p className="text-xs text-muted-color">
          Join the developer platform to contribute to discussions and bookmark articles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          id="username"
          label="Username"
          required
          placeholder="e.g. dev_alex"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="first_name"
            label="First Name"
            placeholder="Alex"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
          />
          <Input
            id="last_name"
            label="Last Name"
            placeholder="Dev"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
          />
        </div>

        <Input
          id="email"
          type="email"
          label="Email Address"
          required
          placeholder="alex@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          helpText="A 6-digit verification code will be sent to this email."
        />

        <Input
          id="password"
          type="password"
          label="Password"
          required
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          id="password_confirm"
          type="password"
          label="Confirm Password"
          required
          placeholder="••••••••"
          value={formData.password_confirm}
          onChange={handleChange}
          error={errors.password_confirm}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          icon={UserPlus}
          className="w-full mt-2"
        >
          Create Account & Verify
        </Button>
      </form>

      <div className="pt-4 border-t border-border-color text-center text-xs text-muted-color">
        <span>Already have an account? </span>
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1">
          <span>Sign In</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
