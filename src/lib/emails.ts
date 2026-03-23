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
  process.env.EMAIL_FROM || "ChartChemistry <noreply@send.chartchemistry.com>";
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
      to Marie, your personal astrologer.
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
  overview: string;
  love: string;
  career: string;
  wellness: string;
  cosmicTip: string;
  luckyTime: string;
  luckyNumber: number;
  luckyColor: string;
  mood: string;
  // Legacy fields (backward compat)
  summary?: string;
  body?: string;
}

// ---------------------------------------------------------------------------
// C. Free-user drip sequence: Day 1 — "Your chart is ready!"
// ---------------------------------------------------------------------------

export async function sendDayOneEmail(
  to: string,
  name: string
): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured — skipping day-one drip email"
    );
    return { success: false };
  }

  const displayName = name || "Stargazer";

  const html = baseWrapper(`
    <h2 style="margin:0 0 16px;font-size:22px;color:${COLORS.cream};">
      Your cosmic profile is waiting, ${displayName}!
    </h2>
    <p style="margin:0 0 16px;">
      It has been a day since you joined ChartChemistry, and your natal chart
      is ready to explore. Your chart is a unique cosmic fingerprint &mdash;
      no one else on Earth has the exact same one.
    </p>
    <p style="margin:0 0 16px;">
      Here is a glimpse of what your chart reveals:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;color:${COLORS.cream};line-height:1.8;">
      <li><strong style="color:${COLORS.gold};">Your Sun sign</strong> &mdash; your core identity and life purpose</li>
      <li><strong style="color:${COLORS.gold};">Your Rising sign</strong> &mdash; how the world sees you</li>
      <li><strong style="color:${COLORS.gold};">Your planetary placements</strong> &mdash; the forces shaping your personality</li>
    </ul>
    <p style="margin:0 0 20px;">
      Head to your dashboard to see your full chart and start discovering
      what the cosmos has written in the stars for you.
    </p>

    ${ctaButton("View Your Chart", `${APP_URL}/dashboard`)}

    <!-- Unsubscribe -->
    <p style="margin:20px 0 0;font-size:12px;color:${COLORS.muted};text-align:center;">
      <a href="${APP_URL}/dashboard/settings" style="color:${COLORS.muted};text-decoration:underline;">
        Manage email preferences
      </a>
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your cosmic profile is waiting ✨",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send day-one drip email:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// D. Free-user drip sequence: Day 3 — "More than your Sun sign"
// ---------------------------------------------------------------------------

export async function sendDayThreeEmail(
  to: string,
  name: string
): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured — skipping day-three drip email"
    );
    return { success: false };
  }

  const displayName = name || "Stargazer";

  const html = baseWrapper(`
    <h2 style="margin:0 0 16px;font-size:22px;color:${COLORS.cream};">
      There is more to you than your Sun sign, ${displayName}
    </h2>
    <p style="margin:0 0 16px;">
      Most people only know their Sun sign, but did you know your
      <strong style="color:${COLORS.gold};">Moon sign</strong> might be
      even more revealing?
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COLORS.purple}18;border-left:3px solid ${COLORS.purple};padding:14px 16px;border-radius:0 8px 8px 0;">
          <strong style="color:${COLORS.gold};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Did you know?</strong>
          <p style="margin:6px 0 0;font-size:14px;color:${COLORS.cream};">
            Your Moon sign governs your emotional world &mdash; how you process
            feelings, what makes you feel safe, and what you truly need in
            relationships. It is the hidden half of who you are.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;">
      Explore the zodiac signs to learn what your Moon sign, Rising sign, and
      other placements mean for your life and relationships.
    </p>

    ${ctaButton("Explore the Zodiac", `${APP_URL}/learn/zodiac`)}

    <!-- Unsubscribe -->
    <p style="margin:20px 0 0;font-size:12px;color:${COLORS.muted};text-align:center;">
      <a href="${APP_URL}/dashboard/settings" style="color:${COLORS.muted};text-decoration:underline;">
        Manage email preferences
      </a>
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "There's more to you than your Sun sign 🌙",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send day-three drip email:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// E. Free-user weekly cosmic digest
// ---------------------------------------------------------------------------

