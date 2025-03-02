import { auth } from "@/auth";
import { db, songs } from "@/schema";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.name) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const midiFile = formData.get("midiFile") as File;
    const title = formData.get("title") as string;
    const tags = JSON.parse(formData.get("tags") as string) as string[];
    const comment = formData.get("comment") as string;
    const source = formData.get("source") as string;

    if (!midiFile || !title || !tags.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    if (midiFile.size > 5 * 1024 * 1024) {
      return new NextResponse("File size must be less than 5MB", {
        status: 400,
      });
    }

    // Generate unique filename
    const fileExt = path.extname(midiFile.name);
    const fileName = `${nanoid()}${fileExt}`;
    const filePath = path.join(process.cwd(), "public", "midi", fileName);

    // Convert File to Buffer and save
    const bytes = await midiFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    await db.insert(songs).values({
      title,
      tags: tags.join(","),
      comment,
      source,
      author: session.user.id,
      download: `${fileName}`,
      dateUploaded: new Date(),
    });

    return new NextResponse("Song uploaded successfully", { status: 200 });
  } catch (error) {
    console.error("Song upload error:", error);
    return new NextResponse("Error uploading song", { status: 500 });
  }
}
