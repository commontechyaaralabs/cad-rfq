# Quick Start Script - Fastest way to get started
# This script will set up everything and start the server

Write-Host "Quick Start - Welding Analyzer API" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python not found. Please install Python 3.11+" -ForegroundColor Red
    Write-Host "Download: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "[*] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "[*] Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install/upgrade pip
Write-Host "[*] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

# Install dependencies
Write-Host "[*] Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
python -m pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Dependencies installed!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Set default project ID
$env:GOOGLE_CLOUD_PROJECT = "playgroundai-470111"
Write-Host "[*] Environment variables set" -ForegroundColor Yellow
Write-Host "   GOOGLE_CLOUD_PROJECT = $env:GOOGLE_CLOUD_PROJECT" -ForegroundColor Cyan

# Check for credentials
if ($env:GOOGLE_APPLICATION_CREDENTIALS) {
    Write-Host "   GOOGLE_APPLICATION_CREDENTIALS = $env:GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Cyan
} else {
    Write-Host "[WARNING] GOOGLE_APPLICATION_CREDENTIALS not set" -ForegroundColor Yellow
    Write-Host "   Set it manually or provide credentials.json path" -ForegroundColor Yellow
    Write-Host ""
}

# Start server
Write-Host ""
Write-Host "[*] Starting server..." -ForegroundColor Green
Write-Host "[*] API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "[*] Health: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Yellow
Write-Host ""

python run_server.py

