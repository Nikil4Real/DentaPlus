import { getSessionFromRequest } from '../lib/auth.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

function toClinicInfoRow(clinicInfo) {
  return {
    name: clinicInfo.name,
    tagline: clinicInfo.tagline,
    license_code: clinicInfo.licenseCode,
    pan_number: clinicInfo.panNumber,
    address: clinicInfo.address,
    phone: clinicInfo.phone,
    email: clinicInfo.email,
    logo_url: clinicInfo.logoUrl,
    established_year: clinicInfo.establishedYear,
  };
}

function fromClinicInfoRow(row) {
  return {
    name: row.name || '',
    tagline: row.tagline || '',
    licenseCode: row.license_code || '',
    panNumber: row.pan_number || '',
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    logoUrl: row.logo_url || '',
    establishedYear: row.established_year || '',
  };
}

export default async function handler(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  const clinicId = session.clinicId;
  if (!clinicId) {
    return res.status(403).json({ success: false, error: 'No clinic associated with this account.' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('clinic_info')
      .select('*')
      .eq('id', clinicId)
      .maybeSingle();

    if (error) {
      console.error('clinic-info GET error:', error);
      return res.status(500).json({ success: false, error: 'Failed to load clinic info.' });
    }

    return res.status(200).json({
      success: true,
      clinicId,
      clinicInfo: data ? fromClinicInfoRow(data) : null,
    });
  }

  if (req.method === 'POST') {
    if (session.role !== 'Super Admin') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can update clinic info.' });
    }

    const clinicInfo = req.body?.clinicInfo;
    if (!clinicInfo || !clinicInfo.name) {
      return res.status(400).json({ success: false, error: 'Missing clinic info payload.' });
    }

    const { data, error } = await supabaseAdmin
      .from('clinic_info')
      .update(toClinicInfoRow(clinicInfo))
      .eq('id', clinicId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('clinic-info POST error:', error);
      return res.status(500).json({ success: false, error: 'Failed to save clinic info.' });
    }
    if (!data) {
      return res.status(404).json({ success: false, error: 'Clinic record not found.' });
    }

    return res.status(200).json({ success: true, clinicInfo: fromClinicInfoRow(data) });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
