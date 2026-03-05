import type { TransferSecurity } from "@/components/portal/SecureFileUploadStep";

export async function uploadFileToDrive(
  file: File,
  folder: string,
  onProgress: (pct: number) => void,
): Promise<{ remotePath: string; driveFileId?: string }> {
  let simPct = 0;
  const interval = setInterval(() => {
    simPct = Math.min(88, simPct + Math.random() * 14 + 4);
    onProgress(Math.round(simPct));
  }, 200);

  try {
    const fileBytes = await file.arrayBuffer();
    const res = await fetch(
      `/api/google-drive/upload?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(file.name)}`,
      {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: fileBytes,
      },
    );

    clearInterval(interval);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error((err as { error?: string }).error ?? `Upload failed with status ${res.status}`);
    }

    const data = await res.json().catch(() => ({})) as { path?: string; driveFileId?: string };
    onProgress(100);
    return { remotePath: data.path ?? `/${folder}/${file.name}`, driveFileId: data.driveFileId };
  } catch (error) {
    clearInterval(interval);
    throw error;
  }
}

export async function createDriveShare(
  folderName: string,
  security: TransferSecurity,
): Promise<{ shareUrl: string; sharePassword?: string }> {
  const res = await fetch("/api/google-drive/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folderName,
      folderId: undefined,
      fileId: undefined,
      expireDate: security.expirationEnabled ? security.expirationDate : undefined,
    }),
  });

  const data = await res.json() as { shareUrl?: string; sharePassword?: string; error?: string };

  if (res.ok && data.shareUrl) {
    return { shareUrl: data.shareUrl, sharePassword: data.sharePassword };
  }

  throw new Error(data.error ?? "Failed to create share link");
}
