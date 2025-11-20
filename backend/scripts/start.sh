#!/bin/bash
# Startup script for Cloud Run
# Cloud Run sets PORT environment variable automatically

PORT=${PORT:-8000}
WORKERS=${WORKERS:-1}

exec uvicorn api:app --host 0.0.0.0 --port $PORT --workers $WORKERS

