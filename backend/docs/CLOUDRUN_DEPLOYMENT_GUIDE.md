# Step-by-Step Guide: Deploy Backend to Google Cloud Run

A simple, easy-to-follow guide to deploy your backend API to Google Cloud Run.

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] Google Cloud account with billing enabled
- [ ] Google Cloud SDK (gcloud) installed on your computer
- [ ] A Google Cloud Project created
- [ ] Your project ID ready (e.g., `playgroundai-470111`)

---

## 🎯 Step 1: Install Google Cloud SDK

### Windows

1. **Download the installer:**
   - Go to: https://cloud.google.com/sdk/docs/install
   - Download the Windows installer
   - Run the installer and follow the prompts

2. **Or use Chocolatey (if you have it):**
   - Open PowerShell as Administrator
   - Run: `choco install gcloudsdk`

3. **Verify installation:**
   - Open a new PowerShell window
   - Run: `gcloud --version`
   - You should see version information

---

## 🔐 Step 2: Login and Set Your Project

1. **Login to Google Cloud:**
   - Open PowerShell
   - Run: `gcloud auth login`
   - A browser window will open
   - Sign in with your Google Cloud account
   - Allow permissions

2. **Set your project:**
   - Run: `gcloud config set project YOUR_PROJECT_ID`
   - Replace `YOUR_PROJECT_ID` with your actual project ID
   - Example: `gcloud config set project playgroundai-470111`

3. **Verify:**
   - Run: `gcloud config get-value project`
   - Should show your project ID

---

## ⚙️ Step 3: Enable Required APIs

Enable the Google Cloud services your backend needs:

1. **Enable Cloud Run API:**
   - Run: `gcloud services enable run.googleapis.com`
   - Wait for confirmation

2. **Enable Cloud Build API:**
   - Run: `gcloud services enable cloudbuild.googleapis.com`
   - Wait for confirmation

3. **Enable Container Registry API:**
   - Run: `gcloud services enable containerregistry.googleapis.com`
   - Wait for confirmation

4. **Enable Vertex AI API (for Gemini):**
   - Run: `gcloud services enable aiplatform.googleapis.com`
   - Wait for confirmation

**Note:** This may take 1-2 minutes. Wait for each command to complete before running the next one.

---

## 🔑 Step 4: Set Up Service Account Permissions

Cloud Run uses a default service account. You just need to give it permission to use Vertex AI.

1. **Get your project number:**
   - Run: `gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"`
   - Copy the number that appears (e.g., `123456789012`)

2. **Grant Vertex AI permission:**
   - Replace `YOUR_PROJECT_ID` and `YOUR_PROJECT_NUMBER` in this command:
   ```
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/aiplatform.user"
   ```
   - Example:
   ```
   gcloud projects add-iam-policy-binding playgroundai-470111 --member="serviceAccount:123456789012-compute@developer.gserviceaccount.com" --role="roles/aiplatform.user"
   ```

**That's it!** Cloud Run will automatically use this service account when you deploy.

---

## 🐳 Step 5: Build and Push Docker Image

1. **Navigate to your backend directory:**
   - Run: `cd E:\Office\cad-rfq\backend`

2. **Build and push the image:**
   - Replace `YOUR_PROJECT_ID` with your project ID:
   ```
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/welding-analyzer-api:latest
   ```
   - Example:
   ```
   gcloud builds submit --tag gcr.io/playgroundai-470111/welding-analyzer-api:latest
   ```

**What happens:**
- Google Cloud Build will:
  1. Build your Docker image
  2. Push it to Google Container Registry
  3. Show you progress in the terminal

**Time:** This takes 5-10 minutes the first time. Subsequent builds are faster.

---

## 🚀 Step 6: Deploy to Cloud Run

1. **Deploy your service:**
   - Replace `YOUR_PROJECT_ID` with your project ID:
   ```
   gcloud run deploy welding-analyzer-api --image gcr.io/YOUR_PROJECT_ID/welding-analyzer-api:latest --platform managed --region us-east4 --allow-unauthenticated --port 8000 --memory 2Gi --cpu 2 --timeout 300 --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
   ```
   - Example:
   ```
   gcloud run deploy welding-analyzer-api --image gcr.io/playgroundai-470111/welding-analyzer-api:latest --platform managed --region us-east4 --allow-unauthenticated --port 8000 --memory 2Gi --cpu 2 --timeout 300 --set-env-vars GOOGLE_CLOUD_PROJECT=playgroundai-470111
   ```

2. **When prompted:**
   - "Allow unauthenticated invocations?" → Type `Y` and press Enter
   - Wait for deployment to complete (2-3 minutes)

**What this does:**
- Creates a Cloud Run service named `welding-analyzer-api`
- Uses 2GB memory and 2 CPUs
- Sets timeout to 5 minutes (300 seconds)
- Makes it publicly accessible (no authentication required)
- Sets your project ID as an environment variable

---

## ✅ Step 7: Get Your Service URL

After deployment completes, you'll see a URL like:
```
https://welding-analyzer-api-xxxxx-uc.a.run.app
```

**To get it again later:**
```
gcloud run services describe welding-analyzer-api --region us-east4 --format 'value(status.url)'
```

**Save this URL!** You'll need it for your frontend.

---

## 🧪 Step 8: Test Your Deployment

1. **Health Check:**
   - Open your browser
   - Go to: `https://YOUR_SERVICE_URL/health`
   - Should show: `{"status":"healthy"}`

2. **API Documentation:**
   - Go to: `https://YOUR_SERVICE_URL/docs`
   - You should see the Swagger UI with all your API endpoints

3. **Test an endpoint:**
   - In the Swagger UI, try the `/health` endpoint
   - Click "Try it out" → "Execute"
   - Should return a successful response

---

