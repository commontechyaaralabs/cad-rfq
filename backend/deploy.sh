#!/bin/bash
# Deployment script for Welding Analyzer API

set -e

echo "🚀 Starting deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if credentials file exists
if [ ! -f "credentials.json" ]; then
    echo "⚠️  Warning: credentials.json not found in current directory"
    echo "   Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable"
fi

# Get project ID
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"playgroundai-470111"}
echo "📦 Using project ID: $PROJECT_ID"

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t welding-analyzer-api:latest .

echo "✅ Build complete!"
echo ""
echo "To run locally:"
echo "  docker run -p 8000:8000 -e GOOGLE_CLOUD_PROJECT=$PROJECT_ID welding-analyzer-api:latest"
echo ""
echo "To deploy to Cloud Run:"
echo "  gcloud run deploy welding-analyzer-api --image welding-analyzer-api:latest --region us-east4"

