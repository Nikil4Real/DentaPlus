import { ClinicInfo } from '../types';

interface ClinicInfoResponse {
  success: boolean;
  clinicInfo?: ClinicInfo;
  error?: string;
}

export async function fetchClinicInfo(): Promise<ClinicInfo | null> {
  const res = await fetch('/api/clinic-info');
  const data = (await res.json()) as ClinicInfoResponse;
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to load clinic info from server.');
  }
  return data.clinicInfo || null;
}

export async function saveClinicInfo(clinicInfo: ClinicInfo): Promise<ClinicInfo> {
  const res = await fetch('/api/clinic-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clinicInfo }),
  });
  const data = (await res.json()) as ClinicInfoResponse;
  if (!res.ok || !data.success || !data.clinicInfo) {
    throw new Error(data.error || 'Failed to save clinic info.');
  }
  return data.clinicInfo;
}
