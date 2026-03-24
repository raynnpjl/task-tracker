import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { labels, projects, users } from '@/../drizzle/schema';

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

export async function POST(request: Request) {
  try {
    const dbUser = await getCurrentDbUser(request);

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const name = body?.name?.trim();
    const color = body?.color ?? 'blue';
    const projectId = Number(body?.projectId);

    if (!name) {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 });
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const [label] = await db
      .insert(labels)
      .values({
        name,
        color,
        projectId,
        userId: dbUser.id,
      })
      .returning();

    return NextResponse.json({ label }, { status: 201 });
  } catch (error) {
    console.error('POST /api/labels error:', error);
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
  }
}