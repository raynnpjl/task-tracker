import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { labels, tasks, projects, users, notes } from "@/../drizzle/schema";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentDbUser(request);

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = Number(id);

    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectLabels = await db
      .select()
      .from(labels)
      .where(and(eq(labels.projectId, projectId), eq(labels.userId, dbUser.id)))
      .orderBy(asc(labels.createdAt));

    const projectTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), eq(tasks.userId, dbUser.id)))
      .orderBy(asc(tasks.position), asc(tasks.createdAt));

    const quickNotes = await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.projectId, projectId),
          eq(notes.userId, dbUser.id),
          eq(notes.pinned, true)
        )
      )
      .orderBy(desc(notes.updatedAt), desc(notes.createdAt));

    return NextResponse.json({
      project,
      labels: projectLabels,
      tasks: projectTasks,
      quickNotes,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/board error:", error);
    return NextResponse.json({ error: "Failed to load board" }, { status: 500 });
  }
}