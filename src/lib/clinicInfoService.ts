import { ClinicInfo } from '../types';

interface ClinicInfoResponse {
  success: boolean;
  clinicInfo?: ClinicInfo | null;
  error?: string;
}

export async function fetchClinicInfoWithId(
  _userEmail: string,
): Promise<{ info: ClinicInfo; id: string } | null> {
  const res = await fetch('/api/clinic-info');
  const data = (await res.json().catch(() => ({}))) as ClinicInfoResponse & { clinicId?: string };
  if (!res.ok || !data.success || !data.clinicInfo) {
    if (res.status !== 404) console.error('fetchClinicInfoWithId error:', data.error);
    return null;
  }

  // App already receives the authoritative clinicId in the signed OTP session.
  // The API response intentionally returns only clinic data, so use the row id
  // from the authenticated user object at the call site when saving.
  return { info: data.clinicInfo, id: data.clinicId || '' };
}

export async function saveClinicInfo(
  info: ClinicInfo,
  _rowId: string,
): Promise<boolean> {
  const res = await fetch('/api/clinic-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinicInfo: info }),
  });
  const data = (await res.json().catch(() => ({}))) as ClinicInfoResponse;
  if (!res.ok || !data.success) {
    console.error('saveClinicInfo error:', data.error);
    return false;
  }
  return true;
}
