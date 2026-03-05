import { google } from "googleapis";
import type { drive_v3 } from "@googleapis/drive";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];
const CACHE_TTL_MS = 15 * 60 * 1000;

let cachedDrive: drive_v3.Drive | null = null;
let cacheExpiry = 0;

function parseCredentials() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");
  }

  try {
    return JSON.parse(key);
  } catch {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON");
  }
}

export function getDriveClient(): drive_v3.Drive {
  if (cachedDrive && cacheExpiry > Date.now()) {
    return cachedDrive;
  }

  const credentials = parseCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: DRIVE_SCOPES,
  });

  cachedDrive = google.drive({ version: "v3", auth });
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cachedDrive;
}

export function sanitizeFolderName(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9\-_]/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 64) : "job-files";
}

export function sanitizeFileName(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9\-_\.]/g, "_");
  return cleaned.length > 0 ? cleaned.slice(0, 128) : "upload.bin";
}

export async function findOrCreateFolder(drive: drive_v3.Drive, name: string, parentId: string) {
  const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const listRes = await drive.files.list({
    q: query,
    fields: "files(id)",
    pageSize: 1,
  });

  const existing = listRes.data.files?.[0]?.id;
  if (existing) return existing;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  if (!created.data.id) {
    throw new Error("Unable to create folder on Google Drive");
  }

  return created.data.id;
}

export async function findFolderByName(drive: drive_v3.Drive, name: string, parentId: string) {
  const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const listRes = await drive.files.list({
    q: query,
    fields: "files(id)",
    pageSize: 1,
  });

  return listRes.data.files?.[0]?.id;
}
