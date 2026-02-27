"""
Transit calculation engine.

Computes current planetary positions for a given date and calculates
aspects to natal chart positions, with interpretive keywords.
"""

from __future__ import annotations

import logging
from datetime import datetime

import pytz
import swisseph as swe

from app.constants import (
    ASPECTS,
    PLANETS,
    TRANSIT_KEYWORDS,
)
from app.models import (
    NatalChartRequest,
    PlanetPosition,
    TransitAspect,
    TransitResponse,
)
from app.natal_chart import (
    _angular_distance,
    _longitude_to_sign,
    _normalize_angle,
    compute_natal_chart,
)

logger = logging.getLogger(__name__)

# Planets used for transit calculations (outer planets are most important,
# but we include all for completeness)
TRANSIT_PLANETS: list[str] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
]

# Natal planets that receive transit aspects
NATAL_RECEIVING_PLANETS: list[str] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    "North Node", "Chiron",
]


def _transit_julian_day(date_str: str) -> float:
    """Convert a date string to Julian Day at noon UT."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return swe.julday(dt.year, dt.month, dt.day, 12.0)


def _compute_transit_positions(jd: float) -> list[PlanetPosition]:
    """Calculate planetary positions at the transit date."""
    positions: list[PlanetPosition] = []

    for name in TRANSIT_PLANETS:
        planet_id = PLANETS[name]
        try:
            flags = swe.FLG_SWIEPH | swe.FLG_SPEED
            try:
                result, _ret_flags = swe.calc_ut(jd, planet_id, flags)
            except swe.Error:
                flags = swe.FLG_MOSEPH | swe.FLG_SPEED
                result, _ret_flags = swe.calc_ut(jd, planet_id, flags)

            longitude = _normalize_angle(result[0])
            speed = result[3]
            retrograde = speed < 0
            sign, degree, minute = _longitude_to_sign(longitude)

            positions.append(PlanetPosition(
                planet=name,
                longitude=longitude,
                sign=sign,
                degree=degree,
                minute=minute,
                retrograde=retrograde,
                house=None,
            ))
        except Exception:
            logger.exception("Failed to calculate transit position for %s", name)

    return positions


def _compute_transit_aspects(
    transit_positions: list[PlanetPosition],
    natal_positions: list[PlanetPosition],
) -> list[TransitAspect]:
    """Calculate aspects from transiting planets to natal planets."""
    natal_filtered = [p for p in natal_positions if p.planet in NATAL_RECEIVING_PLANETS]
    aspects: list[TransitAspect] = []

    for tp in transit_positions:
        for np in natal_filtered:
            dist = _angular_distance(tp.longitude, np.longitude)

            for aspect_name, aspect_info in ASPECTS.items():
                target = aspect_info["angle"]
                orb = aspect_info["orb"]
                diff = abs(dist - target)

                # Use tighter orbs for transits (60% of natal orb)
                transit_orb = orb * 0.6
                if diff <= transit_orb:
                    keywords = _get_keywords(tp.planet, aspect_name)
                    aspects.append(TransitAspect(
                        transitingPlanet=tp.planet,
                        natalPlanet=np.planet,
                        aspect=aspect_name,
                        orb=round(diff, 2),
                        keywords=keywords,
                    ))
                    break

    return aspects


def _get_keywords(planet: str, aspect: str) -> str:
    """Get interpretive keywords for a transiting planet + aspect type."""
    planet_keywords = TRANSIT_KEYWORDS.get(planet, {})
    return planet_keywords.get(aspect, "")


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def compute_transits(
    natal_req: NatalChartRequest,
    transit_date: str,
) -> TransitResponse:
    """Full transit calculation pipeline."""
    natal_chart = compute_natal_chart(natal_req)

    jd = _transit_julian_day(transit_date)
    transit_positions = _compute_transit_positions(jd)
    transit_aspects = _compute_transit_aspects(transit_positions, natal_chart.planets)

    return TransitResponse(
        date=transit_date,
        transitingPositions=transit_positions,
        aspectsToNatal=transit_aspects,
    )
