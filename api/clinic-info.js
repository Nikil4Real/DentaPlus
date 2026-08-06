import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { getSessionFromRequest } from '../lib/auth.js';

export default async function handler(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }
  const isSuperAdmin = session.role === 'Super Admin';

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('clinic_info')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return res.status(200).json({ success: true, clinicInfo: data || null });
    } catch (err) {
      console.error('clinic-info GET error:', err);
      return res.status(500).json({ success: false, error: 'Failed to load clinic info.' });
    }
  }

  if (req.method === 'POST') {
    if (!isSuperAdmin) {
      return res.status(403).json({ success: false, error: 'Only Super Admin can update clinic info.' });
    }
    try {
      const clinicInfo = req.body?.clinicInfo;
      if (!clinicInfo) {
        return res.status(400).json({ success: false, error: 'Missing clinic info payload.' });
      }

      const { data, error } = await supabaseAdmin
        .from('clinic_info')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const updateData = {
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

      let result;
      if (data) {
        result = await supabaseAdmin
          .from('clinic_info')
          .update(updateData)
          .eq('id', data.id)
          .select()
          .single();
      } else {
        result = await supabaseAdmin
          .from('clinic_info')
          .insert(updateData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      return res.status(200).json({ success: true, clinicInfo: result.data });
    } catch (err) {
      console.error('clinic-info POST error:', err);
      return res.status(500).json({ success: false, error: 'Failed to save clinic info.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
