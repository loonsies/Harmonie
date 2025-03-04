import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNotNull, isNull } from "drizzle-orm";
import { songs, users, ratings } from "@/schema";
import type { InferSelectModel } from "drizzle-orm";
import { verifyPassword } from "@/utils/password";
import { Song } from "@/data/types/song";
import { sql, avg } from "drizzle-orm";

const connectionString = process.env.AUTH_DRIZZLE_URL || "";
const queryClient = postgres(connectionString);
const db = drizzle({ client: queryClient });
type User = InferSelectModel<typeof users>;

export async function getUserFromDb(
  email: string,
  password: string
): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .execute();
  const user = result[0];

  if (
    user &&
    user.password &&
    (await verifyPassword(user.password, password))
  ) {
    return user;
  }
  return null;
}

export async function getUserFromId(id: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
    .execute();
  return result[0] ?? null;
}

export async function getUserFromName(name: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.name, name))
    .limit(1)
    .execute();
  return result[0] ?? null;
}

export async function getSongs(source: string): Promise<Song[]> {
  if (source == "bmp") {
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        download: songs.download,
        source: songs.source,
        comment: songs.comment,
        tags: songs.tags,
        authorId: songs.author,
        authorName: songs.bpmAuthor,
        dateUploaded: songs.dateUploaded,
        origin: sql<string>`'bmp'`,
        averageRating: avg(ratings.rating).mapWith(String),
      })
      .from(songs)
      .leftJoin(ratings, eq(songs.id, ratings.song_id))
      .where(isNotNull(songs.bmpId))
      .groupBy(songs.id);
    console.log(`Found ${result.length} BMP songs`);

    // Convert null averages to "0.0"
    return result.map((song) => ({
      ...song,
      averageRating: song.averageRating
        ? Number(song.averageRating).toFixed(1)
        : "0.0",
    }));
  } else if (source == "harmonie") {
    const result = await db
      .select({
        id: songs.id,
        title: songs.title,
        download: songs.download,
        source: songs.source,
        comment: songs.comment,
        tags: songs.tags,
        authorId: songs.author,
        authorName: users.name,
        dateUploaded: songs.dateUploaded,
        origin: sql<string>`'harmonie'`,
        averageRating: avg(ratings.rating).mapWith(String),
      })
      .from(songs)
      .leftJoin(users, eq(songs.author, users.id))
      .leftJoin(ratings, eq(songs.id, ratings.song_id))
      .where(isNull(songs.bmpId))
      .groupBy(songs.id, users.name);

    // Convert null averages to "0.0"
    return result.map((song) => ({
      ...song,
      averageRating: song.averageRating
        ? Number(song.averageRating).toFixed(1)
        : "0.0",
    }));
  }
  return [];
}

export async function getUserSongs(userId: string): Promise<Song[]> {
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
    bmpId: songs.bmpId,
    averageRating: avg(ratings.rating).mapWith(String),
  })
  .from(songs)
  .leftJoin(users, eq(songs.author, users.id))
  .leftJoin(ratings, eq(songs.id, ratings.song_id))
  .where(eq(songs.author, userId))
  .groupBy(songs.id, users.name);

  // Convert null averages to "0.0" and add origin based on bmpId
  const processedSongs = userSongs.map((song) => ({
    ...song,
    origin: song.bmpId ? "bmp" : "harmonie",
    averageRating: song.averageRating
      ? Number(song.averageRating).toFixed(1)
      : "0.0",
  }));
  return processedSongs
}

export async function getUserAvatarByUsername(
  username: string
): Promise<string | null> {
  const result = await db
    .select({ avatar: users.image })
    .from(users)
    .where(eq(users.name, username))
    .limit(1)
    .execute();

  return result[0]?.avatar ?? null;
}