export async function sendWeeklyFreeDigest(
  to: string,
  name: string
): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured — skipping weekly free digest email"
    );
    return { success: false };
  }

  const displayName = name || "Stargazer";
  const weekStart = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const html = baseWrapper(`
    <h2 style="margin:0 0 4px;font-size:20px;color:${COLORS.cream};">
      Your weekly cosmic outlook, ${displayName}
    </h2>
    <p style="margin:0 0 20px;font-size:13px;color:${COLORS.muted};">
      ${formatDate(weekStart)} &ndash; ${formatDate(weekEnd)}
    </p>

    <!-- Moon phases -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
      <tr>
        <td style="background:${COLORS.purple}18;border-left:3px solid ${COLORS.gold};padding:14px 16px;border-radius:0 8px 8px 0;">
          <strong style="color:${COLORS.gold};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Moon Phases This Week</strong>
          <p style="margin:6px 0 0;font-size:14px;color:${COLORS.cream};">
            Pay attention to the lunar cycle this week. The Moon&rsquo;s shifts
            through the signs influence your mood, energy, and relationships.
            Check your dashboard for daily transit updates.
          </p>
        </td>
      </tr>
    </table>

    <!-- Cosmic weather -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COLORS.purple}18;border-left:3px solid ${COLORS.purple};padding:14px 16px;border-radius:0 8px 8px 0;">
          <strong style="color:${COLORS.gold};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Cosmic Weather</strong>
          <p style="margin:6px 0 0;font-size:14px;color:${COLORS.cream};">
            Keep an eye on any planetary retrogrades and major aspects this week.
            These cosmic events affect everyone &mdash; knowing about them ahead
            of time helps you navigate challenges and seize opportunities.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:15px;color:${COLORS.cream};">
      Want to know how this week&rsquo;s cosmic weather affects your
      relationships? Run a compatibility check and see how the stars align
      between you and someone special.
    </p>

    ${ctaButton("Check Compatibility", `${APP_URL}/compatibility`)}

    <!-- Upsell -->
    <p style="margin:20px 0 0;font-size:14px;color:${COLORS.muted};text-align:center;">
      Upgrade to <strong style="color:${COLORS.gold};">Premium</strong> for
      personalized daily horoscopes, AI-powered reports, and unlimited access
      to Marie, your personal astrologer.
    </p>

    <!-- Unsubscribe -->
    <p style="margin:12px 0 0;font-size:12px;color:${COLORS.muted};text-align:center;">
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
      subject: "Your weekly cosmic outlook 🌟",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send weekly free digest email:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// F. Birthday reminder email (for saved partners/friends)
// ---------------------------------------------------------------------------

const SIGN_BIRTHDAY_MESSAGES: Record<string, string> = {
  Aries: "Aries season brings bold, fiery energy. This is the perfect time to celebrate their adventurous spirit and remind them how much their courage inspires you.",
  Taurus: "Taurus season is all about grounding love and sensual pleasures. Treat them to something beautiful — they deserve it more than anyone.",
  Gemini: "Gemini season sparks curiosity and connection. Their quick wit and dual nature make every conversation an adventure worth having.",
  Cancer: "Cancer season deepens emotional bonds. Their nurturing heart is a gift to everyone around them — make sure they feel that love returned.",
  Leo: "Leo season is a celebration of warmth and creativity. Let them shine — this is their time to bask in the spotlight they so deserve.",
  Virgo: "Virgo season honors devotion and detail. Their thoughtful nature often goes unnoticed — today is the day to let them know you see it all.",
  Libra: "Libra season brings harmony and beauty. Their gift for balance and connection makes the world a more graceful place.",
  Scorpio: "Scorpio season invites transformation and depth. Their intensity and loyalty run deeper than most will ever know.",
  Sagittarius: "Sagittarius season ignites adventure and optimism. Their free spirit and philosophical mind make life richer for everyone around them.",
  Capricorn: "Capricorn season celebrates ambition and resilience. Their quiet determination moves mountains — and you are lucky to witness it.",
  Aquarius: "Aquarius season honors individuality and vision. Their unique perspective on the world is exactly what makes them irreplaceable.",
  Pisces: "Pisces season opens the heart to compassion and dreams. Their intuitive, empathetic soul is a rare and precious gift.",
};

function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export async function sendBirthdayReminderEmail(
  to: string,
  userName: string,
  profileName: string,
  sign: string
): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping birthday reminder email");
    return { success: false };
  }

  const displayName = userName || "Stargazer";
  const signMessage = SIGN_BIRTHDAY_MESSAGES[sign] || `Their birthday season is here — a perfect time to celebrate the cosmic bond you share.`;

  const html = baseWrapper(`
    <h2 style="margin:0 0 16px;font-size:22px;color:${COLORS.gold};">
      It&rsquo;s ${profileName}&rsquo;s birthday season!
    </h2>
    <p style="margin:0 0 16px;">
      Hey ${displayName}, today is a special day in the stars &mdash;
      <strong style="color:${COLORS.gold};">${profileName}</strong> is celebrating
      their birthday!
    </p>

    <!-- Sign energy callout -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COLORS.purple}18;border-left:3px solid ${COLORS.gold};padding:14px 16px;border-radius:0 8px 8px 0;">
          <strong style="color:${COLORS.gold};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">${sign} Birthday Energy</strong>
          <p style="margin:6px 0 0;font-size:14px;color:${COLORS.cream};">
            ${signMessage}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;">
      Why not check your compatibility or view their natal chart to discover
      what the stars say about your cosmic connection?
    </p>

    ${ctaButton("Check Compatibility", `${APP_URL}/compatibility`)}

    <!-- Unsubscribe -->
    <p style="margin:20px 0 0;font-size:12px;color:${COLORS.muted};text-align:center;">
      <a href="${APP_URL}/dashboard/settings" style="color:${COLORS.muted};text-decoration:underline;">
        Manage email preferences
      </a>
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `It's ${profileName}'s birthday season! 🎂`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send birthday reminder email:", error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// G. Solar return email (user's own birthday)
// ---------------------------------------------------------------------------

