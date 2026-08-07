// api/logout.js
import { clearSessionCookie } from '../lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  clearSessionCookie(res);
  return res.status(200).json({ success: true });
}
