'use client';

import React from 'react';
import { FileIcon, ChevronRightIcon } from 'lucide-react';
import type { MatterInfo } from '@/components/portal/MatterInformationStep';
import type { ProductionSpecs } from '@/components/portal/ProductionSpecsStep';
import type { SecureUploadData } from '@/components/portal/SecureFileUploadStep';

const ORANGE = '#FF7A00';
const GLASS = 'rgba(13,17,23,0.85)';
const GLASS_BORDER = 'rgba(255,255,255,0.08)';

interface LiveJobTicketProps {
  matter?: MatterInfo;
  specs?: ProductionSpecs;
  upload?: SecureUploadData;
  isSection1Ready?: boolean;
  isSection2Ready?: boolean;
  isSection3Ready?: boolean;
}

export function LiveJobTicket({
  matter,
  specs,
  upload,
  isSection1Ready,
  isSection2Ready,
  isSection3Ready,
}: LiveJobTicketProps) {
  const fileCount = upload?.files?.length ?? 0;
  const totalSize = upload?.files?.reduce((sum, f) => sum + (f.size ?? 0), 0) ?? 0;
  const sizeGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <aside
      className="sticky top-6 rounded-xl p-6 h-fit"
      style={{
        background: GLASS,
        border: `1px solid ${GLASS_BORDER}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#334155' }}>
          Live Job Ticket
        </p>
        <h3 className="text-lg font-bold mt-1" style={{ color: '#F1F5F9' }}>
          {matter?.caseMatterName ? `${matter.caseMatterName.slice(0, 30)}${matter.caseMatterName.length > 30 ? '...' : ''}` : 'New Matter'}
        </h3>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3">
        {/* Section 1 */}
        <div
          className="rounded-lg p-3 transition-all duration-200"
          style={{
            background: isSection1Ready ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isSection1Ready ? 'rgba(34,197,94,0.25)' : GLASS_BORDER}`,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: isSection1Ready ? '#86EFAC' : '#475569' }}>
              Matter Info
            </p>
            {isSection1Ready && <ChevronRightIcon className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />}
          </div>
          {matter?.caseMatterName && (
            <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: '#94A3B8' }}>
              <span style={{ color: '#E2E8F0' }}>Ref:</span> {matter.caseMatterName}
            </p>
          )}
          {matter?.clientEmail && (
            <p className="text-[11px] mt-1 truncate" style={{ color: '#94A3B8' }}>
              <span style={{ color: '#E2E8F0' }}>Email:</span> {matter.clientEmail}
            </p>
          )}
        </div>

        {/* Section 2 */}
        <div
          className="rounded-lg p-3 transition-all duration-200"
          style={{
            background: isSection2Ready ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isSection2Ready ? 'rgba(34,197,94,0.25)' : GLASS_BORDER}`,
            opacity: isSection1Ready ? 1 : 0.5,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: isSection2Ready ? '#86EFAC' : '#475569' }}>
              Production Specs
            </p>
            {isSection2Ready && <ChevronRightIcon className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />}
          </div>
          {specs?.selectedCategory && (
            <p className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>
              <span style={{ color: '#E2E8F0' }}>Service:</span> {specs.selectedCategory}
            </p>
          )}
          {specs?.format && (
            <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>
              <span style={{ color: '#E2E8F0' }}>Format:</span> {specs.format}
            </p>
          )}
        </div>

        {/* Section 3 */}
        <div
          className="rounded-lg p-3 transition-all duration-200"
          style={{
            background: isSection3Ready ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isSection3Ready ? 'rgba(34,197,94,0.25)' : GLASS_BORDER}`,
            opacity: isSection2Ready ? 1 : 0.5,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: isSection3Ready ? '#86EFAC' : '#475569' }}>
              Files
            </p>
            {isSection3Ready && <ChevronRightIcon className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />}
          </div>
          {fileCount > 0 ? (
            <>
              <p className="text-[11px] mt-1.5 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
                <FileIcon className="w-3 h-3" />
                <span>
                  <span style={{ color: '#E2E8F0' }}>{fileCount}</span> file{fileCount !== 1 ? 's' : ''}
                </span>
              </p>
              <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>
                <span style={{ color: '#E2E8F0' }}>{sizeGB}</span> GB
              </p>
            </>
          ) : (
            <p className="text-[11px] mt-1.5" style={{ color: '#475569' }}>
              Awaiting files...
            </p>
          )}
        </div>
      </div>

      {/* Action hint */}
      {isSection3Ready && (
        <div className="mt-5 p-3 rounded-lg" style={{ background: `rgba(255,122,0,0.08)`, border: `1px solid rgba(255,122,0,0.2)` }}>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: ORANGE }}>
            Ready to Submit
          </p>
          <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: '#94A3B8' }}>
            Scroll down and click the submit button to upload files, generate share links, and receive your receipt.
          </p>
        </div>
      )}
    </aside>
  );
}
