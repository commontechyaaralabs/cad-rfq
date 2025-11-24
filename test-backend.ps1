# PowerShell Script to Test Backend API
# Usage: .\test-backend.ps1

param(
    [string]$ApiUrl = "https://welding-analyzer-api-773717965404.us-east4.run.app"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Backend API Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# Test 1: Health Check
Write-Host "[1/4] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/health" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Health Check: PASSED" -ForegroundColor Green
        Write-Host "    Response: $($response.Content)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "  ✗ Health Check: FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ✗ Health Check: FAILED" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Root Endpoint
Write-Host "`n[2/4] Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Root Endpoint: PASSED" -ForegroundColor Green
        Write-Host "    Response: $($response.Content)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "  ✗ Root Endpoint: FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ✗ Root Endpoint: FAILED" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 3: API Documentation
Write-Host "`n[3/4] Testing API Documentation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/docs" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ API Docs: PASSED" -ForegroundColor Green
        Write-Host "    URL: $ApiUrl/docs" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "  ✗ API Docs: FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ✗ API Docs: FAILED" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Test 4: OpenAPI JSON
Write-Host "`n[4/4] Testing OpenAPI Schema..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/openapi.json" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $json = $response.Content | ConvertFrom-Json
        $endpoints = ($json.paths | Get-Member -MemberType NoteProperty).Name
        Write-Host "  ✓ OpenAPI Schema: PASSED" -ForegroundColor Green
        Write-Host "    Available Endpoints: $($endpoints.Count)" -ForegroundColor Gray
        foreach ($endpoint in $endpoints) {
            Write-Host "      - $endpoint" -ForegroundColor Gray
        }
        $testsPassed++
    } else {
        Write-Host "  ✗ OpenAPI Schema: FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  ✗ OpenAPI Schema: FAILED" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total Tests: $(($testsPassed + $testsFailed))" -ForegroundColor White
Write-Host "  Passed: $testsPassed" -ForegroundColor Green
Write-Host "  Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })

if ($testsFailed -eq 0) {
    Write-Host "`n✓ All tests passed! Backend is working correctly.`n" -ForegroundColor Green
} else {
    Write-Host "`n✗ Some tests failed. Please check the errors above.`n" -ForegroundColor Red
}

Write-Host "Backend URL: $ApiUrl" -ForegroundColor Yellow
Write-Host "API Docs: $ApiUrl/docs`n" -ForegroundColor Yellow

