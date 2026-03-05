"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  MessageCircle,
  Share2,
  Heart,
  MessageSquare,
  Flame,
  Shield,
  AlertTriangle,
  Sprout,
  Eye,
  Loader2,
  ArrowLeft,
  Printer,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Types
interface ReportPerson {
  name: string;
  birthDate: string;
  birthCity: string;
}

interface Report {
  id: string;
  person1: ReportPerson;
  person2: ReportPerson;
  overallScore: number;
  communicationScore: number;
  emotionalScore: number;
  chemistryScore: number;
  stabilityScore: number;
  conflictScore: number;
  summaryNarrative: string;
  fullNarrative: string;
  redFlags: string[];
  growthAreas: string[];
  tier: "FREE" | "PREMIUM" | "BOUTIQUE";
}

interface NarrativeSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  freeAccess: boolean;
  variant?: "default" | "warning" | "growth";
}

// Animated score circle
function ScoreCircle({
  score,
  size = 160,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 70
      ? "#10B981"
      : score >= 50
        ? "#F59E0B"
        : "#EF4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: scoreColor }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Overall
        </span>
      </div>
    </div>
  );
}

// Radar chart (simplified SVG)
function RadarChart({
  scores,
}: {
  scores: { label: string; value: number }[];
}) {
  const size = 250;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 90;
  const levels = 4;

  const angleStep = (2 * Math.PI) / scores.length;

  // Generate grid
  const gridLevels = Array.from({ length: levels }, (_, i) =>
    ((i + 1) / levels) * maxR
  );

  // Generate data points
  const points = scores.map((s, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (s.value / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      labelX: cx + (maxR + 20) * Math.cos(angle),
      labelY: cy + (maxR + 20) * Math.sin(angle),
      label: s.label,
      value: s.value,
    };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {/* Grid lines */}
      {gridLevels.map((r, li) => (
        <polygon
          key={li}
          points={scores
            .map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {scores.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const endX = cx + maxR * Math.cos(angle);
        const endY = cy + maxR * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={endX}
            y2={endY}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        points={polygonPath}
        fill="rgba(124,58,237,0.15)"
        stroke="#A78BFA"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#A78BFA"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 + i * 0.1 }}
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={`label-${i}`}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(241,245,249,0.6)"
          fontSize="9"
          className="select-none"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// Score bar
function ScoreBar({
  label,
  score,
  icon,
  delay = 0,
  invertColor = false,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
  delay?: number;
  invertColor?: boolean;
}) {
  // For conflict, high score = bad (red/amber), low score = good (green)
  const color = invertColor
    ? score >= 70
      ? "bg-red-400"
      : score >= 50
        ? "bg-gold"
        : "bg-emerald-400"
    : score >= 70
      ? "bg-emerald-400"
      : score >= 50
        ? "bg-gold"
        : "bg-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

// Collapsible section
function NarrativeSectionCard({
  section,
  isPremium,
  index,
}: {
  section: NarrativeSection;
  isPremium: boolean;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(section.freeAccess);
  const isLocked = !section.freeAccess && !isPremium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border overflow-hidden",
        section.variant === "warning"
          ? "border-red-400/20 bg-red-400/[0.03]"
          : section.variant === "growth"
            ? "border-emerald-400/20 bg-emerald-400/[0.03]"
            : "border-white/10 bg-white/[0.03]"
      )}
    >
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              section.variant === "warning"
                ? "text-red-400"
                : section.variant === "growth"
                  ? "text-emerald-400"
                  : "text-cosmic-purple-light"
            )}
          >
            {section.icon}
          </span>
          <span className="font-heading text-sm font-semibold sm:text-base">
            {section.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLocked && (
            <Badge
              variant="outline"
              className="border-cosmic-purple/30 text-cosmic-purple-light text-[10px]"
            >
              <Lock className="mr-1 h-2.5 w-2.5" />
              Premium
            </Badge>
          )}
          {!isLocked &&
            (isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ))}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              <Separator className="mb-4 bg-white/5" />
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {section.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked blur overlay */}
      {isLocked && (
        <div className="relative px-4 pb-4">
          <div className="relative">
            <p className="text-sm leading-relaxed text-muted-foreground blur-sm select-none">
              This section contains detailed insights about your compatibility
              in this area. Upgrade to Premium to unlock the full analysis with
              personalized guidance and actionable advice for your
              relationship...
            </p>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/60 backdrop-blur-[2px] rounded-lg">
              <Lock className="h-5 w-5 text-cosmic-purple-light mb-2" />
              <p className="text-xs text-muted-foreground mb-2">
                Unlock with Premium
              </p>
              <Button
                asChild
                size="sm"
                className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white text-xs h-7"
              >
                <Link href="/pricing">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareToast, setShareToast] = useState(false);

  const reportId = params.id as string;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/${reportId}`);
        if (res.ok) {
          const json = await res.json();
          setReport(json);
        } else {
          // Use demo data for MVP
          setReport(getDemoReport(reportId));
        }
      } catch {
        setReport(getDemoReport(reportId));
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading your compatibility report...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-heading font-semibold mb-2">
            Report Not Found
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            This report may not exist or you may not have access.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPremium =
    report.tier === "PREMIUM" ||
    report.tier === "BOUTIQUE" ||
    session?.user?.plan === "PREMIUM" ||
    session?.user?.plan === "ANNUAL";

  const scores = [
    {
      label: "Communication",
      value: report.communicationScore,
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "Emotional",
      value: report.emotionalScore,
      icon: <Heart className="h-4 w-4" />,
    },
    {
      label: "Chemistry",
      value: report.chemistryScore,
      icon: <Flame className="h-4 w-4" />,
    },
    {
      label: "Stability",
      value: report.stabilityScore,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: "Conflict",
      value: report.conflictScore,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  // Parse narrative sections from fullNarrative
  const narrativeSections = parseNarrativeSections(report);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    // Open the server-rendered HTML version in a new tab for saving/printing
    window.open(`/api/report/${reportId}/pdf`, "_blank");
  };

  return (
    <div className="min-h-screen print-report">
      {/* Print-only branding header */}
      <div className="print-header">
        <div className="print-header-brand">
          <span className="print-header-logo" aria-hidden="true">&#x2728;</span>
          <span className="print-header-title">ChartChemistry</span>
        </div>
        <p className="print-header-subtitle">AI-Powered Astrological Compatibility Report</p>
      </div>

      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 print:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                {report.person1.name}{" "}
                <span className="text-cosmic-purple-light print:text-black">&</span>{" "}
                {report.person2.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Compatibility Report
              </p>
            </div>
            <Badge
              className={cn(
                "self-start",
                report.overallScore >= 70
                  ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                  : report.overallScore >= 50
                    ? "bg-gold/10 text-gold border-gold/30"
                    : "bg-red-400/10 text-red-400 border-red-400/30"
              )}
              variant="outline"
            >
              {report.overallScore}% Compatible
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Visualization */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Score */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
              <h2 className="font-heading text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                Overall Score
              </h2>
              <ScoreCircle score={report.overallScore} />
              {/* Print-only plain text score */}
              <div className="print-score-text">
                <span className="text-4xl font-bold">{report.overallScore}</span>
                <span className="text-sm text-gray-500 uppercase tracking-wider ml-1">/ 100</span>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm print:hidden">
              <h2 className="font-heading text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider text-center">
                Dimension Breakdown
              </h2>
              <RadarChart
                scores={scores.map((s) => ({
                  label: s.label,
                  value: s.value,
                }))}
              />
            </div>

            {/* Individual Score Bars */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm space-y-4">
              <h2 className="font-heading text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                Scores
              </h2>
              {scores.map((s, i) => (
                <ScoreBar
                  key={s.label}
                  label={s.label}
                  score={s.value}
                  icon={s.icon}
                  delay={i * 0.1}
                  invertColor={s.label === "Conflict"}
                />
              ))}
              {/* Print-only score table */}
              <div className="print-score-table">
                {scores.map((s) => (
                  <div key={s.label} className="print-score-row">
                    <span className="print-score-label">{s.label}</span>
                    <span className="print-score-bar-container">
                      <span
                        className="print-score-bar-fill"
                        style={{ width: `${s.value}%` }}
                      />
                    </span>
                    <span className="print-score-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Narrative Sections */}
          <div className="lg:col-span-2 space-y-4">
            {narrativeSections.map((section, i) => (
              <NarrativeSectionCard
                key={section.id}
                section={section}
                isPremium={isPremium}
                index={i}
              />
            ))}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 print:hidden">
              <Button
                asChild
                className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
              >
                <Link href="/chat">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ask AI About This
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/10"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                className="border-white/10"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print / Save PDF
              </Button>
              <Button
                variant="outline"
                className="border-white/10"
                onClick={handleDownloadHTML}
              >
                <Download className="mr-2 h-4 w-4" />
                Export HTML
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only footer */}
      <div className="print-footer">
        <p>Generated by ChartChemistry &mdash; chartchemistry.io</p>
        <p>Report ID: {reportId} &bull; {new Date().toLocaleDateString()}</p>
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-navy-light/95 backdrop-blur-xl px-6 py-3 shadow-xl"
          >
            <p className="text-sm font-medium">Link copied to clipboard</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper: parse narrative into sections
function parseNarrativeSections(report: Report): NarrativeSection[] {
  // In a real app, fullNarrative would be structured JSON or markdown.
  // For MVP, we create sections from what we have.
  const sections: NarrativeSection[] = [
    {
      id: "big-picture",
      title: "The Big Picture",
      icon: <Eye className="h-5 w-5" />,
      content: report.summaryNarrative || "Your compatibility summary will appear here once generated.",
      freeAccess: true,
    },
    {
      id: "emotional",
      title: "Emotional Connection",
      icon: <Heart className="h-5 w-5" />,
      content:
        report.fullNarrative
          ? extractSection(report.fullNarrative, "emotional")
          : "Detailed emotional connection analysis will appear here.",
      freeAccess: false,
    },
    {
      id: "romance",
      title: "Romance & Chemistry",
      icon: <Flame className="h-5 w-5" />,
      content:
        report.fullNarrative
          ? extractSection(report.fullNarrative, "romance")
          : "Your romantic chemistry analysis will appear here.",
      freeAccess: false,
    },
    {
      id: "communication",
      title: "Communication",
      icon: <MessageSquare className="h-5 w-5" />,
      content:
        report.fullNarrative
          ? extractSection(report.fullNarrative, "communication")
          : "Communication style analysis will appear here.",
      freeAccess: false,
    },
    {
      id: "long-term",
      title: "Long-Term Potential",
      icon: <Shield className="h-5 w-5" />,
      content:
        report.fullNarrative
          ? extractSection(report.fullNarrative, "long-term")
          : "Long-term potential analysis will appear here.",
      freeAccess: false,
    },
    {
      id: "red-flags",
      title: "Watch Out For",
      icon: <AlertTriangle className="h-5 w-5" />,
      content:
        Array.isArray(report.redFlags) && report.redFlags.length > 0
          ? report.redFlags.map((f, i) => `${i + 1}. ${f}`).join("\n\n")
          : "Red flag analysis will appear here.",
      freeAccess: false,
      variant: "warning",
    },
    {
      id: "growth",
      title: "Your Growth Edge",
      icon: <Sprout className="h-5 w-5" />,
      content:
        Array.isArray(report.growthAreas) && report.growthAreas.length > 0
          ? report.growthAreas.map((g, i) => `${i + 1}. ${g}`).join("\n\n")
          : "Growth insights will appear here.",
      freeAccess: false,
      variant: "growth",
    },
  ];

  return sections;
}

function extractSection(narrative: string, section: string): string {
  if (!narrative) {
    return `Detailed ${section} analysis will appear here once your report is generated.`;
  }

  // Try to parse as JSON first (premium reports store structured data)
  try {
    const parsed = JSON.parse(narrative);
    // Map section IDs to JSON keys from PremiumReportSections
    const keyMap: Record<string, string> = {
      emotional: "emotionalLandscape",
      romance: "passionAndAttraction",
      communication: "communicationStyle",
      "long-term": "longTermPotential",
    };
    const key = keyMap[section];
    if (key && parsed[key]) return parsed[key];
    // Fallback to theBigPicture if key missing
    if (parsed.theBigPicture) return parsed.theBigPicture;
  } catch {
    // Not JSON — split plain text narrative into sections by paragraph
  }

  // Split plain text by double newlines or paragraph markers
  const paragraphs = narrative
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Distribute paragraphs across the 4 section slots
  const sectionIndex: Record<string, number> = {
    emotional: 0,
    romance: 1,
    communication: 2,
    "long-term": 3,
  };

  const idx = sectionIndex[section] ?? 0;

  if (paragraphs.length >= 4) {
    return paragraphs[idx] || paragraphs[0];
  }

  // If fewer paragraphs than sections, return the available one
  return paragraphs[idx % paragraphs.length] || narrative;
}

// Demo report for when API is not available
function getDemoReport(id: string): Report {
  return {
    id,
    person1: { name: "Alex", birthDate: "1995-03-21", birthCity: "New York" },
    person2: { name: "Jordan", birthDate: "1993-08-15", birthCity: "Los Angeles" },
    overallScore: 78,
    communicationScore: 82,
    emotionalScore: 75,
    chemistryScore: 88,
    stabilityScore: 65,
    conflictScore: 71,
    summaryNarrative:
      "Alex and Jordan share a magnetic connection rooted in complementary elements. With Alex's Aries Sun bringing bold initiative and Jordan's Leo Sun radiating warmth and loyalty, this pairing has natural fire-sign chemistry. The emotional landscape shows promising depth, though differences in communication styles may require conscious effort. Overall, this connection carries strong potential for both passion and growth.",
    fullNarrative:
      "This is a deeply layered compatibility that shows strength in passion and creative expression. The emotional connection between these two charts suggests a relationship that can be both nurturing and inspiring. Communication flows naturally in many areas, though there are some tension points around practical matters. The long-term potential is strong if both partners are willing to work through their differences with patience and understanding.",
    redFlags: [
      "Mars square Saturn suggests potential power struggles around control and pace. One partner may feel restricted while the other feels pushed too fast.",
      "Moon opposition can create emotional misunderstandings. What feels nurturing to one may feel smothering to the other.",
      "Venus-Uranus aspects suggest one or both partners may crave novelty, which could manifest as restlessness if not channeled constructively.",
    ],
    growthAreas: [
      "Learning to balance independence with togetherness. This relationship teaches both partners the art of maintaining individuality within partnership.",
      "Developing shared emotional vocabulary. The different Moon signs offer a chance to expand your emotional range and empathy.",
      "Building patience around different communication rhythms. This pairing can develop exceptional communication skills through conscious practice.",
    ],
    tier: "FREE",
  };
}
