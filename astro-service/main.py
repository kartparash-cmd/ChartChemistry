"""
ChartChemistry Astro Service — FastAPI entry point.

Provides endpoints for natal chart, synastry, composite, and transit
calculations powered by the Swiss Ephemeris.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

import swisseph as swe
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.composite import compute_composite
from app.models import (
    CompositeRequest,
    CompositeResponse,
    NatalChartRequest,
    NatalChartResponse,
    SynastryRequest,
    SynastryResponse,
    TransitRequest,
    TransitResponse,
)
from app.natal_chart import compute_natal_chart
from app.synastry import compute_synastry
from app.transits import compute_transits

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
log_level = os.getenv("LOG_LEVEL", "info").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — initialize / teardown Swiss Ephemeris
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    ephe_path = os.getenv("EPHE_PATH", "")
    if not ephe_path:
        # Auto-detect bundled ephe/ directory relative to this file
        bundled = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ephe")
        if os.path.isdir(bundled):
            ephe_path = bundled
    if ephe_path:
        swe.set_ephe_path(ephe_path)
        logger.info("Swiss Ephemeris path set to: %s", ephe_path)
    else:
        logger.info("No ephemeris path configured — using Moshier (built-in)")

    yield

    swe.close()
    logger.info("Swiss Ephemeris closed")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ChartChemistry Astro Service",
    description="Astrological calculation microservice powered by Swiss Ephemeris",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "astro-service", "version": "1.0.0"}


# ---------------------------------------------------------------------------
# Natal Chart
# ---------------------------------------------------------------------------
@app.post("/api/natal-chart", response_model=NatalChartResponse)
async def natal_chart_endpoint(req: NatalChartRequest):
    """Calculate a full natal chart for the given birth data."""
    try:
        return compute_natal_chart(req)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Natal chart calculation failed")
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")


# ---------------------------------------------------------------------------
# Synastry
# ---------------------------------------------------------------------------
@app.post("/api/synastry", response_model=SynastryResponse)
async def synastry_endpoint(req: SynastryRequest):
    """Calculate synastry (relationship compatibility) between two charts."""
    try:
        return compute_synastry(req.chart1, req.chart2)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Synastry calculation failed")
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")


# ---------------------------------------------------------------------------
# Composite
# ---------------------------------------------------------------------------
@app.post("/api/composite", response_model=CompositeResponse)
async def composite_endpoint(req: CompositeRequest):
    """Calculate a composite chart using the midpoint method."""
    try:
        return compute_composite(req.chart1, req.chart2)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Composite chart calculation failed")
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")


# ---------------------------------------------------------------------------
# Transits
# ---------------------------------------------------------------------------
@app.post("/api/transits", response_model=TransitResponse)
async def transits_endpoint(req: TransitRequest):
    """Calculate current transits to a natal chart for a given date."""
    try:
        return compute_transits(req.natal_chart, req.date)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Transit calculation failed")
        raise HTTPException(status_code=500, detail=f"Calculation error: {exc}")


# ---------------------------------------------------------------------------
# CLI runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level=log_level.lower(),
    )
