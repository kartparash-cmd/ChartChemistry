import { describe, it, expect } from "vitest";
import { ACHIEVEMENTS, type AchievementDef } from "@/lib/achievement-defs";

// Valid Lucide icon names used in the project
const VALID_LUCIDE_ICONS = [
  "Star",
  "Heart",
  "Flame",
  "Trophy",
  "Crown",
  "Shield",
  "Sparkles",
  "Sun",
  "Moon",
  "Zap",
  "Award",
  "Medal",
  "Target",
  "Gift",
  "Gem",
  "Rocket",
  "Check",
  "CircleCheck",
  "MessageCircle",
  "HeartPulse",
  "Share2",
  "UserPlus",
  "Search",
  "Compass",
  "StarHalf",
  "Users",
  "GraduationCap",
  "Eclipse",
  "Network",
];

describe("Achievement Definitions", () => {
  const originalKeys = [
    "FIRST_CHART",
    "FIRST_COMPATIBILITY",
    "STREAK_7",
    "STREAK_30",
    "PREMIUM_MEMBER",
  ];

  const allExpectedKeys = [
    ...originalKeys,
    "FIRST_HOROSCOPE",
    "FIRST_CHAT",
    "FIRST_CHECKIN",
    "SHARED_REPORT",
    "REFERRED_FRIEND",
    "FIVE_REPORTS",
    "TEN_REPORTS",
    "STREAK_3",
    "STREAK_14",
    "STREAK_60",
    "STREAK_100",
    "FIVE_PROFILES",
    "LEARNED_ALL",
    "COSMIC_EVENT",
    "THREE_REFERRALS",
  ];

  it("defines exactly 20 achievements", () => {
    expect(Object.keys(ACHIEVEMENTS)).toHaveLength(20);
  });

  it("contains all expected achievement keys", () => {
    for (const key of allExpectedKeys) {
      expect(ACHIEVEMENTS).toHaveProperty(key);
    }
  });

  it.each(allExpectedKeys)("%s has name, description, and icon fields", (key) => {
    const achievement: AchievementDef = ACHIEVEMENTS[key];
    expect(achievement.name).toBeDefined();
    expect(typeof achievement.name).toBe("string");
    expect(achievement.name.length).toBeGreaterThan(0);

    expect(achievement.description).toBeDefined();
    expect(typeof achievement.description).toBe("string");
    expect(achievement.description.length).toBeGreaterThan(0);

    expect(achievement.icon).toBeDefined();
    expect(typeof achievement.icon).toBe("string");
    expect(achievement.icon.length).toBeGreaterThan(0);
  });

  it.each(allExpectedKeys)("%s has a valid Lucide icon name", (key) => {
    const achievement: AchievementDef = ACHIEVEMENTS[key];
    expect(VALID_LUCIDE_ICONS).toContain(achievement.icon);
  });

  it("FIRST_CHART has expected values", () => {
    expect(ACHIEVEMENTS.FIRST_CHART.name).toBe("First Chart");
    expect(ACHIEVEMENTS.FIRST_CHART.icon).toBe("Star");
  });

  it("FIRST_COMPATIBILITY has expected values", () => {
    expect(ACHIEVEMENTS.FIRST_COMPATIBILITY.name).toBe("Cosmic Connection");
    expect(ACHIEVEMENTS.FIRST_COMPATIBILITY.icon).toBe("Heart");
  });

  it("STREAK_7 has expected values", () => {
    expect(ACHIEVEMENTS.STREAK_7.name).toBe("Week Warrior");
    expect(ACHIEVEMENTS.STREAK_7.icon).toBe("Flame");
  });

  it("STREAK_30 has expected values", () => {
    expect(ACHIEVEMENTS.STREAK_30.name).toBe("Monthly Maven");
    expect(ACHIEVEMENTS.STREAK_30.icon).toBe("Trophy");
  });

  it("PREMIUM_MEMBER has expected values", () => {
    expect(ACHIEVEMENTS.PREMIUM_MEMBER.name).toBe("Constellation Club");
    expect(ACHIEVEMENTS.PREMIUM_MEMBER.icon).toBe("Crown");
  });
});
