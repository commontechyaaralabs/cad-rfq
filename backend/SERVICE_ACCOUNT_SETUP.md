# Service Account Setup Guide

## Quick Decision: Which Service Account to Use?

### For Cloud Run Deployment → Use Default Service Account (Easier)
- ✅ No credentials.json file needed
- ✅ Automatically available to Cloud Run
- ✅ Just grant permissions

### For Local Development → Create Custom Service Account
- ✅ Download credentials.json for local testing
- ✅ Use same credentials for both local and Cloud Run (optional)

---

## Option 1: Use Default Service Account (Recommended for Cloud Run)

Cloud Run automatically uses the default Compute Engine service account. You just need to grant it permissions.

### Step 1: Get Your Project Number
```powershell
$PROJECT_ID = "YOUR_PROJECT_ID"
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
```

### Step 2: Grant Vertex AI Permissions
```powershell
$SERVICE_ACCOUNT = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/aiplatform.user"
```

### Step 3: Deploy to Cloud Run
```powershell
# No need to specify --service-account, it uses default automatically
gcloud run deploy welding-analyzer-api `
    --image gcr.io/$PROJECT_ID/welding-analyzer-api:latest `
    --region us-east4 `
    --allow-unauthenticated `
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID
```

**That's it!** Cloud Run will automatically use the default service account with the permissions you granted.

---

## Option 2: Create Custom Service Account

Use this if you need credentials.json for local development or want a dedicated service account.

### Step 1: Create Service Account
```powershell
$PROJECT_ID = "YOUR_PROJECT_ID"

gcloud iam service-accounts create welding-analyzer-sa `
    --display-name="Welding Analyzer Service Account" `
    --project=$PROJECT_ID
```

### Step 2: Grant Permissions
```powershell
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/aiplatform.user"
```

### Step 3: Create and Download Key
```powershell
# Download credentials for local development
gcloud iam service-accounts keys create credentials.json `
    --iam-account=welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com `
    --project=$PROJECT_ID
```

### Step 4: Use in Cloud Run (Optional)
```powershell
# Deploy with custom service account
gcloud run deploy welding-analyzer-api `
    --image gcr.io/$PROJECT_ID/welding-analyzer-api:latest `
    --region us-east4 `
    --allow-unauthenticated `
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID `
    --service-account welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com
```

### Step 5: Use Locally
```powershell
# Set environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\credentials.json"
$env:GOOGLE_CLOUD_PROJECT = $PROJECT_ID

# Run your app
python run_server.py
```

---

## Required Permissions

The service account needs these roles:

| Role | Purpose |
|------|---------|
| `roles/aiplatform.user` | Access Vertex AI (Gemini API) |

### Grant Additional Permissions (if needed)

```powershell
# For Cloud Storage (if you use it)
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" `
    --role="roles/storage.objectViewer"

# For Cloud Logging (for better logs)
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" `
    --role="roles/logging.logWriter"
```

---

## Verify Service Account Setup

### Check Default Service Account Permissions
```powershell
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
$SERVICE_ACCOUNT = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud projects get-iam-policy $PROJECT_ID `
    --flatten="bindings[].members" `
    --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT"
```

### Check Custom Service Account Permissions
```powershell
gcloud projects get-iam-policy $PROJECT_ID `
    --flatten="bindings[].members" `
    --filter="bindings.members:serviceAccount:welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com"
```

---

## Troubleshooting

### Error: Permission Denied
**Solution:** Make sure you granted `roles/aiplatform.user` to the service account.

### Error: Service Account Not Found
**Solution:** 
- For default: Make sure you're using the correct project number
- For custom: Verify the service account name and project ID

### Error: Credentials Not Found (Local Development)
**Solution:** 
1. Make sure `credentials.json` exists in your backend directory
2. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = ".\credentials.json"
   ```

---

## Summary

| Scenario | Recommended Approach |
|----------|---------------------|
| **Cloud Run only** | Use default service account (Option 1) |
| **Local development** | Create custom service account (Option 2) |
| **Both Cloud Run + Local** | Create custom service account, use same credentials |

---

**Quick Command Reference:**

```powershell
# Default service account (Cloud Run)
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" `
    --role="roles/aiplatform.user"

# Custom service account (Local + Cloud Run)
gcloud iam service-accounts create welding-analyzer-sa --display-name="Welding Analyzer"
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/aiplatform.user"
gcloud iam service-accounts keys create credentials.json `
    --iam-account=welding-analyzer-sa@$PROJECT_ID.iam.gserviceaccount.com
```

