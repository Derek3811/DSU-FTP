/**
 * Email templates for DSU Litigation Support Portal
 * Uses plain HTML tables — renders reliably in all email clients.
 */

// ─── Shared styles ────────────────────────────────────────────────────────────

const NAVY    = "#0A192F";
const NAVY_L  = "#112240";
const SLATE   = "#4A5568";
const WHITE   = "#F8FAFC";
const BORDER  = "#CBD5E0";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";
const SANS    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-family:${SANS};font-size:12px;font-weight:700;color:${SLATE};text-transform:uppercase;letter-spacing:0.08em;width:38%;vertical-align:top;">
        ${label}
      </td>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-family:${SANS};font-size:13px;color:#1A202C;vertical-align:top;">
        ${value || "—"}
      </td>
    </tr>`;
}

function sectionHeader(title: string): string {
  return `
    <tr>
      <td colspan="2" style="padding:10px 16px;background:${NAVY};font-family:${SANS};font-size:11px;font-weight:700;color:#90A4B8;text-transform:uppercase;letter-spacing:0.12em;">
        ${title}
      </td>
    </tr>`;
}

// ─── Staff job-ticket email ───────────────────────────────────────────────────

export function buildStaffEmailHtml(refNumber: string, summary: Record<string, unknown>, shareUrl?: string): string {
  const m  = (summary.matterInformation  as Record<string, string>)  ?? {};
  const ps = (summary.productionSpecifications as Record<string, unknown>) ?? {};
  const st = (summary.secureTransfer     as Record<string, unknown>) ?? {};
  const sec = (st.security               as Record<string, unknown>) ?? {};

  const specEntries = Object.entries(
    (ps.specs as Record<string, unknown>) ?? {}
  );

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DSU Job Ticket — ${refNumber}</title></head>
<body style="margin:0;padding:0;background:#EDF2F7;font-family:${SANS};">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDF2F7;padding:32px 0;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${WHITE};border-radius:4px;overflow:hidden;border:1px solid ${BORDER};">

        <!-- Header -->
        <tr>
          <td style="background:${NAVY};padding:28px 32px;">
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#4A6FA5;font-family:${SANS};">DSU Discovery — Litigation Support</p>
            <h1 style="margin:8px 0 4px;font-size:22px;font-weight:700;color:${WHITE};font-family:${SANS};letter-spacing:-0.02em;">New Production Job Ticket</h1>
            <p style="margin:0;font-size:12px;color:#718096;font-family:${SANS};">HIPAA-Compliant &nbsp;·&nbsp; SOC 2 Type II &nbsp;·&nbsp; Chain of Custody</p>
          </td>
        </tr>

        <!-- Reference banner -->
        <tr>
          <td style="background:${NAVY_L};padding:16px 32px;border-bottom:1px solid #1A2E52;">
            <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#4A6FA5;font-family:${SANS};">Reference Number</p>
            <p style="margin:4px 0 0;font-size:24px;font-weight:700;font-family:${MONO};color:${WHITE};letter-spacing:0.08em;">${refNumber}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 0 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              ${sectionHeader("Matter Information")}
              ${row("Case / Matter Name", m.caseMatterName ?? "")}
              ${row("Matter Number", `<span style="font-family:${MONO};font-size:12px;">${m.matterNumber ?? ""}</span>`)}
              ${row("Lead Attorney / Paralegal", m.leadAttorney ?? "")}
              ${row("Hard Deadline", m.hardDeadline ? m.hardDeadline.replace("T", " at ") : "—")}

              ${sectionHeader("Production Specifications")}
              ${row("Service Category", String(ps.serviceCategoryLabel ?? "—"))}
              ${specEntries.map(([k, v]) =>
                row(
                  k.replace(/([A-Z])/g, " $1").trim(),
                  typeof v === "boolean" ? (v ? "Yes" : "No") : String(v ?? "—")
                )
              ).join("")}

              ${sectionHeader("Secure File Transfer")}
              ${row("Files Uploaded", String(st.fileCount ?? 0))}
              ${row("File Names", Array.isArray(st.fileNames) ? (st.fileNames as string[]).join("<br>") : "—")}
              ${row("Total Size", (() => {
                const bytes = Number(st.totalBytes ?? 0);
                if (bytes < 1024) return `${bytes} B`;
                if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
              })())}
              ${row("Password Protected", sec.passwordProtected ? "Yes" : "No")}
              ${row("Expiration Date", sec.expirationEnabled ? String(sec.expirationDate ?? "—") : "None")}
              ${row("Delete After Download", sec.deleteAfterDownload ? "Yes" : "No")}
              ${row("Authorized Reception", sec.authorizedReception ? "Yes — Authorized to leave with Reception/Security" : "No")}
              ${st.specialInstructions ? row("Special Instructions", String(st.specialInstructions)) : ""}

              ${sectionHeader("Submission Metadata")}
              ${row("Submitted At", String(summary.submittedAt ?? "—"))}
              ${row("Portal", "DSU Secure Litigation Portal v2.0")}
              ${shareUrl ? row("Nextcloud Share Link", `<a href="${shareUrl}" style="color:#2B6CB0;font-family:${MONO};font-size:12px;">${shareUrl}</a>`) : ""}

            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#EDF2F7;padding:20px 32px;border-top:1px solid ${BORDER};">
            <p style="margin:0;font-size:11px;color:#718096;font-family:${SANS};line-height:1.6;">
              This is an automated production intake notification from the DSU Secure Litigation Portal.
              Do not reply to this email. For urgent matters, call our production team.<br>
              <strong style="color:${SLATE};">415.398.2111 &mdash; Option 3</strong> &nbsp;&middot;&nbsp;
              <strong style="color:${SLATE};">sf@dsudiscovery.com</strong><br>
              <strong style="color:${SLATE};">portal.dsudiscovery.com</strong>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

// ─── Client receipt email ─────────────────────────────────────────────────────

export function buildClientReceiptHtml(refNumber: string, summary: Record<string, unknown>, shareUrl?: string): string {
  const m  = (summary.matterInformation  as Record<string, string>)  ?? {};
  const ps = (summary.productionSpecifications as Record<string, unknown>) ?? {};
  const st = (summary.secureTransfer     as Record<string, unknown>) ?? {};

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DSU Production Receipt — ${refNumber}</title></head>
<body style="margin:0;padding:0;background:#EDF2F7;font-family:${SANS};">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDF2F7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${WHITE};border-radius:4px;overflow:hidden;border:1px solid ${BORDER};">

        <!-- Header -->
        <tr>
          <td style="background:${NAVY};padding:24px 28px;">
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#4A6FA5;font-family:${SANS};">DSU Discovery</p>
            <h1 style="margin:6px 0 4px;font-size:20px;font-weight:700;color:${WHITE};font-family:${SANS};">Production Request Received</h1>
            <p style="margin:0;font-size:12px;color:#718096;font-family:${SANS};">Your file has been securely received and is in our production queue.</p>
          </td>
        </tr>

        <!-- Reference -->
        <tr>
          <td style="background:${NAVY_L};padding:14px 28px;border-bottom:1px solid #1A2E52;">
            <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#4A6FA5;font-family:${SANS};font-weight:700;">Your Reference Number</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:700;font-family:${MONO};color:${WHITE};letter-spacing:0.08em;">${refNumber}</p>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:20px 28px 8px;">
            <p style="margin:0 0 16px;font-size:14px;color:#2D3748;font-family:${SANS};line-height:1.6;">
              Dear ${m.leadAttorney || "Client"},<br><br>
              This email confirms that DSU Discovery has received your production request.
              Our team will process your job and reach out with updates.
              Please save your reference number for all correspondence regarding this matter.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:4px;overflow:hidden;">
              ${row("Case / Matter Name", m.caseMatterName ?? "")}
              ${row("Matter Number", `<span style="font-family:${MONO};font-size:12px;">${m.matterNumber ?? ""}</span>`)}
              ${row("Service Requested", String(ps.serviceCategoryLabel ?? "—"))}
              ${row("Hard Deadline", m.hardDeadline ? m.hardDeadline.replace("T", " at ") : "—")}
              ${row("Files Received", String(st.fileCount ?? 0))}
              ${shareUrl ? row("Secure Job Folder", `<a href="${shareUrl}" style="color:#2B6CB0;font-size:13px;">View your files on DSU Nextcloud</a>`) : ""}
            </table>
          </td>
        </tr>

        <!-- Next steps -->
        <tr>
          <td style="padding:16px 28px 24px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.10em;color:${SLATE};font-family:${SANS};">What Happens Next</p>
            <ul style="margin:0;padding-left:16px;color:#4A5568;font-size:13px;font-family:${SANS};line-height:1.8;">
              <li>Our production team will confirm receipt within 1 business hour.</li>
              <li>You will receive milestone updates as your job progresses.</li>
              <li>For urgent matters, call our 24/7 hotline and provide your reference number.</li>
            </ul>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#EDF2F7;padding:16px 28px;border-top:1px solid ${BORDER};">
            <p style="margin:0;font-size:11px;color:#718096;font-family:${SANS};line-height:1.6;">
              DSU Discovery, LLC &nbsp;&middot;&nbsp; <strong>portal.dsudiscovery.com</strong><br>
              415.398.2111 &mdash; Option 3 &nbsp;&middot;&nbsp; sf@dsudiscovery.com<br>
              HIPAA-Compliant &nbsp;&middot;&nbsp; SOC 2 Type II Certified &nbsp;&middot;&nbsp; Chain of Custody Maintained
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}
