import { NextRequest, NextResponse } from "next/server";

/**
 * Nextcloud OCS Share API proxy — creates a public share link for a given path.
 *
 * Share API URL: https://sftp.dsudiscovery.com:8443/nextcloud-php/ocs/v2.php/apps/files_sharing/api/v1/shares
 *
 * POST /api/nextcloud/share
 * Body JSON: { path: string; password?: string; expireDate?: string }
 *
 * Returns: { ok: true; shareUrl: string; shareId: string; sharePassword?: string }
 */
export const runtime = "edge";

/** Generate a cryptographically random 8-character alphanumeric password. */
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => chars[b % chars.length]).join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      path:        string;
      password?:   string;
      expireDate?: string;
    };

    const { path, expireDate } = body;

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    // ── Read env vars ──────────────────────────────────────────────────────────
    const ocsUrl   = process.env.NEXT_PUBLIC_NEXTCLOUD_SHARE_URL;
    const username = process.env.NEXTCLOUD_USERNAME ?? "admin";
    const pw       = process.env.NEXTCLOUD_PASSWORD;

    if (!ocsUrl || !pw) {
      console.error("[nextcloud/share] Missing NEXT_PUBLIC_NEXTCLOUD_SHARE_URL or NEXTCLOUD_PASSWORD");
      return NextResponse.json({ error: "Nextcloud Share API not configured" }, { status: 503 });
    }

    // Always generate a fresh 8-char password for the share link.
    // This satisfies Nextcloud's minimum-complexity policies and guarantees
    // the share is never publicly accessible without the password.
    const sharePassword = generatePassword();

    const credentials = btoa(`${username}:${pw}`);

    // ── Build OCS form body (application/x-www-form-urlencoded) ───────────────
    const formData = new URLSearchParams();
    formData.set("path",        path);
    formData.set("shareType",   "3");   // 3 = public link
    formData.set("permissions", "1");   // 1 = read-only
    formData.set("password",    sharePassword);
    if (expireDate) formData.set("expireDate", expireDate);

    console.log(`[nextcloud/share] Creating share for path="${path}" at ${ocsUrl}`);

    const ocsResponse = await fetch(ocsUrl, {
      method: "POST",
      headers: {
        Authorization:    `Basic ${credentials}`,
        "OCS-APIRequest": "true",
        "Content-Type":   "application/x-www-form-urlencoded",
        Accept:           "application/json",
      },
      body: formData.toString(),
    });

    console.log(`[nextcloud/share] OCS HTTP status: ${ocsResponse.status}`);

    // OCS always returns HTTP 200 even on failure; check ocs.meta.statuscode.
    // The server can respond with either JSON (Accept header) or XML fallback.
    const rawText = await ocsResponse.text();

    let data: {
      ocs?: {
        data?: { url?: string; id?: string; token?: string };
        meta?: { status?: string; statuscode?: number; message?: string };
      };
    } = {};

    try {
      data = JSON.parse(rawText);
    } catch {
      // Server ignored our Accept header and returned XML — log it clearly
      console.error(
        "[nextcloud/share] OCS returned non-JSON (possibly XML). Full response body:\n",
        rawText,
      );
      return NextResponse.json(
        { error: "OCS API returned XML instead of JSON — check server logs for raw response", detail: rawText.slice(0, 500) },
        { status: 502 },
      );
    }

    const ocsStatusCode = data?.ocs?.meta?.statuscode ?? -1;
    const ocsMessage    = data?.ocs?.meta?.message    ?? "No message";

    // OCS statuscode 100 = OK. Anything else is a failure.
    if (ocsStatusCode !== 100) {
      console.error(
        `[nextcloud/share] OCS failure — statuscode=${ocsStatusCode} message="${ocsMessage}"`,
        "\nFull OCS response:", JSON.stringify(data),
      );
      return NextResponse.json(
        { error: ocsMessage, ocsStatusCode },
        { status: 502 },
      );
    }

    const shareUrl = data?.ocs?.data?.url;
    const shareId  = String(data?.ocs?.data?.id ?? data?.ocs?.data?.token ?? "");

    if (!shareUrl) {
      console.error("[nextcloud/share] OCS status 100 but no URL returned:", JSON.stringify(data));
      return NextResponse.json(
        { error: "OCS returned success but no share URL", ocsStatusCode: 100 },
        { status: 502 },
      );
    }

    console.log(`[nextcloud/share] Share created — id=${shareId} url=${shareUrl}`);
    // Return the generated password so the caller can display it to the user.
    return NextResponse.json({ ok: true, shareUrl, shareId, sharePassword });

  } catch (err) {
    console.error("[nextcloud/share] Unexpected error:", err);
    return NextResponse.json({ error: "Share creation failed", detail: String(err) }, { status: 500 });
  }
}

