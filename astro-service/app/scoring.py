"""
Compatibility scoring algorithm for ChartChemistry.

Computes sub-scores (emotional, chemistry, communication, stability, conflict)
and an overall weighted score from inter-chart aspects.
"""

from __future__ import annotations

import logging

from app.constants import (
    DIMENSION_PLANET_PAIRS,
    DIMENSION_WEIGHTS,
    OVERALL_WEIGHTS,
)
from app.models import Aspect, CompatibilityScores

logger = logging.getLogger(__name__)

# Maximum raw score per dimension (used to normalize to 0-100).
# This is an empirical ceiling — the sum of all possible positive aspect
# weights for the dimension's planet pairs if every pair formed a conjunction.
_MAX_RAW: dict[str, float] = {
    "emotional": 50.0,
    "chemistry": 40.0,
    "communication": 40.0,
    "stability": 48.0,
    "conflict": 40.0,
}

# Baseline used so that a "neutral" chart comparison (no aspects) still
# returns a reasonable middle score rather than 0.
_BASELINE = 50.0


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def compute_dimension_score(
    dimension: str,
    inter_aspects: list[Aspect],
) -> float:
    """Compute a 0-100 score for a single compatibility dimension.

    The algorithm:
    1. Collect all inter-aspects whose (planet1, planet2) match the
       dimension's planet pairs.
    2. Sum the aspect weight values.
    3. Normalize to 0-100 with a baseline at 50.
    """
    pairs = DIMENSION_PLANET_PAIRS.get(dimension, [])
    weights = DIMENSION_WEIGHTS.get(dimension, {})
    max_raw = _MAX_RAW.get(dimension, 40.0)

    raw = 0.0
    for aspect in inter_aspects:
        key_forward = (aspect.planet1, aspect.planet2)
        key_reverse = (aspect.planet2, aspect.planet1)

        if key_forward in pairs or key_reverse in pairs:
            weight = weights.get(aspect.aspect, 0)
            raw += weight

    # Normalize: raw can be negative (bad) or positive (good).
    # Map [-max_raw, +max_raw] to [0, 100] with 0 raw = 50.
    score = _BASELINE + (raw / max_raw) * _BASELINE
    return round(_clamp(score), 1)


def compute_compatibility_scores(inter_aspects: list[Aspect]) -> CompatibilityScores:
    """Compute all dimension sub-scores and the weighted overall score."""
    dimensions: dict[str, float] = {}

    for dimension in DIMENSION_WEIGHTS:
        dimensions[dimension] = compute_dimension_score(dimension, inter_aspects)

    overall = sum(
        dimensions[dim] * weight
        for dim, weight in OVERALL_WEIGHTS.items()
    )

    return CompatibilityScores(
        emotional=dimensions["emotional"],
        chemistry=dimensions["chemistry"],
        communication=dimensions["communication"],
        stability=dimensions["stability"],
        conflict=dimensions["conflict"],
        overall=round(_clamp(overall), 1),
    )
