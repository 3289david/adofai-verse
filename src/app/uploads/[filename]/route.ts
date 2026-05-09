import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", gif: "image/gif", webp: "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse(null, { status: 400 });
  }
  const filePath = join(process.cwd(), "public", "uploads", filename);
  try {
    if (!existsSync(filePath)) return new NextResponse(null, { status: 404 });
    const file = await readFile(filePath);
    const ext  = filename.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(file, {
      headers: {
        "Content-Type":  MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
