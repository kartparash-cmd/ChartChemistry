import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const SIGN_EMOJIS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

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
  const hasResult = a && b;

  let signA = "";
  let signB = "";
  if (hasResult) {
    signA = getSunSign(a);
    signB = getSunSign(b);
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
            {/* Signs */}
            <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "72px" }}>{SIGN_EMOJIS[signA] || ""}</span>
                <span style={{ color: "#A78BFA", fontSize: "20px", fontWeight: 600 }}>{signA}</span>
              </div>
              <span style={{ fontSize: "36px", color: "#F59E0B" }}>+</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "72px" }}>{SIGN_EMOJIS[signB] || ""}</span>
                <span style={{ color: "#FCD34D", fontSize: "20px", fontWeight: 600 }}>{signB}</span>
              </div>
            </div>
            <div style={{ fontSize: "28px", color: "#94A3B8", marginBottom: "8px" }}>
              See how compatible they are!
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
