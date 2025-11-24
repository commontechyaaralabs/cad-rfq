# CORS Configuration Fix

## Issue
The frontend running on `http://192.168.1.13:3000` (network IP) was being blocked by CORS because the backend only allowed `localhost` origins.

## Solution
Updated the CORS configuration in `backend/api.py` to allow all origins by default. For production, you can restrict this using environment variables.

---

## Changes Made

### Updated CORS Configuration

**File:** `backend/api.py`

- Changed default `allowed_origins` from specific localhost URLs to `["*"]` (allow all origins)
- This allows requests from:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://192.168.x.x:3000` (network IPs)
  - Any other origin

### Environment Variable Support

You can still restrict origins using the `CORS_ORIGINS` environment variable:

```bash
# Allow specific origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Or allow all origins
CORS_ORIGINS=*
```

---

## Deployment Steps

After updating the code, redeploy the backend:

```powershell
cd backend

# Build and push new image
gcloud builds submit --tag gcr.io/playgroundai-470111/welding-analyzer-api:latest

# Deploy to Cloud Run
gcloud run deploy welding-analyzer-api `
  --image gcr.io/playgroundai-470111/welding-analyzer-api:latest `
  --platform managed `
  --region us-east4 `
  --port 8000 `
  --memory 2Gi `
  --cpu 2 `
  --timeout 300 `
  --max-instances 10 `
  --min-instances 0 `
  --allow-unauthenticated `
  --set-env-vars GOOGLE_CLOUD_PROJECT=playgroundai-470111
```

---

## For Production (Optional)

If you want to restrict CORS to specific domains only, set the environment variable during deployment:

```powershell
gcloud run deploy welding-analyzer-api `
  --image gcr.io/playgroundai-470111/welding-analyzer-api:latest `
  --platform managed `
  --region us-east4 `
  --set-env-vars GOOGLE_CLOUD_PROJECT=playgroundai-470111,CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Testing

After redeployment, test the CORS fix:

```powershell
# Test from your frontend origin
# Open browser console on http://192.168.1.13:3000
# Run:
fetch('https://welding-analyzer-api-773717965404.us-east4.run.app/health')
  .then(res => res.json())
  .then(data => console.log('CORS test:', data))
```

Should no longer show CORS errors!

