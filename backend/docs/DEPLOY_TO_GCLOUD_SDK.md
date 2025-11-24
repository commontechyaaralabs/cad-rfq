# Step-by-Step Guide: Deploy Backend to Google Cloud Run using gcloud CLI

Complete guide to deploy your backend API to Google Cloud Run using the Google Cloud SDK (gcloud CLI).

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Google account
- [ ] Google Cloud Platform account with billing enabled
- [ ] Google Cloud SDK (gcloud CLI) installed
- [ ] PowerShell (Windows) or Terminal (Mac/Linux)
- [ ] Project credentials configured

**Project Information:**
- Project ID: `playgroundai-470111`
- Project Number: `773717965404`
- Region: `us-east4`

---

## Step 1: Install Google Cloud SDK

### Windows (PowerShell)

1. **Download Google Cloud SDK:**
   - Visit: https://cloud.google.com/sdk/docs/install
   - Download the Windows installer
   - Run `GoogleCloudSDKInstaller.exe`

2. **Or use Chocolatey:**
   ```powershell
   choco install gcloudsdk
   ```

3. **Verify installation:**
   ```powershell
   gcloud --version
   ```

4. **Initialize gcloud (first time only):**
   ```powershell
   gcloud init
   ```

---

## Step 2: Login and Configure gcloud

1. **Login to Google Cloud:**
   ```powershell
   gcloud auth login
   ```
   - Browser opens automatically
   - Sign in with your Google account
   - Click "Allow" to grant permissions

2. **Set your project:**
   ```powershell
   gcloud config set project playgroundai-470111
   ```

3. **Set default region:**
   ```powershell
   gcloud config set compute/region us-east4
   gcloud config set compute/zone us-east4-a
   ```

4. **Verify configuration:**
   ```powershell
   gcloud config list
   ```
   Should show:
   ```
   project = playgroundai-470111
   region = us-east4
   zone = us-east4-a
   ```

---

## Step 3: Enable Required APIs

Enable the Google Cloud APIs your backend needs:

```powershell
# Enable Cloud Run API
gcloud services enable run.googleapis.com --project=playgroundai-470111

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com --project=playgroundai-470111

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com --project=playgroundai-470111

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com --project=playgroundai-470111

# Enable Vertex AI API (for Gemini)
gcloud services enable aiplatform.googleapis.com --project=playgroundai-470111
```

**Wait for each command to complete** (takes 30-60 seconds each).

**Verify APIs are enabled:**
```powershell
gcloud services list --enabled --project=playgroundai-470111
```

---

## Step 4: Set Up Service Account Permissions

Grant Vertex AI permissions to Cloud Run's default service account:

```powershell
# Grant Vertex AI User role to Compute Engine default service account
gcloud projects add-iam-policy-binding playgroundai-470111 `
  --member="serviceAccount:773717965404-compute@developer.gserviceaccount.com" `
  --role="roles/aiplatform.user" `
  --condition=None
```

**Note:** The service account format is: `PROJECT_NUMBER-compute@developer.gserviceaccount.com`

**Verify permission was granted:**
```powershell
gcloud projects get-iam-policy playgroundai-470111 `
  --flatten="bindings[].members" `
  --filter="bindings.members:serviceAccount:773717965404-compute@developer.gserviceaccount.com"
