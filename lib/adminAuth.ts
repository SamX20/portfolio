import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'sam_admin_session';

function getAdminPassword() {
  // NEXT_PUBLIC_ADMIN_PASSWORD is kept only as a legacy fallback; prefer ADMIN_PASSWORD (server-only).
  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
}

function getSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || getAdminPassword();
  // Store a derived token in the cookie, never the raw password.
  return createHmac('sha256', secret).update('sam-admin-session-v1').digest('hex');
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function hasAdminPassword() {
  return Boolean(getAdminPassword());
}

export function isValidAdminPassword(password: string) {
  const expected = getAdminPassword();
  return Boolean(expected) && safeEqual(password, expected);
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthed() {
  if (!hasAdminPassword()) return false;
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return Boolean(value) && safeEqual(value as string, getSessionToken());
}
