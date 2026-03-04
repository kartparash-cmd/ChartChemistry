/**
 * TypeScript type definitions for all astrological data structures
 * used across ChartChemistry's API routes and services.
 *
 * These types mirror the Python microservice's Pydantic models
 * (astro-service/app/models.py) and define the shapes flowing
 * between the Next.js backend, the Python service, and the Claude AI layer.
 */

// ============================================================
// Natal Chart
// ============================================================

/** Supported house systems for natal chart calculation. */
export type HouseSystem =
  | "placidus"
  | "whole-sign"
  | "equal"
  | "koch"
  | "campanus"
  | "regiomontanus";

/** Display labels for each house system. */
export const HOUSE_SYSTEM_LABELS: Record<HouseSystem, string> = {
  placidus: "Placidus",
  "whole-sign": "Whole Sign",
  equal: "Equal",
  koch: "Koch",
  campanus: "Campanus",
  regiomontanus: "Regiomontanus",
};

/**
 * Map frontend house system keys to the Python astro-service's expected values.
 * The astro-service uses underscores (e.g. "whole_sign") while the frontend
 * uses hyphens (e.g. "whole-sign") for URL/localStorage friendliness.
 */
export const HOUSE_SYSTEM_TO_API: Record<HouseSystem, string> = {
  placidus: "placidus",
  "whole-sign": "whole_sign",
  equal: "equal",
  koch: "koch",
  campanus: "campanus",
  regiomontanus: "regiomontanus",
};

/** Input for natal chart calculation (sent to Python service). */
export interface NatalChartInput {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM (24h) — omit if unknown
  latitude: number;
  longitude: number;
  timezone: string; // IANA timezone, e.g. "America/New_York"
  houseSystem?: string; // placidus | whole_sign | koch | equal | campanus | regiomontanus
}

/** Position of a single celestial body. */
export interface PlanetPosition {
  planet: string;
  longitude: number; // Ecliptic longitude 0-360
  sign: string;
  degree: number; // 0-29
  minute: number; // 0-59
  retrograde: boolean;
  house: number | null; // 1-12 or null if houses not computed
}

/** A single house cusp. */
export interface HouseCusp {
  house: number; // 1-12
  sign: string;
  degree: number;
  minute: number;
  longitude: number;
}

/** An aspect between two planets. */
export interface Aspect {
  planet1: string;
  planet2: string;
  aspect: string; // conjunction, opposition, trine, square, sextile, etc.
  angle: number;
  orb: number;
  applying: boolean;
}

/** Element balance in a chart. */
export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

/** Modality balance in a chart. */
export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
}

/** Full natal chart response from Python service. */
export interface NatalChart {
  planets: PlanetPosition[];
  houses: HouseCusp[] | null;
  aspects: Aspect[];
  elementBalance: ElementBalance;
  modalityBalance: ModalityBalance;
  dominantPlanet: string;
  birthTimeKnown: boolean;
  houseSystem: string | null;
}

// ============================================================
// Synastry
// ============================================================

/** One person's planet falling in the other's house. */
export interface HouseOverlay {
  planet: string;
  planetOwner: string;
  house: number;
  houseOwner: string;
  sign: string;
}

/** Compatibility scores computed by the Python service. */
export interface CompatibilityScores {
  emotional: number; // 0-100
  chemistry: number; // 0-100
  communication: number; // 0-100
  stability: number; // 0-100
  conflict: number; // 0-100
  overall: number; // 0-100
}

/** Full synastry response from Python service. */
export interface SynastryResult {
  interAspects: Aspect[];
  houseOverlays: HouseOverlay[] | null;
  elementCompatibility: Record<string, unknown>;
  modalityCompatibility: Record<string, unknown>;
  scores: CompatibilityScores;
}

// ============================================================
// Composite
// ============================================================

/** Composite chart response from Python service. */
export interface CompositeChart {
  planets: PlanetPosition[];
  houses: HouseCusp[] | null;
  aspects: Aspect[];
  elementBalance: ElementBalance;
  modalityBalance: ModalityBalance;
}

// ============================================================
// Transits
// ============================================================

/** A transit aspect to a natal planet. */
export interface TransitAspect {
  transitingPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  keywords: string;
}

/** Transit calculation response from Python service. */
export interface TransitResult {
  date: string;
  transitingPositions: PlanetPosition[];
  aspectsToNatal: TransitAspect[];
}

// ============================================================
// API Request / Response types
// ============================================================

/** Person birth data as received from the frontend. */
export interface PersonInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  birthCity: string;
  birthCountry: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/** Request body for POST /api/compatibility (free tier). */
export interface CompatibilityRequest {
  person1: PersonInput;
  person2: PersonInput;
}

/** Response from POST /api/compatibility (free tier). */
export interface CompatibilityResponse {
  scores: CompatibilityScores;
  synastryHighlights: SynastryHighlight[];
  narrative: string;
  person1Chart: NatalChart;
  person2Chart: NatalChart;
}

/** A notable synastry aspect surfaced as a highlight. */
export interface SynastryHighlight {
  aspect: Aspect;
  description: string;
  category: "strength" | "challenge" | "dynamic";
}

/** Request body for POST /api/compatibility/full (premium). */
export interface FullCompatibilityRequest {
  person1Id: string;
  person2Id: string;
}

/** Parsed sections of a premium AI report. */
export interface PremiumReportSections {
  theBigPicture: string;
  communicationStyle: string;
  emotionalLandscape: string;
  passionAndAttraction: string;
  longTermPotential: string;
  challengeZones: string;
  cosmicAdvice: string;
}

/** Full premium report response. */
export interface FullCompatibilityResponse {
  id: string;
  scores: CompatibilityScores;
  sections: PremiumReportSections;
  redFlags: string[];
  growthAreas: string[];
  synastryData: SynastryResult;
  compositeData: CompositeChart | null;
  person1: { name: string; id: string };
  person2: { name: string; id: string };
  createdAt: string;
}

/** Request body for POST /api/chat. */
export interface ChatRequest {
  reportId?: string;
  message: string;
  sessionId?: string;
}

/** A single message in a chat conversation. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/** Response from POST /api/chat. */
export interface ChatResponse {
  reply: string;
  sessionId: string;
}

/** Request body for POST /api/profile. */
export interface CreateProfileRequest {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity: string;
  birthCountry: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isOwner?: boolean;
  houseSystem?: string;
}
