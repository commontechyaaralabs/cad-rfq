# Testing Guide - Backend & Frontend

This guide will help you verify that both the backend and frontend are working properly.

---

## 🔍 Quick Health Check

### 1. Backend Health Check (Deployed)

**Test the deployed backend health endpoint:**

```powershell
# Test health endpoint
curl https://welding-analyzer-api-773717965404.us-east4.run.app/health

# Or using PowerShell Invoke-WebRequest
Invoke-WebRequest -Uri "https://welding-analyzer-api-773717965404.us-east4.run.app/health" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{"status":"healthy","service":"Welding Inspector API"}
```

**Check API Documentation:**
Open in browser: https://welding-analyzer-api-773717965404.us-east4.run.app/docs

---

### 2. Backend Health Check (Local)

If running backend locally:

```powershell
# Start the backend (in backend directory)
cd backend
python run_server.py

# In another terminal, test health endpoint
curl http://localhost:8000/health

# Or
Invoke-WebRequest -Uri "http://localhost:8000/health" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{"status":"healthy","service":"Welding Inspector API"}
```

---

### 3. Frontend Health Check

**Start the frontend:**

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in X.XXs
```

**Open in browser:**
- Frontend: http://localhost:3000
- Check browser console for any errors (F12 → Console tab)

---

## 🧪 Comprehensive Testing

### Backend Testing

#### Test 1: Health Endpoint
```powershell
# Deployed
curl https://welding-analyzer-api-773717965404.us-east4.run.app/health

# Local (if running locally)
curl http://localhost:8000/health
```

#### Test 2: API Documentation
Open in browser:
- Deployed: https://welding-analyzer-api-773717965404.us-east4.run.app/docs
- Local: http://localhost:8000/docs

You should see the FastAPI interactive documentation (Swagger UI).

#### Test 3: Check Available Endpoints

**Endpoints:**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /analyze` - Welding analysis
- `POST /compare` - RFQ-CAD comparison
- `POST /compare-vendor` - Vendor RFQ comparison

**Test Root Endpoint:**
```powershell
# Deployed
curl https://welding-analyzer-api-773717965404.us-east4.run.app/

# Local
curl http://localhost:8000/
```

#### Test 4: Test API with Postman/cURL (Optional)

**Example: Test Analyze Endpoint**

```powershell
# Deployed
$filePath = "path/to/your/test/file.pdf"
$uri = "https://welding-analyzer-api-773717965404.us-east4.run.app/analyze"
Invoke-RestMethod -Uri $uri -Method Post -InFile $filePath -ContentType "multipart/form-data"

# Local
$filePath = "path/to/your/test/file.pdf"
$uri = "http://localhost:8000/analyze"
Invoke-RestMethod -Uri $uri -Method Post -InFile $filePath -ContentType "multipart/form-data"
```

---

### Frontend Testing

#### Test 1: Verify API Configuration

**Check if API URL is correctly configured:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Type and run:
   ```javascript
   // This will show the API base URL being used
   fetch('/api/test').catch(() => {})
   ```
4. Check Network tab to see which URL is being called

**Or check in code:**
```javascript
// In browser console
console.log(window.location.origin)
```

#### Test 2: Test Frontend Pages

**Navigate to each page and verify:**

1. **RFQ-CAD Comparison**
   - URL: http://localhost:3000/rfq-cad-comparison
   - Test: Upload RFQ and CAD files, select part, click Compare
   - Check Network tab for API call to `/compare` endpoint

2. **Welding Analyzer**
   - URL: http://localhost:3000/welding-analyzer
   - Test: Upload a welding file, click Analyze
   - Check Network tab for API call to `/analyze` endpoint

3. **Vendor RFQ Comparison**
   - URL: http://localhost:3000/vendor-rfq-comparison
   - Test: Upload multiple RFQ files, select part, click Compare
   - Check Network tab for API call to `/compare-vendor` endpoint

#### Test 3: Check Browser Console

**Open DevTools (F12) and check:**

1. **Console Tab:**
   - No red errors
   - No CORS errors
   - API calls showing correct URL

