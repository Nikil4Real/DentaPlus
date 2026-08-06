import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LoginOtp({ onLoggedIn }) {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }, // only existing staff can log in
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep('otp');
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onLoggedIn?.(data.session);
  };

  if (step === 'email') {
    return (
      <form onSubmit={sendOtp}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@clinic.com"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send code'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={verifyOtp}>
      <p>Enter the 6-digit code sent to {email}</p>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="123456"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & log in'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}