"use client";

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

export interface DimensionScore {
  dimension: string;
  score: number;
  fullMark?: number;
}

interface RadarChartProps {
  data: DimensionScore[];
  className?: string;
}

const DEFAULT_DIMENSIONS: DimensionScore[] = [
  { dimension: "Emotional", score: 0, fullMark: 100 },
  { dimension: "Chemistry", score: 0, fullMark: 100 },
  { dimension: "Communication", score: 0, fullMark: 100 },
  { dimension: "Stability", score: 0, fullMark: 100 },
  { dimension: "Harmony", score: 0, fullMark: 100 },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DimensionScore }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-sm">
      <p className="font-medium text-foreground">{item.dimension}</p>
      <p className="text-cosmic-purple-light font-bold">{item.score}/100</p>
    </div>
  );
}

export function CompatibilityRadarChart({
  data = DEFAULT_DIMENSIONS,
  className,
}: RadarChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    fullMark: d.fullMark ?? 100,
  }));

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={350}>
        <RechartsRadarChart
          cx="50%"
          cy="50%"
          outerRadius="75%"
          data={chartData}
        >
          <PolarGrid
            stroke="rgba(167, 139, 250, 0.15)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: "#94A3B8",
              fontSize: 13,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Compatibility"
            dataKey="score"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="#7C3AED"
            fillOpacity={0.3}
            dot={{
              r: 4,
              fill: "#A78BFA",
              stroke: "#F59E0B",
              strokeWidth: 2,
            }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
