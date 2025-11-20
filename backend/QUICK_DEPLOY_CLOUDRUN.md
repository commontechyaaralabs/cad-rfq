# Quick Deploy to Cloud Run - 5 Minutes

## Prerequisites Check
```powershell
# 1. Install Google Cloud SDK (if not installed)
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Verify installation
gcloud --version

# 3. Login
gcloud auth login

# 4. Set your project
gcloud config set project YOUR_PROJECT_ID
```

## Quick Deploy (Automated Script)

```powershell
# Navigate to backend directory
cd backend

# Run deployment script
.\deploy-cloudrun.ps1 -ProjectId "YOUR_PROJECT_ID"
```

That's it! The script will:
1. ✅ Enable required APIs
2. ✅ Build Docker image
3. ✅ Push to Container Registry
4. ✅ Deploy to Cloud Run
5. ✅ Show you the service URL

## With CORS Configuration

```powershell
.\deploy-cloudrun.ps1 -ProjectId "YOUR_PROJECT_ID" `
    -CorsOrigins "https://your-frontend.com,http://localhost:3000"
```

## Manual Deploy (Step-by-Step)

### 1. Build and Push
```powershell
$PROJECT_ID = "YOUR_PROJECT_ID"
gcloud builds submit --tag gcr.io/$PROJECT_ID/welding-analyzer-api:latest
```

### 2. Deploy
```powershell
gcloud run deploy welding-analyzer-api `
    --image gcr.io/$PROJECT_ID/welding-analyzer-api:latest `
    --platform managed `
    --region us-east4 `
    --allow-unauthenticated `
    --port 8000 `
    --memory 2Gi `
    --cpu 2 `
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID
```

### 3. Get URL
```powershell
gcloud run services describe welding-analyzer-api `
    --region us-east4 `
    --format 'value(status.url)'
```

## Verify Deployment

1. **Health Check:**
   ```powershell
   $URL = gcloud run services describe welding-analyzer-api --region us-east4 --format 'value(status.url)'
   curl "$URL/health"
   ```

2. **API Docs:**
   Open: `https://YOUR_SERVICE_URL/docs`

## Update Frontend

Update your frontend API URL to use the Cloud Run service URL instead of `http://localhost:8000`

## View Logs

```powershell
gcloud run services logs tail welding-analyzer-api --region us-east4
```

## Troubleshooting

- **Build fails?** Check: `gcloud builds list`
- **Service won't start?** Check logs: `gcloud run services logs read welding-analyzer-api --region us-east4`
- **CORS errors?** Set CORS_ORIGINS: `gcloud run services update welding-analyzer-api --region us-east4 --update-env-vars CORS_ORIGINS="https://your-frontend.com"`

---

**For detailed instructions, see:** `DEPLOY_TO_CLOUDRUN.md`

