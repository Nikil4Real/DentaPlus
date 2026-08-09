// src/lib/clinicInfoService.ts
// Fetches and saves clinic_info for the logged-in user.
//
// Multi-tenant model:
//   profiles.clinic_id  ──►  clinic_info.id
//
// Every user (any role) has a clinic_id on their profile pointing to exactly
// one clinic_info row. This is set:
//   - At registration time (api/send-otp.js sets it when Super Admin first logs in)
//   - By the Super Admin adding staff via Settings → Registered Clinic Email Roles
//
// Auth note: this app uses custom JWTs, NOT Supabase Auth sessions.
// supabase.auth.getUser() always returns null here. User identity comes
// from App.tsx state (currentUser.email) set after OTP login.

import { supabase } from './supabaseClient';
import { ClinicInfo } from '../types';

// ---------------------------------------------------------------------------
// Shape mappers
// ---------------------------------------------------------------------------
function fromRow(row: Record<string, unknown>): ClinicInfo {
  return {
    name:            String(row.name             ?? ''),
    tagline:         String(row.tagline          ?? ''),
    licenseCode:     String(row.license_code     ?? ''),
    panNumber:       String(row.pan_number       ?? ''),
    address:         String(row.address          ?? ''),
    phone:           String(row.phone            ?? ''),
    email:           String(row.email            ?? ''),
    logoUrl:         String(row.logo_url         ?? ''),
    establishedYear: String(row.established_year ?? ''),
  };
}

// ---------------------------------------------------------------------------
// Core: fetch the clinic_info row for a given user email.
// Uses profiles.clinic_id — one direct FK, no domain guessing, no role logic.
// ---------------------------------------------------------------------------
async function getClinicIdForUser(userEmail: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('clinic_id')
    .eq('email', userEmail.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('getClinicIdForUser error:', error.message);
    return null;
  }

  return (data?.clinic_id as string) ?? null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the clinic_info row for the currently logged-in user.
 * Pass currentUser.email from App.tsx — this is the only reliable
 * source of user identity since supabase.auth.getUser() returns null.
 */
export async function fetchClinicInfoWithId(
  userEmail: string
): Promise<{ info: ClinicInfo; id: string } | null> {
  const clinicId = await getClinicIdForUser(userEmail);

  if (!clinicId) {
    console.warn('fetchClinicInfoWithId: no clinic_id found for', userEmail);
    return null;
  }

  const { data, error } = await supabase
    .from('clinic_info')
    .select('*')
    .eq('id', clinicId)
    .maybeSingle();

  if (error) {
    console.error('fetchClinicInfoWithId query error:', error.message);
    return null;
  }
  if (!data) return null;

  return {
    info: fromRow(data as Record<string, unknown>),
    id:   data.id as string,
  };
}

/**
 * Save clinic_info via the server-side API route.
 * Writes use the service role key server-side — the anon key can't write.
 * Returns true on success.
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
