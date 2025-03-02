"use client";

import { AddSongWrapper } from "@/components/songs/addSongWrapper";
import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Song } from "@/data/types/song";
import { useSession } from "next-auth/react";

function UserSongs() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs/user", {
        credentials: "include",
      });
      const data = await response.json();
      setSongs(data);
    };

    fetchSongs();
  }, []);

  const handleSongDeleted = (songId: string) => {
    setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
  };

  return (
    <SongTable 
      data={songs} 
      columns={columns} 
      showManageActions={true} 
      onSongDeleted={handleSongDeleted}
    />
  );
}

export default function ManagePage() {
  const { data: session } = useSession();

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
