import { NextResponse } from "next/server";
import { db, ratings } from "@/schema";
import { eq, avg } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const songId = url.searchParams.get("songId");

    if (!songId) {
      return NextResponse.json({ error: "Song ID required" }, { status: 400 });
    }

    const result = await db
      .select({
        average: avg(ratings.rating).as("average"),
      })
      .from(ratings)
      .where(eq(ratings.song_id, songId));

    const averageRating = result[0]?.average || 0;

    return NextResponse.json({
      average: Number(averageRating).toFixed(1),
    });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch average rating" },
      { status: 500 }
    );
  }
}
