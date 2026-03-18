import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decoded.uid))
      .limit(1);

    return NextResponse.json({ user: result[0] ?? null });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const body = await req.json();
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
      return NextResponse.json({ user: existing[0] });
    }

    const inserted = await db
      .insert(users)
      .values({
        firebaseUid: decoded.uid,
        email: decoded.email ?? "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        username: username ?? decoded.email?.split("@")[0] ?? decoded.uid,
      })
      .returning();

    return NextResponse.json({ user: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("SYNC ERROR:", error);
    return NextResponse.json({ error: "Unauthorized or invalid request" }, { status: 401 });
  }
}