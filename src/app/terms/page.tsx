import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ChartChemistry",
  description:
    "Terms of Service for ChartChemistry. Read our terms governing the use of our AI-powered astrological compatibility platform, subscription plans, and services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
          <span className="cosmic-text">Terms of Service</span>
        </h1>
        <p className="text-muted-foreground">
          Last updated: March 3, 2026
        </p>
      </header>

      <div className="space-y-10">
        {/* 1. Acceptance of Terms */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            1. Acceptance of Terms
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using ChartChemistry (the &quot;Service&quot;), including our
            website, applications, and any related services, you agree to be bound by
            these Terms of Service (the &quot;Terms&quot;). If you do not agree to all of
            these Terms, you may not access or use the Service. These Terms constitute a
            legally binding agreement between you and ChartChemistry. We may update these
            Terms from time to time, and your continued use of the Service after any
            changes constitutes acceptance of those changes.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            2. Description of Service
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              ChartChemistry is an AI-powered astrological compatibility platform that
              provides birth chart analysis, synastry reports, composite chart
              interpretations, and AI-driven astrological guidance. The Service uses
              astronomical calculations based on the Swiss Ephemeris combined with
              artificial intelligence to generate compatibility reports and insights.
            </p>
            <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
              <p className="text-sm font-medium text-gold mb-1">
                Entertainment Disclaimer
              </p>
              <p className="text-sm text-muted-foreground">
                Astrology readings provided by ChartChemistry are for entertainment and
                self-reflection purposes only. They should not be considered professional
                advice of any kind, including but not limited to medical, psychological,
                financial, or legal advice. You should not rely on astrological readings
                to make important life decisions. ChartChemistry makes no claims regarding
                the scientific validity of astrology.
              </p>
            </div>
          </div>
        </section>

        {/* 3. User Accounts */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            3. User Accounts
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              To access certain features of the Service, you must create an account. You
              may register using Google OAuth or an email address and password. When
              creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                Provide accurate, current, and complete information during registration
              </li>
              <li>
                Maintain and promptly update your account information to keep it accurate
              </li>
              <li>
                Maintain the security and confidentiality of your login credentials
              </li>
              <li>
                Accept responsibility for all activities that occur under your account
              </li>
              <li>
                Notify ChartChemistry immediately of any unauthorized use of your account
              </li>
            </ul>
            <p>
              You must be at least 13 years of age to create an account and use the
              Service. By creating an account, you represent that you meet this age
              requirement. ChartChemistry reserves the right to suspend or terminate
              accounts that violate these Terms.
            </p>
          </div>
        </section>

        {/* 4. Subscription Plans & Payments */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            4. Subscription Plans &amp; Payments
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              ChartChemistry offers the following subscription tiers:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <span className="text-foreground font-medium">Free</span> &mdash; Basic
                compatibility checks with limited daily usage and summary reports at no
                cost
              </li>
              <li>
                <span className="text-foreground font-medium">Premium</span> &mdash;
                $9.99 per month, providing unlimited compatibility checks, full synastry
                reports, AI Astrologer chat, and unlimited saved profiles
              </li>
              <li>
                <span className="text-foreground font-medium">Annual</span> &mdash;
                $79.99 per year (equivalent to approximately $6.67/month), including all
                Premium features at a discounted rate
              </li>
            </ul>
            <p>
              All paid subscriptions are processed through Stripe. By subscribing to a
              paid plan, you authorize ChartChemistry to charge your payment method on a
              recurring basis at the applicable subscription rate until you cancel.
              Subscription fees are non-refundable except as required by applicable law or
              as otherwise stated in these Terms.
            </p>
            <p>
              You may cancel your subscription at any time through your account settings.
              Upon cancellation, you will retain access to paid features until the end of
              your current billing period, after which your account will revert to the
              Free tier. ChartChemistry reserves the right to modify pricing with
              reasonable advance notice to subscribers.
            </p>
          </div>
        </section>

        {/* 5. Intellectual Property */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            5. Intellectual Property
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              All content, features, and functionality of the Service, including but not
              limited to text, graphics, logos, icons, images, software, AI-generated
              reports, and the underlying algorithms, are owned by or licensed to
              ChartChemistry and are protected by copyright, trademark, and other
              intellectual property laws.
            </p>
            <p>
              You retain ownership of any personal data you provide to the Service,
              including birth profile information. By submitting content to the Service,
              you grant ChartChemistry a non-exclusive, worldwide, royalty-free license to
              use that content solely for the purpose of providing and improving the
              Service.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of,
              publicly display, or otherwise exploit any content from the Service without
              prior written permission from ChartChemistry, except for personal,
              non-commercial use of your own compatibility reports.
            </p>
          </div>
        </section>

        {/* 6. User Conduct */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            6. User Conduct
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              When using the Service, you agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                Use the Service for any unlawful purpose or in violation of any applicable
                laws or regulations
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service, other user
                accounts, or any systems or networks connected to the Service
              </li>
              <li>
                Use automated scripts, bots, or other means to access or interact with
                the Service in a manner that exceeds reasonable usage
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the Service
              </li>
              <li>
                Submit false or misleading information, or impersonate any person or entity
              </li>
              <li>
                Resell, redistribute, or commercially exploit the Service or any content
                generated by the Service without authorization
              </li>
            </ul>
          </div>
        </section>

        {/* 7. Privacy */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            7. Privacy
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-muted-foreground leading-relaxed">
            Your use of the Service is also governed by our Privacy Policy, which
            describes how we collect, use, and protect your personal information,
            including birth profile data. By using the Service, you consent to the
            collection and use of your information as described in our Privacy Policy. We
            take reasonable measures to protect the security of your personal data,
            including encrypting passwords and using secure connections for data
            transmission.
          </p>
        </section>

        {/* 8. Disclaimer of Warranties */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            8. Disclaimer of Warranties
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="uppercase text-sm font-medium text-foreground/80">
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot;
              basis without warranties of any kind, whether express or implied.
            </p>
            <p>
              ChartChemistry disclaims all warranties, including but not limited to
              implied warranties of merchantability, fitness for a particular purpose, and
              non-infringement. We do not warrant that the Service will be uninterrupted,
              error-free, secure, or free of viruses or other harmful components.
            </p>
            <p>
              Astrological interpretations and AI-generated content are produced by
              automated systems and may contain inaccuracies. ChartChemistry does not
              guarantee the accuracy, completeness, or reliability of any astrological
              readings, compatibility reports, or AI-generated guidance provided through
              the Service.
            </p>
          </div>
        </section>

        {/* 9. Limitation of Liability */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            9. Limitation of Liability
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="uppercase text-sm font-medium text-foreground/80">
              To the maximum extent permitted by applicable law, ChartChemistry and its
              officers, directors, employees, and agents shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising
              out of or related to your use of the Service.
            </p>
            <p>
              This includes, without limitation, damages for loss of profits, goodwill,
              data, or other intangible losses, even if ChartChemistry has been advised of
              the possibility of such damages. In no event shall ChartChemistry&apos;s
              total liability to you for all claims arising from or related to the Service
              exceed the amount you have paid to ChartChemistry in the twelve (12) months
              preceding the claim.
            </p>
          </div>
        </section>

        {/* 10. Governing Law */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            10. Governing Law
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of
            the United States, without regard to conflict of law principles. Any disputes
            arising out of or relating to these Terms or the Service shall be resolved
            through binding arbitration in accordance with the rules of the American
            Arbitration Association, except that either party may seek injunctive or other
            equitable relief in any court of competent jurisdiction. You agree that any
            dispute resolution proceedings will be conducted on an individual basis and
            not in a class, consolidated, or representative action.
          </p>
        </section>

        {/* 11. Changes to Terms */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            11. Changes to Terms
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-muted-foreground leading-relaxed">
            ChartChemistry reserves the right to modify or replace these Terms at any
            time. If we make material changes, we will notify you by posting the updated
            Terms on the Service and updating the &quot;Last updated&quot; date at the top
            of this page. We may also send you an email notification for significant
            changes. Your continued use of the Service after any modifications to these
            Terms constitutes acceptance of the revised Terms. It is your responsibility
            to review these Terms periodically for changes.
          </p>
        </section>

        {/* 12. Termination */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            12. Termination
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-muted-foreground leading-relaxed">
            ChartChemistry may terminate or suspend your account and access to the
            Service at any time, with or without cause, and with or without notice. Upon
            termination, your right to use the Service will immediately cease. If you wish
            to terminate your account, you may do so through your account settings or by
            contacting us. All provisions of these Terms which by their nature should
            survive termination shall survive, including ownership provisions, warranty
            disclaimers, and limitations of liability.
          </p>
        </section>

        {/* 13. Contact Information */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            13. Contact Information
          </h2>
          <div className="h-px bg-white/10 mb-4" />
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <p className="font-medium text-foreground">ChartChemistry</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@chartchemistry.io"
                  className="text-cosmic-purple-light hover:underline"
                >
                  support@chartchemistry.io
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