export async function sendSolarReturnEmail(
  to: string,
  userName: string,
  sign: string
): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping solar return email");
    return { success: false };
  }

  const displayName = userName || "Stargazer";

  const html = baseWrapper(`
    <h2 style="margin:0 0 16px;font-size:22px;color:${COLORS.gold};">
      Happy Birthday, ${displayName}!
    </h2>
    <p style="margin:0 0 16px;font-size:18px;color:${COLORS.cream};">
      The Sun has returned to the exact position it held when you were born.
      Welcome to your new <strong style="color:${COLORS.gold};">Solar Return</strong> year!
    </p>

    <!-- Solar return callout -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COLORS.purple}18;border-left:3px solid ${COLORS.gold};padding:14px 16px;border-radius:0 8px 8px 0;">
          <strong style="color:${COLORS.gold};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Your Solar Return &mdash; ${sign}</strong>
          <p style="margin:6px 0 0;font-size:14px;color:${COLORS.cream};">
            In astrology, your birthday marks the beginning of a brand-new personal year.
            The Sun returns to its natal position, resetting the cosmic clock and setting
            the theme for the twelve months ahead. This is your moment of renewal &mdash;
            a powerful time to set intentions, reflect on growth, and step boldly into
            the next chapter of your journey.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;">
      Visit your dashboard to explore your transits and see what the cosmos has
      in store for your new solar year. Marie, your personal astrologer, is ready
      to give you a personalized birthday reading.
    </p>

    ${ctaButton("Explore Your Solar Year", `${APP_URL}/dashboard`)}

    <!-- Unsubscribe -->
    <p style="margin:20px 0 0;font-size:12px;color:${COLORS.muted};text-align:center;">
      <a href="${APP_URL}/dashboard/settings" style="color:${COLORS.muted};text-decoration:underline;">
        Manage email preferences
      </a>
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Happy Birthday, ${displayName}! Your new solar year begins today ☀️`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send solar return email:", error);
    return { success: false };
  }
}

export { getZodiacSign };

// ---------------------------------------------------------------------------
// H. Daily horoscope digest email (premium)
// ---------------------------------------------------------------------------

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

    <!-- Overview -->
    <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:${COLORS.gold};">
      ${horoscopeContent.overview}
    </p>

    <!-- Love -->
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#ec4899;text-transform:uppercase;letter-spacing:0.5px;">&#10084; Love &amp; Relationships</p>
    <p style="margin:0 0 16px;font-size:14px;color:${COLORS.cream};line-height:1.7;">
      ${horoscopeContent.love}
    </p>

    <!-- Career -->
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:0.5px;">&#128188; Career &amp; Purpose</p>
    <p style="margin:0 0 16px;font-size:14px;color:${COLORS.cream};line-height:1.7;">
      ${horoscopeContent.career}
    </p>

    <!-- Wellness -->
    <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:#10b981;text-transform:uppercase;letter-spacing:0.5px;">&#9889; Wellness &amp; Energy</p>
    <p style="margin:0 0 20px;font-size:14px;color:${COLORS.cream};line-height:1.7;">
      ${horoscopeContent.wellness}
    </p>

    <!-- Lucky badges -->
    <p style="margin:0 0 20px;font-size:13px;color:${COLORS.muted};">
      Lucky number: <strong style="color:${COLORS.gold};">${horoscopeContent.luckyNumber}</strong>
      &nbsp;&middot;&nbsp;
      Lucky color: <strong style="color:${COLORS.gold};">${horoscopeContent.luckyColor}</strong>
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
