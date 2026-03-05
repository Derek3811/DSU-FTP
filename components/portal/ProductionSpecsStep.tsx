"use client";

import { useState } from "react";
import {
  BookOpenIcon, ClipboardListIcon, HardDriveIcon, MonitorIcon,
  FileTextIcon, BookIcon, CheckIcon, ChevronDownIcon,
  AlertCircleIcon, ArrowLeftIcon, ArrowRightIcon,
  CalendarIcon, ClockIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY  = "#07090F";
const ORANGE  = "#FF7A00";
const GLASS = "rgba(13,17,23,0.85)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius:  "0.5rem",
  color: "#F1F5F9",
  fontSize: "0.875rem",
  width: "100%",
  height: "2.5rem",
  paddingLeft: "0.75rem",
  paddingRight: "0.75rem",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusOn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = ORANGE;
  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(255,122,0,0.1)`;
}
function focusOff(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: boolean) {
  e.currentTarget.style.borderColor = err ? "#EF4444" : "rgba(255,255,255,0.1)";
  e.currentTarget.style.boxShadow = "none";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceCategoryId =
  | "trial-notebooks" | "deposition-exhibits" | "ediscovery"
  | "demonstratives"  | "blowbacks"           | "appellate-briefs"
  | null;

export interface TrialNotebookSpecs {
  numSets: string; colorMode: "color" | "bw" | "";
  printFormat: "single" | "double" | ""; slipSheets: boolean;
  tabType: "alpha" | "numeric" | "custom" | ""; customTabDescription: string;
}
export interface DepositionExhibitSpecs {
  bindingStyle: "velo" | "acco" | "plastic-coil" | "spiral-gbc" | "";
  numSets: string; tabType: "alpha" | "numeric" | "custom" | "";
  printFormat: "single" | "double" | "";
  colorMode: "color" | "bw" | "";
  slipSheets: boolean;
  batesStart: string; batesEnd: string;
  serviceLevel: "standard" | "rush" | "";
  deadline: string; deadlineTime: string;
}
export interface EDiscoverySpecs {
  outputDeliverable: "tiff" | "pdf" | "native" | "";
  loadFiles: "opticon" | "summation" | "concordance" | "none" | "";
  batesStart: string; batesEnd: string; confidentialityEndorsement: string;
  ocrRequired: boolean; searchablePdf: boolean;
}
export interface DemonstrativeSpecs {
  quantity: string; size: "18x24" | "24x36" | "30x40" | "custom" | "";
  customSize: string; mounting: "foam-core" | "gator-board" | "pvc" | "none" | "";
}
export interface BlowbackSpecs {
  paperType: "regular" | "3-hole" | ""; numSets: string;
  colorMode: "color" | "bw" | "";
  slipSheets: boolean;
  tabType: "alpha" | "numeric" | "custom" | "";
  bindingStyle: "velo" | "acco" | "coil" | "gbc" | "";
  serviceLevel: "standard" | "rush" | "";
  deadline: string; deadlineTime: string;
}
export interface AppellateBriefSpecs {
  regulatoryCompliance: string; numberOfCopies: string;
  colorMode: "color" | "bw" | "";
  slipSheets: boolean;
  tabType: "alpha" | "numeric" | "custom" | "";
}

export interface ProductionSpecs {
  selectedCategory: ServiceCategoryId;
  trialNotebook: TrialNotebookSpecs;
  depositionExhibit: DepositionExhibitSpecs;
  eDiscovery: EDiscoverySpecs;
  demonstrative: DemonstrativeSpecs;
  blowback: BlowbackSpecs;
  appellateBrief: AppellateBriefSpecs;
}

export const INITIAL_PRODUCTION_SPECS: ProductionSpecs = {
  selectedCategory: null,
  trialNotebook:    { numSets: "", colorMode: "", printFormat: "", slipSheets: false, tabType: "", customTabDescription: "" },
  depositionExhibit:{ bindingStyle: "", numSets: "", tabType: "", printFormat: "", colorMode: "", slipSheets: false, batesStart: "", batesEnd: "", serviceLevel: "", deadline: "", deadlineTime: "" },
  eDiscovery:       { outputDeliverable: "", loadFiles: "", batesStart: "", batesEnd: "", confidentialityEndorsement: "", ocrRequired: false, searchablePdf: false },
  demonstrative:    { quantity: "", size: "", customSize: "", mounting: "" },
  blowback:         { paperType: "", numSets: "", colorMode: "", slipSheets: false, tabType: "", bindingStyle: "", serviceLevel: "", deadline: "", deadlineTime: "" },
  appellateBrief:   { regulatoryCompliance: "", numberOfCopies: "", colorMode: "", slipSheets: false, tabType: "" },
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <Label htmlFor={htmlFor} className="text-xs font-semibold" style={{ color: "#374151" }}>
      {children}
      {required && <span style={{ color: "#EF4444", marginLeft: 2 }} aria-hidden>*</span>}
    </Label>
  );
}
function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs" style={{ color: "#94A3B8" }}>{children}</p>;
}
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs flex items-center gap-1" style={{ color: "#EF4444" }}>
      <AlertCircleIcon className="w-3 h-3 flex-shrink-0" />{message}
    </p>
  );
}

function StyledInput({ id, type = "text", placeholder, value, onChange, error }: {
  id: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <Input id={id} type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)} aria-invalid={!!error}
      style={{ ...inputBase, ...(error ? { borderColor: "#EF4444" } : {}) }}
      onFocus={focusOn}
      onBlur={(e) => focusOff(e, !!error)}
    />
  );
}

function StyledSelect({ id, value, onChange, options, placeholder, error }: {
  id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; error?: string;
}) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        style={{ ...inputBase, paddingRight: "2.25rem", cursor: "pointer", appearance: "none",
          ...(error ? { borderColor: "#EF4444" } : {}),
          colorScheme: "dark"
        }}
        onFocus={focusOn}
        onBlur={(e) => focusOff(e, !!error)}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value} style={{ background: "#1E293B", color: "#F1F5F9" }}>{o.label}</option>)}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
    </div>
  );
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150"
      style={selected
        ? { background: ORANGE, color: "#07090F", border: `1px solid ${ORANGE}` }
        : { background: "rgba(255,255,255,0.06)", color: "#E2E8F0", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {selected && <CheckIcon className="w-3 h-3 flex-shrink-0" />}
      {label}
    </button>
  );
}

function CheckboxRow({ id, label, hint, checked, onChange }: {
  id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
      style={{ background: checked ? "rgba(255,122,0,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${checked ? "rgba(255,122,0,0.3)" : "rgba(255,255,255,0.08)"}` }}>
      <div className="flex-shrink-0 w-4 h-4 rounded mt-0.5 flex items-center justify-center"
        style={{ background: checked ? ORANGE : "rgba(255,255,255,0.06)", border: `1.5px solid ${checked ? ORANGE : "rgba(255,255,255,0.1)"}`, transition: "all 0.12s" }}>
        {checked && <CheckIcon className="w-2.5 h-2.5" style={{ color: "#07090F" }} />}
      </div>
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <div>
        <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{label}</p>
        {hint && <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{hint}</p>}
      </div>
    </label>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
