"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Theme definitions: [hue, saturation, lightness]
const THEMES: Record<string, { label: string; color: string; hsl: [number, number, number] }> = {
  animated: { label: "Cosmic", color: "linear-gradient(135deg, hsl(222,50%,7%), hsl(265,30%,14%), hsl(200,50%,8%))", hsl: [222, 50, 7] },
  navy:     { label: "Navy",   color: "hsl(222, 50%, 7%)",  hsl: [222, 50, 7] },
  purple:   { label: "Purple", color: "hsl(265, 35%, 10%)", hsl: [265, 35, 10] },
  indigo:   { label: "Indigo", color: "hsl(240, 40%, 9%)",  hsl: [240, 40, 9] },
  teal:     { label: "Teal",   color: "hsl(200, 50%, 8%)",  hsl: [200, 50, 8] },
};

const THEME_KEYS = Object.keys(THEMES);
const STORAGE_KEY = "cc_bg_theme";

/**
 * Full-screen fixed background with theme selection.
 * "animated" = breathing gradient cycle, others = static color.
 */
export function BreathingBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("animated");
  const rafRef = useRef<number>(0);

  // Load preference from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) {
      setTheme(saved);
    }
  }, []);

  const changeTheme = useCallback((newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  // Handle animation or static color
  useEffect(() => {
    if (!mounted || !ref.current) return;

    // Cancel any running animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (theme !== "animated") {
      // Static color
      const t = THEMES[theme];
      if (t && ref.current) {
        ref.current.style.backgroundColor = `hsl(${t.hsl[0]}, ${t.hsl[1]}%, ${t.hsl[2]}%)`;
        ref.current.style.backgroundImage = "none";
      }
      return;
    }

    // Animated breathing
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
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
    <>
      {/* Background layer */}
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

      {/* Theme picker — bottom-right corner */}
      <div
        style={{
          position: "fixed",
          bottom: 80,
          right: 16,
          zIndex: 40,
        }}
        className="hidden md:block"
      >
        <div className="flex flex-col items-center gap-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl px-1.5 py-2">
          {THEME_KEYS.map((key) => {
            const t = THEMES[key];
            const isActive = theme === key;
            return (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                title={t.label}
                aria-label={`${t.label} theme`}
                className="group relative"
              >
                <div
                  className={`h-5 w-5 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-white scale-110"
                      : "border-white/20 hover:border-white/50 hover:scale-105"
                  }`}
                  style={{
                    background: key === "animated"
                      ? "conic-gradient(hsl(222,50%,12%), hsl(265,35%,15%), hsl(200,50%,12%), hsl(222,50%,12%))"
                      : `hsl(${t.hsl[0]}, ${t.hsl[1]}%, ${Math.max(t.hsl[2] + 5, 12)}%)`,
                  }}
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-full ring-2 ring-white/30 ring-offset-1 ring-offset-transparent" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
