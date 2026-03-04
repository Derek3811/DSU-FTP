"use client";

import { ShieldCheck } from "lucide-react";

const ORANGE = "#FF7A00";
const GLASS_BG     = "rgba(13, 17, 23, 0.85)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

export function PortalHeader() {
  return (
    <header
      className="w-full font-sans relative z-10"
      role="banner"
      style={{ background: GLASS_BG, borderBottom: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(16px)" }}
    >
      {/* ── Top nav bar ── */}
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-7 h-7 rounded"
            style={{ background: ORANGE, boxShadow: `0 0 12px rgba(255,122,0,0.5)` }}
            aria-hidden
          >
            <ShieldCheck className="w-4 h-4" style={{ color: "#07090F" }} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            DSU Discovery
          </span>
          <span
            className="hidden sm:inline text-xs px-2 py-0.5 rounded font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "#64748B", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Litigation Support
          </span>
        </div>

        {/* Right side: version + session pill */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[10px] font-mono" style={{ color: "#334155" }}>
            v2.0
          </span>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10B981", boxShadow: "0 0 6px #10B981" }}
              aria-hidden
            />
            <span className="text-xs font-medium" style={{ color: "#10B981" }}>
              Secure Session
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
