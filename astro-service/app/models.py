"""
Pydantic models for ChartChemistry astro-service.

Defines request/response schemas for every endpoint.
"""

from typing import Annotated, Optional

from pydantic import BaseModel, Field


# ===== Shared / Reusable Models =====


class PlanetPosition(BaseModel):
    """Position of a single celestial body."""
    planet: str
    longitude: float = Field(..., description="Ecliptic longitude 0-360")
    sign: str
    degree: int = Field(..., ge=0, le=29)
    minute: int = Field(..., ge=0, le=59)
    retrograde: bool = False
    house: Optional[int] = Field(None, ge=1, le=12)


class HouseCusp(BaseModel):
    """A single house cusp."""
    house: int = Field(..., ge=1, le=12)
    sign: str
    degree: int
    minute: int
    longitude: float


class Aspect(BaseModel):
    """An aspect between two planets."""
    planet1: str
    planet2: str
    aspect: str
    angle: float
    orb: float
    applying: bool = False


class ElementBalance(BaseModel):
    fire: int = 0
    earth: int = 0
    air: int = 0
    water: int = 0


class ModalityBalance(BaseModel):
    cardinal: int = 0
    fixed: int = 0
    mutable: int = 0


# ===== Natal Chart =====


class NatalChartRequest(BaseModel):
    """Request body for /api/natal-chart."""
    birth_date: str = Field(
        ...,
        alias="birthDate",
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="Date of birth in YYYY-MM-DD format",
    )
    birth_time: Optional[str] = Field(
        None,
        alias="birthTime",
        pattern=r"^\d{2}:\d{2}$",
        description="Time of birth in HH:MM (24h) format; omit if unknown",
    )
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: str = Field(..., description="IANA timezone, e.g. America/New_York")
    house_system: str = Field(
        "placidus",
        alias="houseSystem",
        description="House system: placidus, whole_sign, koch, equal, campanus, regiomontanus",
    )

    model_config = {"populate_by_name": True}


class NatalChartResponse(BaseModel):
    """Response body for /api/natal-chart."""
    planets: list[PlanetPosition]
    houses: Optional[list[HouseCusp]] = None
    aspects: list[Aspect]
    element_balance: Annotated[ElementBalance, Field(alias="elementBalance")]
    modality_balance: Annotated[ModalityBalance, Field(alias="modalityBalance")]
    dominant_planet: Annotated[str, Field(alias="dominantPlanet")]
    birth_time_known: Annotated[bool, Field(alias="birthTimeKnown")]
    house_system: Annotated[Optional[str], Field(default=None, alias="houseSystem")] = None

    model_config = {"populate_by_name": True}


# ===== Synastry =====


class SynastryRequest(BaseModel):
    """Request body for /api/synastry."""
    chart1: NatalChartRequest
    chart2: NatalChartRequest


class HouseOverlay(BaseModel):
    """One person's planet falling in the other's house."""
    planet: str
    planet_owner: Annotated[str, Field(alias="planetOwner")]
    house: int
    house_owner: Annotated[str, Field(alias="houseOwner")]
    sign: str

    model_config = {"populate_by_name": True}


class CompatibilityScores(BaseModel):
    emotional: float = Field(..., ge=0, le=100)
    chemistry: float = Field(..., ge=0, le=100)
    communication: float = Field(..., ge=0, le=100)
    stability: float = Field(..., ge=0, le=100)
    conflict: float = Field(..., ge=0, le=100)
    overall: float = Field(..., ge=0, le=100)


class SynastryResponse(BaseModel):
    inter_aspects: Annotated[list[Aspect], Field(alias="interAspects")]
    house_overlays: Annotated[Optional[list[HouseOverlay]], Field(default=None, alias="houseOverlays")] = None
    element_compatibility: Annotated[dict, Field(alias="elementCompatibility")]
    modality_compatibility: Annotated[dict, Field(alias="modalityCompatibility")]
    scores: CompatibilityScores

    model_config = {"populate_by_name": True}


# ===== Composite =====


class CompositeRequest(BaseModel):
    """Request body for /api/composite."""
    chart1: NatalChartRequest
    chart2: NatalChartRequest


class CompositeResponse(BaseModel):
    planets: list[PlanetPosition]
    houses: Optional[list[HouseCusp]] = None
    aspects: list[Aspect]
    element_balance: Annotated[ElementBalance, Field(alias="elementBalance")]
    modality_balance: Annotated[ModalityBalance, Field(alias="modalityBalance")]

    model_config = {"populate_by_name": True}


# ===== Transits =====


class TransitRequest(BaseModel):
    """Request body for /api/transits."""
    natal_chart: NatalChartRequest = Field(alias="natalChart")
    date: str = Field(
        ...,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="Date for transit calculation in YYYY-MM-DD format",
    )

    model_config = {"populate_by_name": True}


class TransitAspect(BaseModel):
    """A transit aspect to a natal planet."""
    transiting_planet: Annotated[str, Field(alias="transitingPlanet")]
    natal_planet: Annotated[str, Field(alias="natalPlanet")]
    aspect: str
    orb: float
    keywords: str

    model_config = {"populate_by_name": True}


class TransitResponse(BaseModel):
    date: str
    transiting_positions: Annotated[list[PlanetPosition], Field(alias="transitingPositions")]
    aspects_to_natal: Annotated[list[TransitAspect], Field(alias="aspectsToNatal")]

    model_config = {"populate_by_name": True}
