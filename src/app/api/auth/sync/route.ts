import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { users } from '@/../drizzle/schema';
import { requireUser } from '@/lib/auth/require-user';

export async function GET(req: Request) {
  try {
    const decoded = await requireUser(req);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decoded.uid))
      .limit(1);

    return NextResponse.json({ user: result[0] ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';

    if (message === 'MISSING_TOKEN') {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = await requireUser(req);

    const body = await req.json().catch(() => ({}));
    const {
      firstName,
      lastName,
      username,
    }: {
      firstName?: string;
      lastName?: string;
      username?: string;
    } = body;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decoded.uid))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          emailVerified: decoded.email_verified ?? false,
        })
        .where(eq(users.firebaseUid, decoded.uid))
        .returning();

      return NextResponse.json({ user: updated[0] });
    }

    const inserted = await db
      .insert(users)
      .values({
        firebaseUid: decoded.uid,
        email: decoded.email ?? '',
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        username: username ?? decoded.email?.split('@')[0] ?? decoded.uid,
        emailVerified: decoded.email_verified ?? false,
      })
      .returning();

    return NextResponse.json({ user: inserted[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'MISSING_TOKEN') {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    console.error('SYNC ERROR:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}