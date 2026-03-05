"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  TrendingUp,
  Sun,
  RefreshCw,
  Sparkles,
  UserPlus,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Types
interface ReportPerson {
  id: string;
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
  shareToken?: string | null;
  createdAt: string;
}

interface PublicPreview {
  id: string;
  isPublicPreview: true;
  scores: { overall: number };
  summaryNarrative: string;
  person1: { name: string; sunSign: string | null };
  person2: { name: string; sunSign: string | null };
  createdAt: string;
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
  reducedMotion = false,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  reducedMotion?: boolean;
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
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`Overall compatibility score: ${score} out of 100`}
    >
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
          initial={reducedMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.5 }}
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
  reducedMotion = false,
}: {
  scores: { label: string; value: number }[];
  reducedMotion?: boolean;
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

  const radarLabel = scores
    .map((s) => `${s.label}: ${s.value}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[280px] mx-auto"
      role="img"
      aria-label={`Radar chart showing dimension scores: ${radarLabel}`}
    >
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
        initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.5, ease: "easeOut" }}
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
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { delay: 0.8 + i * 0.1 }}
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
  reducedMotion = false,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
  delay?: number;
  invertColor?: boolean;
  reducedMotion?: boolean;
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
      initial={reducedMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={reducedMotion ? { duration: 0 } : { delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{score}</span>
      </div>
      <div
        className="h-2 rounded-full bg-white/5 overflow-hidden"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} score: ${score} out of 100`}
      >
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={reducedMotion ? false : { width: 0 }}
          animate={{ width: `${score}%` }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1, delay: delay + 0.3, ease: "easeOut" }}
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
  reducedMotion = false,
}: {
  section: NarrativeSection;
  isPremium: boolean;
  index: number;
  reducedMotion?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(section.freeAccess);
  const isLocked = !section.freeAccess && !isPremium;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.05 }}
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
              className="border-cosmic-purple/30 text-cosmic-purple-light text-xs"
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
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
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

// Helper: format report age
function formatReportAge(createdAt: string): { label: string; isStale: boolean } {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: "Generated today", isStale: false };
  } else if (diffDays === 1) {
    return { label: "Generated yesterday", isStale: false };
  } else if (diffDays < 30) {
    return { label: `Generated ${diffDays} days ago`, isStale: false };
  } else {
    const weeks = Math.floor(diffDays / 7);
    const label = weeks < 8
      ? `Generated ${weeks} weeks ago`
      : `Generated ${Math.floor(diffDays / 30)} months ago`;
    return { label, isStale: true };
  }
}

// ============================================================
// Public Preview Component
// ============================================================

