// src/lib/clinicInfoService.ts
// Reads and writes clinic_info rows for the currently logged-in user.
//
// Architecture (multi-tenant):
//   profiles  ──(owner_id)──►  clinic_info
//
// Each clinic_info row has an owner_id = profiles.id of its Super Admin.
// Staff who are NOT Super Admins (Admin, Doctor, Receptionist, etc.) can
// READ their clinic's row because they share the same owner_id — which is
// resolved by looking up their profile's clinic association.
//
// RLS on clinic_info enforces this at the database level; the frontend
// queries here are the matching JS layer.

import { supabase } from './supabaseClient';
import { ClinicInfo } from '../types';

// ---------------------------------------------------------------------------
// Shape mappers
// ---------------------------------------------------------------------------
function fromRow(row: Record<string, string>): ClinicInfo {
  return {
    name:            row.name             ?? '',
    tagline:         row.tagline          ?? '',
    licenseCode:     row.license_code     ?? '',
    panNumber:       row.pan_number       ?? '',
    address:         row.address          ?? '',
    phone:           row.phone            ?? '',
    email:           row.email            ?? '',
    logoUrl:         row.logo_url         ?? '',
    establishedYear: row.established_year ?? '',
  };
}

function toRow(info: ClinicInfo) {
  return {
    name:             info.name,
    tagline:          info.tagline,
    license_code:     info.licenseCode,
    pan_number:       info.panNumber,
    address:          info.address,
    phone:            info.phone,
    email:            info.email,
    logo_url:         info.logoUrl,
    established_year: info.establishedYear,
  };
}

// ---------------------------------------------------------------------------
// Step 1: Resolve which clinic_info row belongs to the logged-in user.
//
// For a Super Admin: their own profiles.id IS the owner_id.
// For other roles:   they need a clinic_id column on profiles pointing to
//                    the clinic they belong to (future enhancement).
//                    For now we resolve by matching email domain so all
//                    staff at the same clinic share one row.
// ---------------------------------------------------------------------------
async function resolveOwnerIdForCurrentUser(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  // Fetch the current user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, email')
    .eq('email', user.email.toLowerCase())
    .maybeSingle();

  if (!profile) return null;

  // Super Admin: they own the clinic row directly
  if (profile.role === 'Super Admin') return profile.id as string;

  // Non-Super Admin: find the Super Admin in the same email domain
  // (all staff from @familydental.com.np share the clinic owned by
  //  the Super Admin whose email is also @familydental.com.np)
  const domain = profile.email.split('@')[1];
  if (!domain) return null;

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'Super Admin')
    .ilike('email', `%@${domain}`)
    .maybeSingle();

  return (ownerProfile?.id as string) ?? null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the clinic_info row for the currently logged-in user's clinic.
 * Returns null if not found or user is not authenticated.
 */
export async function fetchClinicInfoWithId(): Promise<{ info: ClinicInfo; id: string } | null> {
  const ownerId = await resolveOwnerIdForCurrentUser();
  if (!ownerId) return null;

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
    info: fromRow(data as Record<string, string>),
    id:   data.id as string,
  };
}

/**
 * Save (upsert) the clinic_info row for the current user.
 * RLS will reject the write if the caller is not a Super Admin.
 * Returns true on success, false on failure.
 */
export async function saveClinicInfo(info: ClinicInfo, rowId?: string): Promise<boolean> {
  const ownerId = await resolveOwnerIdForCurrentUser();
  if (!ownerId) return false;

  const payload = {
    ...(rowId ? { id: rowId } : {}),
    ...toRow(info),
    owner_id: ownerId,
  };

  const { error } = await supabase
    .from('clinic_info')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('saveClinicInfo error:', error.message);
    return false;
  }
  return true;
}

/**
 * Create a brand-new clinic_info row for a Super Admin who has none yet.
 * Called automatically after a new Super Admin registers.
 */
export async function createClinicInfoIfMissing(
  ownerId: string,
  defaults: Partial<ClinicInfo> = {}
): Promise<boolean> {
  const { data: existing } = await supabase
    .from('clinic_info')
    .select('id')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (existing) return true; // already exists, nothing to do

  const { error } = await supabase.from('clinic_info').insert({
    owner_id:    ownerId,
    name:        defaults.name        ?? 'My Dental Clinic',
    tagline:     defaults.tagline     ?? '',
    address:     defaults.address     ?? '',
    phone:       defaults.phone       ?? '',
    email:       defaults.email       ?? '',
    logo_url:    defaults.logoUrl     ?? '',
    established_year: defaults.establishedYear ?? '',
  });

  if (error) {
    console.error('createClinicInfoIfMissing error:', error.message);
    return false;
  }
  return true;
}
