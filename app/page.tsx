'use client';

import { useState, useMemo } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { MatterInformationStep, type MatterInfo } from '@/components/portal/MatterInformationStep';
import {
  ProductionSpecsStep,
  type ProductionSpecs,
  INITIAL_PRODUCTION_SPECS,
} from '@/components/portal/ProductionSpecsStep';
import {
  SecureFileUploadStep,
  type SecureUploadData,
  INITIAL_SECURE_UPLOAD,
} from '@/components/portal/SecureFileUploadStep';
import { ConfirmationStep } from '@/components/portal/ConfirmationStep';
import { JobProgressChart } from '@/components/portal/JobProgressChart';
import { StarfieldBackground } from '@/components/portal/StarfieldBackground';

const INITIAL_MATTER: MatterInfo = {
  caseMatterName: '',
  matterNumber: '',
  clientEmail: '',
  leadAttorney: '',
  hardDeadlineDate: '',
  hardDeadlineTime: '',
};

const GLASS_CARD = 'transparent';
const GLASS_BORDER = 'rgba(255,255,255,0.15)';
const GLASS_GLOW = 'rgba(255,122,0,0.2)';
const ORANGE = '#FF7A00';

export default function PortalPage() {
  const [matterInfo, setMatterInfo] = useState<MatterInfo>(INITIAL_MATTER);
  const [productionSpecs, setProductionSpecs] = useState<ProductionSpecs>(INITIAL_PRODUCTION_SPECS);
  const [secureUpload, setSecureUpload] = useState<SecureUploadData>(INITIAL_SECURE_UPLOAD);
  const [submitted, setSubmitted] = useState(false);

  // ── Compute section readiness ──────────────────────────────────────────────
  const isSection1Ready = useMemo(
    () => matterInfo.caseMatterName.trim().length > 0 && matterInfo.clientEmail.trim().length > 0,
    [matterInfo.caseMatterName, matterInfo.clientEmail],
  );

  const isSection2Ready = useMemo(
    () => isSection1Ready && productionSpecs.selectedCategory !== '',
    [isSection1Ready, productionSpecs.selectedCategory],
  );

  const isSection3Ready = useMemo(
    () => isSection2Ready && secureUpload.files.length > 0,
    [isSection2Ready, secureUpload.files.length],
  );

  function handleStartNew() {
    setMatterInfo(INITIAL_MATTER);
    setProductionSpecs(INITIAL_PRODUCTION_SPECS);
    setSecureUpload(INITIAL_SECURE_UPLOAD);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col font-sans relative" style={{ background: '#07090F' }}>
        <StarfieldBackground />
        <PortalHeader />
        <div className="relative z-10 flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
          <ConfirmationStep
            matter={matterInfo}
            specs={productionSpecs}
            upload={secureUpload}
            onBack={() => setSubmitted(false)}
            onStartNew={handleStartNew}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ background: '#07090F' }}>
      <StarfieldBackground />
      <PortalHeader />

      {/* ── Hero Header with Job Stats ── */}
      <div className="mb-12 relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Headline and description */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#22C55E' }}>
              • PRODUCTION INTAKE
            </p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: '#F1F5F9' }}>
              Submit Your <span style={{ color: ORANGE }}>Production</span> Request
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#94A3B8' }}>
              Upload files, specify production details, and get on our queue. Our team will begin processing your request within 1 business hour.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6" style={{ background: ORANGE }}></div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748B' }}>DSU Discovery</p>
            </div>
          </div>

          {/* Right: AI Network Animation - no container */}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div>
          {/* ── Main content: full width ── */}
          <main className="flex flex-col gap-6" id="main-content" aria-label="Production intake form">
            {/* ─── SECTION 1: Matter Information ───────────────────────────────── */}
            <section>
              <MatterInformationStep data={matterInfo} onChange={setMatterInfo} onNext={() => {}} hideNext showHint />
            </section>

            {/* ─── SECTION 2: Production Specs (Progressive Disclosure) ────────── */}
            <section
              className="transition-all duration-500 overflow-hidden"
              style={{
                maxHeight: isSection1Ready ? '2000px' : '0',
                opacity: isSection1Ready ? 1 : 0,
                marginTop: isSection1Ready ? 0 : '-24px',
              }}
            >
              {isSection1Ready && (
                <ProductionSpecsStep data={productionSpecs} onChange={setProductionSpecs} onBack={() => {}} onNext={() => {}} hideNav showHint />
              )}
            </section>

            {/* ─── SECTION 3: File Upload (Progressive Disclosure) ───────────── */}
            <section
              className="transition-all duration-500 overflow-hidden"
              style={{
                maxHeight: isSection2Ready ? '3000px' : '0',
                opacity: isSection2Ready ? 1 : 0,
                marginTop: isSection2Ready ? 0 : '-24px',
              }}
            >
              {isSection2Ready && (
                <SecureFileUploadStep data={secureUpload} onChange={setSecureUpload} onBack={() => {}} onNext={() => {}} hideNav showHint />
              )}
            </section>

            {/* ─── SUBMIT BUTTON ───────────────────────────────────────────── */}
            {isSection3Ready && (
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={!isSection3Ready}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
                  style={{
                    background: isSection3Ready ? ORANGE : 'rgba(255,255,255,0.08)',
                    color: isSection3Ready ? '#07090F' : '#475569',
                    boxShadow: isSection3Ready ? `0 0 20px rgba(255,122,0,0.4)` : 'none',
                    cursor: isSection3Ready ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => {
                    if (isSection3Ready) {
                      (e.currentTarget as HTMLElement).style.background = '#FF9A3C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isSection3Ready) {
                      (e.currentTarget as HTMLElement).style.background = ORANGE;
                    }
                  }}
                >
                  Upload & Submit Request
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full mt-auto" style={{ background: 'rgba(7,9,15,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
        {/* Bottom bar */}
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: '#1E293B' }}>
            &copy; {new Date().getFullYear()} DSU Discovery, LLC. &nbsp;
            <span style={{ color: '#334155' }}>portal.dsudiscovery.com</span>
          </p>
          <nav aria-label="Footer links">
            <ul className="flex items-center gap-5 list-none" role="list">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'BAA Agreement', href: '#' },
                { label: 'Terms', href: '#' },
                { label: 'Staff Portal', href: '/staff' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-xs transition-colors duration-150"
                    style={{ color: '#1E293B' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#475569';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#1E293B';
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
