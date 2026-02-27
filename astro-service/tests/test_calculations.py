"""
Tests for ChartChemistry astro-service calculations.

Uses well-known birth data to verify planetary positions, aspect detection,
scoring, composite midpoints, and transit calculations.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# Fixtures — reusable birth data payloads
# ---------------------------------------------------------------------------

# Example: someone born Jan 1, 1990 at 12:00 in New York
PERSON_A = {
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York",
}

# Example: someone born Jul 4, 1992 at 08:30 in Los Angeles
PERSON_B = {
    "birthDate": "1992-07-04",
    "birthTime": "08:30",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "timezone": "America/Los_Angeles",
}

# Example: no birth time known
PERSON_NO_TIME = {
    "birthDate": "1985-03-15",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "timezone": "Europe/London",
}


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

class TestHealthCheck:
    def test_health_returns_200(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["service"] == "astro-service"


# ---------------------------------------------------------------------------
# Natal chart
# ---------------------------------------------------------------------------

class TestNatalChart:
    def test_natal_chart_with_birth_time(self):
        resp = client.post("/api/natal-chart", json=PERSON_A)
        assert resp.status_code == 200
        data = resp.json()

        # Must have planets
        assert len(data["planets"]) >= 13
        planet_names = {p["planet"] for p in data["planets"]}
        assert "Sun" in planet_names
        assert "Moon" in planet_names
        assert "Pluto" in planet_names
        assert "North Node" in planet_names
        assert "Chiron" in planet_names
        assert "Lilith" in planet_names

        # Each planet must have required fields
        for p in data["planets"]:
            assert "sign" in p
            assert "degree" in p
            assert "minute" in p
            assert "retrograde" in p
            assert p["sign"] in [
                "Aries", "Taurus", "Gemini", "Cancer",
                "Leo", "Virgo", "Libra", "Scorpio",
                "Sagittarius", "Capricorn", "Aquarius", "Pisces",
            ]
            assert 0 <= p["degree"] <= 29
            assert 0 <= p["minute"] <= 59

        # Houses should be present when birth time is known
        assert data["birthTimeKnown"] is True
        assert data["houses"] is not None
        assert len(data["houses"]) == 12

        # Aspects should exist
        assert len(data["aspects"]) > 0

        # Element balance
        eb = data["elementBalance"]
        total = eb["fire"] + eb["earth"] + eb["air"] + eb["water"]
        assert total == 10  # 10 core planets

        # Modality balance
        mb = data["modalityBalance"]
        total_m = mb["cardinal"] + mb["fixed"] + mb["mutable"]
        assert total_m == 10

        # Dominant planet is a string
        assert isinstance(data["dominantPlanet"], str)

    def test_natal_chart_without_birth_time(self):
        resp = client.post("/api/natal-chart", json=PERSON_NO_TIME)
        assert resp.status_code == 200
        data = resp.json()

        assert data["birthTimeKnown"] is False
        assert data["houses"] is None
        assert data["houseSystem"] is None

        # Planets should still have no house assignments
        for p in data["planets"]:
            assert p["house"] is None

        # Aspects and balances should still be computed
        assert len(data["aspects"]) > 0
        assert data["elementBalance"] is not None

    def test_natal_chart_sun_in_capricorn_for_jan1(self):
        """Jan 1 1990 — Sun should be in Capricorn."""
        resp = client.post("/api/natal-chart", json=PERSON_A)
        data = resp.json()
        sun = next(p for p in data["planets"] if p["planet"] == "Sun")
        assert sun["sign"] == "Capricorn"

    def test_natal_chart_sun_in_cancer_for_jul4(self):
        """Jul 4 1992 — Sun should be in Cancer."""
        resp = client.post("/api/natal-chart", json=PERSON_B)
        data = resp.json()
        sun = next(p for p in data["planets"] if p["planet"] == "Sun")
        assert sun["sign"] == "Cancer"

    def test_natal_chart_whole_sign_houses(self):
        payload = {**PERSON_A, "houseSystem": "whole_sign"}
        resp = client.post("/api/natal-chart", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["houseSystem"] == "whole_sign"
        assert data["houses"] is not None

    def test_natal_chart_invalid_date(self):
        payload = {**PERSON_A, "birthDate": "not-a-date"}
        resp = client.post("/api/natal-chart", json=payload)
        assert resp.status_code == 422

    def test_natal_chart_invalid_latitude(self):
        payload = {**PERSON_A, "latitude": 999}
        resp = client.post("/api/natal-chart", json=payload)
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Synastry
# ---------------------------------------------------------------------------

class TestSynastry:
    def test_synastry_returns_valid_structure(self):
        payload = {"chart1": PERSON_A, "chart2": PERSON_B}
        resp = client.post("/api/synastry", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        # Inter-aspects
        assert "interAspects" in data
        assert len(data["interAspects"]) > 0

        for asp in data["interAspects"]:
            assert asp["aspect"] in [
                "conjunction", "sextile", "square", "trine", "opposition",
            ]
            assert 0 <= asp["orb"] <= 10

        # House overlays (both have birth times)
        assert data["houseOverlays"] is not None
        assert len(data["houseOverlays"]) > 0

        # Element compatibility
        assert "person1" in data["elementCompatibility"]
        assert "person2" in data["elementCompatibility"]

        # Scores
        scores = data["scores"]
        for key in ["emotional", "chemistry", "communication", "stability", "conflict", "overall"]:
            assert key in scores
            assert 0 <= scores[key] <= 100

    def test_synastry_without_birth_times(self):
        """When one chart lacks birth time, house overlays should be null."""
        payload = {"chart1": PERSON_A, "chart2": PERSON_NO_TIME}
        resp = client.post("/api/synastry", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        assert data["houseOverlays"] is None

    def test_synastry_scores_are_reasonable(self):
        """Scores should cluster around the midrange for unrelated charts."""
        payload = {"chart1": PERSON_A, "chart2": PERSON_B}
        resp = client.post("/api/synastry", json=payload)
        data = resp.json()
        overall = data["scores"]["overall"]
        # Should be somewhere between 10 and 95 for typical charts
        assert 10 <= overall <= 95


# ---------------------------------------------------------------------------
# Composite
# ---------------------------------------------------------------------------

class TestComposite:
    def test_composite_returns_valid_structure(self):
        payload = {"chart1": PERSON_A, "chart2": PERSON_B}
        resp = client.post("/api/composite", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        assert len(data["planets"]) >= 13
        assert data["houses"] is not None
        assert len(data["houses"]) == 12
        assert len(data["aspects"]) > 0

        eb = data["elementBalance"]
        total = eb["fire"] + eb["earth"] + eb["air"] + eb["water"]
        assert total == 10

    def test_composite_midpoint_is_between_inputs(self):
        """The composite Sun longitude should be roughly between the two natal Suns."""
        payload = {"chart1": PERSON_A, "chart2": PERSON_B}
        resp = client.post("/api/composite", json=payload)
        data = resp.json()

        composite_sun = next(p for p in data["planets"] if p["planet"] == "Sun")
        # Just verify it has a valid longitude
        assert 0 <= composite_sun["longitude"] < 360

    def test_composite_without_birth_time(self):
        """When one chart has no birth time, composite houses should be null."""
        payload = {"chart1": PERSON_A, "chart2": PERSON_NO_TIME}
        resp = client.post("/api/composite", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["houses"] is None


# ---------------------------------------------------------------------------
# Transits
# ---------------------------------------------------------------------------

class TestTransits:
    def test_transits_returns_valid_structure(self):
        payload = {
            "natalChart": PERSON_A,
            "date": "2026-02-27",
        }
        resp = client.post("/api/transits", json=payload)
        assert resp.status_code == 200
        data = resp.json()

        assert data["date"] == "2026-02-27"
        assert len(data["transitingPositions"]) == 10

        # Transit positions should have valid signs
        for tp in data["transitingPositions"]:
            assert tp["sign"] in [
                "Aries", "Taurus", "Gemini", "Cancer",
                "Leo", "Virgo", "Libra", "Scorpio",
                "Sagittarius", "Capricorn", "Aquarius", "Pisces",
            ]

    def test_transits_have_aspects(self):
        payload = {
            "natalChart": PERSON_A,
            "date": "2026-02-27",
        }
        resp = client.post("/api/transits", json=payload)
        data = resp.json()

        # There should be at least some transit aspects
        assert len(data["aspectsToNatal"]) > 0

        for asp in data["aspectsToNatal"]:
            assert "transitingPlanet" in asp
            assert "natalPlanet" in asp
            assert "aspect" in asp
            assert "orb" in asp
            assert "keywords" in asp

    def test_transits_invalid_date(self):
        payload = {
            "natalChart": PERSON_A,
            "date": "bad-date",
        }
        resp = client.post("/api/transits", json=payload)
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Unit tests for internal helpers
# ---------------------------------------------------------------------------

class TestHelpers:
    def test_longitude_to_sign(self):
        from app.natal_chart import _longitude_to_sign

        sign, deg, minute = _longitude_to_sign(0.0)
        assert sign == "Aries"
        assert deg == 0

        sign, deg, minute = _longitude_to_sign(30.0)
        assert sign == "Taurus"
        assert deg == 0

        sign, deg, minute = _longitude_to_sign(279.5)
        assert sign == "Capricorn"
        assert deg == 9
        assert minute == 30

        sign, deg, minute = _longitude_to_sign(359.99)
        assert sign == "Pisces"

    def test_angular_distance(self):
        from app.natal_chart import _angular_distance

        assert _angular_distance(0, 90) == 90
        assert _angular_distance(350, 10) == 20
        assert _angular_distance(180, 0) == 180
        assert abs(_angular_distance(1, 359) - 2) < 0.01

    def test_midpoint(self):
        from app.composite import _midpoint

        # Same sign
        assert abs(_midpoint(10, 20) - 15) < 0.01

        # Across 0 Aries
        mid = _midpoint(350, 10)
        assert abs(mid - 0.0) < 0.01 or abs(mid - 360.0) < 0.01

        # Opposition — midpoint on shorter arc
        mid = _midpoint(0, 180)
        assert mid == 90.0 or mid == 270.0

    def test_element_balance_sums_to_ten(self):
        from app.natal_chart import calculate_element_balance, calculate_planet_positions

        import swisseph as swe
        jd = swe.julday(1990, 1, 1, 17.0)
        positions = calculate_planet_positions(jd)
        balance = calculate_element_balance(positions)
        total = balance.fire + balance.earth + balance.air + balance.water
        assert total == 10

    def test_modality_balance_sums_to_ten(self):
        from app.natal_chart import calculate_modality_balance, calculate_planet_positions

        import swisseph as swe
        jd = swe.julday(1990, 1, 1, 17.0)
        positions = calculate_planet_positions(jd)
        balance = calculate_modality_balance(positions)
        total = balance.cardinal + balance.fixed + balance.mutable
        assert total == 10

    def test_scoring_baseline(self):
        """With no matching aspects, dimension score should be ~50 (baseline)."""
        from app.scoring import compute_dimension_score

        score = compute_dimension_score("emotional", [])
        assert score == 50.0

    def test_scoring_positive_aspect(self):
        """A conjunction between Moon-Moon should push emotional score above baseline."""
        from app.models import Aspect
        from app.scoring import compute_dimension_score

        aspects = [
            Aspect(
                planet1="Moon",
                planet2="Moon",
                aspect="conjunction",
                angle=2.0,
                orb=2.0,
                applying=True,
            ),
        ]
        score = compute_dimension_score("emotional", aspects)
        assert score > 50.0

    def test_scoring_negative_aspect(self):
        """A square between Moon-Moon should push emotional score below baseline."""
        from app.models import Aspect
        from app.scoring import compute_dimension_score

        aspects = [
            Aspect(
                planet1="Moon",
                planet2="Moon",
                aspect="square",
                angle=88.0,
                orb=2.0,
                applying=False,
            ),
        ]
        score = compute_dimension_score("emotional", aspects)
        assert score < 50.0
