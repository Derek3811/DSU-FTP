"use client";

import { useState } from "react";
import {
  CheckCircleIcon, ClipboardCopyIcon, DownloadIcon, PrinterIcon,
  BriefcaseIcon, HashIcon, UserIcon, CalendarIcon, LayersIcon,
  FileIcon, ShieldCheckIcon, AlertCircleIcon, ArrowLeftIcon,
  ArrowRightIcon, MailIcon, UploadCloudIcon, LinkIcon,
} from "lucide-react";
import type { MatterInfo } from "@/components/portal/MatterInformationStep";
import type { ProductionSpecs, ServiceCategoryId } from "@/components/portal/ProductionSpecsStep";
import type { SecureUploadData } from "@/components/portal/SecureFileUploadStep";
import { uploadFileToNextcloud, createNextcloudShare } from "@/lib/nextcloud";

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY        = "#07090F";
const ORANGE      = "#FF7A00";
const BLUE        = "#2563EB";
const GLASS       = "rgba(13,17,23,0.85)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRefNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DSU-${year}-${rand}`;
}

const CATEGORY_LABELS: Record<Exclude<ServiceCategoryId, null>, string> = {
  "trial-notebooks":       "Trial Notebooks / Witness Binders",
  "deposition-exhibits":   "Deposition Exhibits",
  "ediscovery":            "Digital Production / E-Discovery",
  "demonstratives":        "Courtroom Demonstratives (Oversize)",
  "blowbacks":             "High-Volume Blowbacks",
  "appellate-briefs":      "Appellate Briefs",
};

function buildSpecRows(specs: ProductionSpecs): { label: string; value: string }[] {
  const cat = specs.selectedCategory;
  if (!cat) return [];
  switch (cat) {
    case "trial-notebooks": {
      const s = specs.trialNotebook;
      return [
        { label: "Sets", value: s.numSets || "—" },
        { label: "Color Mode", value: s.colorMode === "bw" ? "Black & White" : s.colorMode === "mixed" ? "Mixed" : s.colorMode === "color" ? "Full Color" : "—" },
        { label: "Print Format", value: s.printFormat === "single" ? "Single-Sided" : s.printFormat === "double" ? "Double-Sided" : "—" },
        { label: "Slip Sheets", value: s.slipSheets || "None" },
        { label: "Tab Type", value: s.tabType === "custom" ? `Custom — ${s.customTabDescription}` : s.tabType || "—" },
        { label: "Binder Size", value: s.binderSize || "—" },
      ];
    }
    case "deposition-exhibits": {
      const s = specs.depositionExhibit;
      return [
        { label: "Binding Style", value: s.bindingStyle || "—" },
        { label: "Sets", value: s.numSets || "—" },
        { label: "Tab Type", value: s.tabType || "—" },
        { label: "Print Format", value: s.printFormat === "single" ? "Single-Sided" : s.printFormat === "double" ? "Double-Sided" : "—" },
        { label: "Bates Range", value: s.batesStart && s.batesEnd ? `${s.batesStart} — ${s.batesEnd}` : "Not specified" },
        { label: "Service Level", value: s.serviceLevel === "rush" ? "Rush" : s.serviceLevel === "standard" ? "Standard" : "—" },
        { label: "Deadline", value: s.deadline ? `${s.deadline}${s.deadlineTime ? ` at ${s.deadlineTime}` : ""}` : "—" },
      ];
    }
    case "ediscovery": {
      const s = specs.eDiscovery;
      return [
        { label: "Output", value: s.outputDeliverable?.toUpperCase() || "—" },
        { label: "Load Files", value: s.loadFiles || "None" },
        { label: "Bates Range", value: s.batesStart && s.batesEnd ? `${s.batesStart} — ${s.batesEnd}` : "Not specified" },
        { label: "Confidentiality", value: s.confidentialityEndorsement || "None" },
        { label: "OCR Required", value: s.ocrRequired ? "Yes" : "No" },
        { label: "Searchable PDF", value: s.searchablePdf ? "Yes" : "No" },
      ];
    }
    case "demonstratives": {
      const s = specs.demonstrative;
      return [
        { label: "Quantity", value: s.quantity || "—" },
        { label: "Size", value: s.size === "custom" ? s.customSize || "Custom" : s.size || "—" },
        { label: "Mounting", value: s.mounting || "None" },
      ];
    }
    case "blowbacks": {
      const s = specs.blowback;
      return [
        { label: "Paper Type", value: s.paperType === "3-hole" ? "3-Hole Punch" : s.paperType === "regular" ? "Regular" : "—" },
        { label: "Sets", value: s.numSets || "—" },
        { label: "Binding Style", value: s.bindingStyle || "—" },
        { label: "Slip Sheets", value: s.slipSheetInstructions || "None" },
        { label: "Service Level", value: s.serviceLevel === "rush" ? "Rush" : s.serviceLevel === "standard" ? "Standard" : "—" },
        { label: "Deadline", value: s.deadline ? `${s.deadline}${s.deadlineTime ? ` at ${s.deadlineTime}` : ""}` : "—" },
      ];
    }
    case "appellate-briefs": {
      const s = specs.appellateBrief;
      return [
        { label: "Regulatory Compliance", value: s.regulatoryCompliance || "—" },
        { label: "Copies", value: s.numberOfCopies || "—" },
      ];
    }
    default: return [];
  }
}

