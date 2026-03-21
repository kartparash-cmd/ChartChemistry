"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface RelationshipCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const MOODS = [
  { value: "hopeful", label: "Hopeful", emoji: "\u2728" },
  { value: "stressed", label: "Stressed", emoji: "\ud83d\ude13" },
  { value: "connected", label: "Connected", emoji: "\ud83d\udc9e" },
  { value: "distant", label: "Distant", emoji: "\ud83c\udf19" },
  { value: "growing", label: "Growing", emoji: "\ud83c\udf31" },
  { value: "uncertain", label: "Uncertain", emoji: "\ud83e\udd14" },
] as const;

const TOTAL_STEPS = 5;

export function RelationshipCheckIn({
  isOpen,
  onClose,
  onComplete,
}: RelationshipCheckInProps) {
  const [step, setStep] = useState(1);
  const [connectionScore, setConnectionScore] = useState<number>(0);
  const [conflictNote, setConflictNote] = useState("");
  const [positiveNote, setPositiveNote] = useState("");
  const [growthGoal, setGrowthGoal] = useState("");
  const [overallMood, setOverallMood] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setStep(1);
    setConnectionScore(0);
    setConflictNote("");
    setPositiveNote("");
    setGrowthGoal("");
    setOverallMood("");
    setSubmitting(false);
    setCompleted(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return connectionScore >= 1 && connectionScore <= 5;
      case 2:
        return true; // optional
      case 3:
        return true; // optional
      case 4:
        return true; // optional
      case 5:
        return overallMood !== "";
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/relationship/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionScore,
          conflictNote: conflictNote.trim() || undefined,
          positiveNote: positiveNote.trim() || undefined,
          growthGoal: growthGoal.trim() || undefined,
          overallMood,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save check-in");
      }

      setCompleted(true);
      onComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === TOTAL_STEPS) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="glass-card border-white/10 bg-navy-dark/95 backdrop-blur-xl sm:max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cosmic-purple to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" />
              Relationship Check-In
            </DialogTitle>
            {!completed && (
              <p className="text-xs text-muted-foreground mt-1">
                Step {step} of {TOTAL_STEPS}
              </p>
            )}
          </DialogHeader>

          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  Thank you!
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Taking time to reflect on your relationship is a beautiful act
                  of care. Keep nurturing your connection.
                </p>
                <Button
                  size="sm"
                  className="mt-5 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                  onClick={handleClose}
                >
                  Done
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Connection Score */}
                {step === 1 && (
                  <div>
                    <h3 className="font-heading text-base font-semibold mb-2">
                      How connected do you feel this month?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-5">
                      Rate your emotional connection on a scale of 1 to 5
                    </p>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => setConnectionScore(score)}
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl border text-lg transition-all",
                            connectionScore >= score
                              ? "border-pink-400/50 bg-pink-500/10 text-pink-400 scale-110"
                              : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20"
                          )}
                        >
                          <Heart
                            className={cn(
                              "h-5 w-5",
                              connectionScore >= score
                                ? "fill-pink-400 text-pink-400"
                                : ""
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    {connectionScore > 0 && (
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        {connectionScore === 1 && "Feeling disconnected"}
                        {connectionScore === 2 && "Somewhat distant"}
                        {connectionScore === 3 && "Neutral"}
                        {connectionScore === 4 && "Feeling close"}
                        {connectionScore === 5 && "Deeply connected"}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 2: Conflicts */}
                {step === 2 && (
                  <div>
                    <h3 className="font-heading text-base font-semibold mb-2">
                      Any conflicts or friction?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Optional - note any challenges you faced this month
                    </p>
                    <Textarea
                      value={conflictNote}
                      onChange={(e) => setConflictNote(e.target.value)}
                      placeholder="e.g., We disagreed about finances..."
                      className="bg-white/[0.03] border-white/10 min-h-[100px] resize-none"
                      maxLength={500}
                    />
                    <p className="text-right text-xs text-muted-foreground mt-1">
                      {conflictNote.length}/500
                    </p>
                  </div>
                )}

                {/* Step 3: What went well */}
                {step === 3 && (
                  <div>
                    <h3 className="font-heading text-base font-semibold mb-2">
                      What went well?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Optional - celebrate the positive moments
                    </p>
                    <Textarea
                      value={positiveNote}
                      onChange={(e) => setPositiveNote(e.target.value)}
                      placeholder="e.g., We had a wonderful date night..."
                      className="bg-white/[0.03] border-white/10 min-h-[100px] resize-none"
                      maxLength={500}
                    />
                    <p className="text-right text-xs text-muted-foreground mt-1">
                      {positiveNote.length}/500
                    </p>
                  </div>
                )}

                {/* Step 4: Growth goal */}
                {step === 4 && (
                  <div>
                    <h3 className="font-heading text-base font-semibold mb-2">
                      What would you like to work on?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Optional - set an intention for next month
                    </p>
                    <Textarea
                      value={growthGoal}
                      onChange={(e) => setGrowthGoal(e.target.value)}
                      placeholder="e.g., Practice more active listening..."
                      className="bg-white/[0.03] border-white/10 min-h-[100px] resize-none"
                      maxLength={500}
                    />
                    <p className="text-right text-xs text-muted-foreground mt-1">
                      {growthGoal.length}/500
                    </p>
                  </div>
                )}

                {/* Step 5: Overall mood */}
                {step === 5 && (
                  <div>
                    <h3 className="font-heading text-base font-semibold mb-2">
                      Overall mood right now?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-5">
                      Pick the one that best describes how you feel
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setOverallMood(mood.value)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
                            overallMood === mood.value
                              ? "border-cosmic-purple/50 bg-cosmic-purple/10 scale-105"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20"
                          )}
                        >
                          <span className="text-xl">{mood.emoji}</span>
                          <span className="text-xs font-medium">
                            {mood.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-400 mt-3">{error}</p>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10"
                    onClick={() => setStep((s) => s - 1)}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                    onClick={handleNext}
                    disabled={!canProceed() || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Saving...
                      </>
                    ) : step === TOTAL_STEPS ? (
                      <>
                        Complete
                        <Check className="ml-1 h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
