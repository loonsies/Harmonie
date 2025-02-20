import { db, songs, users } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const allSongs = await db
    .select({
      id: songs.id,
      title: songs.title,
      tags: songs.tags,
      download: songs.download,
      source: songs.source,
      comment: songs.comment,
      dateUploaded: songs.dateUploaded,
      authorId: songs.author,
      authorName: users.name,
    })
    .from(songs)
    .leftJoin(users, eq(songs.author, users.id));

  return NextResponse.json(allSongs);
}
