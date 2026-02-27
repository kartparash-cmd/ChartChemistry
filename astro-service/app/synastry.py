"""
Synastry (relationship compatibility) calculation engine.

Computes inter-chart aspects, house overlays, element/modality compatibility,
and compatibility scores between two natal charts.
"""

from __future__ import annotations

import logging
from typing import Optional

from app.constants import ASPECTS, ASPECT_PLANETS, ELEMENTS, MODALITIES
from app.models import (
    Aspect,
    HouseOverlay,
    NatalChartRequest,
    NatalChartResponse,
    SynastryResponse,
)
from app.natal_chart import (
    _angular_distance,
    _find_house,
    _is_applying,
    compute_natal_chart,
)
from app.scoring import compute_compatibility_scores

logger = logging.getLogger(__name__)


def _compute_inter_aspects(
    chart1: NatalChartResponse,
    chart2: NatalChartResponse,
) -> list[Aspect]:
    """Calculate aspects between planet pairs across two charts.

    Every planet in chart1 is compared against every planet in chart2.
    """
    planets1 = [p for p in chart1.planets if p.planet in ASPECT_PLANETS]
    planets2 = [p for p in chart2.planets if p.planet in ASPECT_PLANETS]
    aspects: list[Aspect] = []

    for p1 in planets1:
        for p2 in planets2:
            dist = _angular_distance(p1.longitude, p2.longitude)

            for aspect_name, aspect_info in ASPECTS.items():
                target = aspect_info["angle"]
                orb = aspect_info["orb"]
                diff = abs(dist - target)

                if diff <= orb:
                    applying = _is_applying(p1.longitude, p2.longitude, target)
                    aspects.append(Aspect(
                        planet1=p1.planet,
                        planet2=p2.planet,
                        aspect=aspect_name,
                        angle=round(dist, 2),
                        orb=round(diff, 2),
                        applying=applying,
                    ))
                    break  # tightest aspect wins per pair

    return aspects


def _compute_house_overlays(
    chart1: NatalChartResponse,
    chart2: NatalChartResponse,
) -> Optional[list[HouseOverlay]]:
    """Determine house overlays: Person 1's planets in Person 2's houses
    and vice versa. Only possible when both charts have houses."""
    if chart1.houses is None or chart2.houses is None:
        return None

    overlays: list[HouseOverlay] = []
    cusps2 = [h.longitude for h in chart2.houses]
    cusps1 = [h.longitude for h in chart1.houses]

    # Person 1's planets in Person 2's houses
    for p in chart1.planets:
        house = _find_house(p.longitude, cusps2)
        overlays.append(HouseOverlay(
            planet=p.planet,
            planetOwner="person1",
            house=house,
            houseOwner="person2",
            sign=p.sign,
        ))

    # Person 2's planets in Person 1's houses
    for p in chart2.planets:
        house = _find_house(p.longitude, cusps1)
        overlays.append(HouseOverlay(
            planet=p.planet,
            planetOwner="person2",
            house=house,
            houseOwner="person1",
            sign=p.sign,
        ))

    return overlays


def _compute_element_compatibility(
    chart1: NatalChartResponse,
    chart2: NatalChartResponse,
) -> dict:
    """Compare element distribution between two charts."""
    e1 = chart1.element_balance
    e2 = chart2.element_balance

    return {
        "person1": e1.model_dump(),
        "person2": e2.model_dump(),
        "sharedDominant": _shared_dominant_element(e1, e2),
    }


def _shared_dominant_element(e1, e2) -> Optional[str]:
    """Return the element that is dominant in both charts, if any."""
    d1 = max(["fire", "earth", "air", "water"], key=lambda x: getattr(e1, x))
    d2 = max(["fire", "earth", "air", "water"], key=lambda x: getattr(e2, x))
    return d1 if d1 == d2 else None


def _compute_modality_compatibility(
    chart1: NatalChartResponse,
    chart2: NatalChartResponse,
) -> dict:
    m1 = chart1.modality_balance
    m2 = chart2.modality_balance

    d1 = max(["cardinal", "fixed", "mutable"], key=lambda x: getattr(m1, x))
    d2 = max(["cardinal", "fixed", "mutable"], key=lambda x: getattr(m2, x))

    return {
        "person1": m1.model_dump(),
        "person2": m2.model_dump(),
        "sharedDominant": d1 if d1 == d2 else None,
    }


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def compute_synastry(
    req1: NatalChartRequest,
    req2: NatalChartRequest,
) -> SynastryResponse:
    """Full synastry calculation pipeline."""
    chart1 = compute_natal_chart(req1)
    chart2 = compute_natal_chart(req2)

    inter_aspects = _compute_inter_aspects(chart1, chart2)
    house_overlays = _compute_house_overlays(chart1, chart2)
    element_compat = _compute_element_compatibility(chart1, chart2)
    modality_compat = _compute_modality_compatibility(chart1, chart2)
    scores = compute_compatibility_scores(inter_aspects)

    return SynastryResponse(
        interAspects=inter_aspects,
        houseOverlays=house_overlays,
        elementCompatibility=element_compat,
        modalityCompatibility=modality_compat,
        scores=scores,
    )
