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
    console.log('Fetching BMP songs...');
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
    console.log('Fetching Harmonie songs...');
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
    console.log(`Found ${result.length} Harmonie songs`);

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
