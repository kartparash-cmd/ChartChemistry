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

  // Escalating dunning sequence based on attempt count
  let subject: string;
  let heading: string;
  let body: string;
  let footer: string;

  if (attemptCount <= 1) {
    // Attempt 1: Friendly reminder
    subject = "Quick heads up: your payment didn't go through";
    heading = "Just a quick heads up";
    body = "It looks like your latest payment didn't go through. This can happen for a number of reasons — an expired card, insufficient funds, or a temporary bank issue. No worries, these things happen!";
    footer = "We'll try again in a few days. In the meantime, you can update your payment method to avoid any interruption to your premium features.";
  } else if (attemptCount === 2) {
    // Attempt 2: Urgency
    subject = "Action needed: your premium features are at risk";
    heading = "Your premium access needs attention";
    body = "We've tried to process your payment twice now, but it's still not going through. Your premium features — including Marie, unlimited reports, and full chart analysis — are at risk of being suspended.";
    footer = "Please update your payment method as soon as possible to keep your access.";
  } else {
    // Attempt 3+: Final notice
    subject = "Last chance: update your payment method to keep Premium";
    heading = "Final notice: your subscription is about to end";
    body = `We've attempted to charge your payment method ${attemptCount} times without success. If we can't process your payment soon, your Premium subscription will be cancelled and you'll lose access to all premium features.`;
    footer = "This is your last chance to update your payment method before your subscription is cancelled.";
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">ChartChemistry</h2>
          <h3>${heading}</h3>
          <p>${body}</p>
          <p>${footer}</p>
          <a href="${APP_URL}/dashboard?tab=settings" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Update Payment Method
          </a>
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
            <li>Marie (personal astrologer)</li>
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

export async function sendExistingAccountNotification(email: string): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping existing account notification email");
    return { success: false };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Sign-in reminder — ChartChemistry",
      text: `Hi,\n\nSomeone tried to create a new ChartChemistry account using your email address. If this was you, you already have an account — just sign in instead:\n\n${APP_URL}/auth/signin\n\nIf this wasn't you, you can safely ignore this email. Your account is secure.\n\n— ChartChemistry`,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send existing account notification email:", error);
    return { success: false };
  }
}

export async function sendCancellationEmail(email: string): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping cancellation email");
    return { success: false };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "We're sorry to see you go",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">ChartChemistry</h2>
          <p>Your premium subscription has been cancelled. We're sorry to see you go.</p>
          <p>Don't worry — your account and all your data (birth profiles, reports, and chat history) are safe and will be here whenever you're ready to return.</p>
          <p>You can re-subscribe anytime to regain access to unlimited compatibility reports, Marie (your personal astrologer), and all premium features.</p>
          <a href="${APP_URL}/pricing" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            View Plans
          </a>
          <p style="color: #888; font-size: 14px;">Thank you for being part of ChartChemistry. The stars will be waiting for you.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    return { success: false };
  }
}

export async function sendAccountExistsEmail(email: string): Promise<{ success: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured — skipping account exists email");
    return { success: false };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Sign in to ChartChemistry",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7c3aed;">ChartChemistry</h2>
          <p>Someone tried to create an account with your email address. If this was you, you already have an account — just sign in instead.</p>
          <a href="${APP_URL}/auth/signin" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Sign In
          </a>
          <p style="color: #888; font-size: 14px;">If this wasn't you, you can safely ignore this email. Your account is secure.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send account exists email:", error);
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
