import { auth } from "@/auth";
import { db, songs } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserFromId } from "@/utils/db";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.name) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, title, tags, comment, source } = body;

    if (!id || !title || !tags.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify the song exists
    const [existingSong] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (!existingSong) {
      return new NextResponse("Song not found", { status: 404 });
    }

    // Get current user role from database
    const currentUser = await getUserFromId(session.user.id);

    // Check if user is admin/moderator (role 1 or 2) or the song owner
    const userRole = currentUser?.role || 0;
    const isAdminOrMod = userRole === 1 || userRole === 2;
    const isOwner = existingSong.author === session.user.id;

    if (!isAdminOrMod && !isOwner) {
      return new NextResponse("Unauthorized - Insufficient permissions", {
        status: 403,
      });
    }

    // Update the song
    await db
      .update(songs)
      .set({
        title,
        tags: tags.join(","),
        comment,
        source,
      })
      .where(eq(songs.id, id));

    return new NextResponse("Song updated successfully", { status: 200 });
  } catch (error) {
    console.error("Song update error:", error);
    return new NextResponse("Error updating song", { status: 500 });
  }
}