export function buildJobSummary(
  refNumber: string,
  matter: MatterInfo,
  specs: ProductionSpecs,
  upload: SecureUploadData,
) {
  const cat = specs.selectedCategory;
  const camelKey = cat ? cat.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()) : null;
  const specData = camelKey ? (specs as Record<string, unknown>)[camelKey] ?? {} : {};
  return {
    schemaVersion: "1.0",
    referenceNumber: refNumber,
    submittedAt: new Date().toISOString(),
    portal: "DSU Secure Litigation Portal v2.0",
    contact: { phone: "415.398.2111 — Option 3", email: "sf@dsudiscovery.com", address: "356 6th Street, San Francisco, CA 94103" },
    matterInformation: { caseMatterName: matter.caseMatterName, matterNumber: matter.matterNumber, leadAttorney: matter.leadAttorney, hardDeadline: `${matter.hardDeadlineDate}T${matter.hardDeadlineTime}` },
    productionSpecifications: { serviceCategory: cat, serviceCategoryLabel: cat ? CATEGORY_LABELS[cat] : null, specs: specData },
    secureTransfer: {
      fileCount: upload.files.length,
      fileNames: upload.files.map((f) => f.file.name),
      totalBytes: upload.files.reduce((a, f) => a + f.file.size, 0),
      security: { passwordProtected: upload.security.passwordEnabled, expirationEnabled: upload.security.expirationEnabled, expirationDate: upload.security.expirationDate || null, deleteAfterDownload: upload.security.deleteAfterDownload, authorizedReception: upload.security.authorizedReception },
      specialInstructions: upload.specialInstructions || null,
    },
  };
}

// ─── Submission phase type ────────────────────────────────────────────────────

type SubmissionPhase =
  | { kind: "idle" }
  | { kind: "uploading"; current: number; total: number; fileName: string }
  | { kind: "summary" }
  | { kind: "share" }
  | { kind: "email" }
  | { kind: "done" };

// ─── Progress overlay ───────────────────────────────────────���─────────────────

