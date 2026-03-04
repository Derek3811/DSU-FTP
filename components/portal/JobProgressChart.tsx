'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface JobProgressChartProps {
  filesCount: number;
  completionPercent: number;
  categoryCount: number;
}

export function JobProgressChart({ filesCount, completionPercent, categoryCount }: JobProgressChartProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Full rainbow + brand colors (8+ colors for vibrant donut)
  const rainbowColors = [
    '#FF0000', // Red
    '#FF7F00', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green (lime)
    '#00FFFF', // Cyan
    '#0000FF', // Blue
    '#4B0082', // Indigo
    '#9400D3', // Violet
  ];

  // Create data segments showing multiple progress metrics
  const data = [
    { name: 'Section 1: Matter Info', value: 33.33, description: 'Your contact & matter details' },
    { name: 'Section 2: Production Specs', value: 33.33, description: 'Service type & specifications' },
    { name: 'Section 3: File Upload', value: 33.34, description: `${filesCount} files attached` },
  ];

  // Calculate which segments are "complete" (filled vs faded)
  const completionThreshold = 33.33;
  const filledSegments = Math.floor(completionPercent / 33.33);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Donut Chart with Interactive Segments */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              onClick={(entry, index) => {
                setActiveSegment(activeSegment === data[index].name ? null : data[index].name);
              }}
            >
              {data.map((entry, index) => {
                const isActive = activeSegment === entry.name;
                const isFilled = index < filledSegments;
                const baseColor = rainbowColors[index % rainbowColors.length];
                const opacity = isFilled ? 1 : 0.3;
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={baseColor}
                    style={{
                      opacity,
                      filter: isActive ? `drop-shadow(0 0 12px ${baseColor})` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label showing completion % */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: '#FF7A00' }}>
              {completionPercent}%
            </p>
            <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
              Complete
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Info Cards */}
      <div className="w-full space-y-2">
        {data.map((segment, index) => {
          const baseColor = rainbowColors[index % rainbowColors.length];
          const isFilled = index < filledSegments;
          const isActive = activeSegment === segment.name;

          return (
            <div
              key={segment.name}
              onClick={() => setActiveSegment(isActive ? null : segment.name)}
              className="rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 border"
              style={{
                background: isActive ? `rgba(255,122,0,0.15)` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? 'rgba(255,122,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isActive ? `0 0 12px rgba(255,122,0,0.2)` : 'none',
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveSegment(isActive ? null : segment.name);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ background: baseColor, opacity: isFilled ? 1 : 0.4 }}></div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: isFilled ? '#F1F5F9' : '#64748B' }}>
                    {segment.name}
                  </p>
                  {isActive && (
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      {segment.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip */}
      {activeSegment && (
        <div className="rounded-lg px-4 py-2 text-xs font-medium"
          style={{
            background: 'rgba(255,122,0,0.2)',
            border: '1px solid rgba(255,122,0,0.4)',
            color: '#FF7A00',
            animation: 'fadeIn 0.2s ease-in',
          }}>
          Click a section to view details
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
