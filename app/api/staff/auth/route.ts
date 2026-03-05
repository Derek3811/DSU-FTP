import { NextRequest, NextResponse } from "next/server";

/**
 * Simple staff authentication using environment-variable credentials.
 * Returns a signed session token in an HttpOnly cookie.
 *
 * Edge-compatible for Cloudflare Pages.
 *
 * To set credentials, add these env vars in your Cloudflare Pages dashboard:
 *   STAFF_EMAIL    — e.g. sf@dsudiscovery.com
 *   STAFF_PASSWORD — strong passphrase
 *   STAFF_SESSION_SECRET — random 32+ char string for token signing
 */
export const runtime = "edge";

const SESSION_COOKIE = "dsu_staff_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

async function signToken(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${payload}.${b64}`;
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return false;
    const payload = token.slice(0, lastDot);
    const expected = await signToken(payload, secret);
    return token === expected;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { email: string; password: string };

  const staffEmail = process.env.STAFF_EMAIL;
  const staffPassword = process.env.STAFF_PASSWORD;
  const secret = process.env.STAFF_SESSION_SECRET;

  if (!staffEmail || !staffPassword || !secret) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const emailMatch = body.email?.toLowerCase().trim() === staffEmail.toLowerCase().trim();
  const passMatch = body.password === staffPassword;

  if (!emailMatch || !passMatch) {
    // Add artificial delay to prevent timing attacks
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const tokenPayload = `staff:${expiresAt}`;
  const token = await signToken(tokenPayload, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/staff",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/staff",
    maxAge: 0,
  });
  return res;
}
