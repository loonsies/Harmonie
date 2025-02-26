import { NextResponse } from "next/server";
import {
  initCache,
  existsInCache,
  getFromCache,
  saveToCache,
} from "@/utils/midiCache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // Initialize cache directory if it doesn't exist
    await initCache();

    // Try to get from server cache first
    if (await existsInCache(url)) {
      const cachedData = await getFromCache(url);
      if (cachedData) {
        return new NextResponse(cachedData, {
          headers: {
            "Content-Type": "audio/midi",
            "Cache-Control": "public, max-age=31536000", // Cache for 1 year
          },
        });
      }
    }

    // If not in cache, fetch from BMP
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to cache
    await saveToCache(url, buffer);

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "audio/midi",
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error proxying MIDI file:", error);
    return new NextResponse("Error fetching MIDI file", { status: 500 });
  }
}
