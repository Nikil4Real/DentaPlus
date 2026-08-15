import React, { useEffect, useRef, useState } from 'react';
import {
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { AuthUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

interface OtpResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user?: AuthUser;
}

const INITIAL_DIGITS = ['', '', '', '', '', ''];

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [otpDigits, setOtpDigits] = useState<string[]>(INITIAL_DIGITS);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== 2 || timerSeconds <= 0) return undefined;
    const interval = window.setInterval(() => {
      setTimerSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [step, timerSeconds]);

  useEffect(() => {
    if (step === 2 && timerSeconds === 0) {
      setErrorMessage('Verification code has expired. Please request a new code.');
    }
  }, [step, timerSeconds]);

  const resetOtpState = () => {
    setOtpDigits([...INITIAL_DIGITS]);
    setTimerSeconds(300);
    setErrorMessage('');
    window.setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const requestOtp = async () => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail || !/^\S+@\S+\.\S+$/.test(cleanedEmail)) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setEmail(cleanedEmail);
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanedEmail }),
      });
      const data = (await response.json().catch(() => ({}))) as OtpResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code.');
      }
      setStep(2);
      resetOtpState();
      setSuccessNotice(data.message || 'Verification code sent. Check your email inbox.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    await requestOtp();
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }
    if (timerSeconds <= 0) {
      setErrorMessage('Verification code has expired. Please request a new code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp_code: otpCode }),
      });
      const data = (await response.json().catch(() => ({}))) as OtpResponse;
      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }
      onLoginSuccess(data.user);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const nextDigits = [...otpDigits];
    nextDigits[index] = value.slice(-1);
    setOtpDigits(nextDigits);
    setErrorMessage('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const nextDigits = [...INITIAL_DIGITS];
    pasted.split('').forEach((digit, index) => { nextDigits[index] = digit; });
    setOtpDigits(nextDigits);
    if (pasted.length === 6) inputRefs.current[5]?.focus();
  };

  const changeEmail = () => {
    setStep(1);
    setOtpDigits([...INITIAL_DIGITS]);
    setErrorMessage('');
    setSuccessNotice('');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.25),rgba(255,255,255,0))] pointer-events-none" />

      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">Sign In to Dashboard</h3>
              <p className="text-xs text-slate-400 mt-0.5">Role-Integrated Passwordless Login</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setErrorMessage(''); }}
                    placeholder="e.g. admin@familydental.com.np"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/50 transition flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin text-purple-200" /> Sending Code...</span>
                ) : (
                  <><span>Send Verification Code</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Verification Code Sent To:</div>
                  <div className="font-bold text-purple-200 truncate max-w-[200px]">{email}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Clinic workspace will load after verification</div>
                </div>
                <button type="button" onClick={changeEmail} className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-semibold">
                  <ArrowLeft className="w-3 h-3" /> Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">Enter 6-Digit Verification Code</label>
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => { inputRefs.current[index] = element; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleDigitChange(index, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={handlePaste}
                      className="w-10 h-12 sm:w-12 sm:h-12 text-center text-lg font-mono font-bold rounded-xl bg-slate-950 border border-slate-800 text-purple-300 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/40 transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Code expires in:</span>
                  <span className={`font-mono font-bold ${timerSeconds < 60 ? 'text-rose-400' : 'text-purple-300'}`}>{formatTime(timerSeconds)}</span>
                </div>
                <button type="button" disabled={timerSeconds > 240 || isLoading} onClick={requestOtp} className="text-purple-400 hover:underline font-semibold disabled:opacity-40 disabled:no-underline text-[11px]">Resend Code</button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length < 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/50 transition flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin text-purple-200" /> Verifying Code...</span>
                ) : (
                  <><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Verify Code &amp; Sign In</span></>
                )}
              </button>
            </form>
          )}

          <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 mt-6">Secured &amp; Managed by DentaPlus. All data encrypted.</div>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 text-center text-[11px] text-slate-500 border-t border-slate-800/60">© 2026 DentaPlus. All Rights Reserved.</footer>
    </div>
  );
}
