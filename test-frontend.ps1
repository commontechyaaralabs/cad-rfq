# PowerShell Script to Test Frontend Build
# Usage: .\test-frontend.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Frontend Build Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if frontend directory exists
if (-not (Test-Path "frontend")) {
    Write-Host "✗ Frontend directory not found!" -ForegroundColor Red
    Write-Host "  Please run this script from the project root directory.`n" -ForegroundColor Red
    exit 1
}

# Change to frontend directory
Push-Location frontend

$testsPassed = 0
$testsFailed = 0

# Test 1: Check if package.json exists
Write-Host "[1/4] Checking package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  ✓ package.json found" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ✗ package.json not found" -ForegroundColor Red
    $testsFailed++
    Pop-Location
    exit 1
}

# Test 2: Check if node_modules exists
Write-Host "`n[2/4] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  ⚠ Dependencies not installed" -ForegroundColor Yellow
    Write-Host "    Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Dependencies installed successfully" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "    ✗ Failed to install dependencies" -ForegroundColor Red
            $testsFailed++
            Pop-Location
            exit 1
        }
    } catch {
        Write-Host "    ✗ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
        Pop-Location
        exit 1
    }
}

# Test 3: Check API configuration
Write-Host "`n[3/4] Checking API configuration..." -ForegroundColor Yellow
if (Test-Path "utils\api.ts") {
    $apiContent = Get-Content "utils\api.ts" -Raw
    if ($apiContent -match "welding-analyzer-api-773717965404") {
        Write-Host "  ✓ API configuration found" -ForegroundColor Green
        Write-Host "    API URL configured correctly" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "  ⚠ API configuration may be incorrect" -ForegroundColor Yellow
        $testsPassed++
    }
} else {
    Write-Host "  ✗ API configuration file not found" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Build frontend
Write-Host "`n[4/4] Building frontend..." -ForegroundColor Yellow
try {
    Write-Host "    Running: npm run build" -ForegroundColor Gray
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Frontend build successful" -ForegroundColor Green
        if (Test-Path ".next") {
            Write-Host "    Build output found in .next directory" -ForegroundColor Gray
        }
        $testsPassed++
    } else {
        Write-Host "  ✗ Frontend build failed" -ForegroundColor Red
        Write-Host "    Check the output above for errors" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ✗ Frontend build failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Restore location
Pop-Location

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total Tests: $(($testsPassed + $testsFailed))" -ForegroundColor White
Write-Host "  Passed: $testsPassed" -ForegroundColor Green
Write-Host "  Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })

if ($testsFailed -eq 0) {
    Write-Host "`n✓ All tests passed! Frontend is ready.`n" -ForegroundColor Green
    Write-Host "To start development server:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor White
    Write-Host "  npm run dev`n" -ForegroundColor White
} else {
    Write-Host "`n✗ Some tests failed. Please check the errors above.`n" -ForegroundColor Red
}

