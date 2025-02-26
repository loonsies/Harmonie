import { db, songs } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { songId: string } }
) {
  try {
    // Get the song details from the database
    const result = await db
      .select({
        download: songs.download,
      })
      .from(songs)
      .where(eq(songs.id, params.songId));

    if (!result.length) {
      return new NextResponse("Song not found", { status: 404 });
    }

    const { download } = result[0];
    const filePath = path.join(process.cwd(), "public", "midi", download);

    try {
      const fileBuffer = await readFile(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "audio/midi",
          "Content-Disposition": `attachment; filename="${download}"`,
        },
      });
    } catch (error) {
      console.error("Error reading MIDI file:", error);
      return new NextResponse("MIDI file not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching song:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
