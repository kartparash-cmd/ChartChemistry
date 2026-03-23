import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const SIGN_EMOJIS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

function getVerdict(score: number): string {
  if (score >= 90) return "Cosmic Soulmates";
  if (score >= 80) return "Written in the Stars";
  if (score >= 70) return "Strong Connection";
  if (score >= 55) return "Interesting Dynamic";
  if (score >= 40) return "Challenging but Passionate";
  return "Opposites Attract?";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const person1Name = searchParams.get("person1Name") || "Person 1";
  const person2Name = searchParams.get("person2Name") || "Person 2";
  const sign1 = searchParams.get("sign1") || "";
  const sign2 = searchParams.get("sign2") || "";
  const score = Math.min(100, Math.max(0, Number(searchParams.get("score")) || 0));
  const emoji1 = searchParams.get("emoji1") || SIGN_EMOJIS[sign1] || "\u2728";
  const emoji2 = searchParams.get("emoji2") || SIGN_EMOJIS[sign2] || "\u2728";
  const verdict = getVerdict(score);

  // Score circle: size & stroke calculations
  const circleSize = 280;
  const strokeWidth = 16;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(180deg, #020617 0%, #0F172A 30%, #1E1B4B 70%, #0F172A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "200px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "300px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top section: Badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(124, 58, 237, 0.25)",
              border: "2px solid rgba(124, 58, 237, 0.5)",
              color: "#A78BFA",
              padding: "10px 32px",
              borderRadius: "30px",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "3px",
            }}
          >
            COMPATIBILITY RESULTS
          </div>
        </div>

        {/* Middle section: Names + Score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "48px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Person 1 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "96px", lineHeight: 1 }}>{emoji1}</span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 800,
                color: "white",
                textAlign: "center",
                maxWidth: "800px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {person1Name}
            </span>
            {sign1 && (
              <span style={{ fontSize: "26px", fontWeight: 600, color: "#A78BFA" }}>{sign1}</span>
            )}
          </div>

          {/* Score circle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              width: `${circleSize}px`,
              height: `${circleSize}px`,
            }}
          >
            {/* Background ring */}
            <svg
              width={circleSize}
              height={circleSize}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
            {/* Score text */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "100px",
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                %
              </span>
            </div>
          </div>

          {/* Verdict */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "36px",
                fontWeight: 700,
                color: "#F59E0B",
                textAlign: "center",
              }}
            >
              {verdict}
            </span>
          </div>

          {/* Person 2 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "96px", lineHeight: 1 }}>{emoji2}</span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 800,
                color: "white",
                textAlign: "center",
                maxWidth: "800px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {person2Name}
            </span>
            {sign2 && (
              <span style={{ fontSize: "26px", fontWeight: 600, color: "#FCD34D" }}>{sign2}</span>
            )}
          </div>
        </div>

        {/* Bottom section: CTA + Branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* CTA */}
          <div
            style={{
              background: "linear-gradient(135deg, #7C3AED, #F59E0B)",
              padding: "18px 48px",
              borderRadius: "60px",
              fontSize: "28px",
              fontWeight: 700,
              color: "white",
              textAlign: "center",
            }}
          >
            Scan to check YOUR compatibility
          </div>

          {/* Branding */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #A78BFA, #F59E0B)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              ChartChemistry
            </span>
            <span style={{ fontSize: "20px", color: "#94A3B8" }}>
              chartchemistry.com
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
