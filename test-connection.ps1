# Quick Connection Test Script
# Tests both backend and frontend connectivity

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Connection Test Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test Backend (Deployed)
Write-Host "1. Testing Deployed Backend..." -ForegroundColor Yellow
try {
    $backendUrl = "https://logistics-manufacturing-api-1033805860980.us-east4.run.app/health"
    $response = Invoke-RestMethod -Uri $backendUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    Write-Host "   Service: $($response.service)" -ForegroundColor Green
    Write-Host "   URL: https://logistics-manufacturing-api-1033805860980.us-east4.run.app" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend connection failed!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test Backend API Docs
Write-Host "2. Testing Backend API Documentation..." -ForegroundColor Yellow
try {
    $docsUrl = "https://logistics-manufacturing-api-1033805860980.us-east4.run.app/docs"
    $docsResponse = Invoke-WebRequest -Uri $docsUrl -TimeoutSec 10 -ErrorAction Stop
    if ($docsResponse.StatusCode -eq 200) {
        Write-Host "   ✅ API Documentation is accessible!" -ForegroundColor Green
        Write-Host "   URL: $docsUrl" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ API Documentation not accessible!" -ForegroundColor Red
}

Write-Host ""

# Test Frontend (Local - if running)
Write-Host "3. Testing Frontend (Local)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is running!" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3000" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Frontend not running locally" -ForegroundColor Yellow
    Write-Host "   Start with: cd frontend && npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open API Docs: https://logistics-manufacturing-api-1033805860980.us-east4.run.app/docs" -ForegroundColor White
Write-Host "2. Start Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Open Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "4. Test features in browser with DevTools open (F12)" -ForegroundColor White

