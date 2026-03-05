"use client";

import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Loader2,
  MessageCircle,
  ChevronDown,
  Crown,
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/** Serializable shape stored in localStorage (Date -> ISO string) */
interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ReportSummary {
  id: string;
  person1Name: string;
  person2Name: string;
  overallScore: number;
}

const INITIAL_SUGGESTED_QUESTIONS = [
  "Why do we argue about money?",
  "What are our strongest connection points?",
  "Is this relationship meant to last?",
  "How can we improve our communication?",
];

const STORAGE_KEY_PREFIX = "cc_chat_";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeMessages(msgs: Message[]): string {
  const stored: StoredMessage[] = msgs.map((m) => ({
    ...m,
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
  }));
  return JSON.stringify(stored);
}

function deserializeMessages(raw: string): Message[] | null {
  try {
    const parsed: StoredMessage[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return null;
  }
}

/**
 * Derive context-aware follow-up suggestions from the last assistant message.
 * These are deterministic (no AI call) and based on simple keyword heuristics
 * from the conversation so far.
 */
function generateFollowUpSuggestions(messages: Message[]): string[] {
  // Find the last assistant message (excluding welcome)
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.id !== "welcome");
  const lastUser = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastAssistant || !lastUser) return INITIAL_SUGGESTED_QUESTIONS;

  const content = lastAssistant.content.toLowerCase();
  const userContent = lastUser.content.toLowerCase();
  const suggestions: string[] = [];

  // Communication-related follow-ups
  if (content.includes("communicat") || content.includes("mercury") || content.includes("talk")) {
    suggestions.push("How can we handle disagreements more constructively?");
    suggestions.push("What communication style works best for us?");
  }

  // Emotional / Moon-related follow-ups
  if (content.includes("emotion") || content.includes("moon") || content.includes("feel")) {
    suggestions.push("How can we better support each other emotionally?");
    suggestions.push("What triggers emotional distance between us?");
  }

  // Chemistry / Venus / Mars follow-ups
  if (content.includes("venus") || content.includes("mars") || content.includes("chemist") || content.includes("attract")) {
    suggestions.push("How can we keep the spark alive long-term?");
    suggestions.push("What does our physical compatibility look like?");
  }

  // Conflict / Saturn follow-ups
  if (content.includes("conflict") || content.includes("saturn") || content.includes("challenge") || content.includes("difficult")) {
    suggestions.push("What are the biggest challenges we need to overcome?");
    suggestions.push("How can we turn our conflicts into growth opportunities?");
  }

  // Money / Taurus / 2nd house follow-ups
  if (content.includes("money") || content.includes("financ") || content.includes("taurus") || content.includes("security")) {
    suggestions.push("How do our values around money and security differ?");
    suggestions.push("What shared goals can help us align financially?");
  }

  // General astrology follow-ups
  if (content.includes("sun") || content.includes("sign") || content.includes("zodiac")) {
    suggestions.push("How do our sun signs interact day to day?");
    suggestions.push("What role do our rising signs play in this dynamic?");
  }

  // If we still have room, add context-aware generic follow-ups
  if (suggestions.length < 3) {
    if (!suggestions.includes("Tell me more about our strengths as a couple.")) {
      suggestions.push("Tell me more about our strengths as a couple.");
    }
    if (!suggestions.includes("What should we watch out for in the coming months?")) {
      suggestions.push("What should we watch out for in the coming months?");
    }
    if (!suggestions.includes("Can you explain that in simpler terms?")) {
      suggestions.push("Can you explain that in simpler terms?");
    }
  }

  // Avoid suggesting something the user already asked
  const askedTopics = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase());

  const filtered = suggestions.filter(
    (s) => !askedTopics.some((asked) => asked === s.toLowerCase())
  );

  // Return at most 4 unique suggestions
  return [...new Set(filtered)].slice(0, 4);
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-cosmic-purple-light"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat bubble
// ---------------------------------------------------------------------------

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-cosmic-purple/20 text-foreground rounded-br-sm"
            : "border border-white/10 bg-white/[0.03] rounded-bl-sm"
        )}
        style={
          !isUser
            ? {
                borderImage:
                  "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(245,158,11,0.1)) 1",
              }
            : undefined
        }
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3 w-3 text-cosmic-purple-light" />
            <span className="text-xs text-cosmic-purple-light font-medium uppercase tracking-wider">
              AI Astrologer
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={cn(
            "text-xs mt-1.5",
            isUser ? "text-cosmic-purple-light/50" : "text-muted-foreground/50"
          )}
        >
          {message.timestamp.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper (Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageContent />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

function ChatPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams?.get("reportId");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [loadingReports, setLoadingReports] = useState(true);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [isRestoredSession, setIsRestoredSession] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** True once there has been at least one user message in this conversation */
  const hasUserMessage = messages.some((m) => m.role === "user");

  /** Compute follow-up suggestions based on conversation state */
  const currentSuggestions = hasUserMessage
    ? generateFollowUpSuggestions(messages)
    : INITIAL_SUGGESTED_QUESTIONS;

  const isPremium =
    session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

  // -------------------------------------------------------------------
  // localStorage helpers (scoped to selectedReportId)
  // -------------------------------------------------------------------

  const storageKey = selectedReportId
    ? `${STORAGE_KEY_PREFIX}${selectedReportId}`
    : `${STORAGE_KEY_PREFIX}__general`;

  /** Persist messages to localStorage whenever they change */
  useEffect(() => {
    if (!isPremium) return;
    // Only persist when there are real messages beyond the welcome message
    const hasRealContent = messages.some((m) => m.id !== "welcome");
    if (hasRealContent) {
      try {
        localStorage.setItem(storageKey, serializeMessages(messages));
      } catch {
        // localStorage full or unavailable -- silently ignore
      }
    }
  }, [messages, storageKey, isPremium]);

  // -------------------------------------------------------------------
  // Restore messages: DB first, then localStorage fallback
  // -------------------------------------------------------------------

  const buildWelcomeMessage = useCallback((): Message => ({
    id: "welcome",
    role: "assistant",
    content:
      "Welcome to your AI Astrologer session! I can help you understand your compatibility reports, explore specific aspects of your relationship dynamics, or answer any astrology questions you have.\n\nSelect a relationship from the sidebar and ask me anything. You can also use the suggested questions below to get started.",
    timestamp: new Date(),
  }), []);

  useEffect(() => {
    if (!isPremium) return;

    let cancelled = false;

    const restoreSession = async () => {
      setIsRestoringSession(true);

      // --- 1. Try loading from the database (source of truth) ---
      try {
        const params = new URLSearchParams();
        if (selectedReportId) {
          params.set("reportId", selectedReportId);
        }
        const res = await fetch(`/api/chat?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            // Convert DB messages (ChatMessage format) into our Message format
            const restored: Message[] = data.messages.map(
              (m: { role: "user" | "assistant"; content: string; timestamp: string }, i: number) => ({
                id: `${m.role}-restored-${i}`,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.timestamp),
              })
            );
            // Prepend the welcome message for context
            setMessages([buildWelcomeMessage(), ...restored]);
            setSessionId(data.sessionId);
            if (data.sessionDate) {
              setSessionDate(data.sessionDate);
            }
            setIsRestoredSession(true);
            setSuggestionsOpen(false);
            setIsRestoringSession(false);
            // Update localStorage cache with the DB data
            try {
              localStorage.setItem(
                storageKey,
                serializeMessages([buildWelcomeMessage(), ...restored])
              );
            } catch {
              // ignore
            }
            return;
          }
        }
      } catch {
        // DB fetch failed -- fall through to localStorage
      }

      if (cancelled) return;

      // --- 2. Fallback: try restoring from localStorage ---
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const restored = deserializeMessages(stored);
          if (restored && restored.length > 0) {
            setMessages(restored);
            // Try to recover the sessionId from the localStorage key if messages have user content
            setSuggestionsOpen(false);
            setIsRestoringSession(false);
            return;
          }
        }
      } catch {
        // localStorage unavailable
      }

      if (cancelled) return;

      // --- 3. No stored history -- show welcome message ---
      setMessages([buildWelcomeMessage()]);
      setSuggestionsOpen(true);
      setIsRestoringSession(false);
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [storageKey, selectedReportId, isPremium, buildWelcomeMessage]);

  // -------------------------------------------------------------------
  // "New Conversation" handler -- clear stored messages and reset
  // -------------------------------------------------------------------

  const handleNewConversation = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setMessages([buildWelcomeMessage()]);
    setSessionId(undefined);
    setSessionDate(null);
    setIsRestoredSession(false);
    setSuggestionsOpen(true);
  };

  // -------------------------------------------------------------------
  // Redirect if not authenticated
  // -------------------------------------------------------------------

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // -------------------------------------------------------------------
  // Fetch user's reports for the selector
  // -------------------------------------------------------------------

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchReports = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.reports) {
            const mapped = data.reports.map(
              (r: {
                id: string;
                person1: { name: string };
                person2: { name: string };
                overallScore: number;
              }) => ({
                id: r.id,
                person1Name: r.person1.name,
                person2Name: r.person2.name,
                overallScore: r.overallScore,
              })
            );
            setReports(mapped);
            if (reportId) {
              const match = mapped.find((r: ReportSummary) => r.id === reportId);
              if (match) setSelectedReportId(match.id);
            }
          }
        }
      } catch (error) {
        console.warn("Failed to load reports:", error);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [status, reportId]);

  // -------------------------------------------------------------------
  // Scroll to bottom on new messages
  // -------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // -------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Collapse suggestions after the first user message
    setSuggestionsOpen(false);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          reportId: selectedReportId || undefined,
          sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply || data.response || data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "I am having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // -------------------------------------------------------------------
  // Loading / auth guards
  // -------------------------------------------------------------------

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cosmic-purple-light" />
      </div>
    );
  }

  if (!session) return null;

  // Premium gate
  if (!isPremium) {
    const sampleQuestions = [
      { q: "Why do we argue about finances?", icon: "\uD83D\uDCB0" },
      { q: "What does Venus in Scorpio mean for us?", icon: "\u2640\uFE0F" },
      { q: "How will Mercury retrograde affect our relationship?", icon: "\u263F" },
      { q: "What are our strongest connection points?", icon: "\u2728" },
    ];

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-cosmic-purple/10">
              <Crown className="h-10 w-10 text-cosmic-purple-light" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
              AI Astrologer Chat
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Ask our AI astrologer anything about your chart, compatibility, or cosmic events
            </p>
          </div>

          {/* Sample questions */}
          <div className="mb-8 space-y-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider text-center mb-3">
              Questions you can ask
            </p>
            {sampleQuestions.map((item) => (
              <div
                key={item.q}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-lg shrink-0" aria-hidden="true">{item.icon}</span>
                <p className="text-sm text-muted-foreground">&ldquo;{item.q}&rdquo;</p>
              </div>
            ))}
          </div>

          {/* Blurred sample conversation */}
          <div className="relative select-none pointer-events-none mb-8" aria-hidden="true">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3 opacity-50 blur-[2px]">
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-br-sm bg-cosmic-purple/20 px-4 py-2.5 max-w-[75%]">
                  <p className="text-xs">Why do we always argue about money?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03] px-4 py-2.5 max-w-[75%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3 w-3 text-cosmic-purple-light" />
                    <span className="text-[11px] text-cosmic-purple-light font-medium uppercase tracking-wider">AI Astrologer</span>
                  </div>
                  <p className="text-xs">Your Mars in Taurus squares their Venus in Leo -- you value security while they value expression...</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
            >
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Main chat layout
  // -------------------------------------------------------------------

  return (
    <div className="flex h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.02] flex-shrink-0">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span>Relationship Context</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", sidebarOpen && "rotate-180")} />
        </button>
        <div className={cn("px-4 pb-4 lg:block", sidebarOpen ? "block" : "hidden lg:block")}>
          <div className="flex items-center gap-2 mb-4 hidden lg:flex">
            <MessageCircle className="h-4 w-4 text-cosmic-purple-light" />
            <h2 className="text-sm font-semibold">Relationship Context</h2>
          </div>

          {loadingReports ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length > 0 ? (
            <Select
              value={selectedReportId}
              onValueChange={(v) => {
                setSelectedReportId(v);
                setSessionId(undefined);
              }}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10">
                <SelectValue placeholder="Select a relationship..." />
              </SelectTrigger>
              <SelectContent>
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.person1Name} & {report.person2Name} (
                    {report.overallScore}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
              <p className="text-xs text-muted-foreground">
                No compatibility reports yet.
              </p>
              <Button
                asChild
                variant="link"
                size="sm"
                className="text-cosmic-purple-light text-xs px-0 h-auto mt-1"
              >
                <Link href="/compatibility">Create one</Link>
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            Select a relationship for context-aware answers, or ask general
            astrology questions.
          </p>

          {/* New Conversation button */}
          {hasUserMessage && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full border-white/10 text-xs"
              onClick={handleNewConversation}
            >
              <RotateCcw className="mr-1.5 h-3 w-3" />
              New Conversation
            </Button>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <h1 className="sr-only">AI Astrologer Chat</h1>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite" aria-relevant="additions">
          {/* Session restore loading indicator */}
          {isRestoringSession && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Restoring your conversation...</span>
              </div>
            </div>
          )}

          {/* Restored session indicator */}
          {isRestoredSession && !isRestoringSession && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center py-2"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cosmic-purple/20 bg-cosmic-purple/5 px-4 py-1.5 text-xs text-muted-foreground">
                <History className="h-3 w-3 text-cosmic-purple-light" />
                <span>Continuing from your last conversation</span>
                {sessionDate && (
                  <span className="text-muted-foreground/50">
                    &middot;{" "}
                    {new Date(sessionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div
                role="status"
                aria-label="AI is typing"
                className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03]"
              >
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          {/* No-report empty-state hint (mobile only) */}
          {!selectedReportId && !hasUserMessage && !loadingReports && reports.length > 0 && (
            <div className="flex justify-center lg:hidden mt-4">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-cosmic-purple/20 bg-cosmic-purple/5 px-5 py-4 text-center max-w-xs"
              >
                <p className="text-sm font-medium text-cosmic-purple-light mb-1">
                  Select a relationship from the menu above
                </p>
                <ChevronDown className="mx-auto h-5 w-5 text-cosmic-purple-light rotate-180" />
                <p className="text-xs text-muted-foreground mt-1">
                  Tap &ldquo;Relationship Context&rdquo; to pick a report for personalised answers.
                </p>
              </motion.div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Collapsible Suggested Questions (dynamic after first exchange) */}
        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={() => setSuggestionsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1.5"
            aria-expanded={suggestionsOpen}
            aria-controls="suggested-questions"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>{hasUserMessage ? "Follow-up questions" : "Suggestions"}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                suggestionsOpen && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {suggestionsOpen && (
              <motion.div
                id="suggested-questions"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pb-1">
                  {currentSuggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      aria-label={q}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 bg-white/[0.02] p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the AI Astrologer anything..."
                aria-label="Type your message to the AI astrologer"
                rows={1}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground/50 focus:border-cosmic-purple/30 focus:outline-none focus:ring-1 focus:ring-cosmic-purple/20"
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "44px";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="h-11 w-11 rounded-xl bg-cosmic-purple hover:bg-cosmic-purple-dark text-white flex-shrink-0"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
