import { cookies } from 'next/headers';

const COOKIE_NAME = 'sam_admin_session';

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

export function hasAdminPassword() {
  return Boolean(getAdminPassword());
}

export function isValidAdminPassword(password: string) {
  const expected = getAdminPassword();
  return Boolean(expected) && password === expected;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, getSessionSecret(), {
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
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === getSessionSecret();
}
