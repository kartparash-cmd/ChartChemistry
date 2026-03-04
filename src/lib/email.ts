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

const FROM_EMAIL = process.env.EMAIL_FROM || "ChartChemistry <noreply@chartchemistry.io>";
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
