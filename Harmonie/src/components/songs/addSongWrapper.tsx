"use client";

import { AddSongForm } from "@/components/addSongForm";
import { useRouter } from "next/navigation";

export function AddSongWrapper() {
  const router = useRouter();

  return <AddSongForm onSongAdded={() => router.refresh()} />;
}
