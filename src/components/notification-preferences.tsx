"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";

function Toggle({
  checked,
  onChange,
  label,
  description,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-cosmic-purple" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    emailDigest: true,
    emailMarketing: false,
    pushEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setPrefs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updatePref = async (key: string, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      setPrefs((p) => ({ ...p, [key]: !value }));
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Notification Preferences
      </h3>
      <Toggle
        icon={Mail}
        label="Weekly Digest"
        description="Receive weekly cosmic insights and compatibility updates"
        checked={prefs.emailDigest}
        onChange={(v) => updatePref("emailDigest", v)}
      />
      <Toggle
        icon={Mail}
        label="Marketing Emails"
        description="New features, special offers, and astrological events"
        checked={prefs.emailMarketing}
        onChange={(v) => updatePref("emailMarketing", v)}
      />
      <Toggle
        icon={Smartphone}
        label="Push Notifications"
        description="Real-time alerts for cosmic events and chart updates"
        checked={prefs.pushEnabled}
        onChange={(v) => updatePref("pushEnabled", v)}
      />
    </div>
  );
}