```

Should show `roles/aiplatform.user` in the output.

---

## Step 5: Navigate to Backend Directory

1. **Open PowerShell**

2. **Navigate to your backend directory:**
   ```powershell
   cd E:\Office\cad-rfq\backend
   ```

3. **Verify you're in the right place:**
   ```powershell
   dir
   ```
   Should see: `Dockerfile`, `api.py`, `requirements.txt`, etc.

---

## Step 6: Build and Push Docker Image

Build your Docker image and push it to Google Container Registry:

```powershell
gcloud builds submit --tag gcr.io/playgroundai-470111/welding-analyzer-api:latest
```

**What happens:**
- Uploads your source code to Cloud Build
- Builds the Docker image using your `Dockerfile`
- Pushes the image to Google Container Registry
- Shows progress in the terminal

**Time:** 
- First build: 5-10 minutes (downloads base images, installs dependencies)
- Subsequent builds: 2-5 minutes (uses cached layers)

**Wait for:** `SUCCESS` message

**Verify image was pushed:**
```powershell
gcloud container images list --repository=gcr.io/playgroundai-470111
```

---

## Step 7: Deploy to Cloud Run

Deploy your container image to Cloud Run:

```powershell
gcloud run deploy welding-analyzer-api `
  --image gcr.io/playgroundai-470111/welding-analyzer-api:latest `
  --platform managed `
  --region us-east4 `
  --allow-unauthenticated `
  --port 8000 `
  --memory 2Gi `
  --cpu 2 `
  --timeout 300 `
  --max-instances 10 `
  --min-instances 0 `
  --set-env-vars GOOGLE_CLOUD_PROJECT=playgroundai-470111
```

**What each parameter does:**
- `--image`: Container image to deploy
- `--platform managed`: Fully managed Cloud Run
- `--region us-east4`: Deploy to US East (Virginia)
- `--allow-unauthenticated`: Make service publicly accessible
- `--port 8000`: Expose port 8000
- `--memory 2Gi`: Allocate 2GB RAM
- `--cpu 2`: Allocate 2 CPUs
- `--timeout 300`: 5-minute request timeout
- `--max-instances 10`: Maximum concurrent instances
- `--min-instances 0`: Scale to zero when not in use
- `--set-env-vars`: Set environment variable for project ID

**When prompted:**
- "Allow unauthenticated invocations?" → Type `Y` and press Enter

**Time:** 2-3 minutes

**Wait for:** Service URL in the output, like:
```
Service URL: https://welding-analyzer-api-xxxxx-uc.a.run.app
```

**Save this URL!** This is your live API endpoint.

---

## Step 8: Get Your Service URL

After deployment, get your service URL:

```powershell
gcloud run services describe welding-analyzer-api --region us-east4 --format 'value(status.url)'
```

**Save this URL** - you'll need it for your frontend.

---

## Step 9: Test Your Deployment

### Health Check

1. **Get your service URL** (from Step 8)

2. **Open in browser:**
   ```
   https://YOUR_SERVICE_URL/health
   ```
   Should return: `{"status":"healthy"}`

### API Documentation

1. **Open Swagger UI:**
   ```
   https://YOUR_SERVICE_URL/docs
   ```
   Should see FastAPI interactive documentation

2. **Open ReDoc:**
   ```
   https://YOUR_SERVICE_URL/redoc
   ```
   Alternative API documentation

### Test Root Endpoint

```powershell
# Using curl (if installed)
curl https://YOUR_SERVICE_URL/
```

Should return: `{"message":"Welding Inspector API is running"}`

---

## Step 10: Configure CORS (For Frontend)

If your frontend is on a different domain, update CORS origins:

```powershell
gcloud run services update welding-analyzer-api `
  --region us-east4 `
  --update-env-vars CORS_ORIGINS="https://your-frontend-url.com,http://localhost:3000"
```

**Example:**
```powershell
gcloud run services update welding-analyzer-api `
  --region us-east4 `
  --update-env-vars CORS_ORIGINS="https://myapp.com,http://localhost:3000"
```

**For multiple origins:** Separate with commas (no spaces after commas)

---

## Step 11: Monitor Your Service

### View Logs

**Real-time logs:**
```powershell
gcloud run services logs tail welding-analyzer-api --region us-east4
```

**Recent logs:**
```powershell
gcloud run services logs read welding-analyzer-api --region us-east4 --limit 50
```

### Check Service Status

```powershell
gcloud run services list
```

### View Service Details

```powershell
gcloud run services describe welding-analyzer-api --region us-east4
```

---

## Step 12: Update Deployment (After Code Changes)

When you update your code and want to redeploy:

1. **Make your code changes**

2. **Build and push new image:**
   ```powershell
   gcloud builds submit --tag gcr.io/playgroundai-470111/welding-analyzer-api:latest
   ```

