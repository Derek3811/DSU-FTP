/**
 * Cloudflare R2 client — uses the AWS S3-compatible API.
 * * Required environment variables:
 * R2_ACCOUNT_ID        — Cloudflare account ID
 * R2_ACCESS_KEY_ID     — R2 API token Access Key ID
 * R2_SECRET_ACCESS_KEY — R2 API token Secret Access Key
 * R2_BUCKET_NAME       — R2 bucket name
 */

import { S3Client } from "@aws-sdk/client-s3";

// 辅助函数：确保环境变量存在
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// 单例模式，避免重复创建客户端
let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (_client) return _client;

  const accountId = requireEnv("R2_ACCOUNT_ID");

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    // 【关键修复】强制禁用自动添加的校验和参数
    // 这能解决你遇到的 403 Forbidden 和 CORS 报错
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return _client;
}

export function getR2Bucket(): string {
  return requireEnv("R2_BUCKET_NAME");
}

/** 格式化文件夹名称 — 只允许字母、数字、连字符、下划线 */
export function sanitizeFolderName(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9\-_]/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 64) : "job-files";
}

/** 格式化文件名 — 允许字母、数字、连字符、下划线、点 */
export function sanitizeFileName(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9\-_.]/g, "_");
  return cleaned.length > 0 ? cleaned.slice(0, 128) : "upload.bin";
}