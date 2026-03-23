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

type PlanetKind = "saturn" | "jupiter" | "mars" | "neptune";

interface Planet {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  driftX: number;
  driftY: number;
  glowRadius: number;
  kind: PlanetKind;
  depth: number; // 0.6-1.0, affects size scaling and parallax
}

interface SpiralGalaxy {
  x: number;
  y: number;
  size: number; // overall radius
  opacity: number;
  rotation: number; // current rotation angle
  rotationSpeed: number; // radians per frame
  hue: number;
  arms: number; // number of spiral arms (2-3)
  /** Pre-computed dot positions in local coords (angle, dist from center) */
  dots: Array<{ angle: number; dist: number; size: number; brightness: number }>;
}

interface StarFieldProps {
  starCount?: number;
  className?: string;
  /** Enable shooting stars, nebulae, and distant planets */
  cosmic?: boolean;
}

// Parallax depth multipliers per layer
const PARALLAX_NEBULA = 0.5;
const PARALLAX_GALAXY = 0.4;
const PARALLAX_PLANET = 0.8;
const PARALLAX_STAR = 1.2;
// Max offset in pixels for the fastest layer (stars at 1.2x)
const PARALLAX_MAX_PX = 15;

export function StarField({ starCount = 100, className, cosmic = false }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const celestialRef = useRef<CelestialBody[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const galaxiesRef = useRef<SpiralGalaxy[]>([]);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const cosmicInitRef = useRef<boolean>(false);
  const reducedMotionRef = useRef<boolean>(false);

  // Mouse parallax refs — using refs to avoid re-renders
  const mouseXRef = useRef<number>(0); // normalized -1 to 1
  const mouseYRef = useRef<number>(0); // normalized -1 to 1
  const hasPointerFineRef = useRef<boolean>(false);

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

    // Celestial bodies — 1-2 very faint distant planets (original)
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

    // ── Recognizable planets ──
    const planetKinds: PlanetKind[] = ["saturn", "jupiter", "mars", "neptune"];
    const planets: Planet[] = [];
    const usedPositions: Array<{ x: number; y: number; r: number }> = [];

    const doesOverlap = (x: number, y: number, r: number) => {
      for (const p of usedPositions) {
        const dx = x - p.x;
        const dy = y - p.y;
        const minDist = r + p.r + 80; // 80px minimum gap
        if (dx * dx + dy * dy < minDist * minDist) return true;
      }
      return false;
    };

    for (const kind of planetKinds) {
      // Depth affects apparent size: deeper = smaller
      const depth = 0.6 + Math.random() * 0.4;
      let baseRadius: number;
      switch (kind) {
        case "saturn": baseRadius = 14 + Math.random() * 8; break;   // 14-22 body, rings make it wider
        case "jupiter": baseRadius = 18 + Math.random() * 10; break; // 18-28, largest
        case "mars": baseRadius = 8 + Math.random() * 5; break;      // 8-13, small
        case "neptune": baseRadius = 10 + Math.random() * 6; break;  // 10-16
      }
      const scaledRadius = baseRadius * depth;

      // Find non-overlapping position (try up to 30 times)
      let x = 0, y = 0;
      let placed = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        x = 0.1 * width + Math.random() * 0.8 * width;
        y = 0.1 * height + Math.random() * 0.8 * height;
        if (!doesOverlap(x, y, scaledRadius)) {
          placed = true;
          break;
        }
      }
      if (!placed) {
        // Just place it somewhere
        x = 0.1 * width + Math.random() * 0.8 * width;
        y = 0.1 * height + Math.random() * 0.8 * height;
      }

      usedPositions.push({ x, y, r: scaledRadius });

      // Very slow drift: 0.005-0.015 px/frame
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.005 + Math.random() * 0.01;

      planets.push({
        x,
        y,
        radius: scaledRadius,
        opacity: 0.25 + depth * 0.2, // 0.25-0.45 — closer planets slightly more opaque
        driftX: Math.cos(angle) * speed,
        driftY: Math.sin(angle) * speed,
        glowRadius: scaledRadius * 2.5,
        kind,
        depth,
      });
    }
    planetsRef.current = planets;

    // ── Spiral galaxies ──
    const galaxyCount = 1 + Math.floor(Math.random() * 2); // 1-2
    const galaxies: SpiralGalaxy[] = [];
    for (let i = 0; i < galaxyCount; i++) {
      const size = 150 + Math.random() * 200; // 150-350px radius
      const arms = 2 + Math.floor(Math.random() * 2); // 2-3 arms
      const hue = [260, 280, 300, 220][Math.floor(Math.random() * 4)];

      // Pre-compute spiral dots for performance
      const dots: SpiralGalaxy["dots"] = [];
      const dotsPerArm = 60;
      for (let arm = 0; arm < arms; arm++) {
        const armOffset = (arm / arms) * Math.PI * 2;
        for (let d = 0; d < dotsPerArm; d++) {
          const t = d / dotsPerArm; // 0 to 1, center to edge
          const dist = t * size;
          // Logarithmic spiral: angle increases with distance
          const spiralAngle = armOffset + t * Math.PI * 3; // 1.5 full turns per arm
          // Add scatter/spread that increases with distance
          const scatter = (Math.random() - 0.5) * t * 0.8;
          const distScatter = dist + (Math.random() - 0.5) * size * 0.15;
          dots.push({
            angle: spiralAngle + scatter,
            dist: Math.max(0, distScatter),
            size: 0.5 + Math.random() * 1.5 * (1 - t * 0.5), // bigger near center
            brightness: 0.3 + Math.random() * 0.7 * (1 - t * 0.6), // brighter near center
          });
        }
      }
      // Add a dense core cluster
      for (let c = 0; c < 40; c++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * size * 0.15;
        dots.push({
          angle,
          dist,
          size: 0.5 + Math.random() * 1.0,
          brightness: 0.6 + Math.random() * 0.4,
        });
      }

      galaxies.push({
        x: 0.15 * width + Math.random() * 0.7 * width,
        y: 0.15 * height + Math.random() * 0.7 * height,
        size,
        opacity: 0.1 + Math.random() * 0.1, // 0.1-0.2
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: ((Math.random() > 0.5 ? 1 : -1) * (0.0003 + Math.random() * 0.0005)), // full rotation ~60-120s at 60fps
        hue,
        arms,
        dots,
      });
    }
    galaxiesRef.current = galaxies;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect pointer type once for parallax
    hasPointerFineRef.current = window.matchMedia("(pointer: fine)").matches;
    // Detect reduced motion preference
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse move handler for parallax (non-touch only)
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      // Normalize to -1..1 range relative to viewport center
      mouseXRef.current = (e.clientX - cx) / cx;
      mouseYRef.current = (e.clientY - cy) / cy;
    };

    if (hasPointerFineRef.current) {
      window.addEventListener("mousemove", handleMouseMove);
    }

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

    // Helper: compute parallax offset for a given depth multiplier
    const getParallaxOffset = (depthMultiplier: number) => {
      if (!hasPointerFineRef.current) return { dx: 0, dy: 0 };
      // Base max offset scaled by depth; PARALLAX_MAX_PX is for the fastest layer
      const maxOffset = (PARALLAX_MAX_PX / PARALLAX_STAR) * depthMultiplier;
      return {
        dx: mouseXRef.current * maxOffset,
        dy: mouseYRef.current * maxOffset,
      };
    };

    // ── Planet drawing helpers ──

    const drawSaturn = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity: number) => {
      // Glow
      const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);
      glow.addColorStop(0, `rgba(218, 190, 130, ${opacity * 0.3})`);
      glow.addColorStop(1, `rgba(218, 190, 130, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Planet body — warm gold/tan
      const bodyGrad = ctx.createRadialGradient(
        x - r * 0.3, y - r * 0.3, r * 0.1,
        x, y, r
      );
      bodyGrad.addColorStop(0, `rgba(235, 210, 150, ${opacity * 0.9})`);
      bodyGrad.addColorStop(0.5, `rgba(200, 170, 110, ${opacity * 0.7})`);
      bodyGrad.addColorStop(1, `rgba(160, 130, 80, ${opacity * 0.4})`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Subtle band across the body
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = `rgba(180, 150, 90, ${opacity * 0.15})`;
      ctx.fillRect(x - r, y - r * 0.15, r * 2, r * 0.3);
      ctx.fillStyle = `rgba(140, 110, 70, ${opacity * 0.12})`;
      ctx.fillRect(x - r, y + r * 0.2, r * 2, r * 0.2);
      ctx.restore();

      // Rings — the iconic feature! Drawn as angled ellipse
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.3); // slight tilt

      // Ring shadow on planet (back half of ring behind planet)
      // Draw back portion of ring first (behind planet) — skip, it's subtle enough

      // Ring: outer ring
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 2.2, r * 0.55, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(210, 185, 135, ${opacity * 0.5})`;
      ctx.lineWidth = r * 0.18;
      ctx.stroke();

      // Ring: inner ring (brighter)
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.7, r * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(230, 205, 155, ${opacity * 0.4})`;
      ctx.lineWidth = r * 0.12;
      ctx.stroke();

      // Ring gap (Cassini division) — draw thin dark line
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.9, r * 0.48, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(30, 20, 40, ${opacity * 0.2})`;
      ctx.lineWidth = r * 0.04;
      ctx.stroke();

      ctx.restore();
    };

    const drawJupiter = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity: number) => {
      // Glow
      const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.5);
      glow.addColorStop(0, `rgba(210, 170, 120, ${opacity * 0.25})`);
      glow.addColorStop(1, `rgba(210, 170, 120, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Planet body — orange/brown/tan
      const bodyGrad = ctx.createRadialGradient(
        x - r * 0.25, y - r * 0.25, r * 0.1,
        x, y, r
      );
      bodyGrad.addColorStop(0, `rgba(230, 195, 140, ${opacity * 0.85})`);
      bodyGrad.addColorStop(0.5, `rgba(200, 155, 100, ${opacity * 0.65})`);
      bodyGrad.addColorStop(1, `rgba(150, 110, 70, ${opacity * 0.35})`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Horizontal band stripes
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      const bands = [
        { yOff: -0.6, h: 0.2, color: `rgba(190, 140, 80, ${opacity * 0.2})` },
        { yOff: -0.3, h: 0.15, color: `rgba(170, 120, 70, ${opacity * 0.18})` },
        { yOff: -0.05, h: 0.12, color: `rgba(200, 150, 90, ${opacity * 0.15})` },
        { yOff: 0.15, h: 0.2, color: `rgba(180, 130, 75, ${opacity * 0.2})` },
        { yOff: 0.45, h: 0.18, color: `rgba(160, 115, 65, ${opacity * 0.17})` },
      ];
      for (const band of bands) {
        ctx.fillStyle = band.color;
        ctx.fillRect(x - r, y + band.yOff * r, r * 2, band.h * r);
      }

      // Great Red Spot — small oval
      const spotX = x + r * 0.3;
      const spotY = y + r * 0.25;
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, r * 0.18);
      spotGrad.addColorStop(0, `rgba(200, 100, 60, ${opacity * 0.3})`);
      spotGrad.addColorStop(1, `rgba(200, 100, 60, 0)`);
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, r * 0.18, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = spotGrad;
      ctx.fill();

      ctx.restore();
    };

    const drawMars = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity: number) => {
      // Glow
      const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.5);
      glow.addColorStop(0, `rgba(200, 100, 80, ${opacity * 0.3})`);
      glow.addColorStop(1, `rgba(200, 100, 80, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Body — reddish
      const bodyGrad = ctx.createRadialGradient(
        x - r * 0.3, y - r * 0.3, r * 0.1,
        x, y, r
      );
      bodyGrad.addColorStop(0, `rgba(220, 130, 100, ${opacity * 0.9})`);
      bodyGrad.addColorStop(0.6, `rgba(180, 90, 65, ${opacity * 0.7})`);
      bodyGrad.addColorStop(1, `rgba(130, 60, 45, ${opacity * 0.4})`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Subtle darker region
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      const dark = ctx.createRadialGradient(x + r * 0.2, y - r * 0.1, 0, x + r * 0.2, y - r * 0.1, r * 0.5);
      dark.addColorStop(0, `rgba(100, 50, 35, ${opacity * 0.2})`);
      dark.addColorStop(1, `rgba(100, 50, 35, 0)`);
      ctx.beginPath();
      ctx.arc(x + r * 0.2, y - r * 0.1, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = dark;
      ctx.fill();
      ctx.restore();
    };

    const drawNeptune = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity: number) => {
      // Glow
      const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.5);
      glow.addColorStop(0, `rgba(80, 160, 220, ${opacity * 0.3})`);
      glow.addColorStop(1, `rgba(80, 160, 220, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Body — blue-green
      const bodyGrad = ctx.createRadialGradient(
        x - r * 0.3, y - r * 0.3, r * 0.1,
        x, y, r
      );
      bodyGrad.addColorStop(0, `rgba(120, 200, 240, ${opacity * 0.85})`);
      bodyGrad.addColorStop(0.5, `rgba(70, 140, 200, ${opacity * 0.65})`);
      bodyGrad.addColorStop(1, `rgba(40, 90, 160, ${opacity * 0.35})`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Subtle atmospheric band
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = `rgba(100, 180, 230, ${opacity * 0.12})`;
      ctx.fillRect(x - r, y - r * 0.1, r * 2, r * 0.15);
      ctx.restore();
    };

    const drawPlanet = (ctx: CanvasRenderingContext2D, planet: Planet, offsetX: number, offsetY: number) => {
      const x = planet.x + offsetX;
      const y = planet.y + offsetY;
      const r = planet.radius;
      const o = planet.opacity;

      switch (planet.kind) {
        case "saturn": drawSaturn(ctx, x, y, r, o); break;
        case "jupiter": drawJupiter(ctx, x, y, r, o); break;
        case "mars": drawMars(ctx, x, y, r, o); break;
        case "neptune": drawNeptune(ctx, x, y, r, o); break;
      }
    };

    const drawSpiralGalaxy = (ctx: CanvasRenderingContext2D, galaxy: SpiralGalaxy, offsetX: number, offsetY: number) => {
      const cx = galaxy.x + offsetX;
      const cy = galaxy.y + offsetY;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(galaxy.rotation);

      // Core glow
      const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size * 0.3);
      coreGlow.addColorStop(0, `hsla(${galaxy.hue}, 60%, 70%, ${galaxy.opacity * 0.4})`);
      coreGlow.addColorStop(0.5, `hsla(${galaxy.hue}, 50%, 50%, ${galaxy.opacity * 0.15})`);
      coreGlow.addColorStop(1, `hsla(${galaxy.hue}, 40%, 40%, 0)`);
      ctx.beginPath();
      ctx.arc(0, 0, galaxy.size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      // Draw all pre-computed dots
      for (const dot of galaxy.dots) {
        const dx = Math.cos(dot.angle) * dot.dist;
        const dy = Math.sin(dot.angle) * dot.dist;
        const alpha = galaxy.opacity * dot.brightness;

        // Vary color slightly per dot: mix of hue and hue+30
        const dotHue = galaxy.hue + (dot.angle % 1) * 30;
        ctx.beginPath();
        ctx.arc(dx, dy, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dotHue}, 55%, 65%, ${alpha})`;
        ctx.fill();
      }

      ctx.restore();
    };

    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = 0;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const isReduced = reducedMotionRef.current;
      time += 1;

      // ── Nebulae (drawn first, behind everything) ──
      if (cosmic) {
        const nebulaOffset = getParallaxOffset(PARALLAX_NEBULA);
        for (const nebula of nebulaeRef.current) {
          const pulse = isReduced ? 0.8 : Math.sin(time * nebula.pulseSpeed + nebula.pulseOffset) * 0.4 + 0.6;
          const currentOpacity = nebula.opacity * pulse;

          ctx.save();
          ctx.translate(nebula.x + nebulaOffset.dx, nebula.y + nebulaOffset.dy);
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

      // ── Spiral galaxies (behind planets and stars) ──
      if (cosmic) {
        const galaxyOffset = getParallaxOffset(PARALLAX_GALAXY);
        for (const galaxy of galaxiesRef.current) {
          if (!isReduced) {
            galaxy.rotation += galaxy.rotationSpeed;
          }
          drawSpiralGalaxy(ctx, galaxy, galaxyOffset.dx, galaxyOffset.dy);
        }
      }

      // ── Celestial bodies (original faint planets) ──
      if (cosmic) {
        const planetOffset = getParallaxOffset(PARALLAX_PLANET);
        for (const body of celestialRef.current) {
          if (!isReduced) {
            body.x += body.driftX;
            body.y += body.driftY;
          }

          // Wrap around
          if (body.x < -50) body.x = rect.width + 50;
          if (body.x > rect.width + 50) body.x = -50;
          if (body.y < -50) body.y = rect.height + 50;
          if (body.y > rect.height + 50) body.y = -50;

          const drawX = body.x + planetOffset.dx;
          const drawY = body.y + planetOffset.dy;

          // Outer glow
          const glow = ctx.createRadialGradient(
            drawX, drawY, body.radius * 0.5,
            drawX, drawY, body.glowRadius
          );
          glow.addColorStop(0, `hsla(${body.hue}, ${body.saturation}%, 60%, ${body.opacity * 0.4})`);
          glow.addColorStop(1, `hsla(${body.hue}, ${body.saturation}%, 50%, 0)`);
          ctx.beginPath();
          ctx.arc(drawX, drawY, body.glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Planet body with gradient for 3D feel
          const planetGrad = ctx.createRadialGradient(
            drawX - body.radius * 0.3, drawY - body.radius * 0.3, body.radius * 0.1,
            drawX, drawY, body.radius
          );
          planetGrad.addColorStop(0, `hsla(${body.hue}, ${body.saturation}%, 70%, ${body.opacity * 0.8})`);
          planetGrad.addColorStop(0.7, `hsla(${body.hue}, ${body.saturation}%, 40%, ${body.opacity * 0.6})`);
          planetGrad.addColorStop(1, `hsla(${body.hue}, ${body.saturation}%, 20%, ${body.opacity * 0.3})`);

          ctx.beginPath();
          ctx.arc(drawX, drawY, body.radius, 0, Math.PI * 2);
          ctx.fillStyle = planetGrad;
          ctx.fill();
        }
      }

      // ── Recognizable planets (Saturn, Jupiter, Mars, Neptune) ──
      if (cosmic) {
        const planetOffset = getParallaxOffset(PARALLAX_PLANET);
        for (const planet of planetsRef.current) {
          if (!isReduced) {
            planet.x += planet.driftX;
            planet.y += planet.driftY;
          }

          // Wrap around with generous margin for Saturn's rings
          const margin = planet.kind === "saturn" ? planet.radius * 3 : planet.radius * 2;
          if (planet.x < -margin) planet.x = rect.width + margin;
          if (planet.x > rect.width + margin) planet.x = -margin;
          if (planet.y < -margin) planet.y = rect.height + margin;
          if (planet.y > rect.height + margin) planet.y = -margin;

          drawPlanet(ctx, planet, planetOffset.dx, planetOffset.dy);
        }
      }

      // ── Stars ──
      {
        const starOffset = getParallaxOffset(PARALLAX_STAR);
        for (const star of starsRef.current) {
          if (!isReduced) {
            star.x += star.vx;
            star.y += star.vy;
          }

          if (star.x < 0) star.x = rect.width;
          if (star.x > rect.width) star.x = 0;
          if (star.y < 0) star.y = rect.height;
          if (star.y > rect.height) star.y = 0;

          const drawX = star.x + starOffset.dx;
          const drawY = star.y + starOffset.dy;

          const twinkle = isReduced
            ? 0.85
            : Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
          const currentOpacity = star.opacity * twinkle;

          ctx.beginPath();
          ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${currentOpacity})`;
          ctx.fill();

          if (star.radius > 1) {
            ctx.beginPath();
            ctx.arc(drawX, drawY, star.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167, 139, 250, ${currentOpacity * 0.15})`;
            ctx.fill();
          }
        }
      }

      // ── Shooting stars (unaffected by parallax) ──
      if (cosmic && !isReduced) {
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
      if (hasPointerFineRef.current) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
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
