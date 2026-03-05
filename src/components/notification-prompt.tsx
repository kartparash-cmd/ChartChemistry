"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const DISMISSED_KEY = "cc_notifications_dismissed";
const SUBSCRIBED_KEY = "cc_notifications_subscribed";

/**
 * NotificationPrompt
 *
 * A subtle banner shown on the dashboard prompting the user to enable push
 * notifications for transit alerts and daily horoscopes.
 *
 * - Only appears if the browser supports notifications and service workers
 * - Hides if the user has already granted/denied permission, dismissed the
 *   prompt, or previously subscribed
 * - "Enable" requests notification permission and registers a push subscription
 * - "Not now" dismisses and stores preference in localStorage
 */
export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    // Guard: only show if the browser supports the required APIs
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    // Don't show if permission already decided or user previously acted
    if (Notification.permission !== "default") return;

    try {
      if (
        localStorage.getItem(DISMISSED_KEY) ||
        localStorage.getItem(SUBSCRIBED_KEY)
      ) {
        return;
      }
    } catch {
      // localStorage may be unavailable in some contexts
      return;
    }

    setVisible(true);
  }, []);

  const handleEnable = async () => {
    setEnabling(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        // User denied — hide the prompt
        setVisible(false);
        return;
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push (no applicationServerKey needed yet — will be
      // required once VAPID keys are configured on the server)
      let subscription: PushSubscription | null = null;
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
        });
      } catch (err) {
        console.warn(
          "Push subscription failed (VAPID key may not be configured):",
          err
        );
        // Still mark as subscribed since notifications are enabled
        localStorage.setItem(SUBSCRIBED_KEY, "true");
        setVisible(false);
        return;
      }

      // Send the subscription to the server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        console.error("Failed to save push subscription on server");
      }

      localStorage.setItem(SUBSCRIBED_KEY, "true");
      setVisible(false);
    } catch (err) {
      console.error("Error enabling notifications:", err);
      setEnabling(false);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Ignore localStorage errors
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-lg border border-cosmic-purple/30 bg-cosmic-purple/10 p-4 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cosmic-purple/20">
              <Bell className="h-4 w-4 text-cosmic-purple-light" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                Stay aligned with the cosmos
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Enable notifications for transit alerts and daily horoscopes
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleEnable}
                  disabled={enabling}
                  className="bg-cosmic-purple hover:bg-cosmic-purple/80 text-white text-xs h-7 px-3"
                >
                  {enabling ? "Enabling..." : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs text-muted-foreground hover:text-white h-7 px-3"
                >
                  Not now
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="shrink-0 text-muted-foreground hover:text-white transition-colors"
              aria-label="Dismiss notification prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
