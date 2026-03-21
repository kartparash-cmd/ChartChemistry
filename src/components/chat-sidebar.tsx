"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { SessionSummary } from "@/types/astrology";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Pin,
  Archive,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Pencil,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

type TimeGroup =
  | "Pinned"
  | "Today"
  | "Yesterday"
  | "Previous 7 Days"
  | "Previous 30 Days"
  | "Older";

function groupSessionsByDate(
  sessions: SessionSummary[],
  filter: "all" | "pinned" | "archived"
): { label: TimeGroup; sessions: SessionSummary[] }[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOf7Days = new Date(startOfToday.getTime() - 7 * 86400000);
  const startOf30Days = new Date(startOfToday.getTime() - 30 * 86400000);

  const groups: Record<TimeGroup, SessionSummary[]> = {
    Pinned: [],
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Older: [],
  };

  // Apply filter
  let filtered = sessions;
  if (filter === "pinned") filtered = sessions.filter((s) => s.pinned);
  else if (filter === "archived") filtered = sessions.filter((s) => s.archived);
  else filtered = sessions.filter((s) => !s.archived);

  for (const session of filtered) {
    // Pinned sessions go to the Pinned group first (only in "all" view)
    if (session.pinned && filter === "all") {
      groups.Pinned.push(session);
      continue;
    }

    const updated = new Date(session.updatedAt);
    if (updated >= startOfToday) groups.Today.push(session);
    else if (updated >= startOfYesterday) groups.Yesterday.push(session);
    else if (updated >= startOf7Days) groups["Previous 7 Days"].push(session);
    else if (updated >= startOf30Days) groups["Previous 30 Days"].push(session);
    else groups.Older.push(session);
  }

  const order: TimeGroup[] = [
    "Pinned",
    "Today",
    "Yesterday",
    "Previous 7 Days",
    "Previous 30 Days",
    "Older",
  ];

  return order
    .filter((label) => groups[label].length > 0)
    .map((label) => ({ label, sessions: groups[label] }));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatSidebarProps {
  sessions: SessionSummary[];
  activeSessionId: string | undefined;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, title: string) => void;
  onPinSession: (id: string, pinned: boolean) => void;
  onArchiveSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onDeleteAll: () => void;
  filter: "all" | "pinned" | "archived";
  onFilterChange: (filter: "all" | "pinned" | "archived") => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onPinSession,
  onArchiveSession,
  onDeleteSession,
  onDeleteAll,
  filter,
  onFilterChange,
  isLoading,
}: ChatSidebarProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpenId]);

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Reset delete-all confirmation after 3 seconds
  useEffect(() => {
    if (confirmDeleteAll) {
      const t = setTimeout(() => setConfirmDeleteAll(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmDeleteAll]);

  const handleRenameSubmit = useCallback(
    (id: string) => {
      const trimmed = renameValue.trim();
      if (trimmed) onRenameSession(id, trimmed);
      setRenamingId(null);
    },
    [renameValue, onRenameSession]
  );

  const groups = groupSessionsByDate(sessions, filter);
  const filters: { label: string; value: "all" | "pinned" | "archived" }[] = [
    { label: "All", value: "all" },
    { label: "Pinned", value: "pinned" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <div className="flex h-full flex-col glass-card rounded-none lg:rounded-l-xl border-r border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold tracking-wide">Chats</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/5"
          onClick={onNewChat}
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 px-4 pb-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
              filter === f.value
                ? "bg-cosmic-purple/20 text-cosmic-purple-light"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <MessageSquare className="mx-auto mb-2 h-5 w-5 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              {filter === "pinned"
                ? "No pinned chats"
                : filter === "archived"
                  ? "No archived chats"
                  : "No conversations yet"}
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
              {group.sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isRenaming = renamingId === session.id;
                const isMenuOpen = menuOpenId === session.id;

                return (
                  <div
                    key={session.id}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 transition-colors",
                      isActive
                        ? "border-l-2 border-cosmic-purple bg-cosmic-purple/10"
                        : "border-l-2 border-transparent hover:bg-white/5"
                    )}
                    onClick={() => {
                      if (!isRenaming) onSelectSession(session.id);
                    }}
                  >
                    {/* Icon */}
                    <MessageSquare
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 flex-shrink-0",
                        isActive
                          ? "text-cosmic-purple-light"
                          : "text-muted-foreground/50"
                      )}
                    />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <Input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSubmit(session.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onBlur={() => handleRenameSubmit(session.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 border-white/10 bg-white/5 px-1.5 text-xs"
                        />
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            {session.pinned && filter !== "pinned" && (
                              <Pin className="h-2.5 w-2.5 flex-shrink-0 text-cosmic-purple-light/60" />
                            )}
                            <p className="truncate text-xs font-medium leading-tight">
                              {session.title || "New conversation"}
                            </p>
                          </div>
                          {session.lastMessage && (
                            <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground/60">
                              {session.lastMessage}
                            </p>
                          )}
                          <p className="mt-0.5 text-[10px] text-muted-foreground/40">
                            {getRelativeTime(session.updatedAt)}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Three-dot menu */}
                    {!isRenaming && (
                      <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(isMenuOpen ? null : session.id);
                          }}
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                            isMenuOpen
                              ? "bg-white/10 text-foreground"
                              : "text-muted-foreground/0 group-hover:text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-7 z-50 w-36 rounded-lg border border-white/10 bg-background/95 py-1 shadow-xl backdrop-blur-sm">
                            <button
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-white/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenameValue(session.title || "");
                                setRenamingId(session.id);
                                setMenuOpenId(null);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                              Rename
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-white/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPinSession(session.id, !session.pinned);
                                setMenuOpenId(null);
                              }}
                            >
                              <Pin className="h-3 w-3" />
                              {session.pinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-white/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                onArchiveSession(session.id);
                                setMenuOpenId(null);
                              }}
                            >
                              <Archive className="h-3 w-3" />
                              {session.archived ? "Unarchive" : "Archive"}
                            </button>
                            <div className="my-1 border-t border-white/5" />
                            <button
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-white/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                                setMenuOpenId(null);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Delete All */}
      {sessions.length > 0 && (
        <div className="border-t border-white/5 px-4 py-2">
          <button
            onClick={() => {
              if (confirmDeleteAll) {
                onDeleteAll();
                setConfirmDeleteAll(false);
              } else {
                setConfirmDeleteAll(true);
              }
            }}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] transition-colors",
              confirmDeleteAll
                ? "bg-red-500/10 text-red-400"
                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/5"
            )}
          >
            <Trash2 className="h-3 w-3" />
            {confirmDeleteAll ? "Click again to confirm" : "Delete all"}
          </button>
        </div>
      )}
    </div>
  );
}
