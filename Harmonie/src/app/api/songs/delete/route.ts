import { auth } from "@/auth";
import { db, songs } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { getUserFromId } from "@/utils/db";

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { songId } = await request.json();

  // Get the song details first to get the filename
  const result = await db.select().from(songs).where(eq(songs.id, songId));

  const song = result[0];

  if (!song) {
    return new NextResponse("Song not found", { status: 404 });
  }

  // Get current user role from database
  const currentUser = await getUserFromId(session.user.id);

  // Check if user is admin/moderator (role 1 or 2) or the song owner
  const userRole = currentUser?.role || 0;
  const isAdminOrMod = userRole === 1 || userRole === 2;
  const isOwner = song.author === session.user.id;

  console.log(isAdminOrMod, isOwner);
  if (!isAdminOrMod && !isOwner) {
    return new NextResponse("Unauthorized - Insufficient permissions", {
      status: 403,
    });
  }

  try {
    // Delete the physical file
    const filePath = path.join(process.cwd(), "public", "midi", song.download);
    await unlink(filePath);

    // Delete song from database
    await db.delete(songs).where(eq(songs.id, songId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
