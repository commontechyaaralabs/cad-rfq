# Backend Deployment Guide

## Prerequisites
- Docker installed (for containerized deployment)
- Google Cloud account with Vertex AI enabled
- Service account credentials JSON file

## Option 1: Docker Deployment (Recommended)

### Local Docker Testing
1. Place your Google Cloud credentials file as `credentials.json` in the backend directory
2. Build the Docker image:
   ```bash
   docker build -t welding-analyzer-api .
   ```
3. Run the container:
   ```bash
   docker run -p 8000:8000 \
     -e GOOGLE_CLOUD_PROJECT=your-project-id \
     -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
     -v $(pwd)/credentials.json:/app/credentials.json:ro \
     -v $(pwd)/output:/app/output \
     welding-analyzer-api
   ```

### Using Docker Compose
1. Create a `.env` file from `.env.example` and fill in your values
2. Place `credentials.json` in the backend directory
3. Run:
   ```bash
   docker-compose up -d
   ```

## Option 2: Google Cloud Run Deployment

### Method A: Using Cloud Build (Automated)
1. Ensure you have Cloud Build API enabled
2. Push your code to a Git repository (GitHub, GitLab, etc.)
3. Connect the repository to Cloud Build
4. Cloud Build will automatically build and deploy using `cloudbuild.yaml`

### Method B: Manual Deployment
1. Build and push the image:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/welding-analyzer-api
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy welding-analyzer-api \
     --image gcr.io/YOUR_PROJECT_ID/welding-analyzer-api \
     --platform managed \
     --region us-east4 \
     --allow-unauthenticated \
     --port 8000 \
     --memory 2Gi \
     --cpu 2 \
     --timeout 300 \
     --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
   ```
3. Set up service account:
   ```bash
   gcloud run services update welding-analyzer-api \
     --service-account YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com \
     --region us-east4
   ```

## Option 3: Railway/Render/Fly.io Deployment

### Railway
1. Connect your GitHub repository
2. Add environment variables:
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_APPLICATION_CREDENTIALS` (paste JSON content or use Railway secrets)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn api:app --host 0.0.0.0 --port $PORT`

### Render
1. Create a new Web Service
2. Connect your repository
3. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn api:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in the dashboard

### Fly.io
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Login: `flyctl auth login`
3. Launch: `flyctl launch`
4. Set secrets:
   ```bash
   flyctl secrets set GOOGLE_CLOUD_PROJECT=your-project-id
   flyctl secrets set GOOGLE_APPLICATION_CREDENTIALS="$(cat credentials.json)"
   ```

## Option 4: Traditional VPS/VM Deployment

1. SSH into your server
2. Install Python 3.11 and dependencies
3. Clone your repository
4. Set up virtual environment and install requirements
5. Use systemd service or supervisor to run the app
6. Set up nginx as reverse proxy
7. Configure SSL with Let's Encrypt

## Environment Variables

Required:
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account JSON (or set via GCP service account)

Optional:
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)
- `WORKERS`: Number of uvicorn workers (default: 2)

## Health Check

After deployment, verify the API is running:
- Health endpoint: `https://your-domain.com/health`
- API docs: `https://your-domain.com/docs`

## Updating CORS

After deployment, update CORS origins in `api.py` to include your frontend domain.

