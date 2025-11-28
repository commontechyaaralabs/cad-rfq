# PowerShell Script for Deploying Backend to Google Cloud Run
# Usage: .\scripts\deploy-gcloud.ps1

param(
    [string]$ProjectId = "logistics-479609",
    [string]$Region = "us-east4",
    [string]$ServiceName = "logistics-manufacturing-api",
    [string]$ImageTag = "latest",
    [switch]$SkipBuild = $false,
    [string]$Memory = "2Gi",
    [int]$Cpu = 2,
    [int]$Timeout = 300,
    [int]$MaxInstances = 10,
    [switch]$AllowUnauthenticated = $true
)

# Color output functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[✓] $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[✗] $Message" "Red"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[i] $Message" "Yellow"
}

# Validate gcloud is installed
function Test-Gcloud {
    try {
        $gcloudVersion = gcloud --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "gcloud CLI found"
            return $true
        }
    }
    catch {
        Write-Error "gcloud CLI not found. Please install Google Cloud SDK first."
        return $false
    }
    return $false
}

# Set gcloud project
function Set-GcloudProject {
    Write-Info "Setting gcloud project to: $ProjectId"
    gcloud config set project $ProjectId 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Project set to: $ProjectId"
        return $true
    }
    else {
        Write-Error "Failed to set project"
        return $false
    }
}

# Enable required APIs
function Enable-RequiredAPIs {
    Write-Info "Enabling required Google Cloud APIs..."
    
    $apis = @(
        "run.googleapis.com",
        "cloudbuild.googleapis.com",
        "containerregistry.googleapis.com",
        "artifactregistry.googleapis.com",
        "aiplatform.googleapis.com"
    )
    
    foreach ($api in $apis) {
        Write-Info "Enabling $api..."
        gcloud services enable $api --project=$ProjectId 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$api enabled"
        }
        else {
            Write-Error "Failed to enable $api"
        }
    }
}

# Build and push Docker image
function Build-AndPushImage {
    if ($SkipBuild) {
        Write-Info "Skipping build (using existing image)"
        return $true
    }
    
    $imagePath = "gcr.io/$ProjectId/$ServiceName`:$ImageTag"
    
    Write-Info "Building and pushing Docker image: $imagePath"
    Write-Info "This may take 5-10 minutes for the first build..."
    
    gcloud builds submit --tag $imagePath --project=$ProjectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Image built and pushed successfully: $imagePath"
        return $true
    }
    else {
        Write-Error "Failed to build/push image"
        return $false
    }
}

# Deploy to Cloud Run
function Deploy-ToCloudRun {
    $imagePath = "gcr.io/$ProjectId/$ServiceName`:$ImageTag"
    
    Write-Info "Deploying to Cloud Run..."
    Write-Info "Service: $ServiceName"
    Write-Info "Region: $Region"
    Write-Info "Image: $imagePath"
    
    # Build deployment command
    $deployArgs = @(
        "run", "deploy", $ServiceName,
        "--image", $imagePath,
        "--platform", "managed",
        "--region", $Region,
        "--port", "8000",
        "--memory", $Memory,
        "--cpu", $Cpu.ToString(),
        "--timeout", $Timeout.ToString(),
        "--max-instances", $MaxInstances.ToString(),
        "--min-instances", "0",
        "--set-env-vars", "GOOGLE_CLOUD_PROJECT=$ProjectId"
    )
    
    if ($AllowUnauthenticated) {
        $deployArgs += "--allow-unauthenticated"
    }
    
    Write-Info "Running deployment command..."
    & gcloud $deployArgs --project=$ProjectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployment successful!"
        
        # Get service URL
        $serviceUrl = gcloud run services describe $ServiceName --region=$Region --format='value(status.url)' --project=$ProjectId
        Write-Success "Service URL: $serviceUrl"
        Write-Info "Health check: $serviceUrl/health"
        Write-Info "API docs: $serviceUrl/docs"
        
        return $true
    }
    else {
        Write-Error "Deployment failed"
        return $false
    }
}

# Main execution
Write-ColorOutput "`n========================================" "Cyan"
Write-ColorOutput "  Google Cloud Run Deployment Script" "Cyan"
Write-ColorOutput "========================================`n" "Cyan"

# Step 1: Check gcloud
if (-not (Test-Gcloud)) {
    Write-Error "Please install Google Cloud SDK first: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Step 2: Set project
if (-not (Set-GcloudProject)) {
    exit 1
}

# Step 3: Enable APIs (optional - can be skipped if already enabled)
$enableApis = Read-Host "Enable required APIs? (Y/n)"
if ($enableApis -ne "n" -and $enableApis -ne "N") {
    Enable-RequiredAPIs
}

# Step 4: Build and push image
if (-not (Build-AndPushImage)) {
    exit 1
}

# Step 5: Deploy to Cloud Run
if (-not (Deploy-ToCloudRun)) {
    exit 1
}

Write-ColorOutput "`n========================================" "Green"
Write-ColorOutput "  Deployment Complete!" "Green"
Write-ColorOutput "========================================`n" "Green"

Write-Info "View your service in Cloud Console:"
Write-ColorOutput "https://console.cloud.google.com/run/detail/$Region/$ServiceName?project=$ProjectId" "Cyan"

