import { auth } from "@/auth";
import { AddSongWrapper } from "@/components/songs/addSongWrapper";
import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function ManagePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }
  if (!session?.user?.name) {
    redirect("/auth/new-user");
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Song</CardTitle>
          </CardHeader>
          <CardContent>
            <AddSongWrapper />
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Your Songs</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <UserSongs />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function UserSongs() {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = process?.env?.NODE_ENV === "development" ? "http" : "https";

  const response = await fetch(`${proto}://${host}/api/songs/user`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      Cookie: headersList.get("cookie") || "",
    },
  });
  const songs = await response.json();

  return <SongTable data={songs} columns={columns} showManageActions={true} />;
}
