"use client";

import { useEffect, useRef, useCallback } from "react";

interface AnchorPoint {
  x: number;
  y: number;
}

function generateAnchorPoints(width: number, height: number): AnchorPoint[] {
  const count = 8 + Math.floor(Math.random() * 5); // 8-12 points
  const points: AnchorPoint[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }
  return points;
}

function getConnectedPairs(
  points: AnchorPoint[],
  maxDistance: number
): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (Math.sqrt(dx * dx + dy * dy) <= maxDistance) {
        pairs.push([i, j]);
      }
    }
  }
  return pairs;
}

export function ConstellationLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<AnchorPoint[]>([]);
  const pairsRef = useRef<[number, number][]>([]);
  const rafRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);
  const dashOffsetRef = useRef(0);
  const lastTimeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = pointsRef.current;
    const pairs = pairsRef.current;
    const scrollY = window.scrollY;
    // Base visibility of 0.3 + scroll adds up to 0.7 more
    const progress = 0.3 + Math.min(scrollY / 500, 1) * 0.7;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lineAlpha = 0.25 * progress;
    const dotAlpha = 0.4 * progress;

    // Draw lines
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;

    if (!prefersReducedMotion.current) {
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -dashOffsetRef.current;
    } else {
      ctx.setLineDash([]);
    }

    for (const [i, j] of pairs) {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[j].x, points[j].y);
      ctx.stroke();
    }

    // Draw dots
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(167, 139, 250, ${dotAlpha})`;
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const animate = useCallback(
    (time: number) => {
      if (!prefersReducedMotion.current) {
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;
        dashOffsetRef.current += delta * 0.01;
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

      pointsRef.current = generateAnchorPoints(
        window.innerWidth,
        window.innerHeight
      );
      pairsRef.current = getConnectedPairs(pointsRef.current, 250);
    };

    setupCanvas();

    if (prefersReducedMotion.current) {
      draw();
      const onScroll = () => {
        draw();
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const onResize = () => {
        setupCanvas();
        draw();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        motionQuery.removeEventListener("change", onMotionChange);
      };
    }

    // Animated path: use rAF loop (handles both scroll-based fade and dash animation)
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      setupCanvas();
    };
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
