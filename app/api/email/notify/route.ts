import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildStaffEmailHtml, buildClientReceiptHtml } from "@/lib/email-templates";

// Edge-compatible — works on Cloudflare Pages via next-on-pages
export const runtime = "edge";

const STAFF_EMAIL  = "sf@dsudiscovery.com";
const FROM_ADDRESS = "DSU Portal <noreply@dsudiscovery.com>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      refNumber: string;
      summary: Record<string, unknown>;
      clientEmail?: string;
      shareUrl?: string;  // Nextcloud public share link for the job folder
    };

    const { refNumber, summary, clientEmail, shareUrl } = body;

    if (!refNumber || !summary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[email/notify] RESEND_API_KEY is not set");
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    const resend  = new Resend(apiKey);
    const results: string[] = [];

    // ── 1. Staff job-ticket email ─────────────────────────────────────────────
    const { error: staffError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to:   STAFF_EMAIL,
      subject: `[DSU Job Ticket] ${refNumber} — ${
        (summary.matterInformation as Record<string, string>)?.caseMatterName ?? "New Production Request"
      }`,
      html: buildStaffEmailHtml(refNumber, summary, shareUrl),
    });

    if (staffError) {
      console.error("[email/notify] Staff email error:", staffError);
    } else {
      results.push("staff");
    }

    // ── 2. Client receipt email (if address provided) ─────────────────────────
    if (clientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      const { error: clientError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to:   clientEmail,
        subject: `Your DSU Production Request Has Been Received — ${refNumber}`,
        html: buildClientReceiptHtml(refNumber, summary, shareUrl),
      });

      if (clientError) {
        console.error("[email/notify] Client email error:", clientError);
      } else {
        results.push("client");
      }
    }

    return NextResponse.json({ ok: true, sent: results });
  } catch (err) {
    console.error("[email/notify] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

