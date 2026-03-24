import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { labels, users } from '@/../drizzle/schema';

async function getCurrentDbUser(request: Request) {
  const firebaseUid =
    request.headers.get('x-firebase-uid') ||
    request.headers.get('x-user-id');

  if (!firebaseUid) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.firebaseUid, firebaseUid));

  return dbUser ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser(request);

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const labelId = Number(id);

    if (Number.isNaN(labelId)) {
      return NextResponse.json({ error: 'Invalid label id' }, { status: 400 });
    }

    const body = await request.json();
    const name = body?.name?.trim();
    const color = body?.color;

    if (!name) {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    const [updatedLabel] = await db
      .update(labels)
      .set({
        name,
        color,
      })
      .where(and(eq(labels.id, labelId), eq(labels.userId, dbUser.id)))
      .returning();

    if (!updatedLabel) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    return NextResponse.json({ label: updatedLabel });
  } catch (error) {
    console.error('PATCH /api/labels/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser(request);

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const labelId = Number(id);

    if (Number.isNaN(labelId)) {
      return NextResponse.json({ error: 'Invalid label id' }, { status: 400 });
    }

    const [deletedLabel] = await db
      .delete(labels)
      .where(and(eq(labels.id, labelId), eq(labels.userId, dbUser.id)))
      .returning();

    if (!deletedLabel) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/labels/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
  }
}