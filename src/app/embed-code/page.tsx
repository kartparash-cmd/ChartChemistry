"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMBED_CODE = `<iframe
  src="https://chartchemistry.com/embed"
  width="400"
  height="500"
  frameborder="0"
  style="border:none;border-radius:12px;"
  allow="clipboard-write"
  title="ChartChemistry Compatibility Widget"
></iframe>`;

export default function EmbedCodePage() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMBED_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-cosmic-purple/20 p-3">
            <Code2 className="h-8 w-8 text-cosmic-purple-light" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight cosmic-text">
          Embed Compatibility Widget
        </h1>
        <p className="text-muted-foreground">
          Add a free zodiac compatibility checker to your blog or website.
          Just copy the embed code below and paste it into your HTML.
        </p>
      </div>

      {/* Preview */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Preview
        </h2>
        <div className="flex justify-center rounded-xl border border-border/50 bg-navy-dark p-6">
          <iframe
            src="/embed"
            width={400}
            height={500}
            style={{ border: "none", borderRadius: 12 }}
            title="ChartChemistry Compatibility Widget Preview"
          />
        </div>
      </div>

      {/* Embed Code */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Embed Code
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
        </div>
        <div className="relative">
          <pre className="overflow-x-auto rounded-xl border border-border/50 bg-navy-dark p-4 text-sm text-slate-300">
            <code>{EMBED_CODE}</code>
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">How It Works</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cosmic-purple/20 text-xs font-bold text-cosmic-purple-light">
              1
            </span>
            <span>
              Copy the embed code above and paste it into any HTML page, blog post, or CMS editor that supports raw HTML.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cosmic-purple/20 text-xs font-bold text-cosmic-purple-light">
              2
            </span>
            <span>
              Visitors enter two birthdays and instantly see their sun sign compatibility score.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cosmic-purple/20 text-xs font-bold text-cosmic-purple-light">
              3
            </span>
            <span>
              The widget links back to ChartChemistry for full birth chart reports. All calculations run client-side — no API calls needed.
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-cosmic-purple-light transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
