"use client";

import { ShieldCheck, FileText, Clock, Phone, Mail } from "lucide-react";

const ORANGE      = "#FF7A00";
const GLASS_CARD  = "rgba(13,17,23,0.75)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const COMPLIANCE_ITEMS = [
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "HIPAA Compliant",  sub: "BAA on file",        color: "#34D399" },
  { icon: <FileText    className="w-3.5 h-3.5" />, label: "Chain of Custody", sub: "Full audit trail",   color: ORANGE    },
  { icon: <Clock       className="w-3.5 h-3.5" />, label: "24-hr Turnaround", sub: "Rush available",     color: "#60A5FA" },
];

const FILE_TYPES = ["PDF", "TIFF", "DOCX", "XLSX", "MSG", "EML", "ZIP", "MP4"];

export function SidebarInfo() {
  return (
    <aside className="flex flex-col gap-4 w-full font-sans" aria-label="Portal information">

      {/* Compliance card */}
      <div
        className="rounded-xl p-5"
        style={{ background: GLASS_CARD, border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(12px)" }}
      >
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "#334155" }}>
          Compliance
        </p>
        <ul className="flex flex-col gap-4" role="list">
          {COMPLIANCE_ITEMS.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded"
                style={{ background: "rgba(255,255,255,0.05)", color: item.color, border: `1px solid rgba(255,255,255,0.07)` }}
                aria-hidden
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>{item.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>{item.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Support contact */}
      <div
        className="rounded-xl p-5"
        style={{ background: GLASS_CARD, border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(12px)" }}
      >
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#334155" }}>
          Need Assistance?
        </p>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: "#475569" }}>
          Our litigation support team is available during business hours for urgent requests.
        </p>
        <div className="flex flex-col gap-2.5">
          <a
            href="tel:+14153982111"
            className="flex items-center gap-2 text-sm font-semibold transition-all"
            style={{ color: ORANGE }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textShadow = `0 0 8px rgba(255,122,0,0.5)`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textShadow = "none"; }}
          >
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            415.398.2111 &mdash; Option 3
          </a>
          <a
            href="mailto:sf@dsudiscovery.com"
            className="flex items-center gap-2 text-xs transition-colors"
            style={{ color: "#475569" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#475569"; }}
          >
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            sf@dsudiscovery.com
          </a>
          <div
            className="mt-2 pt-2.5 flex flex-col gap-0.5 text-[11px]"
            style={{ color: "#475569", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-xs font-semibold mb-1" style={{ color: "#64748B" }}>Hours</span>
            <span>Mon–Fri: 7:30 AM – 11:00 PM</span>
            <span>Sat–Sun: 12:00 AM – 8:00 PM</span>
          </div>
        </div>
      </div>

      {/* Accepted formats */}
      <div
        className="rounded-xl p-5"
        style={{ background: GLASS_CARD, border: `1px solid ${GLASS_BORDER}`, backdropFilter: "blur(12px)" }}
      >
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#334155" }}>
          Accepted File Types
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FILE_TYPES.map((fmt) => (
            <span
              key={fmt}
              className="text-[11px] font-mono font-medium px-2 py-0.5 rounded"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "#64748B",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

    </aside>
  );
}
