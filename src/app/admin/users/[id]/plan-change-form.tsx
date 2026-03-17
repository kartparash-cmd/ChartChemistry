"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, DollarSign, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  { value: "FREE", label: "Free", price: 0, color: "border-zinc-500/30 text-zinc-400" },
  { value: "PREMIUM", label: "Premium", price: 9.99, color: "border-purple-500/30 text-purple-400" },
  { value: "ANNUAL", label: "Annual", price: 79.99, color: "border-amber-500/30 text-amber-400" },
] as const;

const AMOUNT_PRESETS = [
  { label: "Free (comp)", value: 0 },
  { label: "$9.99", value: 9.99 },
  { label: "$79.99", value: 79.99 },
  { label: "Custom", value: -1 },
];

interface PlanChangeFormProps {
  userId: string;
  currentPlan: string;
  userName: string;
}

export function PlanChangeForm({ userId, currentPlan, userName }: PlanChangeFormProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [amountPaid, setAmountPaid] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const effectiveAmount = useCustom ? parseFloat(customAmount) || 0 : amountPaid;
  const hasChanged = selectedPlan !== currentPlan;

  const handleSubmit = async () => {
    if (!hasChanged || isSubmitting) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          amountPaid: effectiveAmount,
          note: note.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          success: true,
          message: `Plan changed to ${data.change.newPlan}. Amount: $${data.change.amountPaid.toFixed(2)}`,
        });
        router.refresh();
      } else {
        const data = await res.json();
        setResult({ success: false, message: data.error || "Failed to update plan" });
      }
    } catch {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold">Change Plan</h3>
      </div>

      {/* Plan selector */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {PLANS.map((plan) => (
          <button
            key={plan.value}
            onClick={() => {
              setSelectedPlan(plan.value);
              if (!useCustom) setAmountPaid(plan.price);
            }}
            className={cn(
              "rounded-lg border-2 px-3 py-3 text-center transition-all",
              selectedPlan === plan.value
                ? `${plan.color} bg-current/5 ring-1 ring-current/20`
                : "border-border text-muted-foreground hover:border-muted-foreground/30"
            )}
          >
            <p className="text-sm font-semibold">{plan.label}</p>
            <p className="text-xs mt-0.5 opacity-70">
              {plan.price === 0 ? "Free" : `$${plan.price}${plan.value === "ANNUAL" ? "/yr" : "/mo"}`}
            </p>
            {plan.value === currentPlan && (
              <p className="text-[10px] mt-1 opacity-50">Current</p>
            )}
          </button>
        ))}
      </div>

      {/* Amount paid */}
      {hasChanged && (
        <>
          <div className="mb-4">
            <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              Amount Paid
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    if (preset.value === -1) {
                      setUseCustom(true);
                    } else {
                      setUseCustom(false);
                      setAmountPaid(preset.value);
                    }
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    (preset.value === -1 && useCustom) || (!useCustom && amountPaid === preset.value)
                      ? "border-cosmic-purple/50 bg-cosmic-purple/10 text-cosmic-purple dark:text-cosmic-purple-light"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {useCustom && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background pl-7 pr-3 py-2 text-sm focus:border-cosmic-purple/30 focus:outline-none focus:ring-1 focus:ring-cosmic-purple/20"
                />
              </div>
            )}
          </div>

          {/* Note */}
          <div className="mb-5">
            <label className="text-sm font-medium mb-1.5 block">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Comp for beta testing, Refund adjustment..."
              maxLength={500}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-cosmic-purple/30 focus:outline-none focus:ring-1 focus:ring-cosmic-purple/20"
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted/50 dark:bg-white/[0.03] px-4 py-3 mb-4 text-sm">
            <p>
              <span className="text-muted-foreground">Changing</span>{" "}
              <span className="font-medium">{userName}</span>{" "}
              <span className="text-muted-foreground">from</span>{" "}
              <span className="font-medium">{currentPlan}</span>{" "}
              <span className="text-muted-foreground">to</span>{" "}
              <span className="font-semibold">{selectedPlan}</span>
            </p>
            <p className="text-muted-foreground mt-0.5">
              Amount: <span className="font-medium text-foreground">${effectiveAmount.toFixed(2)}</span>
              {effectiveAmount === 0 && " (complimentary)"}
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasChanged}
            className="w-full bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Confirm Plan Change
          </Button>
        </>
      )}

      {/* Result message */}
      {result && (
        <div className={cn(
          "mt-3 rounded-lg px-4 py-2.5 text-sm",
          result.success
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        )}>
          {result.message}
        </div>
      )}
    </div>
  );
}
