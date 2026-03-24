import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, users } from "@/../drizzle/schema";

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
    const noteId = Number(id);

    if (Number.isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note id" }, { status: 400 });
    }

    const body = await request.json();
    const content = body?.content?.trim();

    if (!content) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const [updatedNote] = await db
      .update(notes)
      .set({
        title: content.slice(0, 50),
        content,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, dbUser.id)))
      .returning();

    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
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
    const noteId = Number(id);

    if (Number.isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note id" }, { status: 400 });
    }

    const [deletedNote] = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, dbUser.id)))
      .returning();

    if (!deletedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}