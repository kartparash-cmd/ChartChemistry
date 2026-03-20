"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen fixed overlay that cycles through subtle dark background
 * colors, creating a "breathing" effect behind all content.
 */
export function BreathingBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const colors = [
      "hsl(222, 47%, 7%)",   // navy (base)
      "hsl(265, 35%, 10%)",  // purple tint
      "hsl(240, 40%, 9%)",   // indigo
      "hsl(200, 45%, 8%)",   // deep teal
    ];

    let start: number | null = null;
    const cycleDuration = 25000; // 25 seconds full cycle
    let raf: number;

    const animate = (time: number) => {
      if (start === null) start = time;
      const elapsed = (time - start) % cycleDuration;
      const progress = elapsed / cycleDuration;

      // Smoothly interpolate between color stops
      const segmentCount = colors.length;
      const rawIndex = progress * segmentCount;
      const i = Math.floor(rawIndex) % segmentCount;
      const next = (i + 1) % segmentCount;
      const t = rawIndex - Math.floor(rawIndex);

      // Smooth ease
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      if (ref.current) {
        ref.current.style.backgroundColor = colors[i];
        ref.current.style.opacity = String(1 - ease * 0.3);
        // Blend by fading toward next color
        ref.current.style.backgroundColor = lerpColor(colors[i], colors[next], ease);
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 -z-10"
      style={{ backgroundColor: "hsl(222, 47%, 7%)" }}
      aria-hidden="true"
    />
  );
}

/** Parse an HSL string and lerp between two colors */
function lerpColor(a: string, b: string, t: number): string {
  const pa = parseHSL(a);
  const pb = parseHSL(b);
  if (!pa || !pb) return a;

  const h = pa.h + (pb.h - pa.h) * t;
  const s = pa.s + (pb.s - pa.s) * t;
  const l = pa.l + (pb.l - pa.l) * t;
  return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(1)}%)`;
}

function parseHSL(str: string): { h: number; s: number; l: number } | null {
  const m = str.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/);
  if (!m) return null;
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}
