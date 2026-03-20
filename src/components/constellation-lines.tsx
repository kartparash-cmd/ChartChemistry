"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Famous constellation definitions ───────────────────────────────────────
// Stars as [x%, y%] of viewport, edges as [starIndex, starIndex]

interface ConstellationDef {
  name: string;
  stars: [number, number][]; // percentage positions
  edges: [number, number][];
}

const CONSTELLATIONS: ConstellationDef[] = [
  {
    name: "Orion",
    stars: [
      [0.45, 0.15], // Betelgeuse (left shoulder)
      [0.55, 0.15], // Bellatrix (right shoulder)
      [0.50, 0.28], // middle belt star
      [0.47, 0.26], // left belt
      [0.53, 0.26], // right belt
      [0.44, 0.40], // left foot (Saiph)
      [0.56, 0.40], // right foot (Rigel)
    ],
    edges: [
      [0, 1], // shoulders
      [0, 3], // left shoulder to belt
      [1, 4], // right shoulder to belt
      [3, 2], [2, 4], // belt
      [3, 5], // belt to left foot
      [4, 6], // belt to right foot
    ],
  },
  {
    name: "Big Dipper",
    stars: [
      [0.10, 0.12], // bowl top-left
      [0.17, 0.10], // bowl top-right
      [0.18, 0.18], // bowl bottom-right
      [0.11, 0.20], // bowl bottom-left
      [0.24, 0.08], // handle 1
      [0.30, 0.11], // handle 2
      [0.35, 0.09], // handle 3 (end)
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0], // bowl
      [1, 4], [4, 5], [5, 6], // handle
    ],
  },
  {
    name: "Cassiopeia",
    stars: [
      [0.72, 0.08],
      [0.76, 0.14],
      [0.80, 0.08],
      [0.84, 0.15],
      [0.88, 0.10],
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: "Leo",
    stars: [
      [0.62, 0.55], // Regulus
      [0.60, 0.48], // neck
      [0.57, 0.44], // head top
      [0.63, 0.44], // head right
      [0.67, 0.50], // back
      [0.72, 0.52], // hip
      [0.75, 0.58], // tail (Denebola)
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 1], // head sickle
      [0, 4], [4, 5], [5, 6], // body to tail
    ],
  },
  {
    name: "Scorpius",
    stars: [
      [0.85, 0.65], // Antares
      [0.82, 0.60], // upper body
      [0.80, 0.56], // head
      [0.88, 0.70], // lower body
      [0.90, 0.76], // tail curve
      [0.87, 0.80], // tail
      [0.85, 0.84], // stinger
    ],
    edges: [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [5, 6]],
  },
  {
    name: "Cygnus",
    stars: [
      [0.30, 0.60], // Deneb (top)
      [0.33, 0.68], // body
      [0.36, 0.76], // Albireo (bottom)
      [0.27, 0.70], // left wing
      [0.39, 0.66], // right wing
    ],
    edges: [[0, 1], [1, 2], [3, 1], [1, 4]], // cross shape
  },
];

interface PlacedStar {
  x: number;
  y: number;
  brightness: number; // 0-1, brighter stars get bigger dots
}

interface PlacedEdge {
  from: number;
  to: number;
}

interface PlacedConstellation {
  stars: PlacedStar[];
  edges: PlacedEdge[];
}

function placeConstellations(
  width: number,
  height: number
): { stars: PlacedStar[]; edges: [number, number][] } {
  const allStars: PlacedStar[] = [];
  const allEdges: [number, number][] = [];

  // Pick 3-4 random constellations to display (not all at once)
  const shuffled = [...CONSTELLATIONS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(4, shuffled.length));

  // Scatter them with random offsets to avoid overlap
  const offsets = [
    { ox: -0.05, oy: 0.05 },
    { ox: 0.02, oy: -0.03 },
    { ox: -0.08, oy: 0.10 },
    { ox: 0.05, oy: -0.08 },
  ];

  for (let c = 0; c < selected.length; c++) {
    const constellation = selected[c];
    const offset = offsets[c] || { ox: 0, oy: 0 };
    const baseIndex = allStars.length;

    for (const [px, py] of constellation.stars) {
      allStars.push({
        x: (px + offset.ox) * width,
        y: (py + offset.oy) * height,
        brightness: 0.5 + Math.random() * 0.5,
      });
    }

    for (const [from, to] of constellation.edges) {
      allEdges.push([baseIndex + from, baseIndex + to]);
    }
  }

  return { stars: allStars, edges: allEdges };
}

export function ConstellationLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<PlacedStar[]>([]);
  const edgesRef = useRef<[number, number][]>([]);
  const rafRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);
  const dashOffsetRef = useRef(0);
  const lastTimeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = starsRef.current;
    const edges = edgesRef.current;
    const scrollY = window.scrollY;
    const progress = 0.4 + Math.min(scrollY / 400, 1) * 0.6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lineAlpha = 0.18 * progress;
    const dotBaseAlpha = 0.35 * progress;

    // Draw edges (constellation lines)
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;

    if (!prefersReducedMotion.current) {
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -dashOffsetRef.current;
    } else {
      ctx.setLineDash([]);
    }

    for (const [i, j] of edges) {
      if (stars[i] && stars[j]) {
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.stroke();
      }
    }

    // Draw stars with varying brightness
    ctx.setLineDash([]);
    for (const star of stars) {
      const alpha = dotBaseAlpha * star.brightness;
      const radius = 1.5 + star.brightness * 1.5; // 1.5-3px

      // Glow
      ctx.beginPath();
      ctx.arc(star.x, star.y, radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${alpha * 0.2})`;
      ctx.fill();

      // Star dot
      ctx.beginPath();
      ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 180, 255, ${alpha})`;
      ctx.fill();
    }
  }, []);

  const animate = useCallback(
    (time: number) => {
      if (!prefersReducedMotion.current) {
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;
        dashOffsetRef.current += delta * 0.008;
      }
      draw();
      rafRef.current = requestAnimationFrame(animate);
    },
    [draw]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      const placed = placeConstellations(window.innerWidth, window.innerHeight);
      starsRef.current = placed.stars;
      edgesRef.current = placed.edges;
    };

    setupCanvas();

    if (prefersReducedMotion.current) {
      draw();
      const onScroll = () => draw();
      window.addEventListener("scroll", onScroll, { passive: true });
      const onResize = () => { setupCanvas(); draw(); };
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        motionQuery.removeEventListener("change", onMotionChange);
      };
    }

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [draw, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    />
  );
}
