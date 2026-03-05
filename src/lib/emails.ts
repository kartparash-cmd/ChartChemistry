/**
 * Outbound email templates for ChartChemistry.
 *
 * Uses the same Resend client configuration as the transactional
 * emails in email.ts (verification, password reset).  This module
 * focuses on *proactive* outreach: welcome series and daily digests.
 */

import { Resend } from "resend";

// ---------------------------------------------------------------------------
// Shared Resend client (lazy-initialized, same pattern as email.ts)
// ---------------------------------------------------------------------------

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.EMAIL_FROM || "ChartChemistry <noreply@chartchemistry.com>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// ---------------------------------------------------------------------------
// Shared inline-CSS design tokens (cosmic theme)
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#0f0a1e",
  card: "#1a1333",
  border: "#2d2255",
  purple: "#7c3aed",
  gold: "#f5c542",
  cream: "#f5f0eb",
  muted: "#9b8ec4",
} as const;

function baseWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:${COLORS.gold};letter-spacing:0.5px;">ChartChemistry</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 32px;color:${COLORS.cream};font-size:16px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid ${COLORS.border};">
              <p style="margin:0;font-size:12px;color:${COLORS.muted};">
                &copy; ${new Date().getFullYear()} ChartChemistry &middot;
                <a href="${APP_URL}/privacy" style="color:${COLORS.muted};text-decoration:underline;">Privacy</a> &middot;
                <a href="${APP_URL}/terms" style="color:${COLORS.muted};text-decoration:underline;">Terms</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td style="background:${COLORS.purple};border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

// ---------------------------------------------------------------------------
// A. Welcome email
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured — skipping welcome email"
    );
    return { success: false };
  }

  const displayName = name || "Stargazer";

  const html = baseWrapper(`
    <h2 style="margin:0 0 16px;font-size:22px;color:${COLORS.cream};">
      Welcome, ${displayName}!
    </h2>
    <p style="margin:0 0 20px;">
      We are thrilled to have you join ChartChemistry. The cosmos has been
      waiting for you. Here is how to get started in three simple steps:
    </p>

    <!-- Steps -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLORS.border};">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:${COLORS.purple};color:#fff;border-radius:50%;font-weight:700;font-size:14px;margin-right:12px;vertical-align:middle;">1</span>
          <span style="color:${COLORS.cream};font-size:15px;vertical-align:middle;">
            <strong>Create your birth profile</strong> &mdash; enter your date, time, and place of birth.
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLORS.border};">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:${COLORS.purple};color:#fff;border-radius:50%;font-weight:700;font-size:14px;margin-right:12px;vertical-align:middle;">2</span>
          <span style="color:${COLORS.cream};font-size:15px;vertical-align:middle;">
            <strong>Check compatibility</strong> &mdash; add someone special and see your cosmic connection.
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:${COLORS.purple};color:#fff;border-radius:50%;font-weight:700;font-size:14px;margin-right:12px;vertical-align:middle;">3</span>
          <span style="color:${COLORS.cream};font-size:15px;vertical-align:middle;">
            <strong>Explore your chart</strong> &mdash; dive into your natal placements and transits.
          </span>
        </td>
      </tr>
    </table>

    ${ctaButton("Start Exploring", `${APP_URL}/dashboard`)}

    <p style="margin:20px 0 0;font-size:14px;color:${COLORS.muted};text-align:center;">
      Upgrade to <strong style="color:${COLORS.gold};">Premium</strong> for AI-powered
      compatibility reports, daily horoscopes, wellness timing, and unlimited access
      to our AI astrologer chat.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ChartChemistry, ${displayName}! ✨`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// B. Daily horoscope digest email
// ---------------------------------------------------------------------------

export interface HoroscopeDigestContent {
  summary: string;
  body: string;
  cosmicTip: string;
  luckyTime: string;
  mood: string;
}

export async function sendHoroscopeDigest(
  to: string,
  name: string,
  horoscopeContent: HoroscopeDigestContent
): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured — skipping horoscope digest email"
    );
    return { success: false };
  }

  const displayName = name || "Stargazer";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const moodColor =
    horoscopeContent.mood === "passionate" || horoscopeContent.mood === "intense"
      ? "#e74c3c"
      : horoscopeContent.mood === "expansive" || horoscopeContent.mood === "playful"
        ? COLORS.gold
        : horoscopeContent.mood === "grounded" || horoscopeContent.mood === "reflective"
          ? "#27ae60"
          : COLORS.purple;

  const html = baseWrapper(`
    <h2 style="margin:0 0 4px;font-size:20px;color:${COLORS.cream};">
      Good morning, ${displayName}
    </h2>
    <p style="margin:0 0 20px;font-size:13px;color:${COLORS.muted};">${today}</p>

    <!-- Mood badge -->
    <p style="margin:0 0 16px;">
      <span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${moodColor}22;border:1px solid ${moodColor}55;color:${moodColor};font-size:13px;font-weight:600;text-transform:capitalize;">
        ${horoscopeContent.mood}
      </span>
      <span style="margin-left:12px;font-size:13px;color:${COLORS.muted};">
        Lucky time: ${horoscopeContent.luckyTime}
      </span>
    </p>

    <!-- Summary -->
    <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:${COLORS.gold};">
      ${horoscopeContent.summary}
    </p>

    <!-- Body -->
    <p style="margin:0 0 20px;font-size:15px;color:${COLORS.cream};line-height:1.7;">
      ${horoscopeContent.body}
    </p>

    <!-- Cosmic Tip -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COLORS.purple}18;border-left:3px solid ${COLORS.purple};padding:14px 16px;border-radius:0 8px 8px 0;">
          <strong style="color:${COLORS.gold};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Cosmic Tip</strong>
          <p style="margin:6px 0 0;font-size:14px;color:${COLORS.cream};">
            ${horoscopeContent.cosmicTip}
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton("See Full Details", `${APP_URL}/transits`)}

    <!-- Unsubscribe -->
    <p style="margin:20px 0 0;font-size:12px;color:${COLORS.muted};text-align:center;">
      You are receiving this because you have a Premium plan on ChartChemistry.<br />
      <a href="${APP_URL}/dashboard/settings" style="color:${COLORS.muted};text-decoration:underline;">
        Manage email preferences
      </a>
      &middot;
      <a href="${APP_URL}/dashboard/settings?unsubscribe=digest" style="color:${COLORS.muted};text-decoration:underline;">
        Unsubscribe
      </a>
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Daily Cosmic Guidance ☀️ ${today}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send horoscope digest email:", error);
    return { success: false };
  }
}
