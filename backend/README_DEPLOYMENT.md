# Quick Deployment Guide

## 🚀 Quick Start (Docker)

### 1. Prepare Credentials
Place your Google Cloud service account JSON file as `credentials.json` in the backend directory.

### 2. Build and Run
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### 3. Run Container
```bash
docker run -p 8000:8000 \
  -e GOOGLE_CLOUD_PROJECT=your-project-id \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -v %cd%\credentials.json:/app/credentials.json:ro \
  welding-analyzer-api:latest
```

## ☁️ Deploy to Google Cloud Run

### Prerequisites
- Google Cloud SDK installed
- Authenticated: `gcloud auth login`
- Project set: `gcloud config set project YOUR_PROJECT_ID`

### Deploy
```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/welding-analyzer-api

# Deploy
gcloud run deploy welding-analyzer-api \
  --image gcr.io/YOUR_PROJECT_ID/welding-analyzer-api \
  --platform managed \
  --region us-east4 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
  --set-secrets GOOGLE_APPLICATION_CREDENTIALS=your-secret-name:latest
```

## 🔧 Environment Variables

Set these when deploying:

- `GOOGLE_CLOUD_PROJECT` - Your GCP project ID (required)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to credentials or use GCP service account
- `CORS_ORIGINS` - Comma-separated list of allowed frontend URLs (optional)
- `PORT` - Server port (default: 8000)

## 📝 Update Frontend

After deployment, update your frontend API URLs:
- Change `http://localhost:8000` to your deployed URL
- Update CORS_ORIGINS if needed

## ✅ Verify Deployment

1. Health check: `https://your-url/health`
2. API docs: `https://your-url/docs`
3. Test endpoint: `https://your-url/`

For detailed instructions, see `DEPLOYMENT.md`

