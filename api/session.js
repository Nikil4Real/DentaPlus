import { getSessionFromRequest } from '../lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      clinicId: session.clinicId || null,
    },
  });
}
