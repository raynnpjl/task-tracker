import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, projects, users } from "@/../drizzle/schema";

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

export async function POST(request: Request) {
  try {
    const dbUser = await getCurrentDbUser(request);

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const content = body?.content?.trim();
    const projectId = Number(body?.projectId);

    if (!content) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, dbUser.id)));

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [note] = await db
      .insert(notes)
      .values({
        title: content.slice(0, 50),
        content,
        pinned: true,
        projectId,
        userId: dbUser.id,
      })
      .returning();

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}