// src/lib/clinicInfoService.ts
// Reads and writes clinic_info rows, scoped to the logged-in user's clinic.
//
// IMPORTANT — auth model:
//   This app uses CUSTOM JWTs (lib/auth.js) stored in an httpOnly cookie,
//   NOT Supabase Auth sessions. This means:
//     - supabase.auth.getUser()  → always returns null (no Supabase session)
//     - auth.uid()               → null in RLS (Supabase doesn't know the user)
//   The user's identity is known only to the server-side API routes (api/me.js).
//   The frontend receives the user object from App.tsx state after login.
//
// Architecture:
//   READS  → frontend uses anon key + .eq('owner_id', resolvedId)
//            RLS allows all selects; the filter enforces isolation in JS.
//   WRITES → go through /api/update-clinic-info (service role key, bypasses RLS)
//            This is the ONLY safe way to write since we have no Supabase session.

import { supabase } from './supabaseClient';
import { ClinicInfo } from '../types';

// ---------------------------------------------------------------------------
// Shape mappers (camelCase ↔ snake_case)
// ---------------------------------------------------------------------------
function fromRow(row: Record<string, unknown>): ClinicInfo {
  return {
    name:            String(row.name            ?? ''),
    tagline:         String(row.tagline         ?? ''),
    licenseCode:     String(row.license_code    ?? ''),
    panNumber:       String(row.pan_number      ?? ''),
    address:         String(row.address         ?? ''),
    phone:           String(row.phone           ?? ''),
    email:           String(row.email           ?? ''),
    logoUrl:         String(row.logo_url        ?? ''),
    establishedYear: String(row.established_year ?? ''),
  };
}

// ---------------------------------------------------------------------------
// Resolve owner_id from the user's email.
//
// For Super Admin: their profiles.id is the owner_id directly.
// For other roles: find the Super Admin in the same email domain.
//
// The userEmail comes from App.tsx state (set after OTP login) — NOT from
// supabase.auth.getUser() which would return null.
// ---------------------------------------------------------------------------
async function resolveOwnerIdFromEmail(userEmail: string): Promise<string | null> {
  const email = userEmail.trim().toLowerCase();

  // First: check if this user IS a Super Admin and has a clinic row directly
  const { data: ownRow } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .maybeSingle();

  if (!ownRow) return null;

  if (ownRow.role === 'Super Admin') {
    // Super Admin owns a clinic row directly — their profile id IS the owner_id
    return ownRow.id as string;
  }

  // Non-Super Admin: find the Super Admin with the same email domain
  // so all staff at familydental.com.np share that clinic's row
  const domain = email.split('@')[1];
  if (!domain) return null;

  const { data: superAdmin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'Super Admin')
    .ilike('email', `%@${domain}`)
    .maybeSingle();

  return superAdmin ? (superAdmin.id as string) : null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the clinic_info row for the given user email.
 * Pass currentUser.email from App.tsx state.
 */
export async function fetchClinicInfoWithId(
  userEmail: string
): Promise<{ info: ClinicInfo; id: string } | null> {
  const ownerId = await resolveOwnerIdFromEmail(userEmail);
  if (!ownerId) {
    console.warn('fetchClinicInfoWithId: could not resolve owner_id for', userEmail);
    return null;
  }

  const { data, error } = await supabase
    .from('clinic_info')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    console.error('fetchClinicInfoWithId error:', error.message);
    return null;
  }
  if (!data) return null;

  return {
    info: fromRow(data as Record<string, unknown>),
    id:   data.id as string,
  };
}

/**
 * Save clinic_info via the server-side API route (which uses the service role
 * key and can write regardless of RLS). Returns true on success.
 */
export async function saveClinicInfo(
  info: ClinicInfo,
  rowId: string
): Promise<boolean> {
  const res = await fetch('/api/update-clinic-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: rowId, ...info }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('saveClinicInfo error:', err);
    return false;
  }
  return true;
}
