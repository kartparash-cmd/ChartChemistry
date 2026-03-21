"use client";

import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatSidebar } from "@/components/chat-sidebar";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { SessionSummary } from "@/types/astrology";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
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

const EDUCATION_SUGGESTED_QUESTIONS = [
  "Teach me about my Sun sign placement",
  "What does my Moon sign say about my emotions?",
  "Explain my Rising sign and how others see me",
  "What does Venus in my chart say about how I love?",
  "Walk me through my birth chart step by step",
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
 */
function generateFollowUpSuggestions(messages: Message[]): string[] {
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.id !== "welcome");
  const lastUser = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastAssistant || !lastUser) return [...INITIAL_SUGGESTED_QUESTIONS, ...EDUCATION_SUGGESTED_QUESTIONS].slice(0, 8);

  const content = lastAssistant.content.toLowerCase();
  const suggestions: string[] = [];

  if (content.includes("communicat") || content.includes("mercury") || content.includes("talk")) {
    suggestions.push("How can we handle disagreements more constructively?");
    suggestions.push("What communication style works best for us?");
  }
  if (content.includes("emotion") || content.includes("moon") || content.includes("feel")) {
    suggestions.push("How can we better support each other emotionally?");
    suggestions.push("What triggers emotional distance between us?");
  }
  if (content.includes("venus") || content.includes("mars") || content.includes("chemist") || content.includes("attract")) {
    suggestions.push("How can we keep the spark alive long-term?");
    suggestions.push("What does our physical compatibility look like?");
  }
  if (content.includes("conflict") || content.includes("saturn") || content.includes("challenge") || content.includes("difficult")) {
    suggestions.push("What are the biggest challenges we need to overcome?");
    suggestions.push("How can we turn our conflicts into growth opportunities?");
  }
  if (content.includes("money") || content.includes("financ") || content.includes("taurus") || content.includes("security")) {
    suggestions.push("How do our values around money and security differ?");
    suggestions.push("What shared goals can help us align financially?");
  }
  if (content.includes("sun") || content.includes("sign") || content.includes("zodiac")) {
    suggestions.push("How do our sun signs interact day to day?");
    suggestions.push("What role do our rising signs play in this dynamic?");
  }

  // Education follow-ups
  if (content.includes("sun")) {
    suggestions.push("How does my Sun sign affect my daily energy?");
  }
  if (content.includes("house") || content.includes("houses")) {
    suggestions.push("What do the houses in my chart mean?");
  }
  if (content.includes("aspect") || content.includes("trine") || content.includes("square") || content.includes("conjunction")) {
    suggestions.push("Explain what aspects are and why they matter");
  }
  if (content.includes("rising") || content.includes("ascendant")) {
    suggestions.push("How does my Rising sign shape first impressions?");
  }
  if (content.includes("retrograde")) {
    suggestions.push("How do retrogrades affect me personally?");
  }

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

  const askedTopics = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase());

  const filtered = suggestions.filter(
    (s) => !askedTopics.some((asked) => asked === s.toLowerCase())
  );

  return [...new Set(filtered)].slice(0, 4);
}

// ---------------------------------------------------------------------------
// Typing indicator (ChatGPT-style pulsing dots)
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-cosmic-purple dark:bg-cosmic-purple-light"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Copy button for AI messages
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
      aria-label="Copy message"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Chat message row (ChatGPT/Claude style - full width, avatars)
// ---------------------------------------------------------------------------

