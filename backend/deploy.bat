@echo off
REM Deployment script for Welding Analyzer API (Windows)

echo 🚀 Starting deployment process...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if credentials file exists
if not exist "credentials.json" (
    echo ⚠️  Warning: credentials.json not found in current directory
    echo    Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
)

REM Get project ID
if "%GOOGLE_CLOUD_PROJECT%"=="" (
    set GOOGLE_CLOUD_PROJECT=playgroundai-470111
)
echo 📦 Using project ID: %GOOGLE_CLOUD_PROJECT%

REM Build Docker image
echo 🔨 Building Docker image...
docker build -t welding-analyzer-api:latest .

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build complete!
    echo.
    echo To run locally:
    echo   docker run -p 8000:8000 -e GOOGLE_CLOUD_PROJECT=%GOOGLE_CLOUD_PROJECT% welding-analyzer-api:latest
    echo.
    echo To deploy to Cloud Run:
    echo   gcloud run deploy welding-analyzer-api --image welding-analyzer-api:latest --region us-east4
) else (
    echo ❌ Build failed!
    exit /b 1
)

