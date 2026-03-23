"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    window.dispatchEvent(new Event("cookie-consent-change"));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    window.dispatchEvent(new Event("cookie-consent-change"));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 rounded-xl border border-border bg-card/95 backdrop-blur-xl p-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                We use essential cookies for authentication and analytics cookies to improve your experience.{" "}
                <a href="/privacy" className="underline text-foreground hover:text-cosmic-purple-light">
                  Privacy Policy
                </a>
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={accept} className="cosmic-gradient text-white">
                  Accept All
                </Button>
                <Button size="sm" variant="outline" onClick={decline}>
                  Essential Only
                </Button>
              </div>
            </div>
            <button onClick={decline} className="text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
