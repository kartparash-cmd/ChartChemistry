"""
Astrological constants for ChartChemistry.

Defines planets, signs, aspects, elements, modalities, orbs,
and scoring dimension weights used throughout the service.
"""

import os

import swisseph as swe

# ---------------------------------------------------------------------------
# Configure Swiss Ephemeris path at import time so all calculation modules
# that import from constants will have it set before any calc_ut calls.
# ---------------------------------------------------------------------------
_EPHE_PATH = os.getenv("EPHE_PATH", "")
if not _EPHE_PATH:
    _bundled = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ephe"
    )
    if os.path.isdir(_bundled):
        _EPHE_PATH = _bundled
if _EPHE_PATH:
    swe.set_ephe_path(_EPHE_PATH)

# ---------------------------------------------------------------------------
# Planet definitions — key is the display name, value is the swisseph body ID
# ---------------------------------------------------------------------------
PLANETS: dict[str, int] = {
    "Sun": swe.SUN,            # 0
    "Moon": swe.MOON,          # 1
    "Mercury": swe.MERCURY,    # 2
    "Venus": swe.VENUS,        # 3
    "Mars": swe.MARS,          # 4
    "Jupiter": swe.JUPITER,    # 5
    "Saturn": swe.SATURN,      # 6
    "Uranus": swe.URANUS,      # 7
    "Neptune": swe.NEPTUNE,    # 8
    "Pluto": swe.PLUTO,        # 9
    "North Node": swe.MEAN_NODE,   # 11 (mean node)
    "Chiron": 15,              # Chiron
    "Lilith": swe.MEAN_APOG,  # 13 (mean Black Moon Lilith)
}

# Planets used for aspect calculations (exclude nodes / minor bodies optionally)
ASPECT_PLANETS: list[str] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    "North Node", "Chiron",
]

# ---------------------------------------------------------------------------
# Zodiac signs
# ---------------------------------------------------------------------------
SIGNS: list[str] = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

# ---------------------------------------------------------------------------
# Elements
# ---------------------------------------------------------------------------
ELEMENTS: dict[str, str] = {
    "Aries": "Fire",    "Leo": "Fire",       "Sagittarius": "Fire",
    "Taurus": "Earth",  "Virgo": "Earth",    "Capricorn": "Earth",
    "Gemini": "Air",    "Libra": "Air",      "Aquarius": "Air",
    "Cancer": "Water",  "Scorpio": "Water",  "Pisces": "Water",
}

# ---------------------------------------------------------------------------
# Modalities
# ---------------------------------------------------------------------------
MODALITIES: dict[str, str] = {
    "Aries": "Cardinal",   "Cancer": "Cardinal",
    "Libra": "Cardinal",   "Capricorn": "Cardinal",
    "Taurus": "Fixed",     "Leo": "Fixed",
    "Scorpio": "Fixed",    "Aquarius": "Fixed",
    "Gemini": "Mutable",   "Virgo": "Mutable",
    "Sagittarius": "Mutable", "Pisces": "Mutable",
}

# ---------------------------------------------------------------------------
# Aspects and their orbs
# ---------------------------------------------------------------------------
ASPECTS: dict[str, dict] = {
    "conjunction": {"angle": 0.0,   "orb": 8.0},
    "sextile":     {"angle": 60.0,  "orb": 6.0},
    "square":      {"angle": 90.0,  "orb": 7.0},
    "trine":       {"angle": 120.0, "orb": 8.0},
    "opposition":  {"angle": 180.0, "orb": 8.0},
}

# ---------------------------------------------------------------------------
# House systems recognized by swisseph
# ---------------------------------------------------------------------------
HOUSE_SYSTEMS: dict[str, bytes] = {
    "placidus":   b"P",
    "whole_sign": b"W",
    "koch":       b"K",
    "equal":      b"E",
    "campanus":   b"C",
    "regiomontanus": b"R",
}

# ---------------------------------------------------------------------------
# Scoring — planet pair definitions per dimension
# ---------------------------------------------------------------------------
# Each entry is a set of (planet1, planet2) tuples that contribute to a
# dimension score. Aspects found between these pairs are weighted.
DIMENSION_PLANET_PAIRS: dict[str, list[tuple[str, str]]] = {
    "emotional": [
        ("Moon", "Moon"),
        ("Moon", "Venus"),
        ("Moon", "Sun"),
        ("Venus", "Moon"),
        ("Sun", "Moon"),
    ],
    "chemistry": [
        ("Venus", "Mars"),
        ("Mars", "Venus"),
        ("Mars", "Mars"),
        ("Venus", "Venus"),
    ],
    "communication": [
        ("Mercury", "Mercury"),
        ("Mercury", "Sun"),
        ("Mercury", "Moon"),
        ("Sun", "Mercury"),
        ("Moon", "Mercury"),
    ],
    "stability": [
        ("Saturn", "Sun"),
        ("Saturn", "Moon"),
        ("Jupiter", "Saturn"),
        ("Sun", "Saturn"),
        ("Moon", "Saturn"),
        ("Saturn", "Jupiter"),
    ],
    "conflict": [
        ("Mars", "Mars"),
        ("Mars", "Saturn"),
        ("Mars", "Moon"),
        ("Saturn", "Mars"),
        ("Moon", "Mars"),
    ],
}

