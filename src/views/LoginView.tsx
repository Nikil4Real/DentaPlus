import { useEffect, useState, FormEvent } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type Step = 'email' | 'otp';
type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'dentaplus-login-theme';

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === 'dark';

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await fetch('/api/send-otp', {
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
    <div className={`min-h-screen w-full flex items-center justify-center px-4 transition-colors duration-300 ${isDark ? 'bg-[#0F172A] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="w-full max-w-sm relative">
        <button
          type="button"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`absolute -top-12 right-0 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50'}`}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-slate-600" />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <div className={`border rounded-2xl p-8 shadow-xl transition-colors duration-300 ${isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-200'}`}>
          <h1 className={`text-2xl font-semibold text-center mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>DentaPlus Portal</h1>
          <p className={`text-sm text-center mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {step === 'email'
              ? 'Sign in with your registered email — no password needed.'
              : `Enter the 6-digit code sent to ${email}`}
          </p>

          {error && (
            <div className={`mb-4 text-sm rounded-lg px-3 py-2 ${isDark ? 'text-red-300 bg-red-950/40 border border-red-800' : 'text-red-700 bg-red-50 border border-red-200'}`}>
              {error}
            </div>
          )}
          {info && !error && (
            <div className={`mb-4 text-sm rounded-lg px-3 py-2 ${isDark ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-800' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>
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
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${isDark ? 'bg-[#0F172A] border-[#334155] text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'}`}
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
                className={`w-full text-center tracking-[0.5em] rounded-lg border px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${isDark ? 'bg-[#0F172A] border-[#334155] text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'}`}
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
                className={`w-full text-xs py-1 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
