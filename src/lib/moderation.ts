/**
 * Lightweight content moderation for user and AI messages.
 *
 * This is a first-pass keyword/pattern filter — not a comprehensive system.
 * Designed to avoid over-filtering: astrology users routinely discuss
 * emotional topics, relationship pain, breakups, grief, etc.
 */

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Pattern categories — each pattern is case-insensitive
// ---------------------------------------------------------------------------

/** Explicit, direct threats of violence against specific people */
const VIOLENCE_PATTERNS = [
  /\b(i('m| am) going to|i('ll| will)|gonna|planning to)\s+(kill|murder|shoot|stab|attack|bomb)\b/i,
  /\b(how to|ways to)\s+(kill|murder|poison|assassinate)\s+(someone|a person|my|him|her|them)\b/i,
  /\bkill\s+(myself|yourself|himself|herself|themselves)\b/i,
];

/** Self-harm indicators — only match clear, direct statements */
const SELF_HARM_PATTERNS = [
  /\b(i('m| am) going to|i('ll| will)|gonna|planning to|want to|i want to)\s+(end my life|kill myself|commit suicide)\b/i,
  /\b(how to|best way to)\s+(commit suicide|end my life|hurt myself)\b/i,
  /\bsuicidal\s+(plan|ideation|thoughts)\b/i,
];

/** Requests for help with clearly illegal activities */
const ILLEGAL_ACTIVITY_PATTERNS = [
  /\b(how to|help me|teach me to)\s+(make|build|create|manufacture)\s+(a bomb|explosives|meth|drugs)\b/i,
  /\b(how to|help me)\s+(hack|break into|steal from)\s+(a bank|someone('s)?)\b/i,
  /\b(how to|where to)\s+(buy|get|find)\s+(child\s+porn|illegal\s+drugs|weapons)\b/i,
];

/** Extreme hate speech — slurs + dehumanizing calls to action */
const HATE_SPEECH_PATTERNS = [
  /\b(all|every)\s+(jews|muslims|blacks|whites|gays|immigrants)\s+(should|must|need to)\s+(die|be killed|be eliminated)\b/i,
  /\bgenocide\s+(is|was)\s+(good|necessary|needed)\b/i,
];

// ---------------------------------------------------------------------------
// Aggregate patterns with their categories
// ---------------------------------------------------------------------------

const MODERATION_RULES: { patterns: RegExp[]; category: string }[] = [
  { patterns: VIOLENCE_PATTERNS, category: "violence" },
  { patterns: SELF_HARM_PATTERNS, category: "self-harm" },
  { patterns: ILLEGAL_ACTIVITY_PATTERNS, category: "illegal-activity" },
  { patterns: HATE_SPEECH_PATTERNS, category: "hate-speech" },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check user input for obviously harmful content.
 * Returns `{ safe: true }` for acceptable messages, or
 * `{ safe: false, reason }` when content is flagged.
 */
export function moderateContent(text: string): ModerationResult {
  for (const rule of MODERATION_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return { safe: false, reason: rule.category };
      }
    }
  }
  return { safe: true };
}

/**
 * Light output moderation for AI responses (defense-in-depth).
 * Checks that the AI hasn't produced content with explicit instructions
 * for violence, self-harm, or illegal activity.
 */
export function moderateOutput(text: string): ModerationResult {
  // Re-use the same patterns — if the AI somehow echoes harmful content,
  // catch it. We skip self-harm patterns for output since the AI may
  // legitimately reference crisis resources.
  const outputRules = MODERATION_RULES.filter(
    (r) => r.category !== "self-harm"
  );

  for (const rule of outputRules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return { safe: false, reason: rule.category };
      }
    }
  }
  return { safe: true };
}

/**
 * The gentle response returned when user content is flagged.
 */
export const MODERATION_RESPONSE =
  "I want to make sure you get the right support. " +
  "If you're in crisis, please reach out to the 988 Suicide & Crisis Lifeline (call or text 988), " +
  "the Crisis Text Line (text HOME to 741741), or your local emergency services. " +
  "For astrology questions, I'm here to help — feel free to ask me anything about your chart!";
