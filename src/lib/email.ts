import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return null;
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "ChartChemistry <noreply@send.chartchemistry.com>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping password reset email");
    return { success: false };
  }

  try {
    const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your ChartChemistry password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">ChartChemistry</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false };
  }
}

export async function sendPaymentFailedEmail(email: string, attemptCount: number): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping payment failed email");
    return { success: false };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Action Required: Payment Failed — ChartChemistry",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">ChartChemistry</h2>
          <p>We were unable to process your payment (attempt ${attemptCount}).</p>
          <p>Please update your payment method to continue enjoying premium features:</p>
          <a href="${APP_URL}/dashboard?tab=settings" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Update Payment Method
          </a>
          <p style="color: #888; font-size: 14px;">If your payment continues to fail, your subscription may be cancelled.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send payment failed email:", error);
    return { success: false };
  }
}

export async function sendReceiptEmail(email: string, plan: string, amount: string): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping receipt email");
    return { success: false };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Payment Confirmed — ChartChemistry ${plan}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">ChartChemistry</h2>
          <p>Thank you for subscribing! Your payment of <strong>${amount}</strong> for the <strong>${plan}</strong> plan has been confirmed.</p>
          <p>You now have access to all premium features:</p>
          <ul>
            <li>Unlimited compatibility reports</li>
            <li>AI Astrologer chat</li>
            <li>Full synastry &amp; composite analysis</li>
            <li>Daily horoscopes</li>
          </ul>
          <a href="${APP_URL}/dashboard" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Go to Dashboard
          </a>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send receipt email:", error);
    return { success: false };
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping verification email");
    return { success: false };
  }

  try {
    const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your ChartChemistry email",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">Welcome to ChartChemistry!</h2>
          <p>Please verify your email address to get started:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #888; font-size: 14px;">This link expires in 24 hours.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false };
  }
}
