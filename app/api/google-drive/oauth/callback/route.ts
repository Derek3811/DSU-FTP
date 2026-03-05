import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-drive-server";

export const runtime = "nodejs";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const successPage = (token: string) => `
  <html>
    <head><title>OAuth Saved</title></head>
    <body style="font-family: system-ui, sans-serif; background:#080b12; color:#f1f5f9; display:flex; min-height:100vh; align-items:center; justify-content:center; padding:2rem;">
      <div style="max-width:600px; background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:2rem;">
        <h1 style="margin:0 0 1rem;font-size:1.5rem;color:#10b981;">OAuth Token Ready</h1>
        <p>Copy the refresh token below and add it to <code style="background:#020617;padding:0.25rem 0.5rem;border-radius:0.25rem;">GOOGLE_OAUTH_REFRESH_TOKEN</code> in your environment.</p>
        <pre style="background:#020617;padding:1rem;border-radius:0.5rem;overflow:auto;">${escapeHtml(token)}</pre>
      </div>
    </body>
  </html>`;

const errorPage = (message: string) => `
  <html>
    <head><title>OAuth Error</title></head>
    <body style="font-family: system-ui, sans-serif; background:#080b12; color:#f1f5f9; display:flex; min-height:100vh; align-items:center; justify-content:center; padding:2rem;">
      <div style="max-width:600px; background:#0f172a; border:1px solid #1e293b; border-radius:1rem; padding:2rem;">
        <h1 style="margin:0 0 1rem;font-size:1.5rem;color:#f87171;">OAuth Error</h1>
        <p>${escapeHtml(message)}</p>
      </div>
    </body>
  </html>`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.warn("[google-drive/oauth/callback] OAuth error response", error);
    return NextResponse.text(errorPage(`Google returned an error: ${error}`), { headers: { "Content-Type": "text/html" } });
  }

  if (!code) {
    return new NextResponse(errorPage("Missing authorization code."), { headers: { "Content-Type": "text/html" } });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const refreshToken = tokens.refresh_token;
    return new NextResponse(successPage(refreshToken), { headers: { "Content-Type": "text/html" } });
  } catch (err) {
    console.error("[google-drive/oauth/callback]", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new NextResponse(errorPage(message), { headers: { "Content-Type": "text/html" } });
  }
}
