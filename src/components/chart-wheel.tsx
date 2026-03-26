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

// Aspect types with colors — muted for clean look
const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#06B6D4",
  sextile: "#10B981",
  square: "#EF4444",
  trine: "#10B981",
  opposition: "#EF4444",
};

// Angle labels for the four chart axes
const AXIS_LABELS: Record<number, string> = {
  1: "AC",   // Ascendant
  4: "IC",   // Imum Coeli
  7: "DC",   // Descendant
  10: "MC",  // Midheaven
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

/** Format degree as sign-relative (e.g., 135 -> "15° Leo") */
function formatDegree(absDegree: number): string {
  const signDeg = ((absDegree % 30) + 30) % 30;
  return `${Math.round(signDeg)}°`;
}

/** CSS keyframes for chart animations — entrance only, no idle effects */
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
      70%  { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .cw-planet-group {
      transform-origin: var(--cw-tx) var(--cw-ty);
      transform: scale(0);
      opacity: 0;
      animation: cw-planet-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
    .cw-aspect-line.cw-aspect-dashed {
      stroke-dasharray: 3, 3;
      stroke-dashoffset: 0;
      opacity: 0;
      animation: cw-fade-in 0.5s ease-out forwards;
      animation-delay: var(--cw-delay);
    }

    /* === Interaction: planet hover === */
    .cw-planet-group:hover .cw-planet-dot {
      r: 4;
      opacity: 1;
      transition: all 0.2s ease;
    }
    .cw-planet-group:hover .cw-planet-symbol {
      fill: #FFFFFF;
      transition: fill 0.2s ease;
    }
    .cw-planet-group:hover .cw-degree-label {
      opacity: 1 !important;
      transition: opacity 0.2s ease;
    }

    /* === Interaction: highlight aspects for hovered planet === */
    .cw-aspect-line.cw-aspect-highlight {
      stroke-opacity: 0.85 !important;
      stroke-width: 1.4;
      filter: url(#glow);
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
  const nameRingR = outerR - 14;        // radius for sign names (outermost text)
  const signRingInner = outerR - 40;     // wider ring for name + glyph
  const glyphRingR = signRingInner + 8;  // glyphs sit just inside the inner border
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

      // Division lines between signs
      const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
      const innerStart = polarToCartesian(cx, cy, signRingInner, startAngle);

      // Sign name position (outer)
      const namePos = polarToCartesian(cx, cy, nameRingR, midAngle);
      // Glyph position (inner)
      const glyphPos = polarToCartesian(cx, cy, glyphRingR, midAngle);

      // Rotation for text to follow the arc
      const textRotation = -(180 - midAngle);

      return { ...sign, outerStart, innerStart, namePos, glyphPos, textRotation, startAngle, endAngle };
    });
  }, [cx, cy, outerR, signRingInner, nameRingR, glyphRingR]);

  // Generate house lines
  const houseLines = useMemo(() => {
    if (houses.length === 0) return [];
    return houses.map((house) => {
      const isAxis = house.house === 1 || house.house === 4 || house.house === 7 || house.house === 10;
      const outer = polarToCartesian(cx, cy, houseRingOuter, house.degree);
      const inner = polarToCartesian(cx, cy, houseRingInner, house.degree);
      // Label inside the house sector (midpoint between this cusp and midway toward center)
      const labelPos = polarToCartesian(
        cx,
        cy,
        houseRingInner + 20,
        house.degree + 15
      );
      // Axis label just outside the house ring
      const axisLabel = AXIS_LABELS[house.house];
      const axisLabelPos = axisLabel
        ? polarToCartesian(cx, cy, houseRingOuter + 8, house.degree)
        : null;
      return { ...house, outer, inner, labelPos, isAxis, axisLabel, axisLabelPos };
    });
  }, [houses, cx, cy, houseRingOuter, houseRingInner]);

  // Generate planet positions
  const planetPositions = useMemo(() => {
    if (planets.length === 0) return [];

    const sorted = [...planets].sort((a, b) => a.degree - b.degree);
    const positions: Array<PlanetPosition & { displayDegree: number }> = [];
    const minSep = 10;

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
      const degreeText = formatDegree(p.degree);
      return { ...p, pos, symbol, degreeText };
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
        const pos1 = polarToCartesian(cx, cy, aspectRingR, planetDegreeMap[a.planet1]);
        const pos2 = polarToCartesian(cx, cy, aspectRingR, planetDegreeMap[a.planet2]);
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
      const degreeText = formatDegree(p.degree);
      return { ...p, displayDegree: p.degree, pos, symbol, degreeText };
    });
  }, [showDemo, cx, cy, planetRingR]);

  const displayPlanets = showDemo ? demoPlanets : planetPositions;

  const isAspectHighlighted = useCallback(
    (aspect: { planet1: string; planet2: string }) => {
      if (!hoveredPlanet) return false;
      return aspect.planet1 === hoveredPlanet || aspect.planet2 === hoveredPlanet;
    },
    [hoveredPlanet]
  );

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
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Embedded animation styles */}
        <style>{getChartStyles(reduced)}</style>

        {/* Background — subtle, not heavy */}
        <circle cx={cx} cy={cy} r={outerR} fill="url(#chartBg)" />

        {/* Zodiac sign division lines (thin, clean) + names + glyphs */}
        {signSegments.map((sign) => (
          <g key={sign.name}>
            {/* Division line between signs */}
            <line
              x1={sign.outerStart.x}
              y1={sign.outerStart.y}
              x2={sign.innerStart.x}
              y2={sign.innerStart.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.5"
            />
            {/* Sign name (outer ring) */}
            <text
              x={sign.namePos.x}
              y={sign.namePos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(255,255,255,0.5)"
              fontSize="7"
              fontWeight="500"
              letterSpacing="0.5"
              className="select-none"
              transform={`rotate(${sign.textRotation}, ${sign.namePos.x}, ${sign.namePos.y})`}
            >
              {sign.name.toUpperCase()}
            </text>
            {/* Glyph (just inside inner border) */}
            <text
              x={sign.glyphPos.x}
              y={sign.glyphPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={sign.color}
              fontSize="12"
              className="select-none"
              style={{ opacity: 0.8 }}
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
          strokeWidth="0.8"
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
          strokeWidth="0.8"
          className="cw-ring-draw"
          style={
            {
              "--cw-circumference": innerCircumference,
              animationDelay: "0.15s",
            } as React.CSSProperties
          }
        />

        {/* House ring (inner circle) */}
        <circle
          cx={cx}
          cy={cy}
          r={houseRingInner}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />

        {/* House division lines + numbers + axis labels */}
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
                house.isAxis
                  ? "rgba(167,139,250,0.5)"
                  : "rgba(255,255,255,0.12)"
              }
              strokeWidth={house.isAxis ? 1.2 : 0.5}
            />
            {/* House number — larger, more visible */}
            <text
              x={house.labelPos.x}
              y={house.labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
              fontWeight="600"
            >
              {house.house}
            </text>
            {/* Axis label (AC/IC/DC/MC) */}
            {house.axisLabel && house.axisLabelPos && (
              <text
                x={house.axisLabelPos.x}
                y={house.axisLabelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#A78BFA"
                fontSize="8"
                fontWeight="700"
                letterSpacing="0.5"
              >
                {house.axisLabel}
              </text>
            )}
          </g>
        ))}

        {/* Aspect lines — draw in + highlight on hover (no idle pulse) */}
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
              strokeWidth={highlighted ? 1.4 : 0.6}
              strokeOpacity={highlighted ? 0.85 : 0.3}
              strokeDasharray={reduced && isDashed ? "3,3" : undefined}
              className={[
                "cw-aspect-line",
                !reduced && isDashed && "cw-aspect-dashed",
                highlighted && "cw-aspect-highlight",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                {
                  "--cw-line-len": aspect.lineLen,
                  "--cw-delay": `${1.2 + i * 0.04}s`,
                } as React.CSSProperties
              }
              filter={highlighted ? "url(#glow)" : undefined}
            />
          );
        })}

        {/* Planet positions — pop in staggered, degree labels, no idle glow */}
        {displayPlanets.map((p, i) => (
          <g
            key={p.planet}
            className="cw-planet-group"
            style={
              {
                "--cw-delay": `${1.6 + i * 0.1}s`,
                "--cw-tx": `${p.pos.x}px`,
                "--cw-ty": `${p.pos.y}px`,
              } as React.CSSProperties
            }
            onMouseEnter={() => setHoveredPlanet(p.planet)}
            onMouseLeave={() => setHoveredPlanet(null)}
          >
            {/* Planet dot */}
            <circle
              className="cw-planet-dot"
              cx={p.pos.x}
              cy={p.pos.y}
              r={3}
              fill="#A78BFA"
              opacity={0.8}
            />
            {/* Planet symbol — larger */}
            <text
              className="cw-planet-symbol select-none"
              x={p.pos.x}
              y={p.pos.y - 12}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#F1F5F9"
              fontSize="13"
              fontWeight="bold"
            >
              {p.symbol}
            </text>
            {/* Degree label next to planet */}
            <text
              className="cw-degree-label select-none"
              x={p.pos.x + 10}
              y={p.pos.y + 2}
              textAnchor="start"
              dominantBaseline="central"
              fill="rgba(255,255,255,0.45)"
              fontSize="7"
            >
              {p.degreeText}
            </text>
            {/* Retrograde indicator */}
            {p.retrograde && (
              <text
                x={p.pos.x + 10}
                y={p.pos.y - 10}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#F59E0B"
                fontSize="7"
                fontWeight="600"
              >
                R
              </text>
            )}
          </g>
        ))}

        {/* Center decoration — minimal */}
        <circle
          cx={cx}
          cy={cy}
          r="6"
          fill="none"
          stroke="rgba(167,139,250,0.25)"
          strokeWidth="0.5"
        />
        <circle cx={cx} cy={cy} r="1.5" fill="rgba(167,139,250,0.4)" />
      </svg>
    </motion.div>
  );
}
