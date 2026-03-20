"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Nebula {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  hue: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  rotation: number;
}

interface CelestialBody {
  x: number;
  y: number;
  radius: number;
  hue: number;
  saturation: number;
  opacity: number;
  driftX: number;
  driftY: number;
  glowRadius: number;
}

interface StarFieldProps {
  starCount?: number;
  className?: string;
  /** Enable shooting stars, nebulae, and distant planets */
  cosmic?: boolean;
}

export function StarField({ starCount = 100, className, cosmic = false }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const celestialRef = useRef<CelestialBody[]>([]);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const cosmicInitRef = useRef<boolean>(false);

  const initStars = useCallback(
    (width: number, height: number) => {
      const stars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
        });
      }
      starsRef.current = stars;
    },
    [starCount]
  );

  const initCosmic = useCallback((width: number, height: number) => {
    if (cosmicInitRef.current) return;
    cosmicInitRef.current = true;

    // Nebulae — 2-3 faint gradient clouds
    const nebulae: Nebula[] = [];
    const nebulaCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radiusX: 150 + Math.random() * 200,
        radiusY: 100 + Math.random() * 150,
        hue: [260, 280, 220, 310][Math.floor(Math.random() * 4)], // purples, blues, magentas
        opacity: 0.015 + Math.random() * 0.02,
        pulseSpeed: 0.003 + Math.random() * 0.004,
        pulseOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI,
      });
    }
    nebulaeRef.current = nebulae;

    // Celestial bodies — 1-2 very faint distant planets
    const bodies: CelestialBody[] = [];
    const bodyCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < bodyCount; i++) {
      bodies.push({
        x: 0.15 * width + Math.random() * 0.7 * width,
        y: 0.15 * height + Math.random() * 0.7 * height,
        radius: 8 + Math.random() * 18,
        hue: [30, 200, 280, 350, 45][Math.floor(Math.random() * 5)],
        saturation: 30 + Math.random() * 40,
        opacity: 0.06 + Math.random() * 0.06,
        driftX: (Math.random() - 0.5) * 0.015,
        driftY: (Math.random() - 0.5) * 0.01,
        glowRadius: 25 + Math.random() * 30,
      });
    }
    celestialRef.current = bodies;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      if (starsRef.current.length === 0) {
        initStars(rect.width, rect.height);
      }
      if (cosmic) {
        initCosmic(rect.width, rect.height);
      }
    };

    resizeCanvas();

    const handleResize = () => {
      cosmicInitRef.current = false;
      resizeCanvas();
      const rect = canvas.getBoundingClientRect();
      initStars(rect.width, rect.height);
      if (cosmic) {
        initCosmic(rect.width, rect.height);
      }
    };

    window.addEventListener("resize", handleResize);

    let time = 0;

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = 0;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      time += 1;

      // ── Nebulae (drawn first, behind everything) ──
      if (cosmic) {
        for (const nebula of nebulaeRef.current) {
          const pulse = Math.sin(time * nebula.pulseSpeed + nebula.pulseOffset) * 0.4 + 0.6;
          const currentOpacity = nebula.opacity * pulse;

          ctx.save();
          ctx.translate(nebula.x, nebula.y);
          ctx.rotate(nebula.rotation);

          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radiusX);
          gradient.addColorStop(0, `hsla(${nebula.hue}, 60%, 50%, ${currentOpacity})`);
          gradient.addColorStop(0.4, `hsla(${nebula.hue}, 50%, 40%, ${currentOpacity * 0.5})`);
          gradient.addColorStop(1, `hsla(${nebula.hue}, 40%, 30%, 0)`);

          ctx.beginPath();
          ctx.ellipse(0, 0, nebula.radiusX, nebula.radiusY, 0, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.restore();
        }
      }

      // ── Celestial bodies (faint planets) ──
      if (cosmic) {
        for (const body of celestialRef.current) {
          body.x += body.driftX;
          body.y += body.driftY;

          // Wrap around
          if (body.x < -50) body.x = rect.width + 50;
          if (body.x > rect.width + 50) body.x = -50;
          if (body.y < -50) body.y = rect.height + 50;
          if (body.y > rect.height + 50) body.y = -50;

          // Outer glow
          const glow = ctx.createRadialGradient(
            body.x, body.y, body.radius * 0.5,
            body.x, body.y, body.glowRadius
          );
          glow.addColorStop(0, `hsla(${body.hue}, ${body.saturation}%, 60%, ${body.opacity * 0.4})`);
          glow.addColorStop(1, `hsla(${body.hue}, ${body.saturation}%, 50%, 0)`);
          ctx.beginPath();
          ctx.arc(body.x, body.y, body.glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Planet body with gradient for 3D feel
          const planetGrad = ctx.createRadialGradient(
            body.x - body.radius * 0.3, body.y - body.radius * 0.3, body.radius * 0.1,
            body.x, body.y, body.radius
          );
          planetGrad.addColorStop(0, `hsla(${body.hue}, ${body.saturation}%, 70%, ${body.opacity * 0.8})`);
          planetGrad.addColorStop(0.7, `hsla(${body.hue}, ${body.saturation}%, 40%, ${body.opacity * 0.6})`);
          planetGrad.addColorStop(1, `hsla(${body.hue}, ${body.saturation}%, 20%, ${body.opacity * 0.3})`);

          ctx.beginPath();
          ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
          ctx.fillStyle = planetGrad;
          ctx.fill();
        }
      }

      // ── Stars ──
      for (const star of starsRef.current) {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = rect.width;
        if (star.x > rect.width) star.x = 0;
        if (star.y < 0) star.y = rect.height;
        if (star.y > rect.height) star.y = 0;

        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${currentOpacity})`;
        ctx.fill();

        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${currentOpacity * 0.15})`;
          ctx.fill();
        }
      }

      // ── Shooting stars ──
      if (cosmic) {
        // Spawn new shooting star occasionally (~1 every 4 seconds at 60fps)
        if (Math.random() < 0.004) {
          const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.2; // downward-right
          shootingStarsRef.current.push({
            x: Math.random() * rect.width * 0.8,
            y: Math.random() * rect.height * 0.4,
            length: 40 + Math.random() * 60,
            speed: 3 + Math.random() * 4,
            angle,
            opacity: 0.4 + Math.random() * 0.4,
            life: 0,
            maxLife: 40 + Math.random() * 30,
          });
        }

        // Update and draw shooting stars
        shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
          s.life += 1;
          if (s.life > s.maxLife) return false;

          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;

          // Fade in then out
          const progress = s.life / s.maxLife;
          const fade = progress < 0.2
            ? progress / 0.2
            : 1 - (progress - 0.2) / 0.8;
          const alpha = s.opacity * fade;

          // Draw streak
          const tailX = s.x - Math.cos(s.angle) * s.length;
          const tailY = s.y - Math.sin(s.angle) * s.length;

          const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
          gradient.addColorStop(0, `rgba(167, 139, 250, 0)`);
          gradient.addColorStop(0.6, `rgba(200, 180, 255, ${alpha * 0.3})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bright head
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          return true;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && animationRef.current === 0) {
          animationRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initStars, initCosmic, cosmic]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}
