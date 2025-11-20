# Deploy Backend to Google Cloud Run - Step-by-Step Guide

This guide will walk you through deploying your Welding Analyzer API backend to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed
3. **Docker** installed (for local testing)
4. **Service Account** with necessary permissions

---

## Step 1: Install and Configure Google Cloud SDK

### Windows (PowerShell)
```powershell
# Download and install gcloud CLI from:
# https://cloud.google.com/sdk/docs/install

# Or use Chocolatey
choco install gcloudsdk
```

### Verify Installation
```powershell
gcloud --version
```

### Login and Set Project
```powershell
# Login to your Google Cloud account
gcloud auth login

# Set your project ID (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify current project
gcloud config get-value project
```

---

## Step 2: Enable Required APIs

Enable the necessary Google Cloud APIs:

```powershell
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry API (for storing Docker images)
gcloud services enable containerregistry.googleapis.com

# Enable Artifact Registry API (newer, recommended)
gcloud services enable artifactregistry.googleapis.com

# Enable Vertex AI API (if using Gemini)
gcloud services enable aiplatform.googleapis.com
```

---

## Step 3: Create Service Account (Optional but Recommended)

**Important:** For Cloud Run, you have two options:

### Option A: Use Default Service Account (Easier - Recommended for Cloud Run)

Cloud Run automatically uses the default Compute Engine service account. You just need to grant it permissions:

```powershell
# Get the default service account email
$PROJECT_NUMBER = gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"
$SERVICE_ACCOUNT = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Grant Vertex AI permissions to the default service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/aiplatform.user"
```

**This is the recommended approach for Cloud Run** - no need to create a custom service account or manage credentials.json files.

### Option B: Create Custom Service Account (For Local Development)

If you need service account credentials for local development or other services:

```powershell
# Set your project ID
$PROJECT_ID = "playgroundai-470111"

# Create service account
gcloud iam service-accounts create welding-analyzer-sa `
    --display-name="Welding Analyzer Service Account" `
    --project=$PROJECT_ID

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/aiplatform.user"

# Create and download key for local development
gcloud iam service-accounts keys create credentials.json `
    --iam-account=welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com `
    --project=$PROJECT_ID
```

**For Cloud Run deployment:** Use Option A (default service account). The custom service account (Option B) is mainly useful if you need credentials.json for local development.

---

## Step 4: Test Docker Build Locally (Recommended)

Before deploying, test your Docker image locally:

```powershell
# Navigate to backend directory
cd backend

# Build the Docker image
docker build -t welding-analyzer-api:local .

# Test run locally
docker run -p 8000:8000 `
    -e GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID `
    -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json `
    -v ${PWD}/credentials.json:/app/credentials.json:ro `
    welding-analyzer-api:local
```

Test at: `http://localhost:8000/docs`

---

## Step 5: Deploy to Cloud Run

### Method A: Using Cloud Build (Automated - Recommended)

This method uses the `cloudbuild.yaml` file for automated builds:

```powershell
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# The build will automatically:
# 1. Build the Docker image
# 2. Push to Container Registry
# 3. Deploy to Cloud Run
```

### Method B: Manual Deployment (Step-by-Step)

#### 5.1 Build and Push Docker Image

```powershell
# Set your project ID
$PROJECT_ID = "YOUR_PROJECT_ID"  # Replace with your project ID

# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/welding-analyzer-api:latest
```

**Alternative: Use Artifact Registry (Recommended)**
```powershell
# Create Artifact Registry repository (first time only)
gcloud artifacts repositories create welding-analyzer-repo `
    --repository-format=docker `
    --location=us-east4 `
    --description="Docker repository for Welding Analyzer API"

# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker us-east4-docker.pkg.dev

# Build and push to Artifact Registry
gcloud builds submit --tag us-east4-docker.pkg.dev/$PROJECT_ID/welding-analyzer-repo/welding-analyzer-api:latest
```

#### 5.2 Deploy to Cloud Run

```powershell
# Deploy to Cloud Run
# Deploy with default service account (recommended)
gcloud run deploy welding-analyzer-api `
    --image gcr.io/$PROJECT_ID/welding-analyzer-api:latest `
    --platform managed `
    --region us-east4 `
    --allow-unauthenticated `
    --port 8000 `
    --memory 2Gi `
    --cpu 2 `
    --timeout 300 `
    --max-instances 10 `
    --min-instances 0 `
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID

# OR if you created a custom service account, specify it:
# gcloud run deploy welding-analyzer-api `
#     --image gcr.io/$PROJECT_ID/welding-analyzer-api:latest `
#     --platform managed `
#     --region us-east4 `
#     --allow-unauthenticated `
#     --port 8000 `
#     --memory 2Gi `
#     --cpu 2 `
#     --timeout 300 `
#     --max-instances 10 `
#     --min-instances 0 `
#     --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID `
#     --service-account welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com
```

**If using Artifact Registry:**
```powershell
gcloud run deploy welding-analyzer-api `
    --image us-east4-docker.pkg.dev/$PROJECT_ID/welding-analyzer-repo/welding-analyzer-api:latest `
    --platform managed `
    --region us-east4 `
    --allow-unauthenticated `
    --port 8000 `
    --memory 2Gi `
    --cpu 2 `
    --timeout 300 `
    --max-instances 10 `
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID
```

#### 5.3 Set Environment Variables

After deployment, configure environment variables:

```powershell
# Set CORS origins (important for frontend access)
gcloud run services update welding-analyzer-api `
    --region us-east4 `
    --update-env-vars CORS_ORIGINS="https://your-frontend-domain.com,http://localhost:3000"

