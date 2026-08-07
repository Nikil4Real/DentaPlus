// api/send-otp.js
// Step 1 of passwordless login: verify the email is a registered, active
// user in Supabase `profiles`, generate a 6-digit OTP, store it with a
// 5-minute expiry, and email it via Gmail.

import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { sendOtpEmail } from '../lib/mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  try {
    // Only rows that already exist (and are active) in `profiles` can
    // request an OTP — this is the access-restriction requirement.
    const { data: user, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (findError) throw findError;

    if (!user) {
      // Generic message on purpose — avoids leaking which emails exist.
      return res.status(404).json({
        success: false,
        error: 'This email address is not registered in our system. Please contact your administrator.',
      });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ otp_code: otpCode, otp_expires_at: expiresAt })
      .eq('id', user.id);

    if (updateError) throw updateError;

    await sendOtpEmail(user.email, user.name, otpCode);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email inbox.',
      expires_in_seconds: 300,
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to send verification code. Please try again shortly.',
    });
  }
}
