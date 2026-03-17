import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how ChartChemistry collects, uses, and protects your personal data including birth information, account details, and astrological readings.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      <header className="mb-12">
        <h1 className="font-heading text-4xl font-bold cosmic-text mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: March 3, 2026
        </p>
      </header>

      <div className="space-y-10 text-muted-foreground leading-relaxed">
        <p>
          ChartChemistry (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
          is committed to protecting your privacy. This Privacy Policy explains
          how we collect, use, store, and share your information when you use
          our website and services at{" "}
          <Link
            href="/"
            className="text-cosmic-purple-light hover:underline"
          >
            chartchemistry.com
          </Link>
          .
        </p>
        <p>
          By using ChartChemistry, you agree to the collection and use of
          information in accordance with this policy.
        </p>

        {/* 1. Information We Collect */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            1. Information We Collect
          </h2>
          <p className="mb-4">
            We collect the following types of information to provide and
            improve our services:
          </p>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Information You Provide
          </h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>
              <strong className="text-foreground">Birth data:</strong> Date of
              birth, time of birth, and place of birth, which are required to
              generate accurate natal charts and compatibility reports.
            </li>
            <li>
              <strong className="text-foreground">Account information:</strong>{" "}
              Email address and password when you create an account using
              email/password sign-up.
            </li>
            <li>
              <strong className="text-foreground">Google profile data:</strong>{" "}
              When you sign in with Google OAuth, we receive your name, email
              address, and profile picture from your Google account.
            </li>
            <li>
              <strong className="text-foreground">Payment information:</strong>{" "}
              When you subscribe to a paid plan, payment details are collected
              and processed by Stripe. We do not store your credit card number
              on our servers.
            </li>
          </ul>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Information Collected Automatically
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-foreground">Usage data:</strong> Pages
              visited, features used, compatibility checks performed, and
              interaction patterns.
            </li>
            <li>
              <strong className="text-foreground">Device information:</strong>{" "}
              Browser type, operating system, screen resolution, and device
              identifiers.
            </li>
            <li>
              <strong className="text-foreground">IP address:</strong> Used for
              rate limiting on free compatibility checks and general security
              purposes.
            </li>
          </ul>
        </section>

        {/* 2. How We Use Your Information */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Calculate natal charts, synastry charts, and composite charts
              using precise astronomical data from the Swiss Ephemeris.
            </li>
            <li>
              Generate AI-powered horoscopes, compatibility reports, and
              personalized astrological readings.
            </li>
            <li>
              Provide the Marie chat feature for premium subscribers.
            </li>
            <li>
              Process payments and manage your subscription through Stripe.
            </li>
            <li>
              Save your birth profiles so you can quickly run compatibility
              checks without re-entering data.
            </li>
            <li>
              Enforce rate limits on free-tier usage (e.g., three free
              compatibility checks per 24 hours).
            </li>
            <li>
              Improve our services, fix bugs, and develop new features based
              on aggregated usage patterns.
            </li>
            <li>
              Communicate with you about account-related matters, service
              updates, and security alerts.
            </li>
          </ul>
        </section>

        {/* 3. Data Storage & Security */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            3. Data Storage & Security
          </h2>
          <p className="mb-4">
            We take the security of your data seriously and implement
            appropriate technical and organizational measures:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Your data is stored in a PostgreSQL database hosted on{" "}
              <strong className="text-foreground">Supabase</strong>, which
              provides enterprise-grade infrastructure with encryption at rest.
            </li>
            <li>
              All connections between our application and the database use
              encrypted TLS/SSL connections.
            </li>
            <li>
              Passwords are hashed using bcrypt with 12 salt rounds and are
              never stored in plain text.
            </li>
            <li>
              Authentication sessions are managed using secure JSON Web Tokens
              (JWT).
            </li>
            <li>
              All traffic to and from our website is encrypted via HTTPS.
            </li>
          </ul>
          <p className="mt-4">
            While we strive to protect your personal information, no method of
            transmission over the internet or electronic storage is 100%
            secure. We cannot guarantee absolute security but will notify you
            promptly in the event of a data breach.
          </p>
        </section>

        {/* 4. Third-Party Services */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            4. Third-Party Services
          </h2>
          <p className="mb-4">
            We integrate with the following third-party services, each of
            which has its own privacy policy:
          </p>
          <ul className="list-disc list-inside space-y-4">
            <li>
              <strong className="text-foreground">Google OAuth:</strong> Used
              for single sign-on authentication. We receive your basic profile
              information (name, email, profile picture) from Google. We do
              not access your Google contacts, calendar, or other Google
              services. See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cosmic-purple-light hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">Stripe:</strong> Handles all
              payment processing for Premium and Annual subscriptions. Your
              payment card details are sent directly to Stripe and never touch
              our servers. See{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cosmic-purple-light hover:underline"
              >
                Stripe&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">
                AI Providers (Anthropic &amp; OpenAI):
              </strong>{" "}
              Power our AI-generated compatibility readings and the Marie
              chat. Your birth data and chart information are sent to these
              providers&apos; APIs to generate personalized readings. Neither
              provider uses API data to train their models. See{" "}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cosmic-purple-light hover:underline"
              >
                Anthropic&apos;s Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cosmic-purple-light hover:underline"
              >
                OpenAI&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
          <p className="mt-4">
            We do not sell, rent, or trade your personal information to any
            third party for marketing purposes.
          </p>
        </section>

        {/* 5. Data Retention */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            5. Data Retention
          </h2>
          <p className="mb-4">We retain your data as follows:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-foreground">Account data:</strong>{" "}
              Retained for as long as your account is active. If you delete
              your account, your personal data will be permanently removed
              within 30 days.
            </li>
            <li>
              <strong className="text-foreground">Birth profiles:</strong>{" "}
              Stored as long as your account exists. You may delete individual
              profiles at any time.
            </li>
            <li>
              <strong className="text-foreground">
                Compatibility reports:
              </strong>{" "}
              Stored as long as your account exists, so you can revisit
              previous readings.
            </li>
            <li>
              <strong className="text-foreground">Chat sessions:</strong> AI
              Marie chat histories are retained for the duration of your
              subscription. They are deleted when you cancel your subscription
              or delete your account.
            </li>
            <li>
              <strong className="text-foreground">Usage logs:</strong>{" "}
              Anonymized usage data may be retained indefinitely for analytics
              and service improvement.
            </li>
          </ul>
        </section>

        {/* 6. Your Rights */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            6. Your Rights
          </h2>
          <p className="mb-4">
            You have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-foreground">Access:</strong> You can
              request a copy of all personal data we hold about you, including
              your birth profiles, compatibility reports, and account
              information.
            </li>
            <li>
              <strong className="text-foreground">Correction:</strong> You can
              update or correct your personal data at any time through your
              account settings or by contacting us.
            </li>
            <li>
              <strong className="text-foreground">Deletion:</strong> You can
              request the deletion of your account and all associated data.
              We will process deletion requests within 30 days.
            </li>
            <li>
              <strong className="text-foreground">Data export:</strong> You
              may contact us to request your data.
            </li>
            <li>
              <strong className="text-foreground">Withdraw consent:</strong>{" "}
              You may withdraw your consent for data processing at any time by
              deleting your account or contacting us.
            </li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, please contact us at{" "}
            <a
              href="mailto:privacy@chartchemistry.com"
              className="text-cosmic-purple-light hover:underline"
            >
              privacy@chartchemistry.com
            </a>
            .
          </p>
        </section>

        {/* 7. Cookies & Analytics */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            7. Cookies & Analytics
          </h2>
          <p className="mb-4">
            We use a minimal set of cookies and tracking technologies:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-foreground">
                Authentication cookies:
              </strong>{" "}
              Essential cookies used by NextAuth to maintain your login
              session. These are strictly necessary and cannot be disabled.
            </li>
            <li>
              <strong className="text-foreground">Analytics:</strong> We may
              use privacy-focused analytics (such as Umami) to understand how
              our service is used. These tools do not use cookies for tracking
              and do not collect personally identifiable information.
            </li>
          </ul>
          <p className="mt-4">
            We do not use third-party advertising cookies or cross-site
            tracking technologies.
          </p>
        </section>

        {/* 8. Children's Privacy */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            8. Children&apos;s Privacy
          </h2>
          <p>
            ChartChemistry is not intended for use by children under the age
            of 13. We do not knowingly collect personal information from
            children under 13. If we become aware that we have collected data
            from a child under 13 without verified parental consent, we will
            take steps to delete that information as quickly as possible. If
            you believe a child under 13 has provided us with personal data,
            please contact us at{" "}
            <a
              href="mailto:privacy@chartchemistry.com"
              className="text-cosmic-purple-light hover:underline"
            >
              privacy@chartchemistry.com
            </a>
            .
          </p>
        </section>

        {/* 9. Changes to Policy */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices, technology, or legal requirements. When
            we make material changes, we will notify you by updating the
            &quot;Last updated&quot; date at the top of this page and, where
            appropriate, by sending you an email notification. We encourage
            you to review this page periodically to stay informed about how we
            protect your data.
          </p>
        </section>

        {/* 10. Contact Information */}
        <section>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
            10. Contact Information
          </h2>
          <p className="mb-4">
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-foreground">Email:</strong>{" "}
              <a
                href="mailto:privacy@chartchemistry.com"
                className="text-cosmic-purple-light hover:underline"
              >
                privacy@chartchemistry.com
              </a>
            </li>
            <li>
              <strong className="text-foreground">Website:</strong>{" "}
              <Link
                href="/"
                className="text-cosmic-purple-light hover:underline"
              >
                chartchemistry.com
              </Link>
            </li>
          </ul>
        </section>

        {/* Footer separator */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-sm text-muted-foreground">
            This privacy policy is effective as of March 3, 2026.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <Link
              href="/terms"
              className="text-cosmic-purple-light hover:underline"
            >
              Terms of Service
            </Link>
            {" | "}
            <Link
              href="/"
              className="text-cosmic-purple-light hover:underline"
            >
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
