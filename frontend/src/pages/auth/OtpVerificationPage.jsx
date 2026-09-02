// --- FILE: frontend/src/pages/auth/OtpVerificationPage.jsx ---

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function OtpVerificationPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState('');

  const { verifyOtp, resendOtp, pendingEmail } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(otp.trim());
      if (res?.success) {
        addToast(res.message || 'Account verified successfully!', 'success');
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      setResending(true);
      setError('');
      const res = await resendOtp();
      if (res?.success) {
        addToast(res.message || 'New verification code sent!', 'success');
        setCooldown(60);
      }
    } catch (err) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card-panel p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center mx-auto text-cyan-400">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-title-color">
          Verify Email Address
        </h2>
        <p className="text-xs text-muted-color max-w-xs mx-auto leading-relaxed">
          Enter the 6-digit verification code sent to{' '}
          <span className="font-mono text-cyan-300 font-medium">
            {pendingEmail || 'your email'}
          </span>
          .
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5 text-center">
          <input
            type="text"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold bg-slate-900 border border-border-color focus:border-cyan-400 rounded-xl py-3 text-white focus:outline-none placeholder:text-slate-700 transition-colors"
            required
            autoFocus
          />
          <p className="text-[11px] text-muted-color">
            This code will expire in 10 minutes. Max 5 attempts.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          icon={ShieldCheck}
          className="w-full"
        >
          Verify & Complete Registration
        </Button>
      </form>

      {/* Resend Section */}
      <div className="pt-4 border-t border-border-color flex items-center justify-between text-xs text-muted-color">
        <span>Didn't receive the code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed font-semibold inline-flex items-center gap-1 font-mono transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
        </button>
      </div>
    </div>
  );
}
