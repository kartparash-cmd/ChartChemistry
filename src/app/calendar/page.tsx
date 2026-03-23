"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  getEventsForMonth,
  getMoonPhaseForDate,
  formatShortDate,
  type CosmicEvent,
  type CosmicEventType,
} from "@/lib/cosmic-events";
import { cn } from "@/lib/utils";

// ============================================================
// Constants
// ============================================================

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** Color mapping for event dot indicators */
const EVENT_COLORS: Record<CosmicEventType, string> = {
  "mercury-retrograde": "bg-red-500",
  "full-moon": "bg-slate-200",
  "new-moon": "bg-slate-400",
  "solar-eclipse": "bg-amber-400",
  "lunar-eclipse": "bg-amber-500",
  "zodiac-season": "bg-purple-500",
};

const EVENT_TEXT_COLORS: Record<CosmicEventType, string> = {
  "mercury-retrograde": "text-red-400",
  "full-moon": "text-slate-200",
  "new-moon": "text-slate-400",
  "solar-eclipse": "text-amber-400",
  "lunar-eclipse": "text-amber-500",
  "zodiac-season": "text-purple-400",
};

const EVENT_BORDER_COLORS: Record<CosmicEventType, string> = {
  "mercury-retrograde": "border-red-500/40",
  "full-moon": "border-slate-200/40",
  "new-moon": "border-slate-400/40",
  "solar-eclipse": "border-amber-400/40",
  "lunar-eclipse": "border-amber-500/40",
  "zodiac-season": "border-purple-500/40",
};

// ============================================================
// Helpers
// ============================================================

/** Get calendar grid days for a month — includes leading/trailing days from adjacent months. */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: Array<{ date: Date; inMonth: boolean }> = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      inMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: new Date(year, month, d),
      inMonth: true,
    });
  }

  // Next month leading days — fill to complete the grid (always 6 rows)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(year, month + 1, d),
      inMonth: false,
    });
  }

  return days;
}

/** Check if two dates are the same calendar day. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Check if a cosmic event falls on (or spans) a specific date. */
function eventOnDate(event: CosmicEvent, date: Date): boolean {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  return event.startDate <= dayEnd && event.endDate >= dayStart;
}

/** Get unique events for a date — for range events like retrogrades, only show the start date dot unless it's active. */
function getEventsForDate(events: CosmicEvent[], date: Date): CosmicEvent[] {
  return events.filter((e) => {
    if (
      e.type === "mercury-retrograde" ||
      e.type === "zodiac-season"
    ) {
      // For range events, show on every day of the range
      return eventOnDate(e, date);
    }
    // For point events (moons, eclipses), show on the exact date
    return isSameDay(e.startDate, date);
  });
}

// ============================================================
// Components
// ============================================================

function EventDot({ type }: { type: CosmicEventType }) {
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 rounded-full", EVENT_COLORS[type])}
      aria-hidden="true"
    />
  );
}

function MoonPhaseIndicator({ date }: { date: Date }) {
  const phase = getMoonPhaseForDate(date);
  return (
    <span
      className="text-[10px] leading-none opacity-50 select-none"
      title={`${phase.name} (${phase.illumination}%)`}
      aria-label={`${phase.name}, ${phase.illumination}% illumination`}
    >
      {phase.emoji}
    </span>
  );
}

