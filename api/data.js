// api/data.js
// Universal write endpoint for all clinic data tables.
// Uses the SERVICE ROLE key — bypasses RLS safely because this route
// enforces its own auth check (valid JWT session cookie required).
// clinic_id is always stamped from the session, never trusted from the client.

import { getSessionFromRequest } from '../lib/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ALLOWED_TABLES = new Set([
  'patients', 'doctors', 'appointments', 'dental_xrays',
  'pharmacy_items', 'invoices', 'prescriptions',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Auth — must have a valid JWT session
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  const { action, table, payload } = req.body ?? {};

  // 2. Validate table name (prevent SQL injection via table parameter)
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ success: false, error: `Unknown table: ${table}` });
  }

  // 3. Validate action
  if (!['list', 'insert', 'update', 'delete'].includes(action)) {
    return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
  }

  // 4. Resolve the clinic_id from the session user (never trust client-supplied clinic_id)
  const clinicId = session.clinicId;
  if (!clinicId) {
    return res.status(403).json({ success: false, error: 'No clinic associated with this account.' });
  }

  try {
    if (action === 'list') {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq('clinic_id', clinicId);
      if (error) {
        console.error(`api/data list/${table}:`, error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
      return res.status(200).json({ success: true, data: data || [] });
    }

    let error;

    if (action === 'insert') {
      // Always stamp clinic_id from session — client cannot fake it
      const row = { ...payload, clinic_id: clinicId };
      ({ error } = await supabaseAdmin.from(table).insert(row));

    } else if (action === 'update') {
      const { id, clinic_id: _ignoredClinicId, ...fields } = payload;
      if (!id) return res.status(400).json({ success: false, error: 'Missing id for update.' });
      // .eq('clinic_id', clinicId) ensures a clinic can't update another clinic's row
      ({ error } = await supabaseAdmin.from(table).update(fields).eq('id', id).eq('clinic_id', clinicId));

    } else if (action === 'delete') {
      const { id } = payload;
      if (!id) return res.status(400).json({ success: false, error: 'Missing id for delete.' });
      ({ error } = await supabaseAdmin.from(table).delete().eq('id', id).eq('clinic_id', clinicId));
    }

    if (error) {
      console.error(`api/data ${action}/${table}:`, error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('api/data unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
