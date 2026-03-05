import { NextRequest, NextResponse } from "next/server";
import {
  getDriveClient,
  sanitizeFolderName,
  findFolderByName,
} from "@/lib/google-drive-server";

export const runtime = "nodejs";

const DRIVE_FOLDER_ENV = "GOOGLE_DRIVE_FOLDER_ID";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => chars[b % chars.length]).join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { folderName?: string; folderId?: string; fileId?: string; expireDate?: string };
    const drive = getDriveClient();
    const baseFolderId = process.env[DRIVE_FOLDER_ENV];

    if (!baseFolderId) {
      console.error("[google-drive/share] Missing GOOGLE_DRIVE_FOLDER_ID");
      return NextResponse.json({ error: "Drive folder not configured" }, { status: 503 });
    }

    let targetId = body.fileId?.trim() || body.folderId?.trim();

    if (!targetId && body.folderName) {
      const safeFolder = sanitizeFolderName(body.folderName);
      targetId = await findFolderByName(drive, safeFolder, baseFolderId);
    }

    if (!targetId) {
      return NextResponse.json({ error: "Unable to locate folder or file" }, { status: 400 });
    }

    try {
      await drive.permissions.create({
        fileId: targetId,
        requestBody: { type: "anyone", role: "reader" },
      });
    } catch (err) {
      console.warn("[google-drive/share] Permission creation warning", err);
    }

    const metadata = await drive.files.get({
      fileId: targetId,
      fields: "id,name,webViewLink,webContentLink",
    });

    const shareUrl = metadata.data.webViewLink ?? metadata.data.webContentLink;
    const sharePassword = generatePassword();

    if (!shareUrl) {
      console.error("[google-drive/share] Missing share URL for target", targetId);
      return NextResponse.json({ error: "Share URL not available" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, shareUrl, shareId: targetId, sharePassword });
  } catch (err) {
    console.error("[google-drive/share] Unexpected error", err);
    return NextResponse.json({ error: "Share creation failed", detail: String(err) }, { status: 500 });
  }
}
