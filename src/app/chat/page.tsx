"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface ReportSummary {
  id: string;
  person1Name: string;
  person2Name: string;
  overallScore: number;
}

const SUGGESTED_QUESTIONS = [
  "Why do we argue about money?",
  "What are our strongest connection points?",
  "Is this relationship meant to last?",
  "How can we improve our communication?",
];

// Typing indicator
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

// Chat bubble
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
            <span className="text-[10px] text-cosmic-purple-light font-medium uppercase tracking-wider">
              AI Astrologer
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={cn(
            "text-[10px] mt-1.5",
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

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [loadingReports, setLoadingReports] = useState(true);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isPremium =
    session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch user's reports for the selector
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchReports = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.reports) {
            setReports(
              data.reports.map(
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
              )
            );
          }
        }
      } catch {
        // Silently handle for MVP
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [status]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Add welcome message
  useEffect(() => {
    if (messages.length === 0 && isPremium) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Welcome to your AI Astrologer session! I can help you understand your compatibility reports, explore specific aspects of your relationship dynamics, or answer any astrology questions you have.\n\nSelect a relationship from the sidebar and ask me anything. You can also use the suggested questions below to get started.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isPremium, messages.length]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cosmic-purple/10">
            <Crown className="h-10 w-10 text-cosmic-purple-light" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">
            Premium Feature
          </h1>
          <p className="text-muted-foreground mb-6">
            The AI Astrologer chat is available for Premium subscribers. Upgrade
            to get unlimited access to personalized astrological guidance.
          </p>
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

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.02] p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-4 w-4 text-cosmic-purple-light" />
          <h2 className="text-sm font-semibold">Relationship Context</h2>
        </div>

        {loadingReports ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length > 0 ? (
          <Select value={selectedReportId} onValueChange={(v) => { setSelectedReportId(v); setSessionId(undefined); }}>
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

        <p className="text-[10px] text-muted-foreground mt-3">
          Select a relationship for context-aware answers, or ask general
          astrology questions.
        </p>
      </aside>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <h1 className="sr-only">AI Astrologer Chat</h1>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03]">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  aria-label={q}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

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
