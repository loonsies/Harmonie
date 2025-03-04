import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Metadata from "@/utils/metadata";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getUserFromName, getUserSongs } from "@/utils/db";

export default async function UserProfile(props: {
  params: Promise<{ username: string }>;
}) {
  const params = await props.params;

  const { username } = params;

  // Return 404 if someone tries to access /user/bmp
  if (username.toLowerCase() === "bmp") {
    notFound();
  }

  const user = await getUserFromName(username);

  if (!user) {
    notFound();
  }

  const userSongs = await getUserSongs(user.id);

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
                  {userSongs.length} song{userSongs.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            </div>
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
