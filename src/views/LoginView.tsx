import { useState, FormEvent } from 'react';
import { AuthUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type Step = 'email' | 'otp';

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await fetch('/src/components/LoginOtp.jsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setInfo('Verification code sent! Check your email inbox.');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      onLoginSuccess(data.user as AuthUser);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] text-slate-100 px-4">
      <div className="w-full max-w-sm bg-[#1E293B] border border-[#334155] rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-1">DentaPlus Portal</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          {step === 'email'
            ? 'Sign in with your registered email — no password needed.'
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {info && !error && (
          <div className="mb-4 text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-800 rounded-lg px-3 py-2">
            {info}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@clinic.com"
              required
              autoFocus
              className="w-full rounded-lg bg-[#0F172A] border border-[#334155] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-medium py-2.5 text-sm transition-colors"
            >
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code"
              required
              autoFocus
              className="w-full text-center tracking-[0.5em] rounded-lg bg-[#0F172A] border border-[#334155] px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-medium py-2.5 text-sm transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Sign in'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtpCode('');
                setError('');
                setInfo('');
              }}
              className="w-full text-xs text-slate-400 hover:text-slate-200 py-1"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
