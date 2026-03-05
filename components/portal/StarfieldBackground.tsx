"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;        // depth 0..1 — drives size + speed + opacity
  vx: number;       // slow horizontal drift
  vy: number;       // slow vertical drift
  twinkle: number;  // phase offset for opacity oscillation
}

interface NebulaOrb {
  x: number;
  y: number;
  rx: number;       // x-radius
  ry: number;       // y-radius
  color: string;
  alpha: number;
  vx: number;
  vy: number;
}

const STAR_COUNT   = 220;
const NEBULA_COUNT = 5;

// Neon orange family + deep blue-purple for the nebula clouds
const NEBULA_COLORS = [
  "255,100,0",    // neon orange-red
  "255,140,30",   // amber
  "180,60,255",   // violet
  "30,80,200",    // deep blue
  "0,180,220",    // cyan
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    // Respect reduced motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;

    // ── Init particles ─────────────────────────────────────────────────────
    const stars: Star[] = [];
    const nebulae: NebulaOrb[] = [];

    function initStars(w: number, h: number) {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: rand(0, w),
          y: rand(0, h),
          z: Math.random(),
          vx: rand(-0.04, 0.04),
          vy: rand(-0.015, 0.015),
          twinkle: rand(0, Math.PI * 2),
        });
      }
    }

    function initNebulae(w: number, h: number) {
      nebulae.length = 0;
      for (let i = 0; i < NEBULA_COUNT; i++) {
        nebulae.push({
          x: rand(0, w),
          y: rand(0, h),
          rx: rand(w * 0.18, w * 0.38),
          ry: rand(h * 0.14, h * 0.28),
          color: NEBULA_COLORS[i % NEBULA_COLORS.length],
          alpha: rand(0.018, 0.045),
          vx: rand(-0.06, 0.06),
          vy: rand(-0.03, 0.03),
        });
      }
    }

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
      initStars(W, H);
      initNebulae(W, H);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ── Draw loop ──────────────────────────────────────────────────────────
    let frame = 0;

    function draw() {
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      // ── Nebula orbs ───────────────────────────────────────────────────
      for (const orb of nebulae) {
        const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.rx);
        grd.addColorStop(0,   `rgba(${orb.color},${orb.alpha})`);
        grd.addColorStop(0.5, `rgba(${orb.color},${orb.alpha * 0.4})`);
        grd.addColorStop(1,   `rgba(${orb.color},0)`);

        ctx.save();
        ctx.scale(1, orb.ry / orb.rx);  // squash to ellipse
        ctx.beginPath();
        ctx.arc(orb.x, orb.y * (orb.rx / orb.ry), orb.rx, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.restore();

        if (!prefersReduced) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          // Soft wrap
          if (orb.x < -orb.rx)  orb.x = W + orb.rx;
          if (orb.x > W + orb.rx) orb.x = -orb.rx;
          if (orb.y < -orb.ry)  orb.y = H + orb.ry;
          if (orb.y > H + orb.ry) orb.y = -orb.ry;
        }
      }

      // ── Stars ─────────────────────────────────────────────────────────
      for (const s of stars) {
        const size    = 0.4 + s.z * 1.6;
        const twinkle = Math.sin(s.twinkle + frame * 0.018) * 0.35 + 0.65;
        const alpha   = (0.3 + s.z * 0.7) * twinkle;

        // Faint glow for the brightest stars
        if (s.z > 0.75) {
          const glowR = size * 3.5;
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
          // Warm white core with very faint orange tint
          grd.addColorStop(0,   `rgba(255,220,180,${alpha * 0.35})`);
          grd.addColorStop(1,   "rgba(255,200,150,0)");
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();

        if (!prefersReduced) {
          s.x += s.vx;
          s.y += s.vy;
          s.twinkle += 0.004;
          if (s.x < 0)  s.x = W;
          if (s.x > W)  s.x = 0;
          if (s.y < 0)  s.y = H;
          if (s.y > H)  s.y = 0;
        }
      }

      frame++;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
