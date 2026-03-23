"use client";

import { useEffect, useRef, useState } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!isDesktop || prefersReducedMotion) return;

    // Check user preference from localStorage
    const userDisabled = localStorage.getItem("cursor-glow-disabled") === "true";
    if (userDisabled) return;

    setEnabled(true);

    // Listen for toggle changes from settings
    const handleToggle = () => {
      const disabled = localStorage.getItem("cursor-glow-disabled") === "true";
      setEnabled(!disabled);
    };
    window.addEventListener("cursor-glow-toggle", handleToggle);
    return () => window.removeEventListener("cursor-glow-toggle", handleToggle);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 75}px, ${e.clientY - 75}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={glowRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 150,
        height: 150,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(167, 139, 250, 0.6) 0%, transparent 70%)",
        opacity: 0.12,
        pointerEvents: "none",
        mixBlendMode: "screen",
        transition: "transform 50ms linear",
        zIndex: 9999,
        willChange: "transform",
      }}
    />
  );
}
