/**
 * Client-side R2 helpers (safe to import in "use client" components).
 *
 * Upload flow:
 *   1. Call getPresignedUploadUrl()  →  get a short-lived PUT URL from the server
 *   2. PUT the file bytes directly to R2 using that URL (browser → R2, no proxy)
 *
 * Download flow:
 *   1. Call getDownloadUrl()  →  get a presigned GET URL (or direct public URL) from the server
 *   2. Open / fetch that URL
 */

import type { TransferSecurity } from "@/components/portal/SecureFileUploadStep";

// ── Upload ────────────────────────────────────────────────────────────────────

interface PresignResponse {
  presignedUrl: string;
  key: string;
}

/**
 * Fetches a presigned PUT URL from the server, then streams the file directly
 * to Cloudflare R2.  `onProgress` receives 0–100.
 */
export async function uploadFileToR2(
  file: File,
  folder: string,
  onProgress: (pct: number) => void,
): Promise<{ remotePath: string; key: string }> {
  // Step 1 — get presigned URL
  const qs = new URLSearchParams({
    folder,
    file:        file.name,
    contentType: file.type || "application/octet-stream",
  });

  const presignRes = await fetch(`/api/r2/upload?${qs.toString()}`);
  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({ error: `HTTP ${presignRes.status}` })) as { error?: string };
    throw new Error(err.error ?? "Failed to get upload URL");
  }
  const { presignedUrl, key } = await presignRes.json() as PresignResponse;

  // Step 2 — PUT directly to R2 with XHR so we get progress events
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`R2 upload failed: HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during R2 upload"));
    xhr.send(file);
  });

  return { remotePath: `/${key}`, key };
}

// ── Download ──────────────────────────────────────────────────────────────────

/**
 * Returns a usable download URL for an R2 object.
 * If the server has R2_PUBLIC_URL set it will redirect directly;
 * otherwise it returns a presigned GET URL.
 */
export async function getDownloadUrl(key: string): Promise<string> {
  const res = await fetch(`/api/r2/download?key=${encodeURIComponent(key)}`);

  // If the server sent a redirect (302 w/ Location header captured by fetch follow)
  // the response.url will already be the final destination.
  if (res.redirected) return res.url;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string };
    throw new Error(err.error ?? "Failed to get download URL");
  }

  const data = await res.json() as { url?: string };
  if (!data.url) throw new Error("No download URL returned");
  return data.url;
}

// ── Share link (stub — R2 has no native share concept) ────────────────────────

/**
 * Generates a share descriptor that can be passed to DSU staff or stored.
 * Real share-link logic (expiry, password gate, etc.) would live in your own
 * auth/share system; this stub surfaces the R2 folder key for reference.
 */
export async function createR2Share(
  folder: string,
  security: TransferSecurity,
): Promise<{ shareUrl: string; sharePassword?: string }> {
  // Presign the folder prefix listing or just surface a placeholder.
  // Replace this with your own share-link API if you build one.
  const shareUrl = `Manual Link Pending — folder: ${folder}`;
  const sharePassword = security.passwordEnabled && security.password
    ? security.password
    : undefined;

  return { shareUrl, sharePassword };
}
