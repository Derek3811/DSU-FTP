import { NextRequest, NextResponse } from "next/server";
import { getAuthorizeUrl } from "@/lib/google-drive-server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const authorizeUrl = getAuthorizeUrl();
    return NextResponse.redirect(authorizeUrl);
  } catch (err) {
    console.error("[google-drive/oauth/authorize]", err);
    return NextResponse.json({ error: "OAuth credentials are not configured" }, { status: 503 });
  }
}
