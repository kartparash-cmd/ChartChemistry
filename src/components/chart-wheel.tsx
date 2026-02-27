"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

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

export function ChartWheel({
  planets = [],
  houses = [],
  aspects = [],
  size = 400,
  className,
}: ChartWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const signRingInner = outerR - 35;
  const houseRingOuter = signRingInner - 2;
  const houseRingInner = houseRingOuter - 60;
  const planetRingR = (houseRingOuter + houseRingInner) / 2;
  const aspectRingR = houseRingInner - 10;

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
        return { ...a, pos1, pos2, color };
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
        </defs>

        {/* Background */}
        <circle cx={cx} cy={cy} r={outerR} fill="url(#chartBg)" />

        {/* Zodiac sign segments */}
        {signSegments.map((sign, i) => (
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

        {/* Sign ring border circles */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        <circle
          cx={cx}
          cy={cy}
          r={signRingInner}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* House ring */}
        <circle
          cx={cx}
          cy={cy}
          r={houseRingInner}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />

        {/* House division lines */}
        {houseLines.map((house) => (
          <g key={`house-${house.house}`}>
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

        {/* Aspect lines */}
        {aspectLines.map((aspect, i) => (
          <line
            key={`aspect-${i}`}
            x1={aspect.pos1.x}
            y1={aspect.pos1.y}
            x2={aspect.pos2.x}
            y2={aspect.pos2.y}
            stroke={aspect.color}
            strokeWidth="0.7"
            strokeOpacity="0.4"
            strokeDasharray={
              aspect.type === "square" || aspect.type === "opposition"
                ? "3,3"
                : undefined
            }
          />
        ))}

        {/* Planet positions */}
        {displayPlanets.map((p, i) => (
          <motion.g
            key={p.planet}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            {/* Planet dot/glow */}
            <circle
              cx={p.pos.x}
              cy={p.pos.y}
              r="12"
              fill="rgba(124,58,237,0.1)"
              filter="url(#glow)"
            />
            <circle
              cx={p.pos.x}
              cy={p.pos.y}
              r="3"
              fill="#A78BFA"
              opacity="0.7"
            />
            {/* Planet symbol */}
            <text
              x={p.pos.x}
              y={p.pos.y - 10}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#F1F5F9"
              fontSize="11"
              fontWeight="bold"
              className="select-none"
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
          </motion.g>
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