3. **Deploy new version:**
   ```powershell
   gcloud run deploy welding-analyzer-api `
     --image gcr.io/playgroundai-470111/welding-analyzer-api:latest `
     --region us-east4
   ```

Cloud Run automatically:
- Deploys the new version
- Routes traffic to the new version
- Keeps the old version for a few minutes (for rollback if needed)

---

## Alternative: Using PowerShell Deployment Script

We've created a PowerShell script to automate the deployment process:

### Run the Script

```powershell
cd E:\Office\cad-rfq\backend
.\scripts\deploy-gcloud.ps1
```

### Script Parameters

```powershell
# With custom parameters
.\scripts\deploy-gcloud.ps1 `
  -ProjectId "playgroundai-470111" `
  -Region "us-east4" `
  -ServiceName "welding-analyzer-api" `
  -Memory "2Gi" `
  -Cpu 2 `
  -Timeout 300
```

### Available Parameters

- `-ProjectId`: Google Cloud Project ID (default: `playgroundai-470111`)
- `-Region`: Deployment region (default: `us-east4`)
- `-ServiceName`: Cloud Run service name (default: `welding-analyzer-api`)
- `-ImageTag`: Docker image tag (default: `latest`)
- `-SkipBuild`: Skip Docker build (use existing image)
- `-Memory`: Memory allocation (default: `2Gi`)
- `-Cpu`: CPU count (default: `2`)
- `-Timeout`: Request timeout in seconds (default: `300`)
- `-MaxInstances`: Maximum instances (default: `10`)
- `-AllowUnauthenticated`: Allow unauthenticated access (default: `$true`)

---

## Troubleshooting

### Problem: "gcloud: command not found"

**Solution:**
- Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
- Close and reopen PowerShell
- Verify: `gcloud --version`

### Problem: Build Fails

**Check build logs:**
```powershell
gcloud builds list
gcloud builds log BUILD_ID
```

**Common causes:**
- Dockerfile has errors
- Missing dependencies in `requirements.txt`
- Network connectivity issues

**Fix:**
- Verify `Dockerfile` syntax
- Check `requirements.txt` for valid package names
- Test locally: `docker build -t test .` (if Docker Desktop is installed)

### Problem: Service Won't Start

**Check service logs:**
```powershell
gcloud run services logs read welding-analyzer-api --region us-east4
```

**Common causes:**
- Missing environment variables
- Service account permissions incorrect
- Code errors

**Fix:**
- Verify `GOOGLE_CLOUD_PROJECT` is set
- Check service account has Vertex AI permissions
- Review logs for error messages

### Problem: "Permission Denied" Errors

**Verify permissions:**
```powershell
gcloud projects get-iam-policy playgroundai-470111 `
  --flatten="bindings[].members" `
  --filter="bindings.members:serviceAccount:773717965404-compute@developer.gserviceaccount.com"
```

**Grant Vertex AI permission:**
```powershell
gcloud projects add-iam-policy-binding playgroundai-470111 `
  --member="serviceAccount:773717965404-compute@developer.gserviceaccount.com" `
  --role="roles/aiplatform.user" `
  --condition=None
```

### Problem: Out of Memory Errors

**Increase memory:**
```powershell
gcloud run services update welding-analyzer-api `
  --region us-east4 `
  --memory 4Gi
```

**Or decrease to save costs:**
```powershell
gcloud run services update welding-analyzer-api `
  --region us-east4 `
  --memory 1Gi
```

### Problem: CORS Errors from Frontend

**Solution:**
1. Update CORS origins:
   ```powershell
   gcloud run services update welding-analyzer-api `
     --region us-east4 `
     --update-env-vars CORS_ORIGINS="https://your-frontend-url.com,http://localhost:3000"
   ```
2. Check exact URL (http vs https, trailing slash)
3. Wait 1-2 minutes for changes to propagate

---

## Quick Reference Commands

### Initial Setup
```powershell
# Login
gcloud auth login

# Set project
gcloud config set project playgroundai-470111

