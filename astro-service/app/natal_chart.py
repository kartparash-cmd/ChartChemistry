"""
Natal chart calculation engine.

Computes planetary positions, house cusps, aspects, element/modality balance,
and dominant planet for a given birth date, time, and location.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

import pytz
import swisseph as swe

from app.constants import (
    ASPECTS,
    ASPECT_PLANETS,
    ELEMENTS,
    HOUSE_SYSTEMS,
    MODALITIES,
    PLANETS,
    SIGNS,
)
from app.models import (
    Aspect,
    ElementBalance,
    HouseCusp,
    ModalityBalance,
    NatalChartRequest,
    NatalChartResponse,
    PlanetPosition,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_julian_day(
    date_str: str,
    time_str: Optional[str],
    timezone: str,
) -> tuple[float, bool]:
    """Convert date/time + timezone to Julian Day (UT).

    Returns (julian_day, birth_time_known).
    """
    tz = pytz.timezone(timezone)

    if time_str:
        dt_local = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        birth_time_known = True
    else:
        # Default to noon local time when birth time is unknown
        dt_local = datetime.strptime(f"{date_str} 12:00", "%Y-%m-%d %H:%M")
        birth_time_known = False

    dt_local = tz.localize(dt_local)
    dt_utc = dt_local.astimezone(pytz.utc)

    jd = swe.julday(
        dt_utc.year,
        dt_utc.month,
        dt_utc.day,
        dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0,
    )
    return jd, birth_time_known


def _longitude_to_sign(longitude: float) -> tuple[str, int, int]:
    """Convert ecliptic longitude to sign, degree, minute."""
    sign_index = int(longitude // 30)
    remainder = longitude - sign_index * 30
    degree = int(remainder)
    minute = int((remainder - degree) * 60)
    return SIGNS[sign_index], degree, minute


def _normalize_angle(angle: float) -> float:
    """Normalize an angle to 0-360."""
    return angle % 360.0


def _angular_distance(lon1: float, lon2: float) -> float:
    """Shortest angular distance between two longitudes."""
    diff = abs(lon1 - lon2) % 360.0
    if diff > 180.0:
        diff = 360.0 - diff
    return diff


def _find_house(longitude: float, house_cusps: list[float]) -> int:
    """Determine which house a planet falls in given 12 house cusp longitudes."""
    for i in range(12):
        cusp_start = house_cusps[i]
        cusp_end = house_cusps[(i + 1) % 12]

        if cusp_start < cusp_end:
            if cusp_start <= longitude < cusp_end:
                return i + 1
        else:
            # Wraps around 0 Aries
            if longitude >= cusp_start or longitude < cusp_end:
                return i + 1

    return 1  # fallback


# ---------------------------------------------------------------------------
# Core calculation
# ---------------------------------------------------------------------------

def calculate_planet_positions(
    jd: float,
    house_cusps: Optional[list[float]] = None,
) -> list[PlanetPosition]:
    """Calculate positions for all defined planets."""
    positions: list[PlanetPosition] = []

    for name, planet_id in PLANETS.items():
        try:
            # Try Swiss Ephemeris files first; fall back to Moshier
            # (Moshier is built-in and needs no external files).
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

            house = None
            if house_cusps is not None:
                house = _find_house(longitude, house_cusps)

            positions.append(PlanetPosition(
                planet=name,
                longitude=longitude,
                sign=sign,
                degree=degree,
                minute=minute,
                retrograde=retrograde,
                house=house,
            ))
        except Exception:
            logger.exception("Failed to calculate position for %s (id=%s)", name, planet_id)

    return positions


def calculate_house_cusps(
    jd: float,
    latitude: float,
    longitude: float,
    house_system: str = "placidus",
) -> list[HouseCusp]:
    """Calculate 12 house cusps."""
    system_code = HOUSE_SYSTEMS.get(house_system, b"P")

    cusps, _ascmc = swe.houses(jd, latitude, longitude, system_code)

    house_cusp_list: list[HouseCusp] = []
    for i, cusp_lon in enumerate(cusps):
        sign, degree, minute = _longitude_to_sign(cusp_lon)
        house_cusp_list.append(HouseCusp(
            house=i + 1,
            sign=sign,
            degree=degree,
            minute=minute,
            longitude=cusp_lon,
        ))

    return house_cusp_list


def calculate_aspects(
    positions: list[PlanetPosition],
    planets_subset: Optional[list[str]] = None,
) -> list[Aspect]:
    """Calculate aspects between planet pairs.

    If ``planets_subset`` is provided, only those planet names are considered.
    """
    if planets_subset is None:
        planets_subset = ASPECT_PLANETS

    filtered = [p for p in positions if p.planet in planets_subset]
    aspects: list[Aspect] = []

    for i, p1 in enumerate(filtered):
        for p2 in filtered[i + 1:]:
            dist = _angular_distance(p1.longitude, p2.longitude)

            for aspect_name, aspect_info in ASPECTS.items():
                target = aspect_info["angle"]
                orb = aspect_info["orb"]
                diff = abs(dist - target)

                if diff <= orb:
                    # Determine applying vs. separating (simplified)
                    applying = _is_applying(p1.longitude, p2.longitude, target)
                    aspects.append(Aspect(
                        planet1=p1.planet,
                        planet2=p2.planet,
                        aspect=aspect_name,
                        angle=round(dist, 2),
                        orb=round(diff, 2),
                        applying=applying,
                    ))
                    break  # Only strongest (tightest) aspect per pair

    return aspects


def _is_applying(lon1: float, lon2: float, target_angle: float) -> bool:
    """Simplified applying check — true if the current angular distance
    is less than the exact aspect angle (planets still approaching)."""
    dist = _angular_distance(lon1, lon2)
    return dist < target_angle if target_angle > 0 else dist < 1.0


def calculate_element_balance(positions: list[PlanetPosition]) -> ElementBalance:
    """Count planets per element (Sun through Pluto only)."""
    core = [
        "Sun", "Moon", "Mercury", "Venus", "Mars",
        "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    ]
    counts = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
    for p in positions:
        if p.planet in core:
            element = ELEMENTS.get(p.sign)
            if element:
                counts[element] += 1

    return ElementBalance(
        fire=counts["Fire"],
        earth=counts["Earth"],
        air=counts["Air"],
        water=counts["Water"],
    )


def calculate_modality_balance(positions: list[PlanetPosition]) -> ModalityBalance:
    """Count planets per modality (Sun through Pluto only)."""
    core = [
        "Sun", "Moon", "Mercury", "Venus", "Mars",
        "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    ]
    counts = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}
    for p in positions:
        if p.planet in core:
            modality = MODALITIES.get(p.sign)
            if modality:
                counts[modality] += 1

    return ModalityBalance(
        cardinal=counts["Cardinal"],
        fixed=counts["Fixed"],
        mutable=counts["Mutable"],
    )


def calculate_dominant_planet(
    positions: list[PlanetPosition],
    aspects: list[Aspect],
) -> str:
    """Determine the dominant planet via a simple scoring system.

    Scoring heuristic:
      - Sun/Moon in own sign: +3
      - Each aspect the planet participates in: +1
      - Personal planets (Sun-Mars) get a +1 base weight
      - Planet ruling the Ascendant sign (if available): +3
    """
    personal = {"Sun", "Moon", "Mercury", "Venus", "Mars"}
    # Rulerships (traditional + modern)
    rulerships: dict[str, str] = {
        "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
        "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
        "Libra": "Venus", "Scorpio": "Pluto", "Sagittarius": "Jupiter",
        "Capricorn": "Saturn", "Aquarius": "Uranus", "Pisces": "Neptune",
    }

    scores: dict[str, int] = {p.planet: 0 for p in positions}

    for p in positions:
        if p.planet in personal:
            scores[p.planet] += 1
        # Dignity: planet rules its sign
        if rulerships.get(p.sign) == p.planet:
            scores[p.planet] += 3

    for asp in aspects:
        if asp.planet1 in scores:
            scores[asp.planet1] += 1
        if asp.planet2 in scores:
            scores[asp.planet2] += 1

    if not scores:
        return "Sun"

    return max(scores, key=lambda k: scores[k])


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def compute_natal_chart(req: NatalChartRequest) -> NatalChartResponse:
    """Full natal chart calculation pipeline."""
    jd, birth_time_known = _to_julian_day(req.birth_date, req.birth_time, req.timezone)

    house_cusps_raw: Optional[list[float]] = None
    houses: Optional[list[HouseCusp]] = None
    house_system_used: Optional[str] = None

    if birth_time_known:
        houses = calculate_house_cusps(jd, req.latitude, req.longitude, req.house_system)
        house_cusps_raw = [h.longitude for h in houses]
        house_system_used = req.house_system

    positions = calculate_planet_positions(jd, house_cusps_raw)
    aspects = calculate_aspects(positions)
    element_balance = calculate_element_balance(positions)
    modality_balance = calculate_modality_balance(positions)
    dominant = calculate_dominant_planet(positions, aspects)

    return NatalChartResponse(
        planets=positions,
        houses=houses,
        aspects=aspects,
        elementBalance=element_balance,
        modalityBalance=modality_balance,
        dominantPlanet=dominant,
        birthTimeKnown=birth_time_known,
        houseSystem=house_system_used,
    )
