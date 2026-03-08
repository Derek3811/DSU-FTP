import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getR2Bucket } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * GET /api/r2/download?key=DSU-2025-1234%2Fexhibit-01.pdf
 *
 * Returns a short-lived presigned GET URL for the requested R2 object.
 * The URL expires in 60 minutes.
 *
 * If R2_PUBLIC_URL is set and the bucket is public, you can skip
 * presigning and just redirect to `${R2_PUBLIC_URL}/${key}` instead.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key")?.trim();

  if (!key) {
    return NextResponse.json({ error: "Missing key param" }, { status: 400 });
  }

  // If you have a public R2 custom domain set, serve it directly (no presign needed)
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    const directUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;
    return NextResponse.redirect(directUrl, { status: 302 });
  }

  // Otherwise generate a presigned GET URL
  try {
    const client  = getR2Client();
    const bucket  = getR2Bucket();

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour

    return NextResponse.json({ url: presignedUrl });
  } catch (err) {
    console.error("[r2/download] Failed to generate download URL", err);
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 502 });
  }
}