function EventDetailPanel({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: CosmicEvent[];
  onClose: () => void;
}) {
  const moonPhase = getMoonPhaseForDate(date);
  const today = new Date();
  const isToday = isSameDay(date, today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-xl border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {isToday && (
            <span className="text-xs font-medium text-cosmic-purple-light">Today</span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="rounded-lg p-1.5 transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Moon phase */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-2xl">{moonPhase.emoji}</span>
        <div>
          <p className="text-sm font-medium">{moonPhase.name}</p>
          <p className="text-xs text-muted-foreground">
            {moonPhase.illumination}% illumination
          </p>
        </div>
      </div>

      {/* Events */}
      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event, idx) => (
            <div
              key={`${event.type}-${idx}`}
              className={cn(
                "rounded-lg border-l-2 bg-muted/30 px-3 py-2",
                EVENT_BORDER_COLORS[event.type]
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{event.icon}</span>
                <span className={cn("text-sm font-semibold", EVENT_TEXT_COLORS[event.type])}>
                  {event.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.description}
              </p>
              {event.startDate.getTime() !== event.endDate.getTime() && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {formatShortDate(event.startDate)} — {formatShortDate(event.endDate)}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No major cosmic events on this day. A quiet day to set your own intentions.
        </p>
      )}
    </motion.div>
  );
}

// ============================================================
// Legend
// ============================================================

function Legend() {
  const items: Array<{ type: CosmicEventType; label: string }> = [
    { type: "mercury-retrograde", label: "Mercury Rx" },
    { type: "full-moon", label: "Full Moon" },
    { type: "new-moon", label: "New Moon" },
    { type: "solar-eclipse", label: "Solar Eclipse" },
    { type: "lunar-eclipse", label: "Lunar Eclipse" },
    { type: "zodiac-season", label: "Zodiac Season" },
  ];

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.type} className="flex items-center gap-1.5">
          <EventDot type={item.type} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function CosmicCalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);
  const monthEvents = useMemo(() => getEventsForMonth(year, month), [year, month]);

  const goToPrev = useCallback(() => {
    setMonth((prevMonth) => {
      if (prevMonth === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prevMonth - 1;
    });
    setSelectedDate(null);
  }, []);

  const goToNext = useCallback(() => {
    setMonth((prevMonth) => {
      if (prevMonth === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prevMonth + 1;
    });
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(null);
  }, [today]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(monthEvents, selectedDate);
  }, [selectedDate, monthEvents]);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-heading cosmic-text sm:text-4xl">
          Cosmic Calendar
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track retrogrades, eclipses, full moons, and zodiac seasons
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl border border-border p-4 sm:p-6"
        >
          {/* Month Navigation */}
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={goToPrev}
              aria-label="Previous month"
              className="rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold font-heading">
                {MONTH_NAMES[month]} {year}
              </h2>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={goToNext}
              aria-label="Next month"
              className="rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px mb-px">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-px">
            {calendarDays.map(({ date, inMonth }, idx) => {
              const dayEvents = getEventsForDate(monthEvents, date);
              const isToday_ = isSameDay(date, today);
              const isSelected = selectedDate
                ? isSameDay(date, selectedDate)
                : false;

              // Check if date is in a Mercury retrograde range (for background tint)
              const inRetrograde = dayEvents.some(
                (e) => e.type === "mercury-retrograde"
              );

              return (
                <button
                  key={idx}
                  onClick={() =>
                    setSelectedDate(
                      isSelected ? null : date
                    )
                  }
                  aria-label={`${date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}${dayEvents.length > 0 ? `, ${dayEvents.length} cosmic event${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[72px] transition-all duration-150",
                    inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/30",
                    inRetrograde && inMonth && "bg-red-500/5",
                    isToday_ &&
                      "ring-2 ring-cosmic-purple/50",
                    isSelected &&
                      "bg-cosmic-purple/15 ring-2 ring-cosmic-purple",
                    !isSelected &&
                      inMonth &&
                      "hover:bg-muted/60"
                  )}
                >
                  {/* Day number + moon phase */}
                  <div className="flex w-full items-center justify-between px-0.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isToday_ &&
                          "flex h-6 w-6 items-center justify-center rounded-full bg-cosmic-purple text-white text-xs"
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {inMonth && <MoonPhaseIndicator date={date} />}
                  </div>

                  {/* Event dots */}
                  {dayEvents.length > 0 && inMonth && (
                    <div className="flex flex-wrap items-center justify-center gap-0.5 mt-auto">
                      {dayEvents.slice(0, 4).map((event, i) => (
                        <EventDot key={`${event.type}-${i}`} type={event.type} />
                      ))}
                      {dayEvents.length > 4 && (
                        <span className="text-[8px] text-muted-foreground">
                          +{dayEvents.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border">
            <Legend />
          </div>
        </motion.div>

        {/* Detail Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <EventDetailPanel
                key={selectedDate.toISOString()}
                date={selectedDate}
                events={selectedEvents}
                onClose={() => setSelectedDate(null)}
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-xl border border-border p-5"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Upcoming Events
                </h3>
                <div className="space-y-2.5">
                  {monthEvents
                    .filter(
                      (e) =>
                        e.type !== "mercury-retrograde" &&
                        e.type !== "zodiac-season"
                    )
                    .slice(0, 6)
                    .map((event, idx) => (
                      <button
                        key={`${event.type}-${idx}`}
                        onClick={() => setSelectedDate(event.startDate)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/60"
                      >
                        <span className="text-base">{event.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-xs font-medium truncate",
                              EVENT_TEXT_COLORS[event.type]
                            )}
                          >
                            {event.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatShortDate(event.startDate)}
                          </p>
                        </div>
                        <EventDot type={event.type} />
                      </button>
                    ))}
                  {monthEvents.filter(
                    (e) =>
                      e.type !== "mercury-retrograde" &&
                      e.type !== "zodiac-season"
                  ).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No point events this month.
                    </p>
                  )}
                </div>

                {/* Mercury retrograde banner if active in month */}
                {monthEvents.some(
                  (e) => e.type === "mercury-retrograde"
                ) && (
                  <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                    <p className="text-xs font-medium text-red-400 flex items-center gap-1.5">
                      <span>{"\u263F"}</span>
                      Mercury Retrograde
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {monthEvents
                        .filter((e) => e.type === "mercury-retrograde")
                        .map(
                          (e) =>
                            `${formatShortDate(e.startDate)} - ${formatShortDate(e.endDate)}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                )}

                <p className="mt-4 text-xs text-muted-foreground/60">
                  Click on a day to see details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
