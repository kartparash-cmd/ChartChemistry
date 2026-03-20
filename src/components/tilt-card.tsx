"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
}

export function TiltCard({ children, className, tiltAmount = 5 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current || !glareRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 2 * tiltAmount;
      const rotateX = (0.5 - y) * 2 * tiltAmount;

      cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      cardRef.current.style.transition = "transform 0.1s ease";

      const mouseXPercent = x * 100;
      const mouseYPercent = y * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${mouseXPercent}% ${mouseYPercent}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;
      glareRef.current.style.opacity = "1";
    },
    [reducedMotion, tiltAmount]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current || !glareRef.current) return;
    cardRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    cardRef.current.style.transition = "transform 0.3s ease";
    glareRef.current.style.opacity = "0";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative", className)}
      style={{ willChange: "transform" }}
    >
      {children}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
        style={{ transition: "opacity 0.3s ease" }}
      />
    </div>
  );
}
