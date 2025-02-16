import { getUserAvatarByUsername } from "@/utils/db";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const avatarUrl = await getUserAvatarByUsername(username);
    let imageBuffer: Buffer;

    if (!avatarUrl) {
      // Serve default avatar
      imageBuffer = await readFile(
        path.join(process.cwd(), "public", "avatar", "default.png")
      );
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    try {
      // If it's an absolute URL (e.g., from Discord), fetch it
      if (avatarUrl.startsWith("http")) {
        const response = await fetch(avatarUrl);
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": response.headers.get("content-type") || "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } else {
        // If it's a local file
        imageBuffer = await readFile(
          path.join(process.cwd(), "public", "avatar", avatarUrl)
        );
        const contentType = avatarUrl.endsWith(".png")
          ? "image/png"
          : avatarUrl.endsWith(".jpg") || avatarUrl.endsWith(".jpeg")
          ? "image/jpeg"
          : avatarUrl.endsWith(".gif")
          ? "image/gif"
          : "image/png";

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (error) {
      // If there's an error loading the avatar, serve default
      imageBuffer = await readFile(
        path.join(process.cwd(), "public", "avatar", "default.png")
      );
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (error) {
    console.error("Error serving avatar:", error);
    return new NextResponse("Error serving avatar", { status: 500 });
  }
}
