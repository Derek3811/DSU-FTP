import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for Nextcloud WebDAV uploads.
 * Keeps credentials server-side — never exposed to the browser.
 *
 * WebDAV base: https://sftp.dsudiscovery.com:8443/nextcloud-php/remote.php/dav/files/admin/
 *
 * Usage: PUT /api/nextcloud/upload?folder=DSU-2026-1234&file=job_summary.json
 * Body: raw file bytes (any content-type)
 */
export const runtime = "edge";

/** Strip trailing slash from a base URL, strip leading slash from a segment. */
function joinUrl(...parts: string[]): string {
  return parts
    .map((p, i) => (i === 0 ? p.replace(/\/+$/, "") : p.replace(/^\/+/, "")))
    .join("/");
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "";
  const file   = searchParams.get("file")   ?? "";

  if (!folder || !file) {
    return NextResponse.json({ error: "Missing folder or file param" }, { status: 400 });
  }

  // ── Read env vars ──────────────────────────────────────────────────────────
  // NEXT_PUBLIC_NEXTCLOUD_WEBDAV_URL must be:
  //   https://sftp.dsudiscovery.com:8443/nextcloud-php/remote.php/dav/files/admin/
  const baseUrl  = process.env.NEXT_PUBLIC_NEXTCLOUD_WEBDAV_URL;
  const username = process.env.NEXTCLOUD_USERNAME ?? "admin";
  const password = process.env.NEXTCLOUD_PASSWORD;

  if (!baseUrl || !password) {
    console.error("[nextcloud/upload] Missing NEXT_PUBLIC_NEXTCLOUD_WEBDAV_URL or NEXTCLOUD_PASSWORD");
    return NextResponse.json({ error: "Nextcloud credentials not configured" }, { status: 503 });
  }

  // Sanitize path segments to prevent path traversal
  const safeFolder = folder.replace(/[^A-Za-z0-9\-_]/g, "");
  const safeFile   = file.replace(/[^A-Za-z0-9\-_.]/g, "");

  const credentials = btoa(`${username}:${password}`);
  const authHeader  = `Basic ${credentials}`;

  // Final URLs:
  //   folder: .../remote.php/dav/files/admin/DSU-2026-1234/
  //   file:   .../remote.php/dav/files/admin/DSU-2026-1234/job_summary.json
  const folderUrl = joinUrl(baseUrl, safeFolder);
  const fileUrl   = joinUrl(baseUrl, safeFolder, safeFile);

  try {
    // ── Step 1: Create the job folder (MKCOL) ─────────────────────────────────
    // 405 = already exists — that is fine.
    const mkcolRes = await fetch(folderUrl, {
      method: "MKCOL",
      headers: { Authorization: authHeader },
    });

    if (!mkcolRes.ok && mkcolRes.status !== 405) {
      const mkcolBody = await mkcolRes.text().catch(() => "");
      console.error(
        `[nextcloud/upload] MKCOL failed — status=${mkcolRes.status} url=${folderUrl} body=${mkcolBody}`
      );
      // Non-fatal — try the upload anyway (folder may already exist)
    }

    // ── Step 2: Upload the file (PUT) ─────────────────────────────────────────
    const body = await req.arrayBuffer();

    const putRes = await fetch(fileUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": req.headers.get("Content-Type") ?? "application/octet-stream",
      },
      body,
    });

    if (putRes.ok || putRes.status === 201 || putRes.status === 204) {
      return NextResponse.json({
        ok: true,
        path: `${safeFolder}/${safeFile}`,
        // Relative path inside Nextcloud (no credentials) — useful for Share API
        ncPath: `/${safeFolder}/${safeFile}`,
      });
    }

    const errBody = await putRes.text().catch(() => "");
    console.error(
      `[nextcloud/upload] PUT failed — status=${putRes.status} url=${fileUrl} body=${errBody}`
    );
    return NextResponse.json(
      { error: `Nextcloud PUT returned ${putRes.status}`, detail: errBody },
      { status: 502 }
    );
  } catch (err) {
    console.error("[nextcloud/upload] Network/fetch error:", err);
    return NextResponse.json({ error: "Upload network error", detail: String(err) }, { status: 500 });
  }
}

