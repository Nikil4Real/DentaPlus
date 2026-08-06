// api/me.js
// Lets the frontend check "am I still logged in?" on page load/refresh,
// since the session now lives in a JWT cookie instead of PHP $_SESSION.

import { getSessionFromRequest } from '../lib/auth.js';

export default function handler(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }
  return res.status(200).json({ success: true, user: session });
}
