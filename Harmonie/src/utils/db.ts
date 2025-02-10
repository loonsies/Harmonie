import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNotNull, isNull } from "drizzle-orm";
import { songs, users } from "@/schema";
import type { InferSelectModel } from "drizzle-orm";
import { verifyPassword } from "@/utils/password";
import { Song } from "@/data/types/song";

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

export async function getSongs(source: string): Promise<Song[]> {
  if (source == "bmp") {
    const result = await db
      .select()
      .from(songs)
      .where(isNotNull(songs.bmpId))
      .execute();

    return (
      result?.map((song) => ({
        id: song.id,
        title: song.title,
        download: song.download,
        source: song.source,
        comment: song.comment,
        tags: song.tags,
        author: song.bpmAuthor,
        dateUploaded: song.dateUploaded,
        origin: "bmp",
      })) ?? []
    );
  } else if (source == "harmonie") {
    const result = await db
      .select()
      .from(songs)
      .where(isNull(songs.bmpId))
      .execute();
  }
  return [];
}
