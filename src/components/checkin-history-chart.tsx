"use client";

import { useEffect, useState } from "react";
import { Heart, TrendingUp, Loader2 } from "lucide-react";

interface CheckIn {
  id: string;
  connectionScore: number;
  overallMood: string;
  createdAt: string;
}

interface CheckInHistory {
  checkIns: CheckIn[];
  trend: number | null;
  count: number;
}

const MOOD_META: Record<string, { label: string; emoji: string }> = {
  hopeful: { label: "Hopeful", emoji: "\u2728" },
  stressed: { label: "Stressed", emoji: "\ud83d\ude13" },
  connected: { label: "Connected", emoji: "\ud83d\udc9e" },
  distant: { label: "Distant", emoji: "\ud83c\udf19" },
  growing: { label: "Growing", emoji: "\ud83c\udf31" },
  uncertain: { label: "Uncertain", emoji: "\ud83e\udd14" },
};

export function CheckInHistoryChart() {
  const [data, setData] = useState<CheckInHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/relationship/checkin")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="text-center py-6">
        <Heart className="h-8 w-8 text-pink-400/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Start tracking your relationship journey
        </p>
      </div>
    );
  }

  // Reverse so oldest is first (API returns desc)
  const points = [...data.checkIns].reverse();
  const count = points.length;

  // SVG dimensions
  const W = 320;
  const H = 140;
  const padX = 30;
  const padY = 20;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  const xStep = count > 1 ? chartW / (count - 1) : 0;
  const coords = points.map((p, i) => ({
    x: padX + i * xStep,
    y: padY + chartH - ((p.connectionScore - 1) / 4) * chartH,
  }));

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");

  // Date labels
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Mood distribution
  const moodCounts: Record<string, number> = {};
  for (const p of points) {
    moodCounts[p.overallMood] = (moodCounts[p.overallMood] || 0) + 1;
  }

  return (
    <div>
      {/* Trend indicator */}
      {data.trend !== null && (
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp className={`h-3.5 w-3.5 ${data.trend > 0 ? "text-emerald-400" : data.trend < 0 ? "text-red-400 rotate-180" : "text-muted-foreground"}`} />
          <span className={`text-xs font-medium ${data.trend > 0 ? "text-emerald-400" : data.trend < 0 ? "text-red-400" : "text-muted-foreground"}`}>
            {data.trend > 0 ? `+${data.trend}` : data.trend === 0 ? "Steady" : data.trend} vs last
          </span>
        </div>
      )}

      {/* SVG chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Connection score trend chart">
        {/* Y-axis labels */}
        {[1, 3, 5].map((v) => {
          const y = padY + chartH - ((v - 1) / 4) * chartH;
          return (
            <text key={v} x={padX - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">
              {v}
            </text>
          );
        })}

        {/* Grid lines */}
        {[1, 3, 5].map((v) => {
          const y = padY + chartH - ((v - 1) / 4) * chartH;
          return <line key={v} x1={padX} x2={W - padX} y1={y} y2={y} stroke="currentColor" className="text-white/5" />;
        })}

        {/* Gradient fill under line */}
        <defs>
          <linearGradient id="checkin-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {count > 1 && (
          <polygon
            points={`${coords[0].x},${padY + chartH} ${polylinePoints} ${coords[count - 1].x},${padY + chartH}`}
            fill="url(#checkin-fill)"
          />
        )}

        {/* Line */}
        {count > 1 && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgb(139, 92, 246)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="4" fill="rgb(139, 92, 246)" stroke="rgb(15, 10, 40)" strokeWidth="2" />
        ))}

        {/* Date labels */}
        {count >= 1 && (
          <text x={coords[0].x} y={H - 2} textAnchor="start" className="fill-muted-foreground" fontSize="8">
            {fmtDate(points[0].createdAt)}
          </text>
        )}
        {count > 1 && (
          <text x={coords[count - 1].x} y={H - 2} textAnchor="end" className="fill-muted-foreground" fontSize="8">
            {fmtDate(points[count - 1].createdAt)}
          </text>
        )}
      </svg>

      {/* Mood distribution */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {Object.entries(moodCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([mood, cnt]) => (
            <span
              key={mood}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {MOOD_META[mood]?.emoji ?? mood} {cnt}
            </span>
          ))}
      </div>
    </div>
  );
}
