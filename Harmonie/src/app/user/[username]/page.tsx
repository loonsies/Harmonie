import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";
import { db, users, songs, ratings } from "@/schema";
import { eq, avg } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Metadata from "@/utils/metadata";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default async function UserProfile(props: {
  params: Promise<{ username: string }>;
}) {
  const params = await props.params;

  const { username } = params;

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
      averageRating: avg(ratings.rating).mapWith(String),
    })
    .from(songs)
    .leftJoin(users, eq(songs.author, users.id))
    .leftJoin(ratings, eq(songs.id, ratings.song_id))
    .where(eq(songs.author, user.id))
    .groupBy(songs.id, users.name);

  // Convert null averages to "0.0"
  const processedSongs = userSongs.map((song) => ({
    ...song,
    averageRating: song.averageRating
      ? Number(song.averageRating).toFixed(1)
      : "0.0",
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Metadata title={`${user.name} - Profile`}></Metadata>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={`/user/${user.name}/avatar`}
                  alt={`${user.name}'s profile picture`}
                />
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="!m-0">{user.name}</CardTitle>
                  {user.role === 0 && (
                    <Badge variant="outline" className="text-slate-500">
                      User
                    </Badge>
                  )}
                  {user.role === 1 && (
                    <Badge variant="outline" className="text-emerald-400">
                      Administrator
                    </Badge>
                  )}
                  {user.role === 2 && (
                    <Badge variant="outline" className="text-violet-400">
                      Moderator
                    </Badge>
                  )}
                  {user.role === 3 && (
                    <Badge variant="outline" className="text-red-400">
                      Banned
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {processedSongs.length} song{processedSongs.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Songs</h2>
          <SongTable
            data={processedSongs}
            columns={columns}
            showManageActions={false}
          />
        </div>
      </div>
    </main>
  );
}
