import { auth, unstable_update } from "@/auth";
import { db, users } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { getUserFromId } from "@/utils/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Generate unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${nanoid()}${fileExt}`;
    const filePath = path.join(process.cwd(), "public", "avatar", fileName);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    await writeFile(filePath, buffer);

    // Update database
    const user = await getUserFromId(session.user.id);

    // Delete old avatar if it exists and isn't default
    if (user?.image && user.image !== "default.png") {
      try {
        await unlink(path.join(process.cwd(), "public", "avatar", user.image));
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }

    await db
      .update(users)
      .set({ image: fileName })
      .where(eq(users.id, session.user.id));

    await unstable_update({
      user: {
        ...session.user,
        image: fileName,
      },
    });
    return new NextResponse("Avatar updated", { status: 200 });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return new NextResponse("Error uploading avatar", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await getUserFromId(session.user.id);

    // Delete old avatar file if it exists and isn't default
    if (
      user?.image &&
      user.image !== "default.png" &&
      !user.image.startsWith("http")
    ) {
      try {
        await unlink(path.join(process.cwd(), "public", "avatar", user.image));
      } catch (error) {
        console.error("Error deleting avatar:", error);
      }
    }

    // Update user to use default avatar
    await db
      .update(users)
      .set({ image: "default.png" })
      .where(eq(users.id, session.user.id));

    await unstable_update({
      user: {
        ...session.user,
        image: "default.png",
      },
    });
    return new NextResponse("Avatar removed", { status: 200 });
  } catch (error) {
    console.error("Avatar removal error:", error);
    return new NextResponse("Error removing avatar", { status: 500 });
  }
}
