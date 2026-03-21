import { describe, it, expect } from "vitest";
import { classifyConversation, extractSynastryHighlights } from "@/lib/claude";
import type { SynastryResult, Aspect } from "@/types/astrology";

describe("classifyConversation", () => {
  const dummyResponse = "That's a great question about your chart.";

  it('identifies "relationship" topic', () => {
    const result = classifyConversation(
      "How compatible am I with my partner?",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("relationship");
  });

  it('identifies "relationship" for love-related queries', () => {
    const result = classifyConversation(
      "Will my dating life improve?",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("relationship");
  });

  it('identifies "chart_education" topic', () => {
    const result = classifyConversation(
      "What does my moon sign mean?",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("chart_education");
  });

  it('identifies "chart_education" for planet queries', () => {
    const result = classifyConversation(
      "Tell me about venus in my chart",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("chart_education");
  });

  it('identifies "timing" topic', () => {
    const result = classifyConversation(
      "When is the next retrograde?",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("timing");
  });

  it('identifies "timing" for transit queries', () => {
    const result = classifyConversation(
      "What transits are affecting me today?",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("timing");
  });

  it('identifies "conflict" topic', () => {
    const result = classifyConversation(
      "We always argue and fight about money",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("conflict");
  });

  it('identifies "wellness" topic', () => {
    const result = classifyConversation(
      "How will my career and finances look this year?",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("wellness");
  });

  it('defaults to "general" for unknown topics', () => {
    const result = classifyConversation(
      "Hello, nice to meet you!",
      dummyResponse,
      false,
      false
    );
    expect(result.topic).toBe("general");
  });

  it("detects positive sentiment from AI response", () => {
    const result = classifyConversation(
      "How is my chart?",
      "Your chart is wonderful and shows a beautiful alignment with strong harmony.",
      false,
      false
    );
    expect(result.sentiment).toBe("positive");
  });

  it("detects negative sentiment from AI response", () => {
    const result = classifyConversation(
      "How is my chart?",
      "There is some tension and challenge in this area. Be careful and mindful of friction.",
      false,
      false
    );
    expect(result.sentiment).toBe("negative");
  });

  it("detects neutral sentiment when no strong words present", () => {
    const result = classifyConversation(
      "Hello",
      "Hello! I'm Marie, your personal astrologer.",
      false,
      false
    );
    expect(result.sentiment).toBe("neutral");
  });

  it('identifies "how" question type', () => {
    const result = classifyConversation(
      "how do I read my birth chart?",
      dummyResponse,
      false,
      false
    );
    expect(result.questionType).toBe("how");
  });

  it('identifies "why" question type', () => {
    const result = classifyConversation(
      "why is my Venus in retrograde important?",
      dummyResponse,
      false,
      false
    );
    expect(result.questionType).toBe("why");
  });

  it('identifies "what" question type', () => {
    const result = classifyConversation(
      "what does my rising sign mean?",
      dummyResponse,
      false,
      false
    );
    expect(result.questionType).toBe("what");
  });

  it('identifies "explain" question type', () => {
    const result = classifyConversation(
      "explain the significance of Jupiter in my chart",
      dummyResponse,
      false,
      false
    );
    expect(result.questionType).toBe("explain");
  });

  it('identifies "advice" question type', () => {
    const result = classifyConversation(
      "should I start a new relationship now?",
      dummyResponse,
      false,
      false
    );
    expect(result.questionType).toBe("advice");
  });

  it("returns correct metadata fields", () => {
    const userMsg = "Hello there";
    const aiResp = "Hi! Welcome to ChartChemistry.";
    const result = classifyConversation(userMsg, aiResp, true, true);

    expect(result.hasReport).toBe(true);
    expect(result.hasMemories).toBe(true);
    expect(result.messageLength).toBe(userMsg.length);
    expect(result.responseLength).toBe(aiResp.length);
    expect(result.dayOfWeek).toBeGreaterThanOrEqual(0);
    expect(result.dayOfWeek).toBeLessThanOrEqual(6);
    expect(result.hourOfDay).toBeGreaterThanOrEqual(0);
    expect(result.hourOfDay).toBeLessThanOrEqual(23);
  });

  it("passes through hasReport=false and hasMemories=false", () => {
    const result = classifyConversation("hi", "hello", false, false);
    expect(result.hasReport).toBe(false);
    expect(result.hasMemories).toBe(false);
  });
});

describe("extractSynastryHighlights", () => {
  function makeAspect(overrides: Partial<Aspect>): Aspect {
    return {
      planet1: "Sun",
      planet2: "Moon",
      aspect: "Trine",
      orb: 2.0,
      applying: true,
      ...overrides,
    };
  }

  function makeSynastry(aspects: Aspect[]): SynastryResult {
    return {
      interAspects: aspects,
      scores: {
        overall: 75,
        emotional: 80,
        chemistry: 70,
        communication: 65,
        stability: 72,
        conflict: 60,
      },
      elementCompatibility: {},
      modalityCompatibility: {},
      houseOverlays: [],
    } as unknown as SynastryResult;
  }

  it("returns up to 5 highlights", () => {
    const aspects = Array.from({ length: 10 }, (_, i) =>
      makeAspect({ planet1: "Venus", orb: i + 1 })
    );
    const result = extractSynastryHighlights(makeSynastry(aspects));
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('classifies trine as "strength"', () => {
    const synastry = makeSynastry([makeAspect({ aspect: "trine", orb: 1.0 })]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].category).toBe("strength");
  });

  it('classifies sextile as "strength"', () => {
    const synastry = makeSynastry([makeAspect({ aspect: "sextile", orb: 1.5 })]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].category).toBe("strength");
  });

  it('classifies conjunction as "strength"', () => {
    const synastry = makeSynastry([makeAspect({ aspect: "conjunction", orb: 0.5 })]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].category).toBe("strength");
  });

  it('classifies square as "challenge"', () => {
    const synastry = makeSynastry([makeAspect({ aspect: "square", orb: 1.0 })]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].category).toBe("challenge");
  });

  it('classifies opposition as "challenge"', () => {
    const synastry = makeSynastry([makeAspect({ aspect: "opposition", orb: 2.0 })]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].category).toBe("challenge");
  });

  it('classifies unknown aspect type as "dynamic"', () => {
    const synastry = makeSynastry([
      makeAspect({ aspect: "quincunx", planet1: "Venus", orb: 1.0 }),
    ]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].category).toBe("dynamic");
  });

  it("sorts by tightest orb first", () => {
    const synastry = makeSynastry([
      makeAspect({ aspect: "trine", orb: 5.0, planet1: "Venus" }),
      makeAspect({ aspect: "square", orb: 0.5, planet1: "Mars" }),
      makeAspect({ aspect: "sextile", orb: 2.0, planet1: "Moon" }),
    ]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].aspect.orb).toBe(0.5);
    expect(result[1].aspect.orb).toBe(2.0);
    expect(result[2].aspect.orb).toBe(5.0);
  });

  it("returns empty array for empty interAspects", () => {
    const synastry = makeSynastry([]);
    const result = extractSynastryHighlights(synastry);
    expect(result).toEqual([]);
  });

  it("includes description text with orb value", () => {
    const synastry = makeSynastry([makeAspect({ aspect: "trine", orb: 1.3 })]);
    const result = extractSynastryHighlights(synastry);
    expect(result[0].description).toContain("1.3");
  });

  it("prioritizes personal planets", () => {
    const synastry = makeSynastry([
      makeAspect({ planet1: "Pluto", planet2: "Neptune", aspect: "trine", orb: 0.1 }),
      makeAspect({ planet1: "Pluto", planet2: "Uranus", aspect: "sextile", orb: 0.2 }),
      makeAspect({ planet1: "Pluto", planet2: "Saturn", aspect: "conjunction", orb: 0.3 }),
      // After 3 non-personal, this personal planet one should still get in
      makeAspect({ planet1: "Venus", planet2: "Mars", aspect: "trine", orb: 4.0 }),
    ]);
    const result = extractSynastryHighlights(synastry);
    // The first 3 are non-personal (allowed up to 3), then Venus-Mars gets in
    const venusEntry = result.find((h) => h.aspect.planet1 === "Venus");
    expect(venusEntry).toBeDefined();
  });
});
