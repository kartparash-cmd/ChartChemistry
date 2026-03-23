"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Zodiac sign data
const ZODIAC_SIGNS = [
  { name: "Aries", glyph: "\u2648", color: "#EF4444" },
  { name: "Taurus", glyph: "\u2649", color: "#10B981" },
  { name: "Gemini", glyph: "\u264A", color: "#F59E0B" },
  { name: "Cancer", glyph: "\u264B", color: "#94A3B8" },
  { name: "Leo", glyph: "\u264C", color: "#F59E0B" },
  { name: "Virgo", glyph: "\u264D", color: "#10B981" },
  { name: "Libra", glyph: "\u264E", color: "#EC4899" },
  { name: "Scorpio", glyph: "\u264F", color: "#EF4444" },
  { name: "Sagittarius", glyph: "\u2650", color: "#8B5CF6" },
  { name: "Capricorn", glyph: "\u2651", color: "#64748B" },
  { name: "Aquarius", glyph: "\u2652", color: "#06B6D4" },
  { name: "Pisces", glyph: "\u2653", color: "#A78BFA" },
];

// Planet data
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
  Uranus: "\u2645",
  Neptune: "\u2646",
  Pluto: "\u2647",
};

// Aspect types with colors
const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#06B6D4",
  sextile: "#10B981",
  square: "#EF4444",
  trine: "#10B981",
  opposition: "#EF4444",
};

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number; // absolute degree 0-360
  retrograde?: boolean;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number; // absolute degree 0-360
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

interface ChartWheelProps {
  planets?: PlanetPosition[];
  houses?: HouseCusp[];
  aspects?: Aspect[];
  size?: number;
  className?: string;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  // Astrological charts have Aries at 9 o'clock (left/180deg),
  // and go counter-clockwise. We convert to SVG coordinates.
  const angleRad = ((180 - angleDeg) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy - r * Math.sin(angleRad),
  };
}

/** CSS keyframes for chart animations, embedded in SVG <style> */
function getChartStyles(reduced: boolean): string {
  if (reduced) {
    return `
      .cw-planet-group { cursor: pointer; }
      .cw-aspect-line { transition: none; }
    `;
  }

  return `
    /* === Entrance: outer ring draw-in === */
    @keyframes cw-ring-draw {
      from { stroke-dashoffset: var(--cw-circumference); }
      to   { stroke-dashoffset: 0; }
    }
    .cw-ring-draw {
      stroke-dasharray: var(--cw-circumference);
      stroke-dashoffset: var(--cw-circumference);
      animation: cw-ring-draw 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    /* === Entrance: house lines fade in === */
    @keyframes cw-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .cw-house-line {
      opacity: 0;
      animation: cw-fade-in 0.5s ease-out forwards;
      animation-delay: var(--cw-delay, 0.8s);
    }

    /* === Entrance: planet pop-in === */
    @keyframes cw-planet-pop {
      0%   { transform: scale(0); opacity: 0; }
      70%  { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .cw-planet-group {
      transform-origin: var(--cw-tx) var(--cw-ty);
      transform: scale(0);
      opacity: 0;
      animation: cw-planet-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      animation-delay: var(--cw-delay);
      cursor: pointer;
    }

    /* === Entrance: aspect line draw === */
    @keyframes cw-line-draw {
      0%   { stroke-dashoffset: var(--cw-line-len); opacity: 0; }
      10%  { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 1; }
    }
    .cw-aspect-line {
      stroke-dasharray: var(--cw-line-len);
      stroke-dashoffset: var(--cw-line-len);
      opacity: 0;
      animation: cw-line-draw 0.6s ease-out forwards;
      animation-delay: var(--cw-delay);
      transition: stroke-opacity 0.3s ease;
    }
    /* Dashed aspect lines (square/opposition) restore dash pattern after draw */
    .cw-aspect-line.cw-aspect-dashed {
      stroke-dasharray: 3, 3;
      stroke-dashoffset: 0;
      opacity: 0;
      animation: cw-fade-in 0.5s ease-out forwards;
      animation-delay: var(--cw-delay);
    }

    /* === Idle: planet breathing glow === */
    @keyframes cw-planet-glow {
      0%, 100% { opacity: 0.10; r: 12; }
      50%      { opacity: 0.22; r: 14; }
    }
    .cw-planet-glow-circle {
      animation: cw-planet-glow 3s ease-in-out infinite;
      animation-delay: var(--cw-glow-delay, 0s);
    }

    /* === Idle: ring shimmer === */
    @keyframes cw-ring-shimmer {
      0%   { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: var(--cw-circumference); }
    }
    .cw-ring-shimmer {
      animation: cw-ring-shimmer 12s linear infinite;
      animation-delay: 1.6s;
    }

    /* === Idle: aspect pulse === */
    @keyframes cw-aspect-pulse {
      0%, 100% { stroke-opacity: 0.35; }
      50%      { stroke-opacity: 0.50; }
    }
    .cw-aspect-idle {
      animation: cw-aspect-pulse 4s ease-in-out infinite;
      animation-delay: var(--cw-pulse-delay, 0s);
    }

    /* === Interaction: planet hover === */
    .cw-planet-group:hover .cw-planet-glow-circle {
      opacity: 0.4 !important;
      r: 16;
      transition: all 0.2s ease;
      animation: none;
    }
    .cw-planet-group:hover .cw-planet-dot {
      r: 4;
      opacity: 1;
      transition: all 0.2s ease;
    }
    .cw-planet-group:hover .cw-planet-symbol {
      fill: #FFFFFF;
      transition: fill 0.2s ease;
    }

    /* === Interaction: highlight aspects for hovered planet === */
    .cw-aspect-line.cw-aspect-highlight {
      stroke-opacity: 0.85 !important;
      stroke-width: 1.4;
      filter: url(#glow);
      animation: none;
    }

    /* === Respect reduced motion === */
    @media (prefers-reduced-motion: reduce) {
      .cw-ring-draw,
      .cw-planet-group,
      .cw-house-line,
      .cw-aspect-line {
        animation: none !important;
        opacity: 1 !important;
        transform: scale(1) !important;
        stroke-dashoffset: 0 !important;
      }
      .cw-planet-glow-circle,
      .cw-ring-shimmer,
      .cw-aspect-idle {
        animation: none !important;
      }
    }
  `;
}

