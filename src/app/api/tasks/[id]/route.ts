import { NextResponse } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks, labels, users } from "@/../drizzle/schema";

async function getCurrentDbUser(request: Request) {
  const firebaseUid =
    request.headers.get("x-firebase-uid") ||
    request.headers.get("x-user-id");

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = Number(id);

    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const body = await request.json();
    const nextTitle = body.title;
    const nextDone = body.done;
    const nextLabelId =
      body.labelId !== undefined ? Number(body.labelId) : undefined;
    const nextPosition =
      body.position !== undefined ? Number(body.position) : undefined;

    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, dbUser.id)));

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (nextLabelId !== undefined) {
      const [targetLabel] = await db
        .select()
        .from(labels)
        .where(
          and(
            eq(labels.id, nextLabelId),
            eq(labels.projectId, existingTask.projectId),
            eq(labels.userId, dbUser.id)
          )
        );

      if (!targetLabel) {
        return NextResponse.json({ error: "Invalid label" }, { status: 400 });
      }
    }

    if (nextLabelId !== undefined && nextPosition !== undefined) {
      await db
        .update(tasks)
        .set({
          position: sql`${tasks.position} + 1`,
        })
        .where(
          and(
            eq(tasks.projectId, existingTask.projectId),
            eq(tasks.labelId, nextLabelId),
            eq(tasks.userId, dbUser.id),
            gte(tasks.position, nextPosition)
          )
        );
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        title: nextTitle ?? existingTask.title,
        done: nextDone ?? existingTask.done,
        labelId: nextLabelId ?? existingTask.labelId,
        position: nextPosition ?? existingTask.position,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, dbUser.id)))
      .returning();

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser(request);

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = Number(id);

    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const [deletedTask] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, dbUser.id)))
      .returning();

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}