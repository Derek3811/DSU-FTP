import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getR2Bucket, sanitizeFolderName, sanitizeFileName } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * GET /api/r2/upload?folder=DSU-2025-1234&file=exhibit-01.pdf&contentType=application/pdf
 *
 * Returns a presigned PUT URL the browser can use to upload directly to R2.
 * The URL expires in 15 minutes.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderParam      = searchParams.get("folder")?.trim();
  const fileParam        = searchParams.get("file")?.trim();
  const contentType      = searchParams.get("contentType")?.trim() || "application/octet-stream";

  if (!folderParam || !fileParam) {
    return NextResponse.json({ error: "Missing folder or file param" }, { status: 400 });
  }

  const safeFolder = sanitizeFolderName(folderParam);
  const safeFile   = sanitizeFileName(fileParam);
  const key        = `${safeFolder}/${safeFile}`;

  try {
    const client = getR2Client();
    const bucket = getR2Bucket();

    const command = new PutObjectCommand({
      Bucket:      bucket,
      Key:         key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(client, command, { 
      expiresIn: 900,
      unhostedPayload: true, // Prevent SDK from adding checksum headers
    }); // 15 min

    return NextResponse.json({ presignedUrl, key });
  } catch (err) {
    console.error("[r2/upload] Failed to generate presigned URL", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 502 });
  }
}

/**
 * PUT /api/r2/upload?folder=…&file=…
 *
 * Server-side upload proxy — used for small payloads like job_summary.json
 * where generating a presigned URL is unnecessary overhead.
 */
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderParam      = searchParams.get("folder")?.trim();
  const fileParam        = searchParams.get("file")?.trim();

  if (!folderParam || !fileParam) {
    return NextResponse.json({ error: "Missing folder or file param" }, { status: 400 });
  }

  const safeFolder = sanitizeFolderName(folderParam);
  const safeFile   = sanitizeFileName(fileParam);
  const key        = `${safeFolder}/${safeFile}`;

  try {
    const client      = getR2Client();
    const bucket      = getR2Bucket();
    const body        = await req.arrayBuffer();
    const contentType = req.headers.get("Content-Type") ?? "application/octet-stream";

    const command = new PutObjectCommand({
      Bucket:      bucket,
      Key:         key,
      Body:        Buffer.from(body),
      ContentType: contentType,
    });

    await client.send(command);

    return NextResponse.json({ ok: true, key, path: `/${key}` });
  } catch (err) {
    console.error("[r2/upload] Server-side upload failed", err);
    return NextResponse.json({ error: "Upload failed", detail: String(err) }, { status: 502 });
  }
}
