"""
Composite chart calculation engine.

Uses the midpoint method: for each planet pair, the composite position is
the shorter-arc midpoint of the two longitudes.
"""

from __future__ import annotations

import logging
from typing import Optional

from app.constants import PLANETS, SIGNS
from app.models import (
    Aspect,
    CompositeResponse,
    ElementBalance,
    HouseCusp,
    ModalityBalance,
    NatalChartRequest,
    PlanetPosition,
)
from app.natal_chart import (
    _longitude_to_sign,
    _normalize_angle,
    calculate_aspects,
    calculate_element_balance,
    calculate_house_cusps,
    calculate_modality_balance,
    compute_natal_chart,
)

logger = logging.getLogger(__name__)


def _midpoint(lon1: float, lon2: float) -> float:
    """Calculate the shorter-arc midpoint of two ecliptic longitudes.

    Always returns the midpoint on the shorter arc between the two points.
    """
    lon1 = lon1 % 360.0
    lon2 = lon2 % 360.0

    diff = (lon2 - lon1) % 360.0

    if diff <= 180.0:
        mid = lon1 + diff / 2.0
    else:
        mid = lon1 - (360.0 - diff) / 2.0

    return mid % 360.0


def compute_composite(
    req1: NatalChartRequest,
    req2: NatalChartRequest,
) -> CompositeResponse:
    """Full composite chart calculation using the midpoint method."""
    chart1 = compute_natal_chart(req1)
    chart2 = compute_natal_chart(req2)

    # Build a map from planet name to position for each chart
    pos_map1 = {p.planet: p for p in chart1.planets}
    pos_map2 = {p.planet: p for p in chart2.planets}

    composite_positions: list[PlanetPosition] = []

    for planet_name in PLANETS:
        p1 = pos_map1.get(planet_name)
        p2 = pos_map2.get(planet_name)

        if p1 is None or p2 is None:
            continue

        mid_lon = _midpoint(p1.longitude, p2.longitude)
        sign, degree, minute = _longitude_to_sign(mid_lon)

        # Composite planets are not meaningfully retrograde
        composite_positions.append(PlanetPosition(
            planet=planet_name,
            longitude=round(mid_lon, 4),
            sign=sign,
            degree=degree,
            minute=minute,
            retrograde=False,
            house=None,
        ))

    # Composite houses — midpoint of each house cusp pair
    composite_houses: Optional[list[HouseCusp]] = None

    if chart1.houses is not None and chart2.houses is not None:
        composite_houses = []
        for h1, h2 in zip(chart1.houses, chart2.houses):
            mid_lon = _midpoint(h1.longitude, h2.longitude)
            sign, degree, minute = _longitude_to_sign(mid_lon)
            composite_houses.append(HouseCusp(
                house=h1.house,
                sign=sign,
                degree=degree,
                minute=minute,
                longitude=round(mid_lon, 4),
            ))

        # Assign houses to composite planets
        house_cusps_raw = [h.longitude for h in composite_houses]
        from app.natal_chart import _find_house
        for pos in composite_positions:
            pos.house = _find_house(pos.longitude, house_cusps_raw)

    aspects = calculate_aspects(composite_positions)
    element_balance = calculate_element_balance(composite_positions)
    modality_balance = calculate_modality_balance(composite_positions)

    return CompositeResponse(
        planets=composite_positions,
        houses=composite_houses,
        aspects=aspects,
        elementBalance=element_balance,
        modalityBalance=modality_balance,
    )
