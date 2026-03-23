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
  // --- Original 5 ---
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

  // --- 15 new achievements ---
  FIRST_HOROSCOPE: {
    name: "Stargazer",
    description: "Read your first daily horoscope",
    icon: "Sun",
  },
  FIRST_CHAT: {
    name: "Cosmic Conversation",
    description: "Have your first chat with Marie",
    icon: "MessageCircle",
  },
  FIRST_CHECKIN: {
    name: "Heart Check",
    description: "Complete your first relationship check-in",
    icon: "HeartPulse",
  },
  SHARED_REPORT: {
    name: "Cosmic Messenger",
    description: "Share a compatibility report",
    icon: "Share2",
  },
  REFERRED_FRIEND: {
    name: "Star Recruiter",
    description: "Refer your first friend",
    icon: "UserPlus",
  },
  FIVE_REPORTS: {
    name: "Pattern Seeker",
    description: "Generate 5 compatibility reports",
    icon: "Search",
  },
  TEN_REPORTS: {
    name: "Cosmic Explorer",
    description: "Generate 10 compatibility reports",
    icon: "Compass",
  },
  STREAK_3: {
    name: "Spark",
    description: "Maintain a 3-day streak",
    icon: "Zap",
  },
  STREAK_14: {
    name: "Dedicated Star",
    description: "Maintain a 14-day streak",
    icon: "StarHalf",
  },
  STREAK_60: {
    name: "Celestial Guardian",
    description: "Maintain a 60-day streak",
    icon: "Shield",
  },
  STREAK_100: {
    name: "Cosmic Legend",
    description: "Maintain a 100-day streak",
    icon: "Sparkles",
  },
  FIVE_PROFILES: {
    name: "Social Butterfly",
    description: "Save 5 birth profiles",
    icon: "Users",
  },
  LEARNED_ALL: {
    name: "Astro Scholar",
    description: "Visit all 4 learning modules",
    icon: "GraduationCap",
  },
  COSMIC_EVENT: {
    name: "Eclipse Chaser",
    description: "Check in during a cosmic event (Mercury retrograde, eclipse, etc.)",
    icon: "Eclipse",
  },
  THREE_REFERRALS: {
    name: "Constellation Builder",
    description: "Refer 3 friends",
    icon: "Network",
  },
};