function ProgressOverlay({ phase }: { phase: SubmissionPhase }) {
  const steps: { label: string; icon: React.ReactNode; phaseKind: string }[] = [
    { label: "Uploading files",         icon: <UploadCloudIcon className="w-4 h-4" />, phaseKind: "uploading" },
    { label: "Uploading job summary",   icon: <FileIcon className="w-4 h-4" />,        phaseKind: "summary" },
    { label: "Generating share link",   icon: <LinkIcon className="w-4 h-4" />,        phaseKind: "share" },
    { label: "Sending notifications",   icon: <MailIcon className="w-4 h-4" />,        phaseKind: "email" },
  ];

  const phaseOrder = ["uploading","summary","share","email","done"];
  const currentIdx = phaseOrder.indexOf(phase.kind);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)" }}
      role="status" aria-live="polite" aria-label="Submission in progress">
      <div className="rounded-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-6"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}>

        {/* Animated icon */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,122,0,0.1)", border: "2px solid rgba(255,122,0,0.3)" }}>
          <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="rgba(255,122,0,0.2)" strokeWidth="3" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: "#F1F5F9" }}>Submitting Production Request</p>
          <p className="text-xs mt-1" style={{ color: "#64748B" }}>Please do not close this window.</p>
        </div>

        {/* Step list */}
        <ol className="w-full flex flex-col gap-2.5" role="list">
          {steps.map((s, i) => {
            const stepIdx  = phaseOrder.indexOf(s.phaseKind);
            const isDone   = currentIdx > stepIdx;
            const isActive = currentIdx === stepIdx;
            return (
              <li key={s.phaseKind} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isDone ? "#22C55E" : isActive ? ORANGE : "rgba(255,255,255,0.06)",
                    color:      isDone ? "#07090F" : isActive ? "#07090F" : "#334155",
                    boxShadow:  isActive ? "0 0 10px rgba(255,122,0,0.4)" : "none",
                  }}>
                  {isDone
                    ? <CheckCircleIcon className="w-4 h-4" />
                    : isActive
                    ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    : s.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: isDone ? "#22C55E" : isActive ? "#F1F5F9" : "#334155" }}>
                    {s.label}
                    {isActive && phase.kind === "uploading" && (
                      <span style={{ color: "#64748B" }}> — {phase.fileName} ({phase.current}/{phase.total})</span>
                    )}
                  </p>
                  {isActive && phase.kind === "uploading" && (
                    <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((phase.current / phase.total) * 100)}%`, background: ORANGE }} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}



function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="text-xs font-medium flex-shrink-0" style={{ color: "#475569" }}>{label}</span>
      <span className={`text-sm text-right ${mono ? "font-mono" : "font-medium"}`} style={{ color: "#E2E8F0" }}>{value}</span>
    </div>
  );
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${GLASS_BORDER}` }}>
      <div className="flex items-center gap-2.5 px-5 py-3" style={{ background: "rgba(255,122,0,0.08)", borderBottom: "1px solid rgba(255,122,0,0.15)" }}>
        <span style={{ color: ORANGE }}>{icon}</span>
        <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>{title}</h3>
      </div>
      <div className="px-5 pb-2" style={{ background: GLASS }}>{children}</div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ refNumber, matter, shareUrl, sharePassword, onStartNew }: {
  refNumber: string; matter: MatterInfo; shareUrl?: string; sharePassword?: string; onStartNew: () => void;
}) {
  const manualLink = !shareUrl || shareUrl === "Manual Link Pending";
  return (
    <section aria-labelledby="success-heading" className="font-sans">
      <div className="flex flex-col items-center text-center gap-5 py-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)", boxShadow: "0 0 24px rgba(34,197,94,0.15)" }}>
          <CheckCircleIcon className="w-8 h-8" style={{ color: "#22C55E" }} />
        </div>

        <div>
          <h2 id="success-heading" className="text-xl font-bold tracking-tight" style={{ color: "#F1F5F9" }}>
            Production Request Submitted
          </h2>
          <p className="text-sm mt-2 max-w-md mx-auto leading-relaxed" style={{ color: "#64748B" }}>
            Your job has been queued and our production team at{" "}
            <a href="mailto:sf@dsudiscovery.com" style={{ color: ORANGE }}>sf@dsudiscovery.com</a>{" "}
            will contact you shortly.
          </p>
        </div>

        {/* Reference card */}
        <div className="w-full max-w-sm rounded-xl px-6 py-5"
          style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(12px)" }}>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "#334155" }}>
            Reference Number
          </p>
          <p className="text-3xl font-mono font-bold tracking-wider" style={{ color: "#F1F5F9" }}>{refNumber}</p>
          <p className="text-xs mt-2" style={{ color: "#475569" }}>
            Quote this number in all correspondence with DSU Discovery.
          </p>
        </div>

        {/* Share password — glowing orange box */}
        {sharePassword && (
          <div className="w-full max-w-sm rounded-xl px-6 py-4"
            style={{
              background: "rgba(255,122,0,0.08)",
              border: "1px solid rgba(255,122,0,0.35)",
              boxShadow: "0 0 20px rgba(255,122,0,0.12)",
            }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: ORANGE }}>
              File Access Password
            </p>
            <p className="text-2xl font-mono font-bold tracking-widest" style={{ color: "#F1F5F9" }}>
              {sharePassword}
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "#94A3B8" }}>
              Share this password with anyone who needs to access your uploaded files via the secure link.
              {matter.clientEmail && " A copy has been sent to your email."}
            </p>
          </div>
        )}

        {/* Share link — or manual pending notice */}
        {shareUrl && (
          <div className="w-full max-w-sm rounded-xl px-5 py-3"
            style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(12px)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#334155" }}>
              Secure File Link
            </p>
            {manualLink ? (
              <p className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                Manual Link Pending — DSU staff will generate and send this link shortly.
              </p>
            ) : (
              <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs font-mono break-all transition-colors"
                style={{ color: ORANGE }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#FF9A3C"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = ORANGE; }}>
                {shareUrl}
              </a>
            )}
          </div>
        )}

        {/* What happens next */}
        <div className="w-full max-w-sm rounded-xl px-5 py-4 text-left"
          style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#334155" }}>What happens next</p>
          <ol className="flex flex-col gap-2.5" role="list">
            {[
              "Email confirmation sent to your address",
              "DSU team reviews job specs within 1 business hour",
              "Production begins — you will receive status updates",
              "Completed files delivered via secure Nextcloud link",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: "#94A3B8" }}>
                <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: ORANGE, color: "#07090F" }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Contact */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs" style={{ color: "#334155" }}>
          <span>415.398.2111 — Option 3</span>
          <span>sf@dsudiscovery.com</span>
          <span>Mon–Fri 7:30 AM–11 PM · Sat–Sun 12 AM–8 PM</span>
        </div>

        <button type="button" onClick={onStartNew}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors"
          style={{ background: ORANGE, color: "#07090F", boxShadow: "0 0 16px rgba(255,122,0,0.35)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FF9A3C"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ORANGE; }}>
          <ArrowRightIcon className="w-4 h-4" /> Submit Another Request
        </button>
      </div>
    </section>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConfirmationStepProps {
  matter: MatterInfo;
  specs: ProductionSpecs;
  upload: SecureUploadData;
  onBack: () => void;
  onStartNew: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConfirmationStep({ matter, specs, upload, onBack, onStartNew }: ConfirmationStepProps) {
  const [refNumber] = useState(generateRefNumber);
  const [phase,        setPhase]       = useState<SubmissionPhase>({ kind: "idle" });
  const [submitted,    setSubmitted]   = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [copied,       setCopied]      = useState(false);
  const [shareUrl,     setShareUrl]    = useState<string | undefined>();
  const [sharePassword, setSharePassword] = useState<string | undefined>();

  const cat      = specs.selectedCategory;
  const specRows = buildSpecRows(specs);
  const submitting = phase.kind !== "idle";

  async function handleSubmit() {
    setError(null);

    // ── Step 1: Upload user files ─────────────────────────────────────────────
    const folder = refNumber;

    if (upload.files.length > 0) {
      for (let i = 0; i < upload.files.length; i++) {
        const entry = upload.files[i];
        setPhase({ kind: "uploading", current: i + 1, total: upload.files.length, fileName: entry.file.name });
        try {
          await uploadFileToNextcloud(entry.file, folder, () => {});
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setError(`Failed to upload "${entry.file.name}": ${msg}. Please go back and retry.`);
          setPhase({ kind: "idle" });
          return; // Stop — do not send email without files
        }
      }
    }

    // ── Step 2: Upload job_summary.json ───────────────────────────────────────
    setPhase({ kind: "summary" });
    const summary = buildJobSummary(refNumber, matter, specs, upload);
    try {
      const summaryRes = await fetch(
        `/api/nextcloud/upload?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(`job_summary_${refNumber}.json`)}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(summary, null, 2) },
      );
      if (!summaryRes.ok) {
        const d = await summaryRes.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? `HTTP ${summaryRes.status}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to upload job summary: ${msg}. Please try again.`);
      setPhase({ kind: "idle" });
      return;
    }

    // ── Step 3: Generate OCS share link ───────────────────────────────────────
    setPhase({ kind: "share" });
    let resolvedShareUrl: string = "Manual Link Pending";
    let resolvedPassword: string | undefined;
    try {
      const result = await createNextcloudShare(`/${folder}`, upload.security);
      resolvedShareUrl = result.shareUrl;
      resolvedPassword = result.sharePassword;
    } catch (err) {
      // Non-fatal — email still sends; staff will generate link manually
      console.warn("[ConfirmationStep] Share link generation failed:", err);
    }
    setShareUrl(resolvedShareUrl);
    setSharePassword(resolvedPassword);

    // ── Step 4: Send email notifications ─────────────────────────────────────
    setPhase({ kind: "email" });
    try {
      await fetch("/api/email/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refNumber,
          summary,
          shareUrl:     resolvedShareUrl,
          sharePassword: resolvedPassword,
          clientEmail:  matter.clientEmail || undefined,
        }),
      });
    } catch (err) {
      console.warn("[ConfirmationStep] Email notification failed:", err);
      // Non-fatal — job is already uploaded; show success anyway
    }

    setPhase({ kind: "done" });
    setSubmitted(true);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(refNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const summary = buildJobSummary(refNumber, matter, specs, upload);
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `job_summary_${refNumber}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  if (submitted) {
    return <SuccessScreen refNumber={refNumber} matter={matter} shareUrl={shareUrl} sharePassword={sharePassword} onStartNew={onStartNew} />;
  }

  return (
    <section aria-labelledby="step4-heading" className="font-sans">
      {/* Progress overlay — rendered on top while submitting */}
      {submitting && <ProgressOverlay phase={phase} />}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
            style={{ background: ORANGE, color: "#07090F" }} aria-hidden>4</span>
          <h2 id="step4-heading" className="text-lg font-semibold tracking-tight" style={{ color: NAVY }}>
            Review &amp; Submit
          </h2>
        </div>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Review your job details below. Submitting will send a notification to our team and upload your job ticket to the DSU Nextcloud server.
        </p>
      </div>

      {/* Reference number banner */}
      <div className="rounded-xl mb-6 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ background: NAVY }}>
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#475569" }}>
            Production Reference Number
          </p>
          <p className="text-2xl font-mono font-bold tracking-wider" style={{ color: "#fff" }}>{refNumber}</p>
          <p className="text-xs mt-1" style={{ color: "#475569" }}>Save this number to track your request.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button type="button" onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: copied ? "#14532D33" : "#1E293B", border: "1px solid #334155", color: copied ? "#4ADE80" : "#CBD5E1", cursor: "pointer" }}>
            <ClipboardCopyIcon className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "#1E293B", border: "1px solid #334155", color: "#CBD5E1", cursor: "pointer" }}>
            <DownloadIcon className="w-3.5 h-3.5" /> job_summary.json
          </button>
          <button type="button" onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "#1E293B", border: "1px solid #334155", color: "#CBD5E1", cursor: "pointer" }}>
            <PrinterIcon className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex flex-col gap-4 mb-6">

        <SectionCard icon={<BriefcaseIcon className="w-4 h-4" />} title="Matter Information">
          <Row label="Case / Matter Name"       value={matter.caseMatterName || "—"} />
          <Row label="Matter Number"            value={matter.matterNumber   || "—"} mono />
          <Row label="Lead Attorney / Paralegal" value={matter.leadAttorney  || "—"} />
          <Row label="Hard Deadline"            value={matter.hardDeadlineDate && matter.hardDeadlineTime ? `${matter.hardDeadlineDate} at ${matter.hardDeadlineTime}` : matter.hardDeadlineDate || "—"} />
        </SectionCard>

        <SectionCard icon={<LayersIcon className="w-4 h-4" />} title="Production Specifications">
          <Row label="Service Type" value={cat ? CATEGORY_LABELS[cat] : "Not selected"} />
          {specRows.map((r) => <Row key={r.label} label={r.label} value={r.value} />)}
          {specRows.length === 0 && (
            <p className="py-3 text-sm" style={{ color: "#94A3B8" }}>No specification details recorded.</p>
          )}
        </SectionCard>

        <SectionCard icon={<FileIcon className="w-4 h-4" />} title="Uploaded Files">
          {upload.files.length === 0 ? (
            <p className="py-3 text-sm" style={{ color: "#94A3B8" }}>No files uploaded.</p>
          ) : (
            upload.files.map((f, i) => (
              <div key={f.id} className="flex items-center justify-between py-2.5 gap-3"
                style={{ borderBottom: i < upload.files.length - 1 ? "1px solid #F1F5F9" : undefined }}>
                <span className="text-sm font-medium truncate" style={{ color: NAVY }}>{f.file.name}</span>
                <span className="text-xs font-mono flex-shrink-0" style={{ color: "#64748B" }}>
                  {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ))
          )}
          {upload.specialInstructions && (
            <Row label="Special Instructions" value={upload.specialInstructions} />
          )}
        </SectionCard>

        <SectionCard icon={<ShieldCheckIcon className="w-4 h-4" />} title="Transfer Security">
          <Row label="Password Protected"   value={upload.security.passwordEnabled   ? "Yes" : "No"} />
          <Row label="Expiration Date"      value={upload.security.expirationEnabled && upload.security.expirationDate ? upload.security.expirationDate : "None"} />
          <Row label="Delete After Download" value={upload.security.deleteAfterDownload  ? "Yes" : "No"} />
          <Row label="Authorized Reception"  value={upload.security.authorizedReception  ? "Yes" : "No"} />
        </SectionCard>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
          <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
          <p className="text-sm" style={{ color: "#B91C1C" }}>{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button type="button" onClick={onBack} disabled={submitting}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors"
          style={{ background: "#F1F5F9", color: NAVY, border: "1px solid #E2E8F0", opacity: submitting ? 0.5 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
          onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "#E2E8F0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F1F5F9"; }}>
          <ArrowLeftIcon className="w-4 h-4" /> Back to File Upload
        </button>

        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors"
          style={{ background: submitting ? "rgba(255,122,0,0.5)" : ORANGE, color: "#07090F", cursor: submitting ? "wait" : "pointer", boxShadow: submitting ? "none" : "0 0 16px rgba(255,122,0,0.35)" }}>
          {submitting ? (
            <><svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>Processing...</>
          ) : (
            <><UploadCloudIcon className="w-4 h-4" /> Upload &amp; Submit Request</>
          )}
        </button>
      </div>
    </section>
  );
}
