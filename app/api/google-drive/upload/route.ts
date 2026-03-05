import { Buffer } from "buffer";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import {
  getDriveClient,
  sanitizeFolderName,
  sanitizeFileName,
  findOrCreateFolder,
} from "@/lib/google-drive-server";

export const runtime = "nodejs";

const DRIVE_FOLDER_ENV = "GOOGLE_DRIVE_FOLDER_ID";
const DRIVE_FILE_FIELDS = "id,name,parents";

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderParam = searchParams.get("folder")?.trim();
  const fileParam = searchParams.get("file")?.trim();

  if (!folderParam || !fileParam) {
    return NextResponse.json({ error: "Missing folder or file param" }, { status: 400 });
  }

  const baseFolderId = process.env[DRIVE_FOLDER_ENV];
  if (!baseFolderId) {
    console.error("[google-drive/upload] Missing GOOGLE_DRIVE_FOLDER_ID");
    return NextResponse.json({ error: "Drive folder not configured" }, { status: 503 });
  }

  const drive = getDriveClient();
  const safeFolder = sanitizeFolderName(folderParam);
  const safeFile = sanitizeFileName(fileParam);

  let targetFolderId: string;
  try {
    targetFolderId = await findOrCreateFolder(drive, safeFolder, baseFolderId);
  } catch (err) {
    console.error("[google-drive/upload] Folder creation failed", err);
    return NextResponse.json({ error: "Unable to prepare destination folder" }, { status: 502 });
  }

  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  try {
    const upload = await drive.files.create({
      requestBody: {
        name: safeFile,
        parents: [targetFolderId],
      },
      media: {
        mimeType: req.headers.get("Content-Type") ?? undefined,
        body: stream,
      },
      fields: `${DRIVE_FILE_FIELDS},webViewLink,webContentLink`,
      supportsAllDrives: true,
    });

    const remotePath = `/${safeFolder}/${safeFile}`;
    return NextResponse.json({
      ok: true,
      path: remotePath,
      driveFileId: upload.data.id,
    });
  } catch (err) {
    console.error("[google-drive/upload] Upload failed", err);
    return NextResponse.json({ error: "Upload failed", detail: String(err) }, { status: 502 });
  }
}
