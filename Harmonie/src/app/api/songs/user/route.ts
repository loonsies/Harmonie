import { auth } from "@/auth";
import { db, songs, users, ratings } from "@/schema";
import { eq, avg, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userSongs = await db
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
      averageRating: avg(ratings.rating).mapWith(String),
    })
    .from(songs)
    .leftJoin(users, eq(songs.author, users.id))
    .leftJoin(ratings, eq(songs.id, ratings.song_id))
    .where(eq(songs.author, session.user.id))
    .groupBy(songs.id, users.name);

  // Convert null averages to "0.0"
  const processedSongs = userSongs.map((song) => ({
    ...song,
    averageRating: song.averageRating
      ? Number(song.averageRating).toFixed(1)
      : "0.0",
  }));

  return NextResponse.json(processedSongs);
}
