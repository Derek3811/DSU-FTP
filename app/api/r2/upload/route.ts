import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getR2Bucket, sanitizeFolderName, sanitizeFileName } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * GET /api/r2/upload?... or /api/r2/download?...
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "upload";
  const path = new URL(req.url).pathname;

  if (path.includes("/download") || action === "download") {
    return handleDownload(searchParams);
  }

  return handleUploadPresign(searchParams);
}

/**
 * handleUploadPresign
 * UPDATED: Strictly controlled signing to prevent 403 Forbidden errors.
 */
async function handleUploadPresign(searchParams: URLSearchParams) {
  const folderParam = searchParams.get("folder")?.trim();
  const fileParam = searchParams.get("file")?.trim();
  const contentType = searchParams.get("contentType")?.trim() || "application/octet-stream";

  if (!folderParam || !fileParam) {
    return NextResponse.json({ error: "Missing folder or file parameter" }, { status: 400 });
  }

  const safeFolder = sanitizeFolderName(folderParam);
  const safeFile = sanitizeFileName(fileParam);
  const key = `${safeFolder}/${safeFile}`;

  try {
    const client = getR2Client();
    const bucket = getR2Bucket();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      // Ensure no checksums are added to the command itself
      ChecksumAlgorithm: undefined,
    });

    // Fix: Force the SDK to ONLY sign the 'host' and 'content-type' headers.
    // This removes 'x-amz-checksum-crc32' and other SDK-specific parameters 
    // from the signed URL query string, which prevents the 403 Forbidden error.
    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 900,
      signableHeaders: new Set(["host", "content-type"]),
      unhostedPayload: true,
    });

    return NextResponse.json({ presignedUrl, key });
  } catch (err) {
    console.error("[r2/upload] Failed to generate presigned URL", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 502 });
  }
}

/**
 * handleDownload
 */
async function handleDownload(searchParams: URLSearchParams) {
  const key = searchParams.get("key")?.trim();

  if (!key) {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
  }

  try {
    const client = getR2Client();
    const bucket = getR2Bucket();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[r2/download] Failed to generate presigned URL", err);
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 502 });
  }
}

/**
 * PUT /api/r2/upload
 */
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderParam = searchParams.get("folder")?.trim();
  const fileParam = searchParams.get("file")?.trim();

  if (!folderParam || !fileParam) {
    return NextResponse.json({ error: "Missing folder or file parameter" }, { status: 400 });
  }

  try {
    const safeFolder = sanitizeFolderName(folderParam);
    const safeFile = sanitizeFileName(fileParam);
    const key = `${safeFolder}/${safeFile}`;

    const client = getR2Client();
    const bucket = getR2Bucket();
    const body = await req.arrayBuffer();
    const contentType = req.headers.get("Content-Type") ?? "application/octet-stream";

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(body),
      ContentType: contentType,
    });

    await client.send(command);

    return NextResponse.json({ ok: true, key, path: `/${key}` });
  } catch (err) {
    console.error("[r2/upload] Server-side proxy upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }
}