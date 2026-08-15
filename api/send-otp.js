// api/send-otp.js
// Step 1 of passwordless login: verify the email is a registered active user,
// generate a 6-digit OTP, store it, and email it via Gmail.
// Also auto-creates a clinic_info row for new Super Admin registrations.

import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { sendOtpEmail } from '../lib/mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  try {
    const { data: user, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role, is_active, clinic_id')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (findError) throw findError;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'This email address is not registered in our system. Please contact your administrator.',
      });
    }

    // Auto-create clinic_info + link it if this Super Admin has none yet
    if (user.role === 'Super Admin' && !user.clinic_id) {
      const { data: newClinic, error: createError } = await supabaseAdmin
        .from('clinic_info')
        .insert({
          owner_id: user.id,
          name: `${user.name}'s Dental Clinic`,
          email: user.email,
        })
        .select('id')
        .single();

      if (!createError && newClinic) {
        await supabaseAdmin
          .from('profiles')
          .update({ clinic_id: newClinic.id })
          .eq('id', user.id);
      }
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

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