# ---------------------------------------------------------------------------
# Scoring — aspect weights per dimension
# ---------------------------------------------------------------------------
DIMENSION_WEIGHTS: dict[str, dict[str, int]] = {
    "emotional": {
        "conjunction": 10,
        "trine": 8,
        "sextile": 6,
        "square": -3,
        "opposition": -1,
    },
    "chemistry": {
        "conjunction": 10,
        "trine": 7,
        "sextile": 5,
        "square": 2,
        "opposition": 4,
    },
    "communication": {
        "conjunction": 8,
        "trine": 7,
        "sextile": 6,
        "square": -4,
        "opposition": -2,
    },
    "stability": {
        "conjunction": 6,
        "trine": 8,
        "sextile": 7,
        "square": -5,
        "opposition": -3,
    },
    "conflict": {
        "conjunction": -2,
        "trine": 8,
        "sextile": 7,
        "square": -6,
        "opposition": -4,
    },
}

# ---------------------------------------------------------------------------
# Overall compatibility — dimension weights (must sum to 1.0)
# ---------------------------------------------------------------------------
OVERALL_WEIGHTS: dict[str, float] = {
    "emotional": 0.25,
    "chemistry": 0.20,
    "communication": 0.20,
    "stability": 0.20,
    "conflict": 0.15,
}

# ---------------------------------------------------------------------------
# Transit keywords for interpretive output
# ---------------------------------------------------------------------------
TRANSIT_KEYWORDS: dict[str, dict[str, str]] = {
    "Sun": {
        "conjunction": "spotlight, vitality, new beginnings",
        "sextile": "opportunity, creative flow",
        "square": "tension, growth challenge",
        "trine": "harmony, ease, confidence",
        "opposition": "awareness, balance needed",
    },
    "Moon": {
        "conjunction": "emotional intensity, sensitivity",
        "sextile": "emotional ease, nurturing",
        "square": "emotional tension, mood shifts",
        "trine": "emotional harmony, comfort",
        "opposition": "emotional awareness, relationships",
    },
    "Mercury": {
        "conjunction": "mental focus, communication",
        "sextile": "ideas, learning, connections",
        "square": "mental stress, miscommunication",
        "trine": "clarity, eloquence, insight",
        "opposition": "perspective shift, debate",
    },
    "Venus": {
        "conjunction": "love, beauty, attraction",
        "sextile": "social ease, pleasure",
        "square": "relationship tension, indulgence",
        "trine": "romance, harmony, creativity",
        "opposition": "relationship awareness, compromise",
    },
    "Mars": {
        "conjunction": "energy, drive, initiation",
        "sextile": "productive energy, motivation",
        "square": "frustration, conflict, impulsiveness",
        "trine": "confidence, action, courage",
        "opposition": "confrontation, competition",
    },
    "Jupiter": {
        "conjunction": "expansion, luck, abundance",
        "sextile": "growth opportunity, optimism",
        "square": "overextension, excess",
        "trine": "blessings, wisdom, generosity",
        "opposition": "overconfidence, philosophical tension",
    },
    "Saturn": {
        "conjunction": "discipline, restructuring, responsibility",
        "sextile": "steady progress, maturity",
        "square": "restriction, hard lessons, delays",
        "trine": "stability, achievement, mastery",
        "opposition": "accountability, reality check",
    },
    "Uranus": {
        "conjunction": "sudden change, awakening, liberation",
        "sextile": "innovation, exciting developments",
        "square": "disruption, restlessness, breakthroughs",
        "trine": "positive change, originality",
        "opposition": "upheaval, freedom vs. security",
    },
    "Neptune": {
        "conjunction": "inspiration, confusion, spirituality",
        "sextile": "imagination, intuition, compassion",
        "square": "illusion, deception, escapism",
        "trine": "creativity, spiritual growth, empathy",
        "opposition": "disillusionment, clarity emerging",
    },
    "Pluto": {
        "conjunction": "transformation, power, rebirth",
        "sextile": "empowerment, deep insight",
        "square": "power struggle, compulsion, crisis",
        "trine": "regeneration, influence, depth",
        "opposition": "confrontation with shadow, letting go",
    },
}
