// api/update-clinic-info.js
// Server-side write for clinic_info. Uses the SERVICE ROLE key so it can
// bypass RLS — safe because this route enforces its own auth check:
// only the session-holder who is a Super Admin can write.

import { getSessionFromRequest } from '../lib/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Verify the custom JWT session cookie
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  // Only Super Admin can update clinic identity
  if (session.role !== 'Super Admin') {
    return res.status(403).json({
      success: false,
      error: 'Only Super Admin can update clinic information.',
    });
  }

  const {
    id,
    name, tagline, licenseCode, panNumber,
    address, phone, email, logoUrl, establishedYear,
  } = req.body ?? {};

  if (!id || !name) {
    return res.status(400).json({ success: false, error: 'Missing required fields: id, name.' });
  }

  const { error } = await supabaseAdmin
    .from('clinic_info')
    .update({
      name,
      tagline:          tagline          ?? '',
      license_code:     licenseCode      ?? '',
      pan_number:       panNumber        ?? '',
      address:          address          ?? '',
      phone:            phone            ?? '',
      email:            email            ?? '',
      logo_url:         logoUrl          ?? '',
      established_year: establishedYear  ?? '',
    })
    .eq('id', id);

  if (error) {
    console.error('update-clinic-info error:', error.message);
    return res.status(500).json({ success: false, error: 'Database update failed.' });
  }

  return res.status(200).json({ success: true });
}
