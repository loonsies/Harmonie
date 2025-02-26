import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";
import { db, users, songs } from "@/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UserProfile(
  props: {
    params: Promise<{ username: string }>;
  }
) {
  const params = await props.params;

  const {
    username
  } = params;

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
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
            {user.email && (
              <p className="text-muted-foreground">{user.email}</p>
            )}
          </CardHeader>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Songs</h2>
          <SongTable
            data={userSongs}
            columns={columns}
            showManageActions={false}
          />
        </div>
      </div>
    </main>
  );
}
