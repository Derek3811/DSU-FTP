"use client";

import { useState, useRef, useCallback } from "react";
import {
  UploadCloudIcon, FileIcon, FileTextIcon, FileImageIcon, FileArchiveIcon,
  XIcon, LockIcon, CalendarIcon, Trash2Icon, ShieldCheckIcon,
  EyeIcon, EyeOffIcon, UserCheckIcon, ArrowLeftIcon, ArrowRightIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY        = "#07090F";
const ORANGE      = "#FF7A00";
const GLASS       = "rgba(13,17,23,0.85)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.5rem",
  color: "#F1F5F9",
  fontSize: "0.875rem",
  width: "100%",
  height: "2.5rem",
  paddingLeft: "0.75rem",
  paddingRight: "0.75rem",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
function focusOn(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = ORANGE;
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,122,0,0.1)";
}
function focusOff(e: React.FocusEvent<HTMLInputElement>, err?: boolean) {
  e.currentTarget.style.borderColor = err ? "#EF4444" : "rgba(255,255,255,0.1)";
  e.currentTarget.style.boxShadow = "none";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  errorMessage?: string;
  remotePath?: string;
}

export interface TransferSecurity {
  passwordEnabled: boolean;
  password: string;
  expirationEnabled: boolean;
  expirationDate: string;
  deleteAfterDownload: boolean;
  authorizedReception: boolean;
}

export interface SecureUploadData {
  files: UploadedFile[];
  security: TransferSecurity;
  specialInstructions: string;
}

export const INITIAL_SECURE_UPLOAD: SecureUploadData = {
  files: [],
  security: { passwordEnabled: false, password: "", expirationEnabled: false, expirationDate: "", deleteAfterDownload: false, authorizedReception: false },
  specialInstructions: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","tiff","tif","bmp","webp"].includes(ext)) return <FileImageIcon className="w-4 h-4" />;
  if (["zip","tar","gz","rar","7z"].includes(ext)) return <FileArchiveIcon className="w-4 h-4" />;
  if (["pdf","doc","docx","txt","rtf","xls","xlsx","ppt","pptx","csv","msg","eml"].includes(ext)) return <FileTextIcon className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
}

// ─── Security toggle row ──────────────────────────────────────────────────────

