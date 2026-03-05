/**
 * Achievement definitions (client-safe — no server imports).
 *
 * Shared by the dashboard UI and the server-side awarding logic.
 */

export interface AchievementDef {
  name: string;
  description: string;
  icon: string; // Lucide icon name
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  FIRST_CHART: {
    name: "First Chart",
    description: "Generated your first natal chart",
    icon: "Star",
  },
  FIRST_COMPATIBILITY: {
    name: "Cosmic Connection",
    description: "Ran your first compatibility check",
    icon: "Heart",
  },
  STREAK_7: {
    name: "Week Warrior",
    description: "7-day check-in streak",
    icon: "Flame",
  },
  STREAK_30: {
    name: "Monthly Maven",
    description: "30-day check-in streak",
    icon: "Trophy",
  },
  PREMIUM_MEMBER: {
    name: "Constellation Club",
    description: "Became a premium member",
    icon: "Crown",
  },
};
