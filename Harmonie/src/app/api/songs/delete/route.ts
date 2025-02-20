import { auth } from "@/auth";
import { db, songs } from "@/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { songId } = await request.json();

  // Delete song only if it belongs to the user
  const result = await db
    .delete(songs)
    .where(and(eq(songs.id, songId), eq(songs.author, session.user.id)));

  return NextResponse.json({ success: true });
}
