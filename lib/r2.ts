/**
 * Cloudflare R2 client — uses the AWS S3-compatible API.
 *
 * Required environment variables:
 *   R2_ACCOUNT_ID       — Cloudflare account ID
 *   R2_ACCESS_KEY_ID    — R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY — R2 API token Secret Access Key
 *   R2_BUCKET_NAME      — R2 bucket name
 *   R2_PUBLIC_URL       — (optional) public bucket URL for direct downloads
 *                         e.g. https://pub-xxxx.r2.dev  or  https://files.yourdomain.com
 */

import { S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (_client) return _client;

  const accountId = requireEnv("R2_ACCOUNT_ID");

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return _client;
}

export function getR2Bucket(): string {
  return requireEnv("R2_BUCKET_NAME");
}

/** Sanitise a folder segment — only allow alphanumeric, hyphens, underscores. */
export function sanitizeFolderName(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9\-_]/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 64) : "job-files";
}

/** Sanitise a file name — allow alphanumeric, hyphens, underscores, dots. */
export function sanitizeFileName(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9\-_.]/g, "_");
  return cleaned.length > 0 ? cleaned.slice(0, 128) : "upload.bin";
}
