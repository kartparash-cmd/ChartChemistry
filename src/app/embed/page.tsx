"use client";

import { useState } from "react";

/* ─── Sun Sign Logic (self-contained for embed) ───────────────────────── */

const SIGN_EMOJIS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

const COMPAT: Record<string, Record<string, number>> = {};
function setCompat(a: string, b: string, score: number) {
  if (!COMPAT[a]) COMPAT[a] = {};
  if (!COMPAT[b]) COMPAT[b] = {};
  COMPAT[a][b] = score;
  COMPAT[b][a] = score;
}

SIGNS.forEach((s) => setCompat(s, s, 78));
setCompat("Aries", "Leo", 93); setCompat("Aries", "Sagittarius", 90); setCompat("Leo", "Sagittarius", 88);
setCompat("Taurus", "Virgo", 90); setCompat("Taurus", "Capricorn", 92); setCompat("Virgo", "Capricorn", 88);
setCompat("Gemini", "Libra", 89); setCompat("Gemini", "Aquarius", 85); setCompat("Libra", "Aquarius", 91);
setCompat("Cancer", "Scorpio", 94); setCompat("Cancer", "Pisces", 92); setCompat("Scorpio", "Pisces", 90);
setCompat("Aries", "Gemini", 83); setCompat("Aries", "Libra", 72); setCompat("Aries", "Aquarius", 79);
setCompat("Leo", "Gemini", 80); setCompat("Leo", "Libra", 85); setCompat("Leo", "Aquarius", 68);
setCompat("Sagittarius", "Gemini", 70); setCompat("Sagittarius", "Libra", 82); setCompat("Sagittarius", "Aquarius", 87);
setCompat("Taurus", "Cancer", 89); setCompat("Taurus", "Scorpio", 73); setCompat("Taurus", "Pisces", 84);
setCompat("Virgo", "Cancer", 82); setCompat("Virgo", "Scorpio", 86); setCompat("Virgo", "Pisces", 65);
setCompat("Capricorn", "Cancer", 68); setCompat("Capricorn", "Scorpio", 88); setCompat("Capricorn", "Pisces", 81);
setCompat("Aries", "Cancer", 47); setCompat("Aries", "Scorpio", 55); setCompat("Aries", "Pisces", 62);
setCompat("Leo", "Cancer", 58); setCompat("Leo", "Scorpio", 60); setCompat("Leo", "Pisces", 52);
setCompat("Sagittarius", "Cancer", 42); setCompat("Sagittarius", "Scorpio", 58); setCompat("Sagittarius", "Pisces", 70);
setCompat("Aries", "Taurus", 52); setCompat("Aries", "Virgo", 48); setCompat("Aries", "Capricorn", 55);
setCompat("Leo", "Taurus", 65); setCompat("Leo", "Virgo", 55); setCompat("Leo", "Capricorn", 50);
setCompat("Sagittarius", "Taurus", 45); setCompat("Sagittarius", "Virgo", 50); setCompat("Sagittarius", "Capricorn", 60);
setCompat("Gemini", "Cancer", 55); setCompat("Gemini", "Scorpio", 48); setCompat("Gemini", "Pisces", 58);
setCompat("Libra", "Cancer", 50); setCompat("Libra", "Scorpio", 72); setCompat("Libra", "Pisces", 60);
setCompat("Aquarius", "Cancer", 42); setCompat("Aquarius", "Scorpio", 65); setCompat("Aquarius", "Pisces", 55);
setCompat("Gemini", "Taurus", 60); setCompat("Gemini", "Virgo", 62); setCompat("Gemini", "Capricorn", 50);
setCompat("Libra", "Taurus", 68); setCompat("Libra", "Virgo", 55); setCompat("Libra", "Capricorn", 58);
setCompat("Aquarius", "Taurus", 48); setCompat("Aquarius", "Virgo", 52); setCompat("Aquarius", "Capricorn", 60);

