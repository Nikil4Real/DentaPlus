// src/lib/clinicInfoService.ts
// All reads and writes for the clinic_info Supabase table go here.
// The frontend uses the anon key — RLS on clinic_info enforces that only
// users whose profiles.role = 'Super Admin' can write.

import { supabase } from './supabaseClient';
import { ClinicInfo } from '../types';

// Map between the frontend ClinicInfo shape (camelCase) and Supabase column names (snake_case)
function fromRow(row: Record<string, string>): ClinicInfo {
  return {
    name:            row.name            ?? '',
    tagline:         row.tagline         ?? '',
    licenseCode:     row.license_code    ?? '',
    panNumber:       row.pan_number      ?? '',
    address:         row.address         ?? '',
    phone:           row.phone           ?? '',
    email:           row.email           ?? '',
    logoUrl:         row.logo_url        ?? '',
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

/** Fetch the single clinic_info row. Returns null if nothing is in the table yet. */
export async function fetchClinicInfo(): Promise<ClinicInfo | null> {
  const { data, error } = await supabase
    .from('clinic_info')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('fetchClinicInfo error:', error.message);
    return null;
  }
  if (!data) return null;
  return fromRow(data as Record<string, string>);
}

/**
 * Save (upsert) the clinic_info row.
 * RLS on the table will reject this silently if the caller is not Super Admin.
 * Returns true on success, false on failure.
 */
export async function saveClinicInfo(info: ClinicInfo, rowId?: string): Promise<boolean> {
  const payload = rowId
    ? { id: rowId, ...toRow(info) }
    : toRow(info);

  const { error } = await supabase
    .from('clinic_info')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('saveClinicInfo error:', error.message);
    return false;
  }
  return true;
}

/** Fetch both the clinic info and its row id (needed for upsert). */
export async function fetchClinicInfoWithId(): Promise<{ info: ClinicInfo; id: string } | null> {
  const { data, error } = await supabase
    .from('clinic_info')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    info: fromRow(data as Record<string, string>),
    id:   data.id as string,
  };
}
