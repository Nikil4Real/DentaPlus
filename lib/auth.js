// Stateless session handling using signed JWTs in an httpOnly browser-session cookie.
//
// The cookie intentionally has no Max-Age/Expires attribute, so normal browser
// session semantics keep users logged in through refreshes but remove the cookie
// when the browser session is closed. The JWT lifetime is longer than the cookie
// lifetime so a refresh does not force a re-login while the browser remains open.

import jwt from 'jsonwebtoken';
import { parseCookie, stringifyCookie } from 'cookie';

const COOKIE_NAME = 'dentaplus_session';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days; the session cookie normally ends first

export function signSession(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId || null },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL_SECONDS }
  );
}

export function setSessionCookie(res, token) {
  const cookieHeader = stringifyCookie({ [COOKIE_NAME]: token }, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    path: '/',
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
