// api/verify-otp.js
// Step 2 of passwordless login: check the submitted OTP against Supabase
// `profiles`, enforce the 5-minute expiry, clear it once used, and issue a
// signed session cookie (JWT).

import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { signSession, setSessionCookie } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const otpCode = String(req.body?.otp_code || '').trim();

  if (!email || !otpCode) {
    return res.status(400).json({
      success: false,
      error: 'Please enter both your email address and 6-digit verification code.',
    });
  }

  try {
    const { data: user, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, otp_code, otp_expires_at')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (findError) throw findError;

    const now = new Date();
    const expiresAt = user?.otp_expires_at ? new Date(user.otp_expires_at) : null;

    const isValid =
      user &&
      user.otp_code &&
      user.otp_code === otpCode &&
      expiresAt &&
      now <= expiresAt;

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired verification code.' });
    }

    // Clear the used OTP so it can't be replayed.
    const { error: clearError } = await supabaseAdmin
      .from('profiles')
      .update({ otp_code: null, otp_expires_at: null })
      .eq('id', user.id);

    if (clearError) throw clearError;

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'Admin',
    };

    const token = signSession(sessionUser);
    setSessionCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Verification successful.',
      user: sessionUser,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, error: 'An internal server error occurred.' });
  }
}