function SecurityRow({ id, icon, label, description, badge, enabled, onToggle, children }: {
  id: string; icon: React.ReactNode; label: string; description: string;
  badge?: string; enabled: boolean; onToggle: (v: boolean) => void; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: `1px solid ${enabled ? "rgba(255,122,0,0.3)" : "rgba(255,255,255,0.08)"}`, background: enabled ? "rgba(255,122,0,0.08)" : "rgba(255,255,255,0.04)" }}>
      <button type="button" role="switch" aria-checked={enabled} aria-controls={`${id}-panel`}
        onClick={() => onToggle(!enabled)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: enabled ? ORANGE : "rgba(255,255,255,0.1)", color: enabled ? "#07090F" : "#94A3B8", transition: "all 0.15s" }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>{label}</span>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: ORANGE, color: "#07090F" }}>{badge}</span>
            )}
          </div>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#94A3B8" }}>{description}</p>
        </div>
        {/* Toggle pill */}
        <div className="flex-shrink-0 rounded-full relative" aria-hidden
          style={{ width: 40, height: 22, background: enabled ? ORANGE : "rgba(255,255,255,0.1)", transition: "background 0.2s" }}>
          <span className="absolute rounded-full"
            style={{ width: 18, height: 18, background: "#F1F5F9", top: 2, left: enabled ? 20 : 2, transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
      </button>
      {enabled && children && (
        <div id={`${id}-panel`} className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid rgba(255,122,0,0.2)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SecureFileUploadStepProps {
  data:      SecureUploadData;
  onChange:  (d: SecureUploadData) => void;
  onBack:    () => void;
  onNext:    () => void;
  hideNav?:  boolean;
  showHint?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SecureFileUploadStep({ data, onChange, onBack, onNext, hideNav, showHint }: SecureFileUploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateSecurity(patch: Partial<TransferSecurity>) {
    onChange({ ...data, security: { ...data.security, ...patch } });
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const newFiles: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f, status: "pending", progress: 0,
    }));
    onChange({ ...data, files: [...data.files, ...newFiles] });
  }

  function removeFile(id: string) {
    onChange({ ...data, files: data.files.filter((f) => f.id !== id) });
  }

  function updateFile(id: string, patch: Partial<UploadedFile>) {
    onChange({ ...data, files: data.files.map((f) => f.id === id ? { ...f, ...patch } : f) });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [data]);

  const hasFiles = data.files.length > 0;

  return (
    <section aria-labelledby="step3-heading" className="font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold" style={{ background: ORANGE, color: "#07090F" }} aria-hidden>3</span>
          <h2 id="step3-heading" className="text-lg font-semibold tracking-tight" style={{ color: "#F1F5F9" }}>
            Secure File Transfer
          </h2>
        </div>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Upload your production source files. All transfers are encrypted in transit (TLS 1.3) and stored securely.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="rounded-xl transition-all duration-150 mb-5"
        style={{
          border: `2px dashed ${dragging ? ORANGE : "rgba(255,255,255,0.1)"}`,
          background: dragging ? "rgba(255,122,0,0.08)" : "rgba(255,255,255,0.04)",
          minHeight: 140,
          cursor: "pointer",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload files — click or drag and drop"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        <div className="flex flex-col items-center justify-center gap-2 p-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: dragging ? ORANGE : "rgba(255,122,0,0.2)" }}>
            <UploadCloudIcon className="w-6 h-6" style={{ color: dragging ? "#07090F" : ORANGE }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
            Drop files here or <span style={{ color: ORANGE }}>browse</span>
          </p>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            PDF, TIFF, DOCX, XLSX, MSG, EML, ZIP, MP4 — Max 2 GB per file
          </p>
        </div>
        <input ref={inputRef} type="file" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {/* File list — pending only, no upload button */}
      {hasFiles && (
        <div className="mb-5 flex flex-col gap-2">
          {data.files.map((f) => (
            <div key={f.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)", color: ORANGE }}>
                {fileIcon(f.file.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{f.file.name}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: "#94A3B8" }}>{formatBytes(f.file.size)}</p>
              </div>
              <button type="button" onClick={() => removeFile(f.id)}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "#94A3B8" }} aria-label={`Remove ${f.file.name}`}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)"; (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
            <ShieldCheckIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ORANGE }} />
            Files will be securely uploaded when you click &ldquo;Review &amp; Confirm&rdquo; on the next step.
          </p>
        </div>
      )}

      {/* Security options */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#94A3B8" }}>
          Transfer Security Options
        </p>
        <div className="flex flex-col gap-3">
          <SecurityRow id="pw" icon={<LockIcon className="w-4 h-4" />} label="Password Protection"
            description="Require a password to access the share link" badge="Recommended"
            enabled={data.security.passwordEnabled} onToggle={(v) => updateSecurity({ passwordEnabled: v })}>
            <div className="flex flex-col gap-1.5 mt-2">
              <Label htmlFor="share-pw" className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>Share Password</Label>
              <div className="relative">
                <Input id="share-pw" type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                  value={data.security.password} onChange={(e) => updateSecurity({ password: e.target.value })}
                  style={{ ...inputBase, paddingRight: "2.5rem" }} onFocus={focusOn} onBlur={focusOff} />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" aria-label={showPw ? "Hide" : "Show"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                  {showPw ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </SecurityRow>

          <SecurityRow id="exp" icon={<CalendarIcon className="w-4 h-4" />} label="Link Expiration"
            description="Automatically expire the share link after a set date"
            enabled={data.security.expirationEnabled} onToggle={(v) => updateSecurity({ expirationEnabled: v })}>
            <div className="flex flex-col gap-1.5 mt-2">
              <Label htmlFor="exp-date" className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>Expiration Date</Label>
              <input id="exp-date" type="date" value={data.security.expirationDate}
                onChange={(e) => updateSecurity({ expirationDate: e.target.value })}
                className="font-sans text-sm" style={{ ...inputBase, colorScheme: "dark" }}
                onFocus={focusOn} onBlur={focusOff} />
            </div>
          </SecurityRow>

          <SecurityRow id="del" icon={<Trash2Icon className="w-4 h-4" />} label="Delete After Download"
            description="Remove files after the recipient downloads them"
            enabled={data.security.deleteAfterDownload} onToggle={(v) => updateSecurity({ deleteAfterDownload: v })} />

          <SecurityRow id="auth" icon={<UserCheckIcon className="w-4 h-4" />} label="Authorized Reception"
            description="Authorized to leave physical copies with building reception or security desk"
            enabled={data.security.authorizedReception} onToggle={(v) => updateSecurity({ authorizedReception: v })} />
        </div>
      </div>

      {/* Special instructions */}
      <div className="mb-8 flex flex-col gap-1.5">
        <Label htmlFor="special-instructions" className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>
          Special Instructions
        </Label>
        <textarea id="special-instructions" rows={3}
          placeholder="Any additional production notes, delivery instructions, or special handling requirements..."
          value={data.specialInstructions}
          onChange={(e) => onChange({ ...data, specialInstructions: e.target.value })}
          className="font-sans text-sm rounded-lg resize-none"
          style={{ ...inputBase, height: "auto", padding: "0.625rem 0.75rem", lineHeight: 1.5 }}
          onFocus={focusOn as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
          onBlur={focusOff as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
        />
      </div>

      {/* Actions */}
      {!hideNav && (
        <div className="flex justify-between">
          <button type="button" onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", color: "#E2E8F0", border: "1px solid rgba(255,255,255,0.1)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}>
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={{ background: "#FF7A00", color: "#07090F", boxShadow: "0 0 16px rgba(255,122,0,0.35)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FF8F20"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(255,122,0,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FF7A00"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(255,122,0,0.35)"; }}>
            Review &amp; Confirm <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      {showHint && (
        <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(255,122,0,0.08)", border: "1px solid rgba(255,122,0,0.2)" }}>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            <span style={{ color: "#FF7A00", fontWeight: "bold" }}>Tip:</span> Files are uploaded directly through our secure proxy. No files are stored on this server.
          </p>
        </div>
      )}
    </section>
  );
}
