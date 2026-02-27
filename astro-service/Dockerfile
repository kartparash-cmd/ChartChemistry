FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for building swisseph C extension
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libc6-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Remove build-only dependencies to reduce image size
RUN apt-get purge -y --auto-remove gcc libc6-dev

COPY . .

# Ensure ephemeris data directory exists and is set
ENV EPHE_PATH=/app/ephe

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
