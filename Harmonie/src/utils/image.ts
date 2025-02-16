"use server";

import fs from "fs/promises";
import path from "path";

const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

export async function downloadAndSaveImage({
  url,
  userId,
  provider,
}: {
  url: string;
  userId: string;
  provider: string;
}): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");

    const contentType = response.headers.get("content-type");
    const extension = contentType ? `.${contentType.split("/")[1]}` : ".png";

    // Validate extension
    if (!VALID_EXTENSIONS.includes(extension.toLowerCase())) {
      throw new Error("Invalid image format");
    }

    const filename = `${userId}-${provider}${extension}`;
    const imagePath = path.join(process.cwd(), "data", "avatar", filename);

    // Ensure directory exists
    await fs.mkdir(path.join(process.cwd(), "data", "avatar"), {
      recursive: true,
    });

    // Save the image
    await fs.writeFile(imagePath, Buffer.from(await response.arrayBuffer()));

    // Return relative path for database storage
    return `/data/avatar/${filename}`;
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

export async function validateImage(file: File): Promise<boolean> {
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return validTypes.includes(file.type) && file.size <= maxSize;
}
