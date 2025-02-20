import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";
import { db, users, songs } from "@/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function UserProfile({
  params: { username },
}: {
  params: { username: string };
}) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.name, username))
    .then((res) => res[0]);

  if (!user) {
    notFound();
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
    })
    .from(songs)
    .leftJoin(users, eq(songs.author, users.id))
    .where(eq(songs.author, user.id));

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
        {user.email && <p className="text-muted-foreground">{user.email}</p>}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Songs</h2>
        <SongTable data={userSongs} columns={columns} showActions={false} />
      </div>
    </div>
  );
}