# Or set multiple environment variables at once
gcloud run services update welding-analyzer-api `
    --region us-east4 `
    --update-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,CORS_ORIGINS="https://your-frontend.com,http://localhost:3000"
```

**Note:** `GOOGLE_CLOUD_PROJECT` should already be set during deployment. You mainly need to update `CORS_ORIGINS` with your frontend URL(s).

---

## Step 6: Verify Deployment

### Check Service Status
```powershell
# List Cloud Run services
gcloud run services list

# Get service details
gcloud run services describe welding-analyzer-api --region us-east4

# Get service URL
gcloud run services describe welding-analyzer-api `
    --region us-east4 `
    --format 'value(status.url)'
```

### Test the Deployed API

1. **Health Check:**
   ```powershell
   # Get the service URL
   $URL = gcloud run services describe welding-analyzer-api `
       --region us-east4 `
       --format 'value(status.url)'
   
   # Test health endpoint
   curl "$URL/health"
   ```

2. **API Documentation:**
   Open in browser: `https://YOUR_SERVICE_URL/docs`

3. **Test an Endpoint:**
   ```powershell
   curl "$URL/health"
   ```

---

## Step 7: Update Frontend Configuration

Update your frontend to use the Cloud Run URL:

1. Find your Cloud Run service URL:
   ```powershell
   gcloud run services describe welding-analyzer-api `
       --region us-east4 `
       --format 'value(status.url)'
   ```

2. Update your frontend API configuration to use this URL instead of `http://localhost:8000`

---

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Map Custom Domain
```powershell
# Map a custom domain to your Cloud Run service
gcloud run domain-mappings create `
    --service welding-analyzer-api `
    --domain api.yourdomain.com `
    --region us-east4
```

### 8.2 Update DNS
Follow the instructions provided by the command to update your DNS records.

---

## Step 9: Monitor and Manage

### View Logs
```powershell
# View recent logs
gcloud run services logs read welding-analyzer-api --region us-east4

# Follow logs in real-time
gcloud run services logs tail welding-analyzer-api --region us-east4
```

### Update Service
```powershell
# Redeploy with new image
gcloud builds submit --tag gcr.io/$PROJECT_ID/welding-analyzer-api:latest
gcloud run deploy welding-analyzer-api `
    --image gcr.io/$PROJECT_ID/welding-analyzer-api:latest `
    --region us-east4
```

### Update Environment Variables
```powershell
gcloud run services update welding-analyzer-api `
    --region us-east4 `
    --update-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,CORS_ORIGINS="https://your-frontend.com"
```

### Scale Settings
```powershell
# Update scaling
gcloud run services update welding-analyzer-api `
    --region us-east4 `
    --min-instances 1 `
    --max-instances 20 `
    --memory 4Gi `
    --cpu 4
```

---

## Step 10: Set Up CI/CD (Optional)

### Using Cloud Build Triggers

1. **Connect Repository:**
   - Go to Cloud Console → Cloud Build → Triggers
   - Connect your GitHub/GitLab repository

2. **Create Trigger:**
   ```powershell
   gcloud builds triggers create github `
       --name="deploy-welding-analyzer" `
       --repo-name="YOUR_REPO" `
       --repo-owner="YOUR_GITHUB_USERNAME" `
       --branch-pattern="^main$" `
       --build-config="cloudbuild.yaml"
   ```

3. **Automatic Deployment:**
   - Every push to `main` branch will trigger a build and deployment

---

## Troubleshooting

### Common Issues

1. **Build Fails:**
   ```powershell
   # Check build logs
   gcloud builds list
   gcloud builds log BUILD_ID
   ```

2. **Service Won't Start:**
   ```powershell
   # Check service logs
   gcloud run services logs read welding-analyzer-api --region us-east4
   ```

3. **CORS Errors:**
   - Verify `CORS_ORIGINS` environment variable is set correctly
   - Check that your frontend URL is included in the list

4. **Authentication Errors:**
   - Verify service account has correct permissions
   - Check `GOOGLE_CLOUD_PROJECT` environment variable

5. **Out of Memory:**
   ```powershell
   # Increase memory
   gcloud run services update welding-analyzer-api `
       --region us-east4 `
       --memory 4Gi
   ```

---

## Cost Optimization

1. **Set Min Instances to 0** (default) - scales to zero when not in use
2. **Use Appropriate Memory/CPU** - start with 2Gi/2 CPU, adjust based on usage
3. **Set Max Instances** - prevent unexpected scaling costs
4. **Monitor Usage** - use Cloud Console to track costs

---

## Quick Reference Commands

```powershell
# Set project
$PROJECT_ID = "your-project-id"
gcloud config set project $PROJECT_ID

# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/welding-analyzer-api:latest
gcloud run deploy welding-analyzer-api `
    --image gcr.io/$PROJECT_ID/welding-analyzer-api:latest `
    --region us-east4 `
    --allow-unauthenticated `
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID

# Get URL
gcloud run services describe welding-analyzer-api `
    --region us-east4 `
    --format 'value(status.url)'

# View logs
gcloud run services logs tail welding-analyzer-api --region us-east4
```

---

## Next Steps

1. ✅ Deploy backend to Cloud Run
2. ✅ Update frontend to use Cloud Run URL
3. ✅ Test all endpoints
4. ✅ Set up monitoring and alerts
5. ✅ Configure custom domain (optional)
6. ✅ Set up CI/CD pipeline (optional)

---

**Need Help?**
- Check Cloud Run logs: `gcloud run services logs read welding-analyzer-api --region us-east4`
- View service details: `gcloud run services describe welding-analyzer-api --region us-east4`
- Cloud Run Documentation: https://cloud.google.com/run/docs

