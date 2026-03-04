'use client';

import { useEffect, useRef } from 'react';

export function AINetworkAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Try loading Lottie animation
    const loadLottie = async () => {
      try {
        const response = await fetch('/ai-network-animation.json');
        const animationData = await response.json();

        // Try to use lottie-web if available
        const lottie = (window as any).lottie;
        if (lottie) {
          lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData,
          });
        } else {
          // Fallback: render SVG placeholder since lottie-web not loaded
          renderFallbackSVG();
        }
      } catch (error) {
        console.log('[v0] Lottie animation failed, using SVG fallback');
        renderFallbackSVG();
      }
    };

    const renderFallbackSVG = () => {
      if (!containerRef.current) return;
      // Render the enhanced SVG fallback
      containerRef.current.innerHTML = `<svg viewBox="0 0 420 420" width="100%" height="auto" style="max-width: 420px; display: block;">
        <defs>
          <style>
            @keyframes particleAppear { 0% { opacity: 0; r: 0; } 20% { opacity: 1; r: 5; } 100% { opacity: 1; r: 5; } }
            @keyframes networkFlow { 0% { stroke-dashoffset: 30; opacity: 0.3; } 50% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0.3; } }
            @keyframes documentPulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            .particle { fill: #00D9FF; filter: drop-shadow(0 0 8px #00D9FF); animation: particleAppear 0.8s ease-out forwards; }
            .connection { stroke: #00D9FF; stroke-width: 1.5; stroke-dasharray: 30; animation: networkFlow 3s linear infinite; }
            .docframe { stroke: #00D9FF; stroke-width: 1.5; fill: none; animation: documentPulse 2s ease-in-out infinite; }
          </style>
        </defs>
        <!-- Neural network particles -->
        <circle cx="80" cy="100" r="0" class="particle" style="animation-delay: 0s" />
        <circle cx="340" cy="100" r="0" class="particle" style="animation-delay: 0.2s" />
        <circle cx="210" cy="280" r="0" class="particle" style="animation-delay: 0.4s" />
        <circle cx="100" cy="200" r="0" class="particle" style="animation-delay: 0.6s" />
        <circle cx="330" cy="200" r="0" class="particle" style="animation-delay: 0.8s" />
        <circle cx="210" cy="120" r="0" class="particle" style="animation-delay: 1s" />
        
        <!-- Network connections -->
        <line x1="80" y1="100" x2="340" y2="100" class="connection" style="animation-delay: 1.2s" />
        <line x1="80" y1="100" x2="100" y2="200" class="connection" style="animation-delay: 1.4s" />
        <line x1="340" y1="100" x2="330" y2="200" class="connection" style="animation-delay: 1.6s" />
        <line x1="100" y1="200" x2="330" y2="200" class="connection" style="animation-delay: 1.8s" />
        <line x1="100" y1="200" x2="210" y2="280" class="connection" style="animation-delay: 2s" />
        <line x1="330" y1="200" x2="210" y2="280" class="connection" style="animation-delay: 2.2s" />
        
        <!-- Document outline that forms -->
        <g style="opacity: 0; animation: documentPulse 2s ease-in-out 2.5s forwards;">
          <rect x="150" y="140" width="120" height="160" class="docframe" />
          <line x1="165" y1="175" x2="285" y2="175" class="docframe" style="stroke-width: 1; opacity: 0.6" />
          <line x1="165" y1="205" x2="285" y2="205" class="docframe" style="stroke-width: 1; opacity: 0.6" />
          <line x1="165" y1="235" x2="285" y2="235" class="docframe" style="stroke-width: 1; opacity: 0.6" />
          <line x1="165" y1="265" x2="245" y2="265" class="docframe" style="stroke-width: 1; opacity: 0.6" />
        </g>
      </svg>`;
    };

    loadLottie();
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ 
        maxWidth: '420px', 
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px'
      }}
    />
  );
}
