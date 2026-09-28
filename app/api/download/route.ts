import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "mp4";
  const fileName = type === "gif" ? "bridge3_waitlist_tutorial.gif" : "bridge3_waitlist_tutorial.mp4";
  const contentType = type === "gif" ? "image/gif" : "video/mp4";

  // Check multiple possible paths
  const possiblePaths = [
    path.join(process.cwd(), "public", fileName),
    path.join(process.cwd(), fileName),
    path.join("C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\923a7459-bac9-4c14-8acb-47352e16bc3c", fileName),
  ];

  let filePath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    return NextResponse.json({ error: "Video file not found." }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const HEAD = GET;