function FormField({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  return <div className={`flex flex-col gap-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>{children}</div>;
}
function Divider({ label }: { label: string }) {
  return (
    <div className="sm:col-span-2 flex items-center gap-3 pt-1">
      <span className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "#94A3B8" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

// Shared deadline fields used by Deposition and Blowback
function DeadlineFields({ deadline, deadlineTime, serviceLevel, onDeadline, onTime, onLevel }: {
  deadline: string; deadlineTime: string; serviceLevel: string;
  onDeadline: (v: string) => void; onTime: (v: string) => void; onLevel: (v: string) => void;
}) {
  return (
    <>
      <Divider label="Schedule & Service Level" />
      <FormField>
        <FieldLabel htmlFor="serviceLevel">Service Level</FieldLabel>
        <StyledSelect id="serviceLevel" value={serviceLevel} onChange={onLevel}
          placeholder="Select service level"
          options={[{ value: "standard", label: "Standard" }, { value: "rush", label: "Rush (surcharge applies)" }]}
        />
      </FormField>
      <FormField>
        <FieldLabel htmlFor="specDeadline">Production Deadline</FieldLabel>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input id="specDeadline" type="date" value={deadline} onChange={(e) => onDeadline(e.target.value)}
              className="w-full font-sans text-sm"
              style={{ ...inputBase, colorScheme: "light" }}
              onFocus={focusOn} onBlur={focusOff}
            />
          </div>
          <input type="time" value={deadlineTime} onChange={(e) => onTime(e.target.value)}
            className="w-28 font-sans text-sm"
            style={{ ...inputBase, colorScheme: "light" }}
            onFocus={focusOn} onBlur={focusOff}
          />
        </div>
        <FieldHint>Court-imposed or internal due date</FieldHint>
      </FormField>
    </>
  );
}

interface CategoryDef { id: ServiceCategoryId; icon: React.ReactNode; label: string; description: string; }
const CATEGORIES: CategoryDef[] = [
  { id: "trial-notebooks",    icon: <BookOpenIcon    className="w-5 h-5" />, label: "Trial Notebooks / Witness Binders",    description: "Tabbed binders, slip sheets, custom spines" },
  { id: "deposition-exhibits",icon: <ClipboardListIcon className="w-5 h-5" />, label: "Deposition Exhibits",               description: "Bound exhibit sets with tab indexing" },
  { id: "ediscovery",         icon: <HardDriveIcon   className="w-5 h-5" />, label: "Digital Production / E-Discovery",    description: "TIFF/PDF/Native output with load files & Bates" },
  { id: "demonstratives",     icon: <MonitorIcon     className="w-5 h-5" />, label: "Courtroom Demonstratives (Oversize)", description: "Large-format mounted boards for trial" },
  { id: "blowbacks",          icon: <FileTextIcon    className="w-5 h-5" />, label: "High-Volume Blowbacks",               description: "Document blowback printing with slip sheets" },
  { id: "appellate-briefs",   icon: <BookIcon        className="w-5 h-5" />, label: "Appellate Briefs",                    description: "Court-compliant brief printing & binding" },
];

function CategoryCard({ category, selected, onClick }: { category: CategoryDef; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className="relative flex flex-col gap-2 p-4 rounded-xl text-left transition-all duration-150 w-full"
      style={selected
        ? { background: "rgba(255,122,0,0.08)", border: `1.5px solid rgba(255,122,0,0.3)`, cursor: "pointer" }
        : { background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.borderColor = "rgba(255,122,0,0.3)"; e.currentTarget.style.background = "rgba(255,122,0,0.08)"; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "#22C55E" }}>
          <CheckIcon className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={selected ? { background: ORANGE, color: "#07090F" } : { background: "rgba(255,255,255,0.08)", color: "#94A3B8" }}>
        {category.icon}
      </div>
      <p className="text-sm font-semibold text-balance" style={{ color: "#F1F5F9" }}>{category.label}</p>
      <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{category.description}</p>
    </button>
  );
}

// ─── Per-category spec panels ─────────────────────────────────────────────────

function TrialNotebookPanel({ data, onChange }: { data: TrialNotebookSpecs; onChange: (d: TrialNotebookSpecs) => void }) {
  const u = <K extends keyof TrialNotebookSpecs>(k: K, v: TrialNotebookSpecs[K]) => onChange({ ...data, [k]: v });
  return (
    <FormGrid>
      <FormField><FieldLabel htmlFor="tn-sets" required>Number of Sets</FieldLabel>
        <StyledInput id="tn-sets" type="number" placeholder="e.g. 4" value={data.numSets} onChange={(v) => u("numSets", v)} />
      </FormField>
      <FormField><FieldLabel htmlFor="tn-color">Color Mode</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[["color","Color"],["bw","Black & White"]].map(([v,l]) =>
            <ToggleChip key={v} label={l} selected={data.colorMode===v} onClick={() => u("colorMode", v as TrialNotebookSpecs["colorMode"])} />
          )}
        </div>
      </FormField>
      <FormField><FieldLabel htmlFor="tn-print">Print Format</FieldLabel>
        <div className="flex gap-2">
          {[["single","Single-Sided"],["double","Double-Sided"]].map(([v,l]) =>
            <ToggleChip key={v} label={l} selected={data.printFormat===v} onClick={() => u("printFormat", v as TrialNotebookSpecs["printFormat"])} />
          )}
        </div>
      </FormField>
      <FormField><FieldLabel htmlFor="tn-tabs">Tab Type</FieldLabel>
        <StyledSelect id="tn-tabs" value={data.tabType} onChange={(v) => u("tabType", v as TrialNotebookSpecs["tabType"])}
          placeholder="Select tab type"
          options={[{value:"alpha",label:"Alpha"},{value:"numeric",label:"Numeric"},{value:"custom",label:"Custom"}]}
        />
      </FormField>
      <FormField fullWidth>
        <CheckboxRow id="tn-slip" label="Slip Sheets" hint="Insert a slip sheet between each exhibit or section" checked={data.slipSheets} onChange={(v) => u("slipSheets", v)} />
      </FormField>
      {data.tabType === "custom" && (
        <FormField fullWidth><FieldLabel htmlFor="tn-tab-desc">Custom Tab Description</FieldLabel>
          <StyledInput id="tn-tab-desc" placeholder="Describe your custom tabs" value={data.customTabDescription} onChange={(v) => u("customTabDescription", v)} />
        </FormField>
      )}
    </FormGrid>
  );
}

function DepositionPanel({ data, onChange }: { data: DepositionExhibitSpecs; onChange: (d: DepositionExhibitSpecs) => void }) {
  const u = <K extends keyof DepositionExhibitSpecs>(k: K, v: DepositionExhibitSpecs[K]) => onChange({ ...data, [k]: v });
  return (
    <div className="flex flex-col gap-5">
      {/* Glossary callout */}
      <div className="rounded-lg px-4 py-3 text-xs leading-relaxed" style={{ background: "rgba(255,122,0,0.08)", border: "1px solid rgba(255,122,0,0.2)", color: "#FF7A00" }}>
        <span className="font-semibold">Deposition Exhibit Packets:</span> Refers to the individual folder containing all the copies needed for a single exhibit.
      </div>
      <FormGrid>
        <FormField><FieldLabel htmlFor="dep-binding" required>Binding Style</FieldLabel>
          <StyledSelect id="dep-binding" value={data.bindingStyle} onChange={(v) => u("bindingStyle", v as DepositionExhibitSpecs["bindingStyle"])}
            placeholder="Select binding"
            options={[{value:"velo",label:"Velo"},{value:"acco",label:"Acco"},{value:"plastic-coil",label:"Plastic Coil"},{value:"spiral-gbc",label:"Spiral / GBC"}]}
          />
        </FormField>
        <FormField><FieldLabel htmlFor="dep-sets" required>Number of Sets</FieldLabel>
          <StyledInput id="dep-sets" type="number" placeholder="e.g. 3" value={data.numSets} onChange={(v) => u("numSets", v)} />
        </FormField>
        <FormField><FieldLabel htmlFor="dep-tabs">Tab Type</FieldLabel>
          <StyledSelect id="dep-tabs" value={data.tabType} onChange={(v) => u("tabType", v as DepositionExhibitSpecs["tabType"])}
            placeholder="Select tab type"
            options={[{value:"alpha",label:"Alpha"},{value:"numeric",label:"Numeric"},{value:"custom",label:"Custom"}]}
          />
        </FormField>
        <FormField><FieldLabel htmlFor="dep-print">Print Format</FieldLabel>
          <div className="flex gap-2">
            {[["single","Single-Sided"],["double","Double-Sided"]].map(([v,l]) =>
              <ToggleChip key={v} label={l} selected={data.printFormat===v} onClick={() => u("printFormat", v as DepositionExhibitSpecs["printFormat"])} />
            )}
          </div>
        </FormField>
        <FormField><FieldLabel htmlFor="dep-color">Color Mode</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {[["color","Color"],["bw","Black & White"]].map(([v,l]) =>
              <ToggleChip key={v} label={l} selected={data.colorMode===v} onClick={() => u("colorMode", v as DepositionExhibitSpecs["colorMode"])} />
            )}
          </div>
        </FormField>
        <FormField fullWidth>
          <CheckboxRow id="dep-slip" label="Slip Sheets" hint="Insert a slip sheet between each exhibit" checked={data.slipSheets} onChange={(v) => u("slipSheets", v)} />
        </FormField>
        <Divider label="Bates Numbering" />
        <FormField><FieldLabel htmlFor="dep-bates-start">Bates Start</FieldLabel>
          <StyledInput id="dep-bates-start" placeholder="e.g. DSU000001" value={data.batesStart} onChange={(v) => u("batesStart", v)} />
        </FormField>
        <FormField><FieldLabel htmlFor="dep-bates-end">Bates End</FieldLabel>
          <StyledInput id="dep-bates-end" placeholder="e.g. DSU001234" value={data.batesEnd} onChange={(v) => u("batesEnd", v)} />
        </FormField>
        <DeadlineFields deadline={data.deadline} deadlineTime={data.deadlineTime} serviceLevel={data.serviceLevel}
          onDeadline={(v) => u("deadline", v)} onTime={(v) => u("deadlineTime", v)} onLevel={(v) => u("serviceLevel", v as DepositionExhibitSpecs["serviceLevel"])} />
      </FormGrid>
    </div>
  );
}

function EDiscoveryPanel({ data, onChange }: { data: EDiscoverySpecs; onChange: (d: EDiscoverySpecs) => void }) {
  const u = <K extends keyof EDiscoverySpecs>(k: K, v: EDiscoverySpecs[K]) => onChange({ ...data, [k]: v });
  return (
    <FormGrid>
      <FormField><FieldLabel htmlFor="edisco-output" required>Output Deliverable</FieldLabel>
        <StyledSelect id="edisco-output" value={data.outputDeliverable} onChange={(v) => u("outputDeliverable", v as EDiscoverySpecs["outputDeliverable"])}
          placeholder="Select format"
          options={[{value:"tiff",label:"TIFF"},{value:"pdf",label:"PDF"},{value:"native",label:"Native"}]}
        />
      </FormField>
      <FormField><FieldLabel htmlFor="edisco-load">Load File Format</FieldLabel>
        <StyledSelect id="edisco-load" value={data.loadFiles} onChange={(v) => u("loadFiles", v as EDiscoverySpecs["loadFiles"])}
          placeholder="Select"
          options={[{value:"none",label:"None"},{value:"opticon",label:"Opticon"},{value:"summation",label:"Summation"},{value:"concordance",label:"Concordance"}]}
        />
      </FormField>
      <Divider label="Bates Numbering" />
      <FormField><FieldLabel htmlFor="edisco-bs">Bates Start</FieldLabel>
        <StyledInput id="edisco-bs" placeholder="e.g. FIRM000001" value={data.batesStart} onChange={(v) => u("batesStart", v)} />
      </FormField>
      <FormField><FieldLabel htmlFor="edisco-be">Bates End</FieldLabel>
        <StyledInput id="edisco-be" placeholder="e.g. FIRM009999" value={data.batesEnd} onChange={(v) => u("batesEnd", v)} />
      </FormField>
      <FormField fullWidth><FieldLabel htmlFor="edisco-conf">Confidentiality Endorsement</FieldLabel>
        <StyledInput id="edisco-conf" placeholder='e.g. "CONFIDENTIAL — SUBJECT TO PROTECTIVE ORDER"' value={data.confidentialityEndorsement} onChange={(v) => u("confidentialityEndorsement", v)} />
      </FormField>
      <Divider label="Processing Options" />
      <FormField fullWidth>
        <div className="flex flex-col gap-2">
          <CheckboxRow id="edisco-ocr" label="OCR Required" hint="Optical character recognition on scanned documents" checked={data.ocrRequired} onChange={(v) => u("ocrRequired", v)} />
          <CheckboxRow id="edisco-pdf" label="Searchable PDF Output" hint="Embed text layer in PDF deliverables" checked={data.searchablePdf} onChange={(v) => u("searchablePdf", v)} />
        </div>
      </FormField>
    </FormGrid>
  );
}

function DemonstrativesPanel({ data, onChange }: { data: DemonstrativeSpecs; onChange: (d: DemonstrativeSpecs) => void }) {
  const u = <K extends keyof DemonstrativeSpecs>(k: K, v: DemonstrativeSpecs[K]) => onChange({ ...data, [k]: v });
  return (
    <FormGrid>
      <FormField><FieldLabel htmlFor="demo-qty" required>Quantity</FieldLabel>
        <StyledInput id="demo-qty" type="number" placeholder="e.g. 12" value={data.quantity} onChange={(v) => u("quantity", v)} />
      </FormField>
      <FormField><FieldLabel htmlFor="demo-size">Size</FieldLabel>
        <StyledSelect id="demo-size" value={data.size} onChange={(v) => u("size", v as DemonstrativeSpecs["size"])}
          placeholder="Select size"
          options={[{value:"18x24",label:'18" × 24"'},{value:"24x36",label:'24" × 36"'},{value:"30x40",label:'30" × 40"'},{value:"custom",label:"Custom"}]}
        />
      </FormField>
      {data.size === "custom" && (
        <FormField fullWidth><FieldLabel htmlFor="demo-custom">Custom Size (W × H)</FieldLabel>
          <StyledInput id="demo-custom" placeholder='e.g. 36" × 48"' value={data.customSize} onChange={(v) => u("customSize", v)} />
        </FormField>
      )}
      <FormField fullWidth><FieldLabel htmlFor="demo-mount">Mounting</FieldLabel>
        <StyledSelect id="demo-mount" value={data.mounting} onChange={(v) => u("mounting", v as DemonstrativeSpecs["mounting"])}
          placeholder="Select mounting"
          options={[{value:"none",label:"None"},{value:"foam-core",label:"Foam Core"},{value:"gator-board",label:"Gator Board"},{value:"pvc",label:"PVC Board"}]}
        />
      </FormField>
    </FormGrid>
  );
}

function BlowbackPanel({ data, onChange }: { data: BlowbackSpecs; onChange: (d: BlowbackSpecs) => void }) {
  const u = <K extends keyof BlowbackSpecs>(k: K, v: BlowbackSpecs[K]) => onChange({ ...data, [k]: v });
  return (
    <FormGrid>
      <FormField><FieldLabel htmlFor="bb-paper">Paper Type</FieldLabel>
        <div className="flex gap-2">
          {[["regular","Regular"],["3-hole","3-Hole Punch"]].map(([v,l]) =>
            <ToggleChip key={v} label={l} selected={data.paperType===v} onClick={() => u("paperType", v as BlowbackSpecs["paperType"])} />
          )}
        </div>
      </FormField>
      <FormField><FieldLabel htmlFor="bb-sets" required>Number of Sets</FieldLabel>
        <StyledInput id="bb-sets" type="number" placeholder="e.g. 6" value={data.numSets} onChange={(v) => u("numSets", v)} />
      </FormField>
      <FormField><FieldLabel htmlFor="bb-color">Color Mode</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[["color","Color"],["bw","Black & White"]].map(([v,l]) =>
            <ToggleChip key={v} label={l} selected={data.colorMode===v} onClick={() => u("colorMode", v as BlowbackSpecs["colorMode"])} />
          )}
        </div>
      </FormField>
      <FormField><FieldLabel htmlFor="bb-tabs">Tab Type</FieldLabel>
        <StyledSelect id="bb-tabs" value={data.tabType} onChange={(v) => u("tabType", v as BlowbackSpecs["tabType"])}
          placeholder="Select tab type"
          options={[{value:"alpha",label:"Alpha"},{value:"numeric",label:"Numeric"},{value:"custom",label:"Custom"}]}
        />
      </FormField>
      <FormField><FieldLabel htmlFor="bb-binding">Binding Style</FieldLabel>
        <StyledSelect id="bb-binding" value={data.bindingStyle} onChange={(v) => u("bindingStyle", v as BlowbackSpecs["bindingStyle"])}
          placeholder="Select binding"
          options={[{value:"velo",label:"Velo"},{value:"acco",label:"Acco"},{value:"coil",label:"Coil"},{value:"gbc",label:"GBC"}]}
        />
      </FormField>
      <FormField fullWidth>
        <CheckboxRow id="bb-slip" label="Slip Sheets" hint="Insert a slip sheet between each exhibit or section" checked={data.slipSheets} onChange={(v) => u("slipSheets", v)} />
      </FormField>
      <DeadlineFields deadline={data.deadline} deadlineTime={data.deadlineTime} serviceLevel={data.serviceLevel}
        onDeadline={(v) => u("deadline", v)} onTime={(v) => u("deadlineTime", v)} onLevel={(v) => u("serviceLevel", v as BlowbackSpecs["serviceLevel"])} />
    </FormGrid>
  );
}

function AppellatePanel({ data, onChange }: { data: AppellateBriefSpecs; onChange: (d: AppellateBriefSpecs) => void }) {
  const u = <K extends keyof AppellateBriefSpecs>(k: K, v: AppellateBriefSpecs[K]) => onChange({ ...data, [k]: v });
  return (
    <FormGrid>
      <FormField fullWidth><FieldLabel htmlFor="app-reg" required>Regulatory Compliance</FieldLabel>
        <StyledInput id="app-reg" placeholder='e.g. "9th Circuit — FRAP Rule 32"' value={data.regulatoryCompliance} onChange={(v) => u("regulatoryCompliance", v)} />
        <FieldHint>Specify the court and applicable rules</FieldHint>
      </FormField>
      <FormField><FieldLabel htmlFor="app-copies" required>Number of Copies</FieldLabel>
        <StyledInput id="app-copies" type="number" placeholder="e.g. 14" value={data.numberOfCopies} onChange={(v) => u("numberOfCopies", v)} />
      </FormField>
      <FormField><FieldLabel htmlFor="app-color">Color Mode</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[["color","Color"],["bw","Black & White"]].map(([v,l]) =>
            <ToggleChip key={v} label={l} selected={data.colorMode===v} onClick={() => u("colorMode", v as AppellateBriefSpecs["colorMode"])} />
          )}
        </div>
      </FormField>
      <FormField><FieldLabel htmlFor="app-tabs">Tab Type</FieldLabel>
        <StyledSelect id="app-tabs" value={data.tabType} onChange={(v) => u("tabType", v as AppellateBriefSpecs["tabType"])}
          placeholder="Select tab type"
          options={[{value:"alpha",label:"Alpha"},{value:"numeric",label:"Numeric"},{value:"custom",label:"Custom"}]}
        />
      </FormField>
      <FormField fullWidth>
        <CheckboxRow id="app-slip" label="Slip Sheets" hint="Insert a slip sheet between each section or brief" checked={data.slipSheets} onChange={(v) => u("slipSheets", v)} />
      </FormField>
    </FormGrid>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProductionSpecsStepProps {
  data:      ProductionSpecs;
  onChange:  (d: ProductionSpecs) => void;
  onBack:    () => void;
  onNext:    () => void;
  hideNav?:  boolean;
  showHint?: boolean;
}

export function ProductionSpecsStep({ data, onChange, onBack, onNext, hideNav, showHint }: ProductionSpecsStepProps) {
  const [error, setError] = useState("");

  function updateCategory(id: ServiceCategoryId) {
    onChange({ ...data, selectedCategory: id });
    setError("");
  }

  function updateSpec<K extends keyof ProductionSpecs>(key: K, val: ProductionSpecs[K]) {
    onChange({ ...data, [key]: val });
  }

  function handleContinue() {
    if (!data.selectedCategory) {
      setError("Please select a service type to continue.");
      return;
    }
    onNext();
  }

  const cat = data.selectedCategory;

  return (
    <section aria-labelledby="step2-heading" className="font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold" style={{ background: ORANGE, color: '#07090F' }} aria-hidden>2</span>
          <h2 id="step2-heading" className="text-lg font-semibold tracking-tight" style={{ color: '#F1F5F9' }}>
            Production Specifications
          </h2>
        </div>
        <p className="text-sm" style={{ color: '#94A3B8' }}>
          Select your service type and fill in the production details.
        </p>
      </div>

      {/* Service category grid */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
          Service Type
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.id!} category={c} selected={data.selectedCategory === c.id}
              onClick={() => updateCategory(c.id)} />
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#EF4444' }}>
            <AlertCircleIcon className="w-3 h-3 flex-shrink-0" />{error}
          </p>
        )}
      </div>

      {/* Spec panel */}
      {cat && (
        <div className="mt-8 pt-6" style={{ borderTop: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>
            {CATEGORIES.find((c) => c.id === cat)?.label} — Details
          </p>
          {cat === "trial-notebooks"    && <TrialNotebookPanel    data={data.trialNotebook}     onChange={(v) => updateSpec("trialNotebook",     v)} />}
          {cat === "deposition-exhibits"&& <DepositionPanel        data={data.depositionExhibit} onChange={(v) => updateSpec("depositionExhibit", v)} />}
          {cat === "ediscovery"         && <EDiscoveryPanel        data={data.eDiscovery}        onChange={(v) => updateSpec("eDiscovery",        v)} />}
          {cat === "demonstratives"     && <DemonstrativesPanel    data={data.demonstrative}     onChange={(v) => updateSpec("demonstrative",     v)} />}
          {cat === "blowbacks"          && <BlowbackPanel          data={data.blowback}          onChange={(v) => updateSpec("blowback",          v)} />}
          {cat === "appellate-briefs"   && <AppellatePanel         data={data.appellateBrief}    onChange={(v) => updateSpec("appellateBrief",    v)} />}
        </div>
      )}

      {/* Actions */}
      {!hideNav && (
        <div className="mt-8 flex justify-between">
          <button type="button" onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}>
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={handleContinue}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={{ background: ORANGE, color: '#07090F', boxShadow: '0 0 16px rgba(255,122,0,0.35)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FF8F20'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(255,122,0,0.5)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ORANGE; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(255,122,0,0.35)'; }}>
            Continue to File Upload <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      {showHint && (
        <div className="mt-4 rounded-lg p-3" style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.2)' }}>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            <span style={{ color: '#FF7A00', fontWeight: 'bold' }}>Next:</span> Once you select a service type, the file upload section will appear.
          </p>
        </div>
      )}
    </section>
  );
}
