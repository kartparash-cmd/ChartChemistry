"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-screen fixed overlay that cycles through subtle dark background
 * colors, creating a "breathing" effect behind all content.
 * Uses inline styles exclusively to avoid Tailwind purge issues.
 */
export function BreathingBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const colors = [
      [222, 50, 5],   // navy (base)
      [265, 30, 14],  // purple tint
      [240, 40, 10],  // indigo
      [200, 50, 8],   // deep teal
    ];

    let start: number | null = null;
    const cycleDuration = 15000;
    let raf: number;

    const animate = (time: number) => {
      if (start === null) start = time;
      const elapsed = (time - start) % cycleDuration;
      const progress = elapsed / cycleDuration;

      const segmentCount = colors.length;
      const rawIndex = progress * segmentCount;
      const i = Math.floor(rawIndex) % segmentCount;
      const next = (i + 1) % segmentCount;
      const t = rawIndex - Math.floor(rawIndex);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const h = colors[i][0] + (colors[next][0] - colors[i][0]) * ease;
      const s = colors[i][1] + (colors[next][1] - colors[i][1]) * ease;
      const l = colors[i][2] + (colors[next][2] - colors[i][2]) * ease;

      if (ref.current) {
        ref.current.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
        const pulseOpacity = 0.03 + 0.02 * Math.sin(elapsed / cycleDuration * Math.PI * 2);
        ref.current.style.backgroundImage = `radial-gradient(ellipse at 50% 50%, hsla(${h}, ${s}%, ${l + 8}%, ${pulseOpacity}), transparent 70%)`;
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10,
        backgroundColor: "hsl(222, 47%, 7%)",
        pointerEvents: "none",
      }}
    />
  );
}
