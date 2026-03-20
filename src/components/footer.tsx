import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  product: [
    { href: "/", label: "Home" },
    { href: "/compatibility", label: "Compatibility" },
    { href: "/learn", label: "Learn" },
    { href: "/pricing", label: "Pricing" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Footer navigation">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Branding */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link
                href="/"
                className="inline-flex items-center gap-2 py-2 mb-2"
                aria-label="ChartChemistry home"
              >
                <Sparkles className="h-5 w-5 text-cosmic-purple-light" aria-hidden="true" />
                <span className="font-heading text-lg font-bold cosmic-text">
                  ChartChemistry
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                AI-powered astrological compatibility analysis. Discover deeper
                connections through the stars.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">
                Product
              </h3>
              <ul className="space-y-1">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-2 text-sm text-muted-foreground transition-colors hover:text-cosmic-purple-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">
                Legal
              </h3>
              <ul className="space-y-1">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-2 text-sm text-muted-foreground transition-colors hover:text-cosmic-purple-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        <Separator className="my-8 bg-border" />

        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-border bg-card/50 p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ChartChemistry is for entertainment and self-reflection purposes
            only. Astrology is not scientifically proven and should not replace
            professional advice. Relationship decisions should be based on
            communication, mutual respect, and personal judgment.
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ChartChemistry. All rights
            reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with cosmic intention
          </p>
        </div>
      </div>
    </footer>
  );
}
