# Quick Testing Guide

Quick commands to verify backend and frontend are working.

---

## 🚀 Quick Start

### Test Backend (PowerShell)
```powershell
.\test-backend.ps1
```

### Test Frontend (PowerShell)
```powershell
.\test-frontend.ps1
```

---

## 📋 Manual Testing

### 1. Test Backend (30 seconds)

**Health Check:**
```powershell
curl https://logistics-manufacturing-api-1033805860980.us-east4.run.app/health
```

**Or in PowerShell:**
```powershell
Invoke-WebRequest -Uri "https://logistics-manufacturing-api-1033805860980.us-east4.run.app/health" -UseBasicParsing
```

**Expected:** `{"status":"healthy","service":"Welding Inspector API"}`

**API Docs:**
Open: https://logistics-manufacturing-api-1033805860980.us-east4.run.app/docs

---

### 2. Test Frontend (1 minute)

**Start Development Server:**
```powershell
cd frontend
npm run dev
```

**Open Browser:**
```
http://localhost:3000
```

**Check:**
- ✅ Page loads
- ✅ No console errors (F12 → Console tab)
- ✅ API calls work (F12 → Network tab)

---

## ✅ Success Criteria

### Backend ✅
- [ ] Health endpoint returns 200 OK
- [ ] API docs load at `/docs`
- [ ] Service is ACTIVE in Cloud Run

### Frontend ✅
- [ ] Development server starts
- [ ] Page loads without errors
- [ ] No CORS errors in console
- [ ] API calls go to correct URL

---

## 🐛 Quick Troubleshooting

### Backend not responding?
```powershell
gcloud run services describe logistics-manufacturing-api --region us-east4 --project logistics-479609
```

### Frontend build fails?
```powershell
cd frontend
npm install
npm run build
```

### CORS errors?
- Check backend CORS settings in `backend/api.py`
- Verify frontend URL is allowed

---

**For detailed testing guide, see `TESTING_GUIDE.md`**

