"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const THEMES: Record<string, [number, number, number]> = {
  animated: [222, 50, 7],
  navy:     [222, 50, 7],
  purple:   [265, 35, 10],
  indigo:   [240, 40, 9],
  teal:     [200, 50, 8],
};

const STORAGE_KEY = "cc_bg_theme";

export function BreathingBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("animated");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) setTheme(saved);

    // Listen for theme changes from Settings
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && THEMES[detail]) setTheme(detail);
    };
    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, []);

  useEffect(() => {
    if (!mounted || !ref.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (theme !== "animated") {
      const hsl = THEMES[theme];
      if (hsl && ref.current) {
        ref.current.style.backgroundColor = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
        ref.current.style.backgroundImage = "none";
      }
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const colors = [
      [222, 50, 5],
      [265, 30, 14],
      [240, 40, 10],
      [200, 50, 8],
    ];

    let start: number | null = null;
    const cycleDuration = 15000;

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

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted, theme]);

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