function getSunSign(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function getVerdict(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Cosmic Soulmates", color: "#FFD700" };
  if (score >= 80) return { text: "Written in the Stars", color: "#A78BFA" };
  if (score >= 70) return { text: "Strong Connection", color: "#4ADE80" };
  if (score >= 55) return { text: "Interesting Dynamic", color: "#60A5FA" };
  if (score >= 40) return { text: "Challenging but Passionate", color: "#FB923C" };
  return { text: "Opposites Attract?", color: "#F87171" };
}

function getBlurb(sign1: string, sign2: string, score: number): string {
  const el1 = SIGN_ELEMENTS[sign1];
  const el2 = SIGN_ELEMENTS[sign2];
  if (sign1 === sign2) return `Two ${sign1}s? Double the energy, double the intensity.`;
  if (el1 === el2) return `${el1} meets ${el2} — a naturally harmonious pairing.`;
  if ((el1 === "Fire" && el2 === "Air") || (el1 === "Air" && el2 === "Fire")) return `${el1} feeds ${el2} — an energizing, dynamic match.`;
  if ((el1 === "Earth" && el2 === "Water") || (el1 === "Water" && el2 === "Earth")) return `${el1} and ${el2} nurture each other beautifully.`;
  if (score >= 65) return `${sign1} and ${sign2} bring out unexpected sides of each other.`;
  return `${sign1} and ${sign2} — different wavelengths, magnetic attraction.`;
}

/* ─── Widget Component ─────────────────────────────────────────────────── */

export default function EmbedWidget() {
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  const [result, setResult] = useState<{
    signA: string;
    signB: string;
    score: number;
    verdict: { text: string; color: string };
    blurb: string;
  } | null>(null);

  function handleCheck() {
    if (!dateA || !dateB) return;
    const signA = getSunSign(dateA);
    const signB = getSunSign(dateB);
    const score = COMPAT[signA]?.[signB] ?? 65;
    const verdict = getVerdict(score);
    const blurb = getBlurb(signA, signB, score);
    setResult({ signA, signB, score, verdict, blurb });
  }

  function handleReset() {
    setDateA("");
    setDateB("");
    setResult(null);
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#E2E8F0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #A78BFA, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Compatibility Check
        </h1>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0" }}>
          Sun sign compatibility in seconds
        </p>
      </div>

      {!result ? (
        /* ─── Form ─────────────────────────────────────────────── */
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}
            >
              Person 1 — Birthday
            </label>
            <input
              type="date"
              value={dateA}
              onChange={(e) => setDateA(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#1E293B",
                color: "#E2E8F0",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}
            >
              Person 2 — Birthday
            </label>
            <input
              type="date"
              value={dateB}
              onChange={(e) => setDateB(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#1E293B",
                color: "#E2E8F0",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={!dateA || !dateB}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 8,
              border: "none",
              background:
                dateA && dateB
                  ? "linear-gradient(135deg, #7C3AED, #A78BFA)"
                  : "#334155",
              color: dateA && dateB ? "#fff" : "#64748B",
              fontSize: 15,
              fontWeight: 600,
              cursor: dateA && dateB ? "pointer" : "not-allowed",
              transition: "opacity 0.2s",
            }}
          >
            Check Compatibility
          </button>
        </div>
      ) : (
        /* ─── Result ───────────────────────────────────────────── */
        <div style={{ flex: 1, textAlign: "center" }}>
          {/* Signs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <span style={{ fontSize: 36 }}>{SIGN_EMOJIS[result.signA]}</span>
              <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>
                {result.signA}
              </div>
            </div>
            <span style={{ fontSize: 20, color: "#64748B" }}>&amp;</span>
            <div>
              <span style={{ fontSize: 36 }}>{SIGN_EMOJIS[result.signB]}</span>
              <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>
                {result.signB}
              </div>
            </div>
          </div>

          {/* Score */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              background: "linear-gradient(135deg, #A78BFA, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {result.score}%
          </div>

          {/* Verdict */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: result.verdict.color,
              marginBottom: 8,
            }}
          >
            {result.verdict.text}
          </div>

          {/* Blurb */}
          <p
            style={{
              fontSize: 13,
              color: "#94A3B8",
              lineHeight: 1.5,
              margin: "0 0 20px",
            }}
          >
            {result.blurb}
          </p>

          {/* CTA */}
          <a
            href="https://chartchemistry.com/compatibility"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "12px 0",
              borderRadius: 8,
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            Get Your Full Report &rarr;
          </a>

          <button
            onClick={handleReset}
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Try another pair
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          paddingTop: 16,
          marginTop: "auto",
          borderTop: "1px solid #1E293B",
        }}
      >
        <a
          href="https://chartchemistry.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            color: "#64748B",
            textDecoration: "none",
          }}
        >
          Powered by{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #A78BFA, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
            }}
          >
            ChartChemistry
          </span>
        </a>
      </div>
    </div>
  );
}
