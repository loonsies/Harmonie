import { NextResponse } from "next/server";
import { db, ratings } from "@/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { songId, rating } = await request.json();

    // Validate rating
    if (
      !Number.isFinite(rating) ||
      rating % 1 !== 0 ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    // Get the user's existing rating if any
    const existingRating = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.user_id, userId), eq(ratings.song_id, songId)))
      .limit(1);

    if (existingRating.length > 0) {
      // Update existing rating
      await db
        .update(ratings)
        .set({
          rating,
          updated_at: new Date(),
        })
        .where(and(eq(ratings.user_id, userId), eq(ratings.song_id, songId)));
    } else {
      // Insert new rating
      await db.insert(ratings).values({
        user_id: userId,
        song_id: songId,
        rating,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
