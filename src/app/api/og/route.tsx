import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const SIGN_EMOJIS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

// Compatibility matrix (inlined for edge runtime)
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

function getCompatibility(sign1: string, sign2: string): number {
  return COMPAT[sign1]?.[sign2] ?? 65;
}

function getVerdict(score: number): string {
  if (score >= 90) return "Cosmic Soulmates";
  if (score >= 80) return "Written in the Stars";
  if (score >= 70) return "Strong Connection";
  if (score >= 55) return "Interesting Dynamic";
  if (score >= 40) return "Challenging but Passionate";
  return "Opposites Attract?";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#F59E0B";
  if (score >= 80) return "#A78BFA";
  if (score >= 70) return "#4ADE80";
  if (score >= 55) return "#60A5FA";
  if (score >= 40) return "#FB923C";
  return "#F87171";
}

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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const a = searchParams.get("a");
  const b = searchParams.get("b");
  const nameA = searchParams.get("na");
  const nameB = searchParams.get("nb");
  const hasResult = a && b;

  let signA = "";
  let signB = "";
  let score = 0;
  let verdict = "";
  let scoreColor = "";
  if (hasResult) {
    signA = getSunSign(a);
    signB = getSunSign(b);
    score = getCompatibility(signA, signB);
    verdict = getVerdict(score);
    scoreColor = getScoreColor(score);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #020617 0%, #0F172A 40%, #1E293B 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            background: "rgba(124, 58, 237, 0.3)",
            border: "1px solid rgba(124, 58, 237, 0.5)",
            color: "#A78BFA",
            padding: "6px 20px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "2px",
            marginBottom: "24px",
          }}
        >
          FREE COMPATIBILITY CHECK
        </div>

        {hasResult ? (
          <>
            {/* Signs row */}
            <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "64px" }}>{SIGN_EMOJIS[signA] || ""}</span>
                {nameA && <span style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>{nameA}</span>}
                <span style={{ color: "#A78BFA", fontSize: "16px", fontWeight: 600 }}>{signA}</span>
              </div>
              <span style={{ fontSize: "32px", color: "#F59E0B" }}>+</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "64px" }}>{SIGN_EMOJIS[signB] || ""}</span>
                {nameB && <span style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>{nameB}</span>}
                <span style={{ color: "#FCD34D", fontSize: "16px", fontWeight: 600 }}>{signB}</span>
              </div>
            </div>

            {/* Score - hero element */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "96px",
                  fontWeight: 800,
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: 700,
                  color: scoreColor,
                  opacity: 0.8,
                }}
              >
                %
              </span>
            </div>

            {/* Verdict */}
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "white",
                marginBottom: "8px",
              }}
            >
              {verdict}
            </div>
            <div style={{ fontSize: "18px", color: "#94A3B8" }}>
              Tap to check your own compatibility
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "56px",
                fontWeight: 800,
                color: "white",
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: "800px",
                marginBottom: "20px",
              }}
            >
              How Compatible Are You?
            </div>
            <div
              style={{
                fontSize: "26px",
                color: "#94A3B8",
                textAlign: "center",
                maxWidth: "600px",
                lineHeight: 1.4,
                marginBottom: "40px",
              }}
            >
              Enter two birthdays and discover your zodiac compatibility in seconds
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              {["\u2648", "\u264C", "\u264F", "\u2652", "\u2649", "\u264E"].map((e, i) => (
                <span key={i} style={{ fontSize: "40px", opacity: 0.6 }}>{e}</span>
              ))}
            </div>
          </>
        )}

        <div style={{ position: "absolute", bottom: "28px", fontSize: "18px", color: "#7C3AED" }}>
          chartchemistry.com/quick-match
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
