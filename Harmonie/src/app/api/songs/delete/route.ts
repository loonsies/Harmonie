import { auth } from "@/auth";
import { db, songs } from "@/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { songId } = await request.json();

  // Get the song details first to get the filename
  const result = await db
    .select()
    .from(songs)
    .where(and(eq(songs.id, songId), eq(songs.author, session.user.id)));

  const song = result[0];

  if (!song) {
    return new NextResponse("Song not found", { status: 404 });
  }

  try {
    // Delete the physical file
    const filePath = path.join(process.cwd(), "public", "midi", song.download);
    await unlink(filePath);

    // Delete song from database
    await db
      .delete(songs)
      .where(and(eq(songs.id, songId), eq(songs.author, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