# Set region
gcloud config set compute/region us-east4
```

### Build and Deploy
```powershell
# Build image
gcloud builds submit --tag gcr.io/playgroundai-470111/welding-analyzer-api:latest

# Deploy service
gcloud run deploy welding-analyzer-api `
  --image gcr.io/playgroundai-470111/welding-analyzer-api:latest `
  --platform managed `
  --region us-east4 `
  --allow-unauthenticated `
  --port 8000 `
  --memory 2Gi `
  --cpu 2 `
  --timeout 300 `
  --set-env-vars GOOGLE_CLOUD_PROJECT=playgroundai-470111
```

### Management
```powershell
# Get service URL
gcloud run services describe welding-analyzer-api --region us-east4 --format 'value(status.url)'

# View logs
gcloud run services logs tail welding-analyzer-api --region us-east4

# Update environment variables
gcloud run services update welding-analyzer-api `
  --region us-east4 `
  --update-env-vars KEY=value

# List services
gcloud run services list

# Delete service (if needed)
gcloud run services delete welding-analyzer-api --region us-east4
```

---

## Deployment Checklist

Use this checklist to ensure you've completed everything:

- [ ] Google Cloud SDK installed and verified
- [ ] Logged in with `gcloud auth login`
- [ ] Project set to `playgroundai-470111`
- [ ] Region set to `us-east4`
- [ ] All required APIs enabled
- [ ] Service account permissions granted (Vertex AI)
- [ ] Docker image built and pushed successfully
- [ ] Service deployed to Cloud Run
- [ ] Service URL saved
- [ ] Health check passes (`/health` endpoint)
- [ ] API docs accessible (`/docs` endpoint)
- [ ] CORS configured (if needed)
- [ ] Logs checked and no errors
- [ ] Frontend updated with new API URL (if applicable)

---

## Cost Management

### Free Tier
- Cloud Run: 2 million requests/month free
- Cloud Build: 120 build-minutes/day free
- Container Registry: 0.5 GB storage free

### Cost Optimization Tips

1. **Min instances = 0** (default)
   - Service scales to zero when not in use
   - You only pay when requests are being processed

2. **Set max instances:**
   ```powershell
   gcloud run services update welding-analyzer-api `
     --region us-east4 `
     --max-instances 10
   ```
   - Prevents unexpected scaling costs

3. **Optimize resources:**
   - Start with 1Gi memory, 1 CPU
   - Increase only if needed

4. **Monitor usage:**
   - Cloud Console → Cloud Run → Metrics
   - Set up billing alerts

---

## Next Steps

After successful deployment:

1. **Monitor your service:**
   - Cloud Console → Cloud Run → [Your Service]
   - Check metrics, logs, and traffic

2. **Set up custom domain (optional):**
   - Cloud Console → Cloud Run → [Your Service] → Manage Custom Domains

3. **Configure CI/CD (optional):**
   - Use Cloud Build triggers for automatic deployment on git push

4. **Set up alerts:**
   - Cloud Console → Monitoring → Alerting

5. **Update your frontend:**
   - Change API URL from `localhost:8000` to your Cloud Run URL

---

## Additional Resources

- **Cloud Run Documentation:** https://cloud.google.com/run/docs
- **Cloud Build Documentation:** https://cloud.google.com/build/docs
- **Vertex AI Documentation:** https://cloud.google.com/vertex-ai/docs
- **gcloud CLI Reference:** https://cloud.google.com/sdk/gcloud/reference
- **Cloud Console:** https://console.cloud.google.com

---

## Need Help?

1. **Check logs:**
   ```powershell
   gcloud run services logs read welding-analyzer-api --region us-east4
   ```

2. **View service details:**
   ```powershell
   gcloud run services describe welding-analyzer-api --region us-east4
   ```

3. **Google Cloud Support:**
   - Cloud Console → Support
   - Stack Overflow: Tag `google-cloud-run`

---

**🎉 Congratulations!** Your backend is now deployed to Google Cloud Run!

Your API is live at: `https://YOUR_SERVICE_URL`

