/**
 * lib/nextcloud.ts
 *
 * Shared utilities for Nextcloud WebDAV file upload and OCS share-link
 * creation. Used by both SecureFileUploadStep and ConfirmationStep.
 *
 * Credentials never leave the server — the proxies at
 *   /api/nextcloud/upload  (PUT)
 *   /api/nextcloud/share   (POST)
 * handle Basic-Auth injection.
 */

import type { TransferSecurity } from "@/components/portal/SecureFileUploadStep";

// ─── File upload ──────────────────────────────────────────────────────────────

/**
 * Uploads a single File object to Nextcloud via the server-side proxy.
 *
 * Progress is simulated client-side up to 88 % while the request is
 * in-flight; it jumps to 100 % once the server responds successfully.
 */
export async function uploadFileToNextcloud(
  file: File,
  folder: string,
  onProgress: (pct: number) => void,
): Promise<string> {
  let simPct = 0;
  const interval = setInterval(() => {
    simPct = Math.min(88, simPct + Math.random() * 14 + 4);
    onProgress(Math.round(simPct));
  }, 200);

  try {
    const fileBytes = await file.arrayBuffer();
    const res = await fetch(
      `/api/nextcloud/upload?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(file.name)}`,
      {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: fileBytes,
      },
    );

    clearInterval(interval);

    if (res.ok || res.status === 201 || res.status === 204) {
      const data = await res.json().catch(() => ({})) as { path?: string; ncPath?: string };
      onProgress(100);
      return data.ncPath ?? data.path ?? `/${folder}/${file.name}`;
    }

    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string };
    throw new Error(err.error ?? `Upload failed with status ${res.status}`);
  } catch (e) {
    clearInterval(interval);
    throw e;
  }
}

// ─── OCS share-link creation ──────────────────────────────────────────────────

/**
 * Calls the /api/nextcloud/share proxy to create an OCS public share link.
 * The server generates a secure 8-char password automatically.
 *
 * Returns the share URL and the generated password so the UI can display it.
 * On failure, returns { shareUrl: "Manual Link Pending", sharePassword: undefined }
 * so the email is still sent and staff knows to generate the link manually.
 */
export async function createNextcloudShare(
  remotePath: string,
  security: TransferSecurity,
): Promise<{ shareUrl: string; sharePassword: string | undefined }> {
  const res = await fetch("/api/nextcloud/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path:       remotePath,
      expireDate: security.expirationEnabled ? security.expirationDate : undefined,
    }),
  });

  const data = await res.json() as {
    shareUrl?:      string;
    sharePassword?: string;
    error?:         string;
    ocsStatusCode?: number;
  };

  if (data.shareUrl) {
    return { shareUrl: data.shareUrl, sharePassword: data.sharePassword };
  }

  throw new Error(data.error ?? "Failed to create share link");
}
