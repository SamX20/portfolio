import { NextResponse } from 'next/server';
import { clearAdminSession, createAdminSession, hasAdminPassword, isAdminAuthed, isValidAdminPassword } from '@/lib/adminAuth';

export async function GET() {
  return NextResponse.json({
    authed: await isAdminAuthed(),
    configured: hasAdminPassword(),
  });
}

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!isValidAdminPassword(password || '')) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