function ChatMessage({ message, userName }: { message: Message; userName?: string | null }) {
  const isUser = message.role === "user";

  const userInitials = (userName || "You")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group py-6 px-4 sm:px-6",
        !isUser && "bg-muted/30 dark:bg-white/[0.02]"
      )}
    >
      <div className="mx-auto max-w-3xl flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cosmic-purple/20 text-xs font-bold text-cosmic-purple dark:text-cosmic-purple-light">
              {userInitials}
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cosmic-purple to-cosmic-purple-dark">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {isUser ? (userName || "You") : "Marie"}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            {!isUser && <CopyButton text={message.content} />}
          </div>

          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-p:leading-relaxed prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:mt-4 prose-headings:mb-2 prose-strong:text-foreground prose-code:text-cosmic-purple dark:prose-code:text-cosmic-purple-light prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper (Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
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
  const initialQuestion = searchParams?.get("ask");
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
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sidebarFilter, setSidebarFilter] = useState<"all" | "pinned" | "archived">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasUserMessage = messages.some((m) => m.role === "user");

  const currentSuggestions = hasUserMessage
    ? generateFollowUpSuggestions(messages)
    : INITIAL_SUGGESTED_QUESTIONS;

  const isPremium =
    session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

  // -------------------------------------------------------------------
  // localStorage helpers (scoped to selectedReportId)
  // -------------------------------------------------------------------

  const storageKey = `${STORAGE_KEY_PREFIX}${session?.user?.id || "anon"}_${selectedReportId || "__general"}`;

  useEffect(() => {
    if (!isPremium) return;
    const hasRealContent = messages.some((m) => m.id !== "welcome");
    if (hasRealContent) {
      try {
        const persistable = messages.filter((m: any) => !m.isError);
        localStorage.setItem(storageKey, serializeMessages(persistable));
      } catch {
        // localStorage full or unavailable
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
      "Hi, I'm **Marie**, your personal astrologer! I can help you:\n\n- Understand your compatibility reports in depth\n- Explore specific aspects of your relationship dynamics\n- Answer any astrology questions you have\n\nSelect a relationship from the sidebar and ask me anything, or try one of the suggested questions below.",
    timestamp: new Date(),
  }), []);

  useEffect(() => {
    if (!isPremium) return;

    let cancelled = false;

    const restoreSession = async () => {
      setIsRestoringSession(true);

      try {
        const params = new URLSearchParams();
        if (selectedReportId) {
          params.set("reportId", selectedReportId);
        }
        const res = await fetch(`/api/chat?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            const restored: Message[] = data.messages.map(
              (m: { role: "user" | "assistant"; content: string; timestamp: string }, i: number) => ({
                id: `${m.role}-restored-${i}`,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.timestamp),
              })
            );
            setMessages([buildWelcomeMessage(), ...restored]);
            setSessionId(data.sessionId);
            if (data.sessionDate) {
              setSessionDate(data.sessionDate);
            }
            setIsRestoredSession(true);
            setSuggestionsOpen(false);
            setIsRestoringSession(false);
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
        // DB fetch failed
      }

      if (cancelled) return;

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const restored = deserializeMessages(stored);
          if (restored && restored.length > 0) {
            setMessages(restored);
            setSuggestionsOpen(false);
            setIsRestoringSession(false);
            return;
          }
        }
      } catch {
        // localStorage unavailable
      }

      if (cancelled) return;

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
  // New conversation
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
  // Auth redirect
  // -------------------------------------------------------------------

  useEffect(() => {
    if (session?.user && isPremium) {
      trackEvent("chat_open");
    }
  }, [session, isPremium]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // -------------------------------------------------------------------
  // Fetch reports
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
  // Fetch chat sessions (sidebar)
  // -------------------------------------------------------------------

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/sessions?filter=${sidebarFilter}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingSessions(false);
    }
  }, [sidebarFilter]);

  useEffect(() => {
    if (session?.user) fetchSessions();
  }, [session, fetchSessions]);

  // -------------------------------------------------------------------
  // Session mutation handlers
  // -------------------------------------------------------------------

  const handleRenameSession = async (id: string, title: string) => {
    await fetch(`/api/chat/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    fetchSessions();
  };

  const handlePinSession = async (id: string, pinned: boolean) => {
    await fetch(`/api/chat/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    });
    fetchSessions();
  };

  const handleArchiveSession = async (id: string) => {
    const s = sessions.find((s) => s.id === id);
    const archived = s ? !s.archived : true;
    await fetch(`/api/chat/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    if (archived && id === sessionId) handleNewConversation();
    fetchSessions();
  };

  const handleDeleteSession = async (id: string) => {
    await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
    if (id === sessionId) handleNewConversation();
    fetchSessions();
  };

  const handleDeleteAllSessions = async () => {
    await fetch("/api/chat/sessions", { method: "DELETE" });
    handleNewConversation();
    fetchSessions();
  };

  const handleSelectSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSessionId(id);
        const loadedMessages = (data.messages || [])
          .filter((m: any) => !m._type)
          .map((m: any) => ({
            id: `${m.role}-loaded-${Math.random().toString(36).slice(2)}`,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp || Date.now()),
          }));
        setMessages([buildWelcomeMessage(), ...loadedMessages]);
        if (data.reportId) setSelectedReportId(data.reportId);
        setIsRestoredSession(true);
        setSuggestionsOpen(false);
      }
    } catch {
      // Failed to load session
    }
  };

  // -------------------------------------------------------------------
  // Auto-scroll
  // -------------------------------------------------------------------

  useEffect(() => {
    // Scroll the messages container to bottom (not the page)
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // -------------------------------------------------------------------
  // Auto-fill input from "ask" query param
  // -------------------------------------------------------------------

  const [initialQuestionApplied, setInitialQuestionApplied] = useState(false);

  useEffect(() => {
    if (
      initialQuestion &&
      !initialQuestionApplied &&
      !isRestoringSession &&
      selectedReportId &&
      isPremium
    ) {
      setInput(initialQuestion);
      setInitialQuestionApplied(true);
      // Focus the input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [initialQuestion, initialQuestionApplied, isRestoringSession, selectedReportId, isPremium]);

  // -------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    trackEvent("chat_message");

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
    setLastFailedMessage(null);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "52px";
    }

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
        setLastFailedMessage(null);
        fetchSessions();
      } else {
        setLastFailedMessage(content.trim());
        let errorText: string;
        switch (res.status) {
          case 429:
            errorText = "You've reached the hourly message limit. Try again in a few minutes.";
            break;
          case 403:
            errorText = "This feature requires a Premium plan.";
            break;
          case 503:
            errorText = "Marie is taking a cosmic break. Please try again in a moment.";
            break;
          default:
            errorText = "Something went wrong. Please try again.";
        }
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: errorText,
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      setLastFailedMessage(content.trim());
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "Check your internet connection and try again.",
        timestamp: new Date(),
        isError: true,
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
        <Loader2 className="h-8 w-8 animate-spin text-cosmic-purple dark:text-cosmic-purple-light" />
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
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-cosmic-purple/10">
              <Crown className="h-10 w-10 text-cosmic-purple dark:text-cosmic-purple-light" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
              Marie Chat
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Ask Marie anything about your chart, compatibility, or cosmic events
            </p>
          </div>

          <div className="mb-8 space-y-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider text-center mb-3">
              Questions you can ask
            </p>
            {sampleQuestions.map((item) => (
              <div
                key={item.q}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 dark:border-white/10 dark:bg-white/[0.03] px-4 py-3"
              >
                <span className="text-lg shrink-0" aria-hidden="true">{item.icon}</span>
                <p className="text-sm text-muted-foreground">&ldquo;{item.q}&rdquo;</p>
              </div>
            ))}
          </div>

          <div className="relative select-none pointer-events-none mb-8" aria-hidden="true">
            <div className="rounded-2xl border border-border bg-muted/30 dark:border-white/10 dark:bg-white/[0.03] p-4 space-y-3 opacity-50 blur-[2px]">
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-br-sm bg-cosmic-purple/20 px-4 py-2.5 max-w-[75%]">
                  <p className="text-xs">Why do we always argue about money?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.03] px-4 py-2.5 max-w-[75%]">
                  <p className="text-xs">Your Mars in Taurus squares their Venus in Leo...</p>
                </div>
              </div>
            </div>
          </div>

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
            <Button asChild variant="outline" className="border-border dark:border-white/10">
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
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.02] flex-shrink-0">
        {/* Mobile toggle */}
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-cosmic-purple dark:text-cosmic-purple-light" />
            Chat History
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", sidebarOpen && "rotate-180")} />
        </button>

        <div className={cn("lg:block", sidebarOpen ? "block" : "hidden lg:block")}>
          <ChatSidebar
            sessions={sessions}
            activeSessionId={sessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewConversation}
            onRenameSession={handleRenameSession}
            onPinSession={handlePinSession}
            onArchiveSession={handleArchiveSession}
            onDeleteSession={handleDeleteSession}
            onDeleteAll={handleDeleteAllSessions}
            filter={sidebarFilter}
            onFilterChange={setSidebarFilter}
            isLoading={loadingSessions}
          />

          {/* Report selector */}
          <div className="px-4 pb-4 border-t border-border dark:border-white/10 pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Relationship Context</p>
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
                <SelectTrigger className="w-full bg-background dark:bg-white/5 border-border dark:border-white/10">
                  <SelectValue placeholder="Select a relationship..." />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.person1Name} & {report.person2Name} ({report.overallScore}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-lg border border-border dark:border-white/5 bg-background dark:bg-white/[0.02] p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  No compatibility reports yet.
                </p>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="text-cosmic-purple dark:text-cosmic-purple-light text-xs px-0 h-auto mt-1"
                >
                  <Link href="/compatibility">Create one</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <h1 className="sr-only">Marie Chat</h1>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto" role="log" aria-live="polite" aria-relevant="additions">
          {/* Session restore loading */}
          {isRestoringSession && (
            <div className="flex justify-center py-8">
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
              className="flex justify-center py-3"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cosmic-purple/20 bg-cosmic-purple/5 px-4 py-1.5 text-xs text-muted-foreground">
                <History className="h-3 w-3 text-cosmic-purple dark:text-cosmic-purple-light" />
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

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              userName={session.user?.name}
            />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 px-4 sm:px-6 bg-muted/30 dark:bg-white/[0.02]"
            >
              <div className="mx-auto max-w-3xl flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cosmic-purple to-cosmic-purple-dark">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex items-center pt-1">
                  <TypingIndicator />
                </div>
              </div>
            </motion.div>
          )}

          {/* No-report hint (mobile) */}
          {!selectedReportId && !hasUserMessage && !loadingReports && reports.length > 0 && (
            <div className="flex justify-center lg:hidden mt-4 px-4">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-cosmic-purple/20 bg-cosmic-purple/5 px-5 py-4 text-center max-w-xs"
              >
                <p className="text-sm font-medium text-cosmic-purple dark:text-cosmic-purple-light mb-1">
                  Select a relationship above
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tap &ldquo;Relationship Context&rdquo; for personalised answers.
                </p>
              </motion.div>
            </div>
          )}

          {/* Retry button */}
          {lastFailedMessage && !isLoading && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  const msg = lastFailedMessage;
                  setLastFailedMessage(null);
                  setMessages((prev) => prev.slice(0, -1));
                  sendMessage(msg);
                }}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Retry message
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 sm:px-6 pb-2">
          <div className="mx-auto max-w-3xl">
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
                        className="rounded-full border border-border dark:border-white/10 bg-background dark:bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground transition-all hover:bg-muted dark:hover:bg-white/[0.06] hover:text-foreground hover:border-cosmic-purple/30 disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-border dark:border-white/10 bg-background dark:bg-white/[0.02] px-4 sm:px-6 py-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="relative flex items-end rounded-xl border border-border dark:border-white/10 bg-muted/50 dark:bg-white/5 focus-within:border-cosmic-purple/40 focus-within:ring-1 focus-within:ring-cosmic-purple/20 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Marie anything..."
                aria-label="Type your message to Marie"
                maxLength={2000}
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none"
                style={{ minHeight: "52px", maxHeight: "160px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "52px";
                  target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
                }}
              />
              {input.length > 1800 && (
                <span className={cn("absolute bottom-14 right-4 text-xs", input.length > 1950 ? "text-red-400" : "text-muted-foreground")}>
                  {input.length}/2000
                </span>
              )}
              <div className="flex items-center pr-2 pb-2">
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all flex-shrink-0",
                    input.trim()
                      ? "bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground/50 mt-2">
              Marie provides insights for entertainment and self-reflection, not professional advice.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
