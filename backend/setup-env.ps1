# Environment Setup Script
# Sets up environment variables for the Welding Analyzer API

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "playgroundai-470111",
    
    [Parameter(Mandatory=$false)]
    [string]$CredentialsPath = ""
)

Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow
Write-Host ""

# Set project ID
$env:GOOGLE_CLOUD_PROJECT = $ProjectId
Write-Host "✅ GOOGLE_CLOUD_PROJECT = $ProjectId" -ForegroundColor Green

# Set credentials if provided
if ($CredentialsPath) {
    if (Test-Path $CredentialsPath) {
        $absPath = (Resolve-Path $CredentialsPath).Path
        $env:GOOGLE_APPLICATION_CREDENTIALS = $absPath
        Write-Host "✅ GOOGLE_APPLICATION_CREDENTIALS = $absPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Credentials file not found: $CredentialsPath" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  No credentials path provided" -ForegroundColor Yellow
    Write-Host "   Usage: .\setup-env.ps1 -CredentialsPath 'C:\path\to\credentials.json'" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ Environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "To make these permanent, add them to your system environment variables:" -ForegroundColor Yellow
Write-Host "  1. Open System Properties > Environment Variables" -ForegroundColor Cyan
Write-Host "  2. Add GOOGLE_CLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Cyan
Write-Host ""

