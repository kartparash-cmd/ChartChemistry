/**
 * OpenAI integration for ChartChemistry.
 *
 * Used for high-volume, cost-sensitive features:
 *   - chatWithAstrologer()
 *   - generateDailyHoroscope()
 *   - explainChartElement()
 *   - generateWellnessSuggestions()
 *
 * Premium report generation stays on Claude Sonnet (src/lib/claude.ts).
 */

import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30_000,
    });
  }
  return _openai;
}

export const OPENAI_MODEL = "gpt-4.1-nano";
