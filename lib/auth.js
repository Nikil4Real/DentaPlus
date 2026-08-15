// lib/auth.js
// Stateless session handling using signed JWTs in an httpOnly cookie.
//
// WHY NOT PHP $_SESSION?
// Vercel serverless functions don't share a filesystem or memory between
// invocations, so PHP-style file-based sessions never actually persist
// across requests in production. A signed JWT stored in an httpOnly cookie
// solves this without needing a separate session store.

import jwt from 'jsonwebtoken';
import { parseCookie, stringifyCookie } from 'cookie';

const COOKIE_NAME = 'dentaplus_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hour session

export function signSession(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId || null },
    process.env.JWT_SECRET,
    { expiresIn: MAX_AGE_SECONDS }
  );
}

export function setSessionCookie(res, token) {
  const cookieHeader = stringifyCookie({ [COOKIE_NAME]: token }, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  res.setHeader('Set-Cookie', cookieHeader);
}

export function clearSessionCookie(res) {
  const cookieHeader = stringifyCookie({ [COOKIE_NAME]: '' }, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', cookieHeader);
}

export function getSessionFromRequest(req) {
  const cookies = parseCookie(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
