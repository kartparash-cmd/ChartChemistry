"use client";

import { useState } from "react";
import { Share2, Copy, Check, Twitter, Facebook, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareData = { title, text: description || title, url };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const smsUrl = `sms:?&body=${encodeURIComponent(`${title}\n${url}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof navigator !== "undefined" && "share" in navigator && (
        <Button variant="outline" size="sm" onClick={handleNativeShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      )}
      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
        <a href={smsUrl} aria-label="Share via text message">
          <Smartphone className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
}
