import { drive, drive_v3 } from "@googleapis/drive";
import { GoogleAuth, OAuth2Client } from "google-auth-library";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];
const CACHE_TTL_MS = 15 * 60 * 1000;

let cachedDrive: drive_v3.Drive | null = null;
let cacheExpiry = 0;

function parseServiceAccountCredentials() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");

  try {
    return JSON.parse(key);
  } catch {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON");
  }
}

function hasOAuthCredentials() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REDIRECT_URI && process.env.GOOGLE_OAUTH_REFRESH_TOKEN);
}

function hasServiceAccountCredentials() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}

function getServiceAccountAuth() {
  const credentials = parseServiceAccountCredentials();
  return new GoogleAuth({
    credentials,
    scopes: DRIVE_SCOPES,
  });
}

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("OAuth client credentials are missing");
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

function getOAuthDriveAuth(): OAuth2Client {
  if (!hasOAuthCredentials()) {
    throw new Error("OAuth credentials not configured");
  }

  const client = getOAuth2Client();
  client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
  });
  return client;
}

function getCachedDriveInstance(auth: GoogleAuth | OAuth2Client) {
  if (cachedDrive && cacheExpiry > Date.now()) {
    return cachedDrive;
  }
  cachedDrive = drive({ version: "v3", auth });
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cachedDrive;
}

export function getDriveClient(): drive_v3.Drive {
  if (hasOAuthCredentials()) {
    return getCachedDriveInstance(getOAuthDriveAuth());
  }

  if (hasServiceAccountCredentials()) {
    return getCachedDriveInstance(getServiceAccountAuth());
  }

  throw new Error("Google Drive credentials are not configured");
}

export function getAuthorizeUrl() {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: DRIVE_SCOPES,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error("OAuth did not return a refresh token — try re-authorizing with Consent screen showing prompt=consent");
  }
  return tokens;
}

export function sanitizeFolderName(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9\-_]/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 64) : "job-files";
}

export function sanitizeFileName(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9\-_.]/g, "_");
  return cleaned.length > 0 ? cleaned.slice(0, 128) : "upload.bin";
}

export async function findOrCreateFolder(driveClient: drive_v3.Drive, name: string, parentId: string) {
  const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const listRes = await driveClient.files.list({
    q: query,
    fields: "files(id)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const existing = listRes.data.files?.[0]?.id;
  if (existing) return existing;

  const created = await driveClient.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  if (!created.data.id) {
    throw new Error("Unable to create folder on Google Drive");
  }

  return created.data.id;
}

export async function findFolderByName(driveClient: drive_v3.Drive, name: string, parentId: string) {
  const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const listRes = await driveClient.files.list({
    q: query,
    fields: "files(id)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return listRes.data.files?.[0]?.id;
}
