# Migration Guide: From playgroundai-470111 to logistics-479609

## New Project Details

| Field | Value |
|-------|-------|
| **Organization** | yashadata.com > Logistics |
| **Project ID** | `logistics-479609` |
| **Project Number** | `1033805860980` |

> **Note:** This organization has disabled service account key creation. Use Application Default Credentials (ADC) for local development and Workload Identity for Cloud Run.

---

## Step 1: Configure gcloud CLI

```powershell
# Login to Google Cloud
gcloud auth login

# Set the new project
gcloud config set project logistics-479609

# Verify
gcloud config list
```

Expected output:
```
[core]
project = logistics-479609
```

---

## Step 2: Set Up Application Default Credentials (For Local Development)

Since service account keys cannot be downloaded, use ADC:

```powershell
# This opens a browser to authenticate
gcloud auth application-default login
```

This creates credentials automatically at:
- **Windows:** `%APPDATA%\gcloud\application_default_credentials.json`
- **Linux/Mac:** `~/.config/gcloud/application_default_credentials.json`

---

## Step 3: Create/Update .env File

Create a `.env` file in the `backend/` directory:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=logistics-479609
# No credentials file needed - using ADC

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000

# Server Configuration
PORT=8000
HOST=0.0.0.0
WORKERS=1

# Vertex AI Configuration
REGION=us-east4
MODEL=gemini-2.5-pro
```

---

## Step 4: Enable Required APIs

Run these commands to enable required APIs in the new project:

```powershell
# Enable Cloud Run
gcloud services enable run.googleapis.com --project=logistics-479609

# Enable Cloud Build
gcloud services enable cloudbuild.googleapis.com --project=logistics-479609

# Enable Container Registry
gcloud services enable containerregistry.googleapis.com --project=logistics-479609

# Enable Artifact Registry
gcloud services enable artifactregistry.googleapis.com --project=logistics-479609

# Enable Vertex AI
gcloud services enable aiplatform.googleapis.com --project=logistics-479609
```

Or all at once:
```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com --project=logistics-479609
```

Verify APIs are enabled:
```powershell
gcloud services list --enabled --project=logistics-479609
```

---

## Step 5: Set Up IAM Permissions

Grant the default Compute Engine service account the Vertex AI User role:

```powershell
gcloud projects add-iam-policy-binding logistics-479609 `
  --member="serviceAccount:1033805860980-compute@developer.gserviceaccount.com" `
  --role="roles/aiplatform.user"
```

If you have a custom service account (e.g., `logistics-manufacturing-sa`):
```powershell
gcloud projects add-iam-policy-binding logistics-479609 `
  --member="serviceAccount:logistics-manufacturing-sa@logistics-479609.iam.gserviceaccount.com" `
  --role="roles/aiplatform.user"
```

---

## Step 6: Run Locally

```powershell
cd backend

# Activate virtual environment
.\.venv\Scripts\Activate

# Run the server
python run_server.py
```

The server will automatically use your ADC credentials.

---

## Step 7: Deploy to Cloud Run

### Option A: Using the deployment script

```powershell
cd backend
.\scripts\deploy-gcloud.ps1
```

### Option B: Manual deployment

```powershell
# Build the container
gcloud builds submit --tag gcr.io/logistics-479609/logistics-manufacturing-api:latest

# Deploy to Cloud Run (uses Workload Identity automatically)
gcloud run deploy logistics-manufacturing-api `
  --image gcr.io/logistics-479609/logistics-manufacturing-api:latest `
  --platform managed `
  --region us-east4 `
  --allow-unauthenticated `
  --port 8000 `
  --memory 2Gi `
  --cpu 2 `
  --timeout 300 `
  --set-env-vars GOOGLE_CLOUD_PROJECT=logistics-479609
```

### Option C: Deploy with custom service account

```powershell
gcloud run deploy logistics-manufacturing-api `
  --image gcr.io/logistics-479609/logistics-manufacturing-api:latest `
  --platform managed `
  --region us-east4 `
  --allow-unauthenticated `
  --port 8000 `
  --memory 2Gi `
  --cpu 2 `
  --timeout 300 `
  --service-account=logistics-manufacturing-sa@logistics-479609.iam.gserviceaccount.com `
  --set-env-vars GOOGLE_CLOUD_PROJECT=logistics-479609
```

---

## Step 8: Get the Service URL

```powershell
gcloud run services describe logistics-manufacturing-api --region us-east4 --format 'value(status.url)'
```

---

## Step 9: Update Frontend Configuration

Create/update `frontend/.env.local`:

**For Cloud Run deployment:**
```env
NEXT_PUBLIC_API_URL=https://YOUR-CLOUD-RUN-URL.run.app
```

**For local development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Verification Checklist

- [ ] `gcloud auth login` executed
- [ ] `gcloud auth application-default login` executed (for local dev)
- [ ] `gcloud config set project logistics-479609` executed
- [ ] All APIs enabled in new project
- [ ] IAM permissions granted to compute service account
- [ ] `.env` file created in `backend/` (without credentials path)
- [ ] Container built and pushed to `gcr.io/logistics-479609/logistics-manufacturing-api`
- [ ] Cloud Run service `logistics-manufacturing-api` deployed
- [ ] Frontend `.env.local` updated with new API URL

---

## Quick Commands Reference

```powershell
# Login
gcloud auth login
gcloud auth application-default login

# Set project
gcloud config set project logistics-479609

# Enable APIs
gcloud services enable run.googleapis.com aiplatform.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com --project=logistics-479609

# Grant permissions
gcloud projects add-iam-policy-binding logistics-479609 --member="serviceAccount:1033805860980-compute@developer.gserviceaccount.com" --role="roles/aiplatform.user"

# Build & Deploy
gcloud builds submit --tag gcr.io/logistics-479609/logistics-manufacturing-api:latest
gcloud run deploy logistics-manufacturing-api --image gcr.io/logistics-479609/logistics-manufacturing-api:latest --platform managed --region us-east4 --allow-unauthenticated --port 8000 --memory 2Gi --cpu 2 --timeout 300 --set-env-vars GOOGLE_CLOUD_PROJECT=logistics-479609

# Check logs
gcloud run services logs tail logistics-manufacturing-api --region us-east4
```

---

## Troubleshooting

### "Permission denied" or "Vertex AI" errors locally
```powershell
# Re-authenticate with ADC
gcloud auth application-default login
```

### Check your authentication
```powershell
gcloud auth list
gcloud config list
```

### Check Cloud Run logs
```powershell
gcloud run services logs tail logistics-manufacturing-api --region us-east4
```

### Check IAM permissions
```powershell
gcloud projects get-iam-policy logistics-479609 --flatten="bindings[].members" --filter="bindings.role:roles/aiplatform.user"
```

---

## Files Updated

The following files have been updated with the new project ID:

1. `backend/api.py` - DEFAULT_PROJECT = "logistics-479609"
2. `backend/main.py` - PROJECT = "logistics-479609"
3. `backend/env.example` - GOOGLE_CLOUD_PROJECT=logistics-479609
4. `backend/scripts/deploy-gcloud.ps1` - ProjectId default = "logistics-479609"

---

## Why No Credentials File?

Your organization has the policy `constraints/iam.disableServiceAccountKeyCreation` enabled, which prevents downloading service account keys. This is a security best practice. Instead:

- **Local Development:** Use Application Default Credentials (ADC) via `gcloud auth application-default login`
- **Cloud Run:** Uses Workload Identity automatically - no credentials file needed
- **CI/CD:** Use Workload Identity Federation

This approach is more secure as there are no long-lived credentials to manage or rotate.
