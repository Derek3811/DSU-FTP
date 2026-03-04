"use client";

import { useState } from "react";
import { CalendarIcon, UserIcon, AlertCircleIcon, ArrowRightIcon, FileTextIcon, MailIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MatterInfo {
  caseMatterName:    string;
  matterNumber:      string;
  clientEmail:       string;
  leadAttorney:      string;
  hardDeadlineDate:  string;
  hardDeadlineTime:  string;
}

interface MatterInformationStepProps {
  data:      MatterInfo;
  onChange:  (data: MatterInfo) => void;
  onNext:    () => void;
  hideNext?: boolean;
  showHint?: boolean;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const ORANGE      = "#FF7A00";
const ORANGE_GLOW = "rgba(255,122,0,0.15)";
const GLASS_INPUT: React.CSSProperties = {
  background:    "rgba(255,255,255,0.06)",
  border:        "1px solid rgba(255,255,255,0.1)",
  borderRadius:  "0.5rem",
  color:         "#F1F5F9",
  fontSize:      "0.875rem",
  height:        "2.625rem",
  paddingLeft:   "0.75rem",
  paddingRight:  "0.75rem",
  width:         "100%",
  outline:       "none",
  boxShadow:     "none",
  transition:    "border-color 0.15s, box-shadow 0.15s",
  colorScheme:   "dark",
};

function focusOn(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = ORANGE;
  e.currentTarget.style.boxShadow   = `0 0 0 3px ${ORANGE_GLOW}`;
}
function focusOff(e: React.FocusEvent<HTMLInputElement>, err = false) {
  e.currentTarget.style.borderColor = err ? "#EF4444" : "rgba(255,255,255,0.1)";
  e.currentTarget.style.boxShadow   = "none";
}

// ── Field ─────────────────────────────────────────────────────────────────────

interface FieldProps {
  id:          string;
  label:       string;
  placeholder?: string;
  type?:       string;
  required?:   boolean;
  icon?:       React.ReactNode;
  hint?:       string;
  value:       string;
  onChange:    (v: string) => void;
  error?:      string;
}

function Field({ id, label, placeholder, type = "text", required, icon, hint, value, onChange, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#94A3B8" }}>
        {icon && <span style={{ color: "#475569" }}>{icon}</span>}
        {label}
        {required && <span style={{ color: ORANGE }} aria-hidden>*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className="font-sans"
        style={{ ...GLASS_INPUT, ...(error ? { borderColor: "#EF4444" } : {}) }}
        onFocus={focusOn}
        onBlur={(e) => focusOff(e, !!error)}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs" style={{ color: "#334155" }}>
          {hint}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}>
          <AlertCircleIcon className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Step ──────────────────────────────────────────────────────────────────────

export function MatterInformationStep({ data, onChange, onNext, hideNext, showHint }: MatterInformationStepProps) {
  const [errors, setErrors]   = useState<Partial<Record<keyof MatterInfo, string>>>({});
  const [touched, setTouched] = useState(false);

  function update(field: keyof MatterInfo, value: string) {
    onChange({ ...data, [field]: value });
    if (touched && errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    const e: Partial<Record<keyof MatterInfo, string>> = {};
    if (!data.caseMatterName.trim())  e.caseMatterName  = "Matter reference is required";
    if (!data.clientEmail.trim())     e.clientEmail     = "Email address is required";
    else if (!EMAIL_RE.test(data.clientEmail.trim())) e.clientEmail = "Enter a valid email address";
    if (!data.leadAttorney.trim())    e.leadAttorney    = "Lead attorney is required";
    if (!data.hardDeadlineDate)       e.hardDeadlineDate = "Deadline date is required";
    // hardDeadlineTime is now optional
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinue() {
    setTouched(true);
    if (validate()) onNext();
  }

  return (
    <section aria-labelledby="step1-heading" className="font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded text-xs font-bold"
            style={{ background: ORANGE, color: "#07090F", boxShadow: `0 0 10px rgba(255,122,0,0.5)` }}
            aria-hidden
          >
            1
          </div>
          <h2 id="step1-heading" className="text-lg font-bold tracking-tight text-white">
            Matter Information
          </h2>
        </div>
        <p className="text-sm" style={{ color: "#475569" }}>
          Provide case identification details for accurate routing and billing.
        </p>
      </div>

      {/* Divider */}
      <div className="mb-6 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Matter Reference — full width, prominent */}
        <div className="sm:col-span-2">
          <Field
            id="caseMatterName"
            label="Matter Reference (Name or ID)"
            placeholder="e.g. Doe v. Acme Corp — 2024-LIT-00142"
            required
            icon={<FileTextIcon className="w-3.5 h-3.5" />}
            hint="Enter the case name, matter ID, or both. Used for routing and billing reconciliation."
            value={data.caseMatterName}
            onChange={(v) => {
              update("caseMatterName", v);
              // Mirror into matterNumber for backward compat
              onChange({ ...data, caseMatterName: v, matterNumber: v });
            }}
            error={errors.caseMatterName}
          />
        </div>

        {/* Client Email */}
        <div className="sm:col-span-2">
          <Field
            id="clientEmail"
            label="Your Email Address"
            placeholder="e.g. jsmith@lawfirm.com"
            type="email"
            required
            icon={<MailIcon className="w-3.5 h-3.5" />}
            hint="A submission receipt will be sent to this address automatically."
            value={data.clientEmail}
            onChange={(v) => update("clientEmail", v)}
            error={errors.clientEmail}
          />
        </div>

        {/* Lead Attorney */}
        <div className="sm:col-span-2">
          <Field
            id="leadAttorney"
            label="Lead Attorney / Paralegal"
            placeholder="e.g. Jane Smith, Esq."
            required
            icon={<UserIcon className="w-3.5 h-3.5" />}
            hint="Primary contact for production updates"
            value={data.leadAttorney}
            onChange={(v) => update("leadAttorney", v)}
            error={errors.leadAttorney}
          />
        </div>

        {/* Hard Deadline */}
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#94A3B8" }}>
            <span style={{ color: "#475569" }}><CalendarIcon className="w-3.5 h-3.5" /></span>
            Hard Deadline
            <span style={{ color: ORANGE }} aria-hidden>*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="hardDeadlineDate"
              type="date"
              value={data.hardDeadlineDate}
              aria-required="true"
              aria-label="Deadline date"
              aria-invalid={!!errors.hardDeadlineDate}
              onChange={(e) => update("hardDeadlineDate", e.target.value)}
              className="flex-1 font-sans"
              style={{ ...GLASS_INPUT, ...(errors.hardDeadlineDate ? { borderColor: "#EF4444" } : {}) }}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, !!errors.hardDeadlineDate)}
            />
            <select
              id="hardDeadlineTime"
              value={data.hardDeadlineTime}
              aria-label="Deadline time (optional)"
              onChange={(e) => update("hardDeadlineTime", e.target.value)}
              className="w-32 font-sans"
              style={{ ...GLASS_INPUT, cursor: "pointer" }}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, false)}
            >
              <option value="">Time (optional)</option>
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                const ampm = i < 12 ? 'AM' : 'PM';
                const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {displayHour.toString().padStart(2, '0')} {ampm}
                  </option>
                );
              })}
            </select>
          </div>
          {errors.hardDeadlineDate ? (
            <p role="alert" className="flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}>
              <AlertCircleIcon className="w-3 h-3 flex-shrink-0" />
              {errors.hardDeadlineDate}
            </p>
          ) : (
            <p className="text-xs" style={{ color: "#334155" }}>
              Court-imposed or opposing counsel production deadline (optional time)
            </p>
          )}
        </div>
      </div>

      {/* Required note */}
      <p className="mt-5 text-xs" style={{ color: "#334155" }}>
        <span style={{ color: ORANGE }}>*</span> Required fields. All data is encrypted in transit per our HIPAA BAA.
      </p>

      {/* Action */}
      <div className="mt-8 space-y-4">
        {showHint && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.2)' }}>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              <span style={{ color: '#FF7A00', fontWeight: 'bold' }}>Next:</span> Once you fill in these fields, the Production Specs section will automatically appear below.
            </p>
          </div>
        )}
        {!hideNext && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-150"
              style={{
                background: ORANGE,
                color: '#07090F',
                boxShadow: `0 0 16px rgba(255,122,0,0.35)`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FF8F20';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 24px rgba(255,122,0,0.55)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = ORANGE;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 16px rgba(255,122,0,0.35)`;
              }}
            >
              Continue to Production Specs
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
