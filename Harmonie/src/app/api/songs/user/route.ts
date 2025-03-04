import { auth } from "@/auth";
import { db, songs, users, ratings } from "@/schema";
import { getUserSongs } from "@/utils/db";
import { eq, avg, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userSongs = await getUserSongs(session.user.id);

  return NextResponse.json(userSongs);
}