export function ChartWheel({
  planets = [],
  houses = [],
  aspects = [],
  size = 400,
  className,
}: ChartWheelProps) {
  const shouldReduceMotion = useReducedMotion();
  const reduced = !!shouldReduceMotion;

  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const signRingInner = outerR - 35;
  const houseRingOuter = signRingInner - 2;
  const houseRingInner = houseRingOuter - 60;
  const planetRingR = (houseRingOuter + houseRingInner) / 2;
  const aspectRingR = houseRingInner - 10;

  const outerCircumference = 2 * Math.PI * outerR;
  const innerCircumference = 2 * Math.PI * signRingInner;

  // Generate zodiac sign segments
  const signSegments = useMemo(() => {
    return ZODIAC_SIGNS.map((sign, i) => {
      const startAngle = i * 30;
      const endAngle = (i + 1) * 30;
      const midAngle = startAngle + 15;

      const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
      const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
      const innerStart = polarToCartesian(cx, cy, signRingInner, startAngle);
      const innerEnd = polarToCartesian(cx, cy, signRingInner, endAngle);
      const glyphPos = polarToCartesian(
        cx,
        cy,
        (outerR + signRingInner) / 2,
        midAngle
      );

      // SVG arc path for the sign segment
      const path = [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerR} ${outerR} 0 0 0 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${signRingInner} ${signRingInner} 0 0 1 ${innerStart.x} ${innerStart.y}`,
        "Z",
      ].join(" ");

      return { ...sign, path, glyphPos, startAngle, endAngle };
    });
  }, [cx, cy, outerR, signRingInner]);

  // Generate house lines
  const houseLines = useMemo(() => {
    if (houses.length === 0) return [];
    return houses.map((house) => {
      const outer = polarToCartesian(cx, cy, houseRingOuter, house.degree);
      const inner = polarToCartesian(cx, cy, houseRingInner, house.degree);
      const labelPos = polarToCartesian(
        cx,
        cy,
        houseRingInner + 15,
        house.degree + 15
      );
      return { ...house, outer, inner, labelPos };
    });
  }, [houses, cx, cy, houseRingOuter, houseRingInner]);

  // Generate planet positions
  const planetPositions = useMemo(() => {
    if (planets.length === 0) return [];

    // Resolve overlapping planets by nudging
    const sorted = [...planets].sort((a, b) => a.degree - b.degree);
    const positions: Array<PlanetPosition & { displayDegree: number }> = [];
    const minSep = 8; // minimum degrees separation for display

    for (const p of sorted) {
      let disp = p.degree;
      for (const prev of positions) {
        const diff = Math.abs(disp - prev.displayDegree);
        if (diff < minSep && diff > 0) {
          disp = prev.displayDegree + minSep;
        }
      }
      positions.push({ ...p, displayDegree: disp });
    }

    return positions.map((p) => {
      const pos = polarToCartesian(cx, cy, planetRingR, p.displayDegree);
      const symbol = PLANET_SYMBOLS[p.planet] || p.planet.charAt(0);
      return { ...p, pos, symbol };
    });
  }, [planets, cx, cy, planetRingR]);

  // Generate aspect lines
  const aspectLines = useMemo(() => {
    if (aspects.length === 0 || planets.length === 0) return [];

    const planetDegreeMap: Record<string, number> = {};
    for (const p of planets) {
      planetDegreeMap[p.planet] = p.degree;
    }

    return aspects
      .filter(
        (a) =>
          planetDegreeMap[a.planet1] !== undefined &&
          planetDegreeMap[a.planet2] !== undefined
      )
      .map((a) => {
        const pos1 = polarToCartesian(
          cx,
          cy,
          aspectRingR,
          planetDegreeMap[a.planet1]
        );
        const pos2 = polarToCartesian(
          cx,
          cy,
          aspectRingR,
          planetDegreeMap[a.planet2]
        );
        const color = ASPECT_COLORS[a.type] || "#64748B";
        const lineLen = Math.sqrt(
          (pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2
        );
        return { ...a, pos1, pos2, color, lineLen };
      });
  }, [aspects, planets, cx, cy, aspectRingR]);

  // Default demo data when no planets are provided
  const showDemo = planets.length === 0;
  const demoPlanets = useMemo(() => {
    if (!showDemo) return [];
    const demoData: PlanetPosition[] = [
      { planet: "Sun", sign: "Leo", degree: 135 },
      { planet: "Moon", sign: "Cancer", degree: 105 },
      { planet: "Mercury", sign: "Virgo", degree: 162 },
      { planet: "Venus", sign: "Libra", degree: 195 },
      { planet: "Mars", sign: "Aries", degree: 15 },
      { planet: "Jupiter", sign: "Sagittarius", degree: 255 },
      { planet: "Saturn", sign: "Capricorn", degree: 285 },
      { planet: "Uranus", sign: "Aquarius", degree: 315 },
      { planet: "Neptune", sign: "Pisces", degree: 340 },
      { planet: "Pluto", sign: "Scorpio", degree: 230 },
    ];
    return demoData.map((p) => {
      const pos = polarToCartesian(cx, cy, planetRingR, p.degree);
      const symbol = PLANET_SYMBOLS[p.planet] || p.planet.charAt(0);
      return { ...p, displayDegree: p.degree, pos, symbol };
    });
  }, [showDemo, cx, cy, planetRingR]);

  const displayPlanets = showDemo ? demoPlanets : planetPositions;

  // Determine which aspect lines to highlight based on hovered planet
  const isAspectHighlighted = useCallback(
    (aspect: { planet1: string; planet2: string }) => {
      if (!hoveredPlanet) return false;
      return aspect.planet1 === hoveredPlanet || aspect.planet2 === hoveredPlanet;
    },
    [hoveredPlanet]
  );

  // Shimmer gradient: a short bright segment that visually rotates around the ring
  const shimmerDashLen = outerCircumference * 0.08; // 8% of circumference is the bright segment
  const shimmerGapLen = outerCircumference - shimmerDashLen;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto max-w-[500px] mx-auto"
        role="img"
        aria-label="Astrological natal chart wheel"
      >
        <defs>
          <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="planetHoverGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Embedded animation styles */}
        <style>{getChartStyles(reduced)}</style>

        {/* Background */}
        <circle cx={cx} cy={cy} r={outerR} fill="url(#chartBg)" />

        {/* Zodiac sign segments */}
        {signSegments.map((sign) => (
          <g key={sign.name}>
            <path
              d={sign.path}
              fill={`${sign.color}10`}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
            />
            <text
              x={sign.glyphPos.x}
              y={sign.glyphPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={sign.color}
              fontSize="14"
              className="select-none"
              style={{ opacity: 0.9 }}
            >
              {sign.glyph}
            </text>
          </g>
        ))}

        {/* Sign ring border circles — animated draw-in */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          className="cw-ring-draw"
          style={
            { "--cw-circumference": outerCircumference } as React.CSSProperties
          }
        />
        <circle
          cx={cx}
          cy={cy}
          r={signRingInner}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          className="cw-ring-draw"
          style={
            {
              "--cw-circumference": innerCircumference,
              animationDelay: "0.15s",
            } as React.CSSProperties
          }
        />

        {/* Shimmer overlay on outer ring (idle animation) */}
        {!reduced && (
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke="rgba(167,139,250,0.15)"
            strokeWidth="2"
            strokeDasharray={`${shimmerDashLen} ${shimmerGapLen}`}
            className="cw-ring-shimmer"
            style={
              {
                "--cw-circumference": outerCircumference,
              } as React.CSSProperties
            }
          />
        )}

        {/* House ring */}
        <circle
          cx={cx}
          cy={cy}
          r={houseRingInner}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />

        {/* House division lines — fade in after ring draws */}
        {houseLines.map((house) => (
          <g
            key={`house-${house.house}`}
            className="cw-house-line"
            style={
              { "--cw-delay": "0.9s" } as React.CSSProperties
            }
          >
            <line
              x1={house.outer.x}
              y1={house.outer.y}
              x2={house.inner.x}
              y2={house.inner.y}
              stroke={
                house.house === 1 || house.house === 10
                  ? "rgba(167,139,250,0.6)"
                  : "rgba(255,255,255,0.15)"
              }
              strokeWidth={house.house === 1 || house.house === 10 ? 1.5 : 0.5}
            />
            <text
              x={house.labelPos.x}
              y={house.labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(255,255,255,0.3)"
              fontSize="8"
            >
              {house.house}
            </text>
          </g>
        ))}

        {/* Aspect lines — draw in + idle pulse + highlight on hover */}
        {aspectLines.map((aspect, i) => {
          const highlighted = isAspectHighlighted(aspect);
          const isDashed =
            aspect.type === "square" || aspect.type === "opposition";

          return (
            <line
              key={`aspect-${i}`}
              x1={aspect.pos1.x}
              y1={aspect.pos1.y}
              x2={aspect.pos2.x}
              y2={aspect.pos2.y}
              stroke={aspect.color}
              strokeWidth={highlighted ? 1.4 : 0.7}
              strokeOpacity={highlighted ? 0.85 : 0.4}
              strokeDasharray={reduced && isDashed ? "3,3" : undefined}
              className={[
                "cw-aspect-line",
                !reduced && isDashed && "cw-aspect-dashed",
                !reduced && "cw-aspect-idle",
                highlighted && "cw-aspect-highlight",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                {
                  "--cw-line-len": aspect.lineLen,
                  "--cw-delay": `${1.2 + i * 0.04}s`,
                  "--cw-pulse-delay": `${i * 0.3}s`,
                } as React.CSSProperties
              }
              filter={highlighted ? "url(#glow)" : undefined}
            />
          );
        })}

        {/* Planet positions — pop in staggered + idle glow + hover interaction */}
        {displayPlanets.map((p, i) => (
          <g
            key={p.planet}
            className="cw-planet-group"
            style={
              {
                "--cw-delay": `${1.8 + i * 0.12}s`,
                "--cw-tx": `${p.pos.x}px`,
                "--cw-ty": `${p.pos.y}px`,
              } as React.CSSProperties
            }
            onMouseEnter={() => setHoveredPlanet(p.planet)}
            onMouseLeave={() => setHoveredPlanet(null)}
          >
            {/* Planet glow background (idle breathing animation) */}
            <circle
              className="cw-planet-glow-circle"
              cx={p.pos.x}
              cy={p.pos.y}
              r={12}
              fill="rgba(124,58,237,0.1)"
              filter="url(#glow)"
              style={
                {
                  "--cw-glow-delay": `${i * 0.4}s`,
                } as React.CSSProperties
              }
            />
            {/* Planet dot */}
            <circle
              className="cw-planet-dot"
              cx={p.pos.x}
              cy={p.pos.y}
              r={3}
              fill="#A78BFA"
              opacity={0.7}
            />
            {/* Planet symbol */}
            <text
              className="cw-planet-symbol select-none"
              x={p.pos.x}
              y={p.pos.y - 10}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#F1F5F9"
              fontSize="11"
              fontWeight="bold"
            >
              {p.symbol}
            </text>
            {/* Retrograde indicator */}
            {p.retrograde && (
              <text
                x={p.pos.x + 8}
                y={p.pos.y - 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#F59E0B"
                fontSize="7"
              >
                R
              </text>
            )}
          </g>
        ))}

        {/* Center decoration */}
        <circle
          cx={cx}
          cy={cy}
          r="8"
          fill="none"
          stroke="rgba(167,139,250,0.3)"
          strokeWidth="0.5"
        />
        <circle cx={cx} cy={cy} r="2" fill="rgba(167,139,250,0.5)" />
      </svg>
    </motion.div>
  );
}
