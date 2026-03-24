import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tasks, labels, projects, users } from '@/../drizzle/schema';

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
    const title = body?.title?.trim();
    const projectId = Number(body?.projectId);
    const labelId = Number(body?.labelId);

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    if (Number.isNaN(projectId) || Number.isNaN(labelId)) {
      return NextResponse.json(
        { error: 'Invalid projectId or labelId' },
        { status: 400 }
      );
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const [label] = await db
      .select()
      .from(labels)
      .where(
        and(
          eq(labels.id, labelId),
          eq(labels.projectId, projectId),
          eq(labels.userId, dbUser.id)
        )
      );

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    const lastTask = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          eq(tasks.labelId, labelId),
          eq(tasks.userId, dbUser.id)
        )
      )
      .orderBy(desc(tasks.position))
      .limit(1);

    const nextPosition = lastTask[0] ? lastTask[0].position + 1 : 0;

    const [task] = await db
      .insert(tasks)
      .values({
        title,
        projectId,
        labelId,
        userId: dbUser.id,
        position: nextPosition,
      })
      .returning();

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}