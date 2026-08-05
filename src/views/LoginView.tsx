export function LoginView() {
}

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import your Supabase client

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate credentials with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Query your live Supabase profiles table for user role & details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("This email is not registered in our database. Please contact your system administrator.");
      }

      console.log('Logged in successfully:', profile);
      // Proceed to dashboard / state update

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    if (profileError || !profile) {
  console.error("Profile Fetch Error Details:", profileError); // Add this log!
  throw new Error("This email is not registered in our database. Please contact your system administrator.");
}
  };

  return (
    // Your existing JSX form markup goes here
    <form onSubmit={handleLogin}>
      {error && <div className="error-message">{error}</div>}
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Enter your email"
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Enter your password"
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Sign In'}
      </button>
    </form>
  );
}