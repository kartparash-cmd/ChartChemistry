"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  trigger: boolean;
}

const COLORS = [
  "#7c3aed", // cosmic-purple
  "#a78bfa", // cosmic-purple-light
  "#d4af37", // gold
  "#34d399", // emerald-400
  "#f472b6", // pink-400
];

const SHAPES = ["square", "circle", "strip"] as const;

interface Particle {
  id: number;
  x: number;
  color: string;
  shape: (typeof SHAPES)[number];
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  drift: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    delay: Math.random() * 0.8,
    duration: 1.8 + Math.random() * 1.4,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
    drift: -30 + Math.random() * 60,
  }));
}

export function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const generated = generateParticles(35);
    setParticles(generated);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setParticles([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible || particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) translateX(0px) rotate(0deg);
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--confetti-drift)) rotate(var(--confetti-rotation));
            opacity: 0;
          }
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
        aria-hidden="true"
      >
        {particles.map((p) => {
          const shapeStyle: React.CSSProperties =
            p.shape === "circle"
              ? { borderRadius: "50%", width: p.size, height: p.size }
              : p.shape === "strip"
              ? { borderRadius: 2, width: p.size * 0.4, height: p.size * 1.5 }
              : { borderRadius: 2, width: p.size, height: p.size };

          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: -12,
                backgroundColor: p.color,
                animationName: "confetti-fall",
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                animationFillMode: "forwards",
                ["--confetti-drift" as string]: `${p.drift}px`,
                ["--confetti-rotation" as string]: `${p.rotation + 720}deg`,
                ...shapeStyle,
              }}
            />
          );
        })}
      </div>
    </>
  );
}