function PublicPreviewView({
  preview,
  reducedMotion,
}: {
  preview: PublicPreview;
  reducedMotion: boolean;
}) {
  const shouldAnimate = !reducedMotion;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 text-center">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldAnimate ? undefined : { duration: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-cosmic-purple-light" />
              <span className="text-sm text-cosmic-purple-light font-medium uppercase tracking-wider">
                Shared Compatibility Report
              </span>
              <Sparkles className="h-5 w-5 text-cosmic-purple-light" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">
              {preview.person1.name}{" "}
              <span className="text-cosmic-purple-light">&</span>{" "}
              {preview.person2.name}
            </h1>
            {(preview.person1.sunSign || preview.person2.sunSign) && (
              <p className="text-sm text-muted-foreground mt-2">
                {preview.person1.sunSign && (
                  <span>{preview.person1.sunSign}</span>
                )}
                {preview.person1.sunSign && preview.person2.sunSign && (
                  <span className="mx-2 text-cosmic-purple-light">+</span>
                )}
                {preview.person2.sunSign && (
                  <span>{preview.person2.sunSign}</span>
                )}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-8">
          {/* Overall Score */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={shouldAnimate ? { delay: 0.2 } : { duration: 0 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm w-full max-w-sm"
          >
            <h2 className="font-heading text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
              Overall Compatibility
            </h2>
            <ScoreCircle score={preview.scores.overall} size={180} reducedMotion={reducedMotion} />
          </motion.div>

          {/* Big Picture Summary */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldAnimate ? { delay: 0.4 } : { duration: 0 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-cosmic-purple-light" />
              <h2 className="font-heading text-base font-semibold">
                The Big Picture
              </h2>
            </div>
            <Separator className="mb-4 bg-white/5" />
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {preview.summaryNarrative}
            </p>
          </motion.div>

          {/* Locked Premium Sections Teaser */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldAnimate ? { delay: 0.6 } : { duration: 0 }}
            className="w-full space-y-3"
          >
            {[
              { icon: <Heart className="h-4 w-4" />, label: "Emotional Connection" },
              { icon: <Flame className="h-4 w-4" />, label: "Romance & Chemistry" },
              { icon: <MessageSquare className="h-4 w-4" />, label: "Communication" },
              { icon: <Shield className="h-4 w-4" />, label: "Long-Term Potential" },
            ].map((section) => (
              <div
                key={section.label}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{section.icon}</span>
                  <span className="text-sm font-medium">{section.label}</span>
                </div>
                <Badge
                  variant="outline"
                  className="border-cosmic-purple/30 text-cosmic-purple-light text-xs"
                >
                  <Lock className="mr-1 h-2.5 w-2.5" />
                  Full Report
                </Badge>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldAnimate ? { delay: 0.8 } : { duration: 0 }}
            className="w-full rounded-xl border border-cosmic-purple/30 bg-gradient-to-br from-cosmic-purple/10 to-cosmic-purple/5 p-8 text-center backdrop-blur-sm"
          >
            <Sparkles className="h-8 w-8 text-cosmic-purple-light mx-auto mb-3" />
            <h3 className="font-heading text-xl font-bold mb-2">
              Want to check YOUR compatibility?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Create a free account to generate your own full compatibility report
              with detailed insights across all dimensions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
              >
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Free Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/10">
                <Link href="/auth/signin">
                  Already have an account? Sign in
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;
  const [report, setReport] = useState<Report | null>(null);
  const [publicPreview, setPublicPreview] = useState<PublicPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [generatingShareLink, setGeneratingShareLink] = useState(false);

  const reportId = params.id as string;
  const shareToken = searchParams.get("token");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Build the API URL, including share token if present
        const apiUrl = shareToken
          ? `/api/report/${reportId}?token=${encodeURIComponent(shareToken)}`
          : `/api/report/${reportId}`;

        const res = await fetch(apiUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.isPublicPreview) {
            setPublicPreview(json);
          } else {
            setReport(json);
          }
        } else {
          if (shareToken) {
            setError("This share link is invalid or has expired.");
          } else {
            setError("Unable to load this report. It may not exist or you may not have access.");
          }
        }
      } catch (err) {
        console.error("Failed to load report:", err);
        setError("Unable to load this report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, shareToken]);

  const handleRegenerate = useCallback(async () => {
    if (!report || regenerating) return;
    setRegenerating(true);
    setRegenerateError(null);
    try {
      const res = await fetch("/api/compatibility/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1Id: report.person1.id,
          person2Id: report.person2.id,
          regenerate: true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        // Navigate to the (possibly same) report page to reload fresh data
        if (json.id) {
          router.push(`/report/${json.id}`);
          router.refresh();
        }
        // Reload current report data
        const refreshRes = await fetch(`/api/report/${reportId}`);
        if (refreshRes.ok) {
          setReport(await refreshRes.json());
        }
      } else {
        const errJson = await res.json().catch(() => null);
        setRegenerateError(
          errJson?.message || errJson?.error || "Failed to regenerate report. Please try again."
        );
      }
    } catch (err) {
      console.error("Failed to regenerate report:", err);
      setRegenerateError("Failed to regenerate report. Please try again.");
    } finally {
      setRegenerating(false);
    }
  }, [report, regenerating, reportId, router]);

  // Generate a share link and copy it
  const handleShare = useCallback(async () => {
    if (!report) return;

    // If we already have a shareToken (from the API response or a previous call),
    // build the URL directly and copy it.
    if (report.shareToken) {
      const shareUrl = `${window.location.origin}/report/${reportId}?token=${report.shareToken}`;
      await copyToClipboard(shareUrl);
      return;
    }

    // Otherwise, call the POST endpoint to generate a share token
    setGeneratingShareLink(true);
    try {
      const res = await fetch(`/api/report/${reportId}`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        // Update report state with the new token
        setReport((prev) => prev ? { ...prev, shareToken: json.shareToken } : prev);
        const shareUrl = `${window.location.origin}/report/${reportId}?token=${json.shareToken}`;
        await copyToClipboard(shareUrl);
      } else {
        console.error("Failed to generate share link");
      }
    } catch (err) {
      console.error("Failed to generate share link:", err);
    } finally {
      setGeneratingShareLink(false);
    }
  }, [report, reportId]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      } catch {
        // Silent fail
      }
      document.body.removeChild(textArea);
    }
  };

  // ============================================================
  // Loading state
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="mt-3 text-sm text-muted-foreground">
            {shareToken
              ? "Loading shared compatibility report..."
              : "Loading your compatibility report..."}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Error state
  // ============================================================

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Report Unavailable</h1>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
          {shareToken ? (
            <Button asChild className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
          ) : (
            <Button asChild className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // Public preview (shared via token)
  // ============================================================

  if (publicPreview) {
    return (
      <PublicPreviewView
        preview={publicPreview}
        reducedMotion={!!prefersReducedMotion}
      />
    );
  }

  // ============================================================
  // No report state
  // ============================================================

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

  // ============================================================
  // Full report (authenticated owner)
  // ============================================================

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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-colors mb-6 print:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldAnimate ? undefined : { duration: 0 }}
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
              {report.createdAt && (() => {
                const { label, isStale } = formatReportAge(report.createdAt);
                const createdDate = new Date(report.createdAt);
                const formattedDate = createdDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Report generated on {formattedDate}
                      {!isStale && <> ({label.toLowerCase().replace("generated ", "")})</>}
                    </span>
                    {isStale && (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-gold/80 bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          Transits may have shifted
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRegenerate}
                          disabled={regenerating}
                          className="h-6 text-xs border-cosmic-purple/30 hover:border-cosmic-purple hover:bg-cosmic-purple/10 text-cosmic-purple-light print:hidden"
                        >
                          {regenerating ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-1.5 h-3 w-3" />
                          )}
                          {regenerating ? "Regenerating..." : "Regenerate Report"}
                        </Button>
                      </>
                    )}
                    {regenerateError && (
                      <span className="text-xs text-red-400">{regenerateError}</span>
                    )}
                  </div>
                );
              })()}
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
              <ScoreCircle score={report.overallScore} reducedMotion={!shouldAnimate} />
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
                reducedMotion={!shouldAnimate}
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
                  reducedMotion={!shouldAnimate}
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
                reducedMotion={!shouldAnimate}
              />
            ))}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 print:hidden">
              <Button
                asChild
                className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
              >
                <Link href={`/chat?reportId=${reportId}`}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ask AI About This
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/10"
                onClick={handleShare}
                disabled={generatingShareLink}
              >
                {generatingShareLink ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                {generatingShareLink ? "Generating..." : "Share"}
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

            {/* Continue Your Journey */}
            <div className="pt-6 print:hidden">
              <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Continue Your Journey
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    href: `/chat?reportId=${reportId}`,
                    icon: <MessageCircle className="h-5 w-5" />,
                    label: "Ask AI About This",
                    description: "Dive deeper with your AI astrologer",
                  },
                  {
                    href: "/transits",
                    icon: <TrendingUp className="h-5 w-5" />,
                    label: "Check Your Transits",
                    description: "See what the stars say right now",
                  },
                  {
                    href: "/horoscope",
                    icon: <Sun className="h-5 w-5" />,
                    label: "View Your Horoscope",
                    description: "Your daily cosmic guidance",
                  },
                  {
                    href: "/compatibility",
                    icon: <Heart className="h-5 w-5" />,
                    label: "Run Another Check",
                    description: "Test a different pairing",
                  },
                ].map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group glass-card rounded-xl border border-white/10 p-4 flex flex-col items-center text-center gap-2 transition-all hover:border-cosmic-purple/50 hover:bg-cosmic-purple/5"
                  >
                    <span className="text-cosmic-purple-light group-hover:text-cosmic-purple transition-colors">
                      {card.icon}
                    </span>
                    <span className="text-sm font-medium leading-tight">
                      {card.label}
                    </span>
                    <span className="text-[11px] leading-snug text-muted-foreground hidden sm:block">
                      {card.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only footer */}
      <div className="print-footer">
        <p>Generated by ChartChemistry &mdash; chartchemistry.com</p>
        <p>Report ID: {reportId} &bull; {new Date().toLocaleDateString()}</p>
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 0 }}
            transition={shouldAnimate ? undefined : { duration: 0 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-24 md:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-navy-light/95 backdrop-blur-xl px-6 py-3 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-medium">Share link copied to clipboard</p>
            </div>
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
