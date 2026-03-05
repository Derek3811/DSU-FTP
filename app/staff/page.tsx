"use client";

import { useState } from "react";
import {
  ShieldCheckIcon, LogOutIcon, UploadCloudIcon, LinkIcon,
  EyeIcon, EyeOffIcon, AlertCircleIcon, CheckCircleIcon,
  FileIcon, XIcon, CopyIcon, CalendarIcon, LockIcon,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY  = "#0F172A";
const BLUE  = "#2563EB";

const inputBase: React.CSSProperties = {
  width: "100%", height: "2.5rem", padding: "0 0.75rem",
  fontSize: "0.875rem", fontFamily: "inherit",
  background: "#F8FAFC", border: "1px solid #E2E8F0",
  borderRadius: "0.5rem", color: NAVY, outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
function focusOn(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = BLUE;
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
}
function focusOff(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#E2E8F0";
  e.currentTarget.style.boxShadow = "none";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  ncPath?: string;
  driveFileId?: string;
}

interface ShareResult {
  shareUrl: string; shareId: string;
  fileName: string; clientEmail: string; expireDate?: string;
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staff/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) { onLogin(); }
      else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your network and try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans px-4"
      style={{ background: NAVY }}>
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
          {/* Header */}
          <div className="px-8 pt-8 pb-6" style={{ background: NAVY }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: BLUE }}>
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#475569" }}>
                  DSU Discovery
                </p>
                <p className="text-sm font-semibold text-white">Staff Portal</p>
              </div>
            </div>
            <h1 className="text-lg font-bold text-white text-balance">Secure Staff Login</h1>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>Authorized DSU personnel only. All access is logged.</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-xs font-semibold" style={{ color: "#374151" }}>
                  Email Address
                </label>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@dsudiscovery.com" required autoComplete="username"
                  style={inputBase} onFocus={focusOn} onBlur={focusOff} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-pw" className="text-xs font-semibold" style={{ color: "#374151" }}>
                  Password
                </label>
                <div className="relative">
                  <input id="login-pw" type={showPw ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••"
                    required autoComplete="current-password"
                    style={{ ...inputBase, paddingRight: "2.5rem" }} onFocus={focusOn} onBlur={focusOff} />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                    {showPw ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
                  <AlertCircleIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold rounded-lg text-white transition-colors"
                style={{ background: loading ? "#93C5FD" : BLUE, border: "none", cursor: loading ? "wait" : "pointer" }}>
                {loading ? (
                  <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>Authenticating...</>
                ) : "Sign In"}
              </button>
            </form>

            <p className="text-[10px] text-center mt-5" style={{ color: "#94A3B8" }}>
              Session valid for 8 hours &bull; HIPAA-audited access
            </p>
          </div>
        </div>
        <p className="text-center mt-5 text-xs" style={{ color: "#334155" }}>
          DSU Discovery, LLC &bull; 415.398.2111 — Option 3
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard ────���───────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [files,        setFiles]        = useState<UploadedFile[]>([]);
  const [dragging,     setDragging]     = useState(false);
  const [clientEmail,  setClientEmail]  = useState("");
  const [refNumber,    setRefNumber]    = useState("");
  const [sharePassword,setSharePassword]= useState("");
  const [expireDate,   setExpireDate]   = useState("");
  const [shareResults, setShareResults] = useState<ShareResult[]>([]);
  const [sending,      setSending]      = useState(false);
  const [sendError,    setSendError]    = useState("");
  const [copied,       setCopied]       = useState<string | null>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const newFiles: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f, progress: 0, status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFile(id: string, patch: Partial<UploadedFile>) {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f));
  }

  async function uploadFileToDrive(entry: UploadedFile, folder: string): Promise<string | null> {
    updateFile(entry.id, { status: "uploading", progress: 10 });

    const fileBytes = await entry.file.arrayBuffer();
    let simPct = 10;
    const interval = setInterval(() => {
      simPct = Math.min(88, simPct + Math.random() * 12 + 4);
      updateFile(entry.id, { progress: Math.round(simPct) });
    }, 200);

    try {
      const res = await fetch(
        `/api/google-drive/upload?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(entry.file.name)}`,
        { method: "PUT", headers: { "Content-Type": entry.file.type || "application/octet-stream" }, body: fileBytes },
      );
      clearInterval(interval);
      if (res.ok) {
        const data = await res.json().catch(() => ({})) as { path?: string; driveFileId?: string };
        const path = data.path ?? null;
        updateFile(entry.id, {
          status: "done",
          progress: 100,
          ncPath: path ?? undefined,
          driveFileId: data.driveFileId ?? undefined,
        });
        return path;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      clearInterval(interval);
      updateFile(entry.id, { status: "error", progress: 0 });
      return null;
    }
  }

  async function handleSendToClient() {
    if (!clientEmail || files.length === 0) return;
    setSending(true);
    setSendError("");

    const folder = refNumber ? `staff-delivery/${refNumber}` : `staff-delivery/${Date.now()}`;
    const newResults: ShareResult[] = [];

    for (const entry of files) {
      let ncPath = entry.ncPath;
      if (!ncPath) ncPath = await uploadFileToDrive(entry, folder) ?? undefined;
      if (!ncPath) continue;
      if (!entry.driveFileId) continue;

      const shareRes = await fetch("/api/google-drive/share", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: entry.driveFileId ?? undefined, expireDate: expireDate || undefined }),
      });
      if (shareRes.ok) {
        const data = await shareRes.json() as { shareUrl?: string; shareId?: string };
        if (data.shareUrl) newResults.push({ shareUrl: data.shareUrl, shareId: data.shareId ?? "", fileName: entry.file.name, clientEmail, expireDate: expireDate || undefined });
      }
    }

    if (newResults.length === 0) setSendError("No files were shared. Check the Google Drive connection in the logs.");
    else setShareResults((prev) => [...newResults, ...prev]);
    setSending(false);
  }

  async function handleLogout() {
    await fetch("/api/staff/auth", { method: "DELETE" });
    onLogout();
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  const canSend = !!(clientEmail && files.length > 0 && !sending);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <header style={{ background: NAVY, borderBottom: "1px solid #1E293B" }}>
        {/* Compliance strip */}
        <div style={{ background: "#070E1A", borderBottom: "1px solid #1E293B" }}>
          <div className="max-w-screen-lg mx-auto px-5 py-1.5 flex items-center justify-center gap-6">
            {["HIPAA Protected", "SOC 2 Type II", "Staff Access Only"].map((t) => (
              <span key={t} className="text-[10px] font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#334155" }}>
                <span className="w-1 h-1 rounded-full" style={{ background: "#1E293B" }} aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-screen-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: BLUE }}>
              <ShieldCheckIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#475569" }}>DSU Discovery</p>
              <p className="text-sm font-bold text-white">Staff File Delivery Portal</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "#1E293B", border: "1px solid #334155", color: "#94A3B8", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#334155"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#1E293B"; }}>
            <LogOutIcon className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-screen-lg mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: NAVY }}>Send Files to Client</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Upload completed production files and generate a secure Google Drive share link for client delivery.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left: Upload + Config */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Drop zone */}
            <div className="rounded-xl" style={{ background: "#fff", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#64748B" }}>Production Files</p>
              </div>
              <div className="p-4">
                <div
                  className="rounded-xl transition-all duration-150"
                  style={{ border: `2px dashed ${dragging ? BLUE : "#CBD5E1"}`, background: dragging ? "#EFF6FF" : "#F8FAFC", minHeight: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1.5rem", cursor: "pointer" }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                  onClick={() => document.getElementById("staff-file-input")?.click()}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("staff-file-input")?.click(); }}
                  aria-label="Upload files"
                >
                  <UploadCloudIcon className="w-6 h-6" style={{ color: dragging ? BLUE : "#94A3B8" }} />
                  <p className="text-sm font-medium" style={{ color: NAVY }}>
                    Drop files or <span style={{ color: BLUE }}>browse</span>
                  </p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>Any file type — max 2 GB per file</p>
                  <input id="staff-file-input" type="file" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {files.map((f) => (
                      <div key={f.id} className="rounded-lg px-3 py-2.5 flex items-center gap-3"
                        style={{ background: "#F8FAFC", border: `1px solid ${f.status === "error" ? "#FECACA" : f.status === "done" ? "#BBF7D0" : "#E2E8F0"}` }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: f.status === "done" ? "#F0FDF4" : "#F1F5F9", color: f.status === "done" ? "#22C55E" : "#64748B" }}>
                          {f.status === "done" ? <CheckCircleIcon className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: NAVY }}>{f.file.name}</p>
                          {(f.status === "uploading" || f.status === "done") && (
                            <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
                              <div className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${f.progress}%`, background: f.status === "done" ? "#22C55E" : BLUE }} />
                            </div>
                          )}
                        </div>
                        {f.status !== "uploading" && (
                          <button type="button" onClick={() => removeFile(f.id)}
                            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                            aria-label={`Remove ${f.file.name}`}>
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Delivery config */}
            <div className="rounded-xl" style={{ background: "#fff", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#64748B" }}>Delivery Configuration</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="client-email" className="text-xs font-semibold" style={{ color: "#374151" }}>
                    Client Email Address <span style={{ color: "#EF4444" }} aria-hidden>*</span>
                  </label>
                  <input id="client-email" type="email" placeholder="client@lawfirm.com"
                    value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                    style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ref-number" className="text-xs font-semibold" style={{ color: "#374151" }}>
                    Job Reference Number
                  </label>
                  <input id="ref-number" type="text" placeholder="e.g. DSU-2026-1234"
                    value={refNumber} onChange={(e) => setRefNumber(e.target.value)}
                    style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="exp-date" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#374151" }}>
                    <CalendarIcon className="w-3.5 h-3.5" /> Share Expiry Date
                  </label>
                  <input id="exp-date" type="date" value={expireDate} onChange={(e) => setExpireDate(e.target.value)}
                    style={{ ...inputBase, colorScheme: "light" }} onFocus={focusOn} onBlur={focusOff} />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="share-pw" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#374151" }}>
                    <LockIcon className="w-3.5 h-3.5" /> Share Password (optional)
                  </label>
                  <input id="share-pw" type="text" placeholder="Leave blank for no password"
                    value={sharePassword} onChange={(e) => setSharePassword(e.target.value)}
                    style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                </div>
              </div>

              {sendError && (
                <div className="mx-5 mb-4 flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
                  <AlertCircleIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{sendError}
                </div>
              )}

              <div className="px-5 pb-5">
                <button type="button" onClick={handleSendToClient} disabled={!canSend}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-lg text-white transition-colors"
                  style={{ background: canSend ? BLUE : "#94A3B8", cursor: canSend ? "pointer" : "not-allowed", border: "none" }}>
                  {sending ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>Uploading &amp; Creating Links...</>
                  ) : (
                    <><LinkIcon className="w-4 h-4" />Generate Secure Share Links</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Share results */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="rounded-xl sticky top-6" style={{ background: "#fff", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#64748B" }}>
                  Generated Share Links
                </p>
              </div>
              <div className="p-4">
                {shareResults.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <LinkIcon className="w-6 h-6" style={{ color: "#CBD5E1" }} />
                    <p className="text-xs" style={{ color: "#94A3B8" }}>Share links will appear here after generation.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {shareResults.map((r, i) => (
                      <div key={i} className="rounded-lg p-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                        <p className="text-xs font-semibold truncate mb-1" style={{ color: NAVY }}>{r.fileName}</p>
                        <p className="text-[11px] mb-2" style={{ color: "#64748B" }}>{r.clientEmail}</p>
                        <div className="flex items-center gap-2">
                          <a href={r.shareUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-xs truncate" style={{ color: BLUE }}>{r.shareUrl}</a>
                          <button type="button" onClick={() => copyUrl(r.shareUrl)}
                            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors"
                            style={{ background: copied === r.shareUrl ? "#DCFCE7" : "#F1F5F9", border: "none", cursor: "pointer",
                              color: copied === r.shareUrl ? "#22C55E" : "#64748B" }} aria-label="Copy URL">
                            <CopyIcon className="w-3 h-3" />
                          </button>
                        </div>
                        {r.expireDate && (
                          <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: "#94A3B8" }}>
                            <CalendarIcon className="w-2.5 h-2.5" />Expires {r.expireDate}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="mt-4 rounded-xl p-4" style={{ background: NAVY, border: "1px solid #1E293B" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>DSU Support</p>
              <div className="flex flex-col gap-1.5 text-xs" style={{ color: "#94A3B8" }}>
                <span>415.398.2111 — Option 3</span>
                <span>sf@dsudiscovery.com</span>
                <span>356 6th Street, San Francisco, CA 94103</span>
                <span className="mt-1" style={{ color: "#475569" }}>Mon–Fri 7:30 AM–11 PM</span>
                <span style={{ color: "#475569" }}>Sat–Sun 12 AM–8 PM</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full mt-auto" style={{ background: NAVY, borderTop: "1px solid #1E293B" }}>
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: "#334155" }}>
            &copy; {new Date().getFullYear()} DSU Discovery, LLC &bull; portal.dsudiscovery.com
          </p>
          <a href="/" className="text-xs" style={{ color: "#475569" }}>Back to Intake Portal</a>
        </div>
      </footer>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [authed, setAuthed] = useState(false);
  return authed
    ? <Dashboard onLogout={() => setAuthed(false)} />
    : <LoginScreen onLogin={() => setAuthed(true)} />;
}