2. **Network Tab:**
   - Filter by "Fetch/XHR"
   - Verify API calls are going to:
     - Production: `https://welding-analyzer-api-773717965404.us-east4.run.app`
     - Or Local: `http://localhost:8000` (if using local backend)
   - Check response status codes (should be 200 for successful requests)

---

## 🔗 Integration Testing

### Test Frontend → Backend Connection

#### Method 1: Using Browser DevTools

1. **Start Frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

2. **Open Browser:**
   - Navigate to http://localhost:3000
   - Open DevTools (F12)

3. **Test an API Call:**
   - Go to RFQ-CAD Comparison page
   - Upload test files
   - Click Compare
   - Check Network tab:
     - Should see request to `/compare` endpoint
     - Status should be 200 (success) or 4xx/5xx (error)
     - Response should contain JSON data

#### Method 2: Direct API Test from Console

**In browser console (on frontend page):**

```javascript
// Test health endpoint
fetch('https://welding-analyzer-api-773717965404.us-east4.run.app/health')
  .then(res => res.json())
  .then(data => console.log('Backend health:', data))
  .catch(err => console.error('Backend connection error:', err));
```

**Expected Output:**
```javascript
Backend health: {status: "healthy", service: "Welding Inspector API"}
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: Cannot connect to deployed backend
**Solution:**
```powershell
# Check if backend is accessible
curl https://welding-analyzer-api-773717965404.us-east4.run.app/health

# If fails, check Cloud Run service status
gcloud run services describe welding-analyzer-api --region us-east4
```

#### Issue: CORS errors in browser
**Check backend CORS configuration:**
- Verify `backend/api.py` has CORS middleware configured
- Check if frontend origin is allowed in CORS settings

#### Issue: 500 Internal Server Error
**Check backend logs:**
```powershell
# View Cloud Run logs
gcloud run services logs read welding-analyzer-api --region us-east4 --limit 50
```

### Frontend Issues

#### Issue: Frontend can't connect to backend
**Check API configuration:**
1. Verify `frontend/utils/api.ts` has correct URL
2. Check if `.env.local` exists and has correct URL
3. Restart Next.js dev server after changing env vars

#### Issue: CORS errors
**Verify:**
1. Backend CORS allows your frontend origin
2. API URL is correct in frontend configuration

#### Issue: Environment variables not working
**Solution:**
1. `.env.local` file must be in `frontend/` directory
2. Variables must start with `NEXT_PUBLIC_`
3. Restart dev server after changes

---

## ✅ Verification Checklist

### Backend ✅
- [ ] Health endpoint returns `{"status":"healthy"}`
- [ ] API docs accessible at `/docs`
- [ ] All endpoints listed in docs
- [ ] No errors in Cloud Run logs
- [ ] Service status is "Ready"

### Frontend ✅
- [ ] Dev server starts without errors
- [ ] All pages load correctly
- [ ] No console errors
- [ ] API calls show correct URL in Network tab
- [ ] Responses from backend are received

### Integration ✅
- [ ] Frontend can call backend health endpoint
- [ ] File uploads work
- [ ] API responses display correctly
- [ ] No CORS errors
- [ ] Error handling works (test with invalid files)

---

## 🚀 Quick Test Script

**Create a test script for quick verification:**

**File: `test-connection.ps1`**
```powershell
# Test Backend
Write-Host "Testing Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "https://welding-analyzer-api-773717965404.us-east4.run.app/health"
    Write-Host "✅ Backend is healthy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend connection failed: $_" -ForegroundColor Red
}

# Test Frontend API Config (if running)
Write-Host "`nTesting Frontend..." -ForegroundColor Cyan
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend not running (start with 'npm run dev')" -ForegroundColor Yellow
}
```

**Run the test:**
```powershell
.\test-connection.ps1
```

---

## 📊 Expected Test Results

### Backend Health Check
```json
{
  "status": "healthy",
  "service": "Welding Inspector API"
}
```

### Successful API Call Response
```json
{
  "match": true,
  "confidence": "95%",
  "summary": "...",
  "rfq_requirements": [...],
  "cad_findings": [...]
}
```

### Frontend Console (No Errors)
- No red errors
- API calls showing 200 status
- Correct API URL in Network requests

---

**Last Updated:** November 24, 2025
