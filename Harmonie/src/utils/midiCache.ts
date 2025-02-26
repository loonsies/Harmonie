import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.join(process.cwd(), "midi-cache");

// Ensure cache directory exists
export async function initCache() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// Generate a unique filename for a URL
function getFilename(url: string): string {
  const hash = crypto.createHash("sha256").update(url).digest("hex");
  return `${hash}.mid`;
}

// Check if a file exists in cache
export async function existsInCache(url: string): Promise<boolean> {
  const filename = getFilename(url);
  try {
    await fs.access(path.join(CACHE_DIR, filename));
    return true;
  } catch {
    return false;
  }
}

// Get file from cache
export async function getFromCache(url: string): Promise<Buffer | null> {
  const filename = getFilename(url);
  try {
    const filePath = path.join(CACHE_DIR, filename);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

// Save file to cache
export async function saveToCache(url: string, data: Buffer): Promise<void> {
  const filename = getFilename(url);
  const filePath = path.join(CACHE_DIR, filename);
  await fs.writeFile(filePath, data);
}