## 🌐 Step 9: Configure CORS (For Frontend Access)

If your frontend is on a different domain, set CORS origins:

1. **Set CORS environment variable:**
   - Replace `YOUR_FRONTEND_URL` with your frontend URL:
   ```
   gcloud run services update welding-analyzer-api --region us-east4 --update-env-vars CORS_ORIGINS="https://YOUR_FRONTEND_URL,http://localhost:3000"
   ```
   - Example:
   ```
   gcloud run services update welding-analyzer-api --region us-east4 --update-env-vars CORS_ORIGINS="https://myapp.com,http://localhost:3000"
   ```

2. **For multiple origins:**
   - Separate with commas (no spaces after commas):
   ```
   CORS_ORIGINS="https://app1.com,https://app2.com,http://localhost:3000"
   ```

---

## 📝 Step 10: Update Your Frontend

1. **Find your Cloud Run URL:**
   - Use the command from Step 7, or check the Cloud Console

2. **Update frontend API configuration:**
   - Find where your frontend connects to the API
   - Change from: `http://localhost:8000`
   - Change to: `https://YOUR_CLOUDRUN_URL`
   - Example: `https://welding-analyzer-api-xxxxx-uc.a.run.app`

---

## 📊 Step 11: Monitor Your Service

### View Logs

**Real-time logs:**
```
gcloud run services logs tail welding-analyzer-api --region us-east4
```

**Recent logs:**
```
gcloud run services logs read welding-analyzer-api --region us-east4
```

### Check Service Status

```
gcloud run services list
```

### View Service Details

```
gcloud run services describe welding-analyzer-api --region us-east4
```

---

## 🔄 Step 12: Update Your Deployment (When You Make Changes)

When you update your code and want to redeploy:

1. **Build and push new image:**
   ```
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/welding-analyzer-api:latest
   ```

2. **Deploy the new version:**
   ```
   gcloud run deploy welding-analyzer-api --image gcr.io/YOUR_PROJECT_ID/welding-analyzer-api:latest --region us-east4
   ```

Cloud Run will automatically:
- Deploy the new version
- Route traffic to the new version
- Keep the old version for a few minutes (for rollback if needed)

---

## 🛠️ Troubleshooting

### Problem: Build fails

**Check build logs:**
```
gcloud builds list
gcloud builds log BUILD_ID
```

**Common causes:**
- Dockerfile has errors
- Missing dependencies in requirements.txt
- Network issues

### Problem: Service won't start

**Check service logs:**
```
gcloud run services logs read welding-analyzer-api --region us-east4
```

**Common causes:**
- Missing environment variables
- Service account permissions
- Code errors

### Problem: CORS errors from frontend

**Solution:**
1. Make sure CORS_ORIGINS is set correctly
2. Include your frontend URL in the list
3. Check the exact URL (http vs https, with/without trailing slash)

### Problem: "Permission denied" errors

**Solution:**
1. Verify service account has `roles/aiplatform.user` permission
2. Check GOOGLE_CLOUD_PROJECT environment variable is set
3. Make sure Vertex AI API is enabled

### Problem: Out of memory errors

**Solution:**
Increase memory:
```
gcloud run services update welding-analyzer-api --region us-east4 --memory 4Gi
```

---

## 💰 Cost Optimization Tips

1. **Min instances = 0** (default)
   - Service scales to zero when not in use
   - You only pay when requests are being processed

2. **Set max instances:**
   ```
   gcloud run services update welding-analyzer-api --region us-east4 --max-instances 10
   ```
   - Prevents unexpected scaling costs

3. **Monitor usage:**
   - Check Cloud Console → Cloud Run → Metrics
   - Set up billing alerts

---

## 📚 Quick Reference Commands

**Set project:**
```
gcloud config set project YOUR_PROJECT_ID
```

**Build and deploy (one command):**
```
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/welding-analyzer-api:latest
gcloud run deploy welding-analyzer-api --image gcr.io/YOUR_PROJECT_ID/welding-analyzer-api:latest --region us-east4 --allow-unauthenticated --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
```

**Get service URL:**
```
gcloud run services describe welding-analyzer-api --region us-east4 --format 'value(status.url)'
```

**View logs:**
```
gcloud run services logs tail welding-analyzer-api --region us-east4
```

**Update environment variables:**
```
gcloud run services update welding-analyzer-api --region us-east4 --update-env-vars CORS_ORIGINS="https://your-frontend.com"
```

---

## ✅ Deployment Checklist

Use this checklist to make sure you've completed everything:

- [ ] Google Cloud SDK installed
- [ ] Logged in with `gcloud auth login`
- [ ] Project set with `gcloud config set project`
- [ ] All required APIs enabled
- [ ] Service account permissions granted
- [ ] Docker image built and pushed
- [ ] Service deployed to Cloud Run
- [ ] Service URL saved
- [ ] Health check passed
- [ ] API docs accessible
- [ ] CORS configured (if needed)
- [ ] Frontend updated with new URL
- [ ] Tested from frontend

---

## 🎉 You're Done!

Your backend is now live on Google Cloud Run! 

**Next Steps:**
- Monitor your service in Cloud Console
- Set up custom domain (optional)
- Configure CI/CD for automatic deployments (optional)
- Set up monitoring and alerts (optional)

---

## 📖 Additional Resources

- **Cloud Run Documentation:** https://cloud.google.com/run/docs
- **Cloud Build Documentation:** https://cloud.google.com/build/docs
- **Vertex AI Documentation:** https://cloud.google.com/vertex-ai/docs

---

**Need Help?**
- Check logs: `gcloud run services logs read welding-analyzer-api --region us-east4`
- View service: `gcloud run services describe welding-analyzer-api --region us-east4`
- Cloud Console: https://console.cloud.google.com/run

