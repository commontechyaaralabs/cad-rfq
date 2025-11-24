# Frontend API Configuration Update

This document describes the changes made to update the frontend to use the deployed backend API.

---

## ✅ Changes Made

### 1. Created API Configuration Utility

**File:** `frontend/utils/api.ts`

- Centralized API URL configuration
- Uses environment variable `NEXT_PUBLIC_API_URL` if set
- Defaults to the deployed Cloud Run service URL
- Provides `getApiUrl()` helper function for building endpoint URLs

### 2. Updated API Calls

All hardcoded `http://localhost:8000` URLs have been replaced with the new API configuration:

#### Files Updated:
1. **`frontend/app/rfq-cad-comparison/page.tsx`**
   - Updated `/compare` endpoint to use `getApiUrl("/compare")`

2. **`frontend/app/welding-analyzer/page.tsx`**
   - Updated `/analyze` endpoint to use `getApiUrl("/analyze")`

3. **`frontend/app/vendor-rfq-comparison/page.tsx`**
   - Updated `/compare-vendor` endpoint to use `getApiUrl("/compare-vendor")`

### 3. Created Environment Configuration

**File:** `frontend/.env.example`
- Template file for environment variables
- Copy to `.env.local` for local development

---

## 🔧 Configuration

### Production (Default)
The frontend is now configured to use the deployed backend by default:
```
https://welding-analyzer-api-773717965404.us-east4.run.app
```

### Local Development
To use a local backend during development:

1. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update the API URL in `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Restart your Next.js development server:**
   ```bash
   npm run dev
   ```

---

## 📋 Updated Endpoints

All endpoints now use the centralized API configuration:

| Endpoint | Usage |
|----------|-------|
| `/compare` | RFQ-CAD comparison |
| `/analyze` | Welding analysis |
| `/compare-vendor` | Vendor RFQ comparison |

---

## 🚀 Next Steps

1. **Test the Application:**
   - Start your Next.js development server
   - Test all three main features:
     - RFQ-CAD Comparison
     - Welding Analyzer
     - Vendor RFQ Comparison

2. **Verify API Connectivity:**
   - Check browser console for any CORS errors
   - Verify API calls are going to the correct URL

3. **If CORS Issues Occur:**
   - Ensure the backend CORS configuration includes your frontend domain
   - Check the deployed backend CORS settings in `backend/api.py`

4. **Environment Variables:**
   - For production deployment, set `NEXT_PUBLIC_API_URL` in your hosting platform
   - For Vercel, add it in Project Settings > Environment Variables
   - For other platforms, configure according to their documentation

---

## 📝 Notes

- The `.env.local` file is gitignored and won't be committed
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- The API URL defaults to production, so the app works out of the box
- Local development requires creating `.env.local` with the localhost URL

---

## 🔗 Related Files

- `frontend/utils/api.ts` - API configuration utility
- `frontend/.env.example` - Environment variable template
- `backend/api.py` - Backend CORS configuration (verify if needed)

---

**Status:** ✅ **Configuration Complete**

The frontend is now ready to connect to the deployed backend API.

