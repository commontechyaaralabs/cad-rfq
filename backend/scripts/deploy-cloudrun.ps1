# PowerShell Script to Deploy Welding Analyzer API to Google Cloud Run
# Usage: .\deploy-cloudrun.ps1 -ProjectId "your-project-id" [options]

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [string]$Region = "us-east4",
    [string]$ServiceName = "welding-analyzer-api",
    [string]$ImageTag = "latest",
    [int]$Memory = 2,
    [int]$Cpu = 2,
    [int]$Timeout = 300,
    [int]$MaxInstances = 10,
    [string]$CorsOrigins = "",
    [switch]$UseArtifactRegistry = $false,
    [switch]$SkipBuild = $false,
    [switch]$Help = $false
)

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Help {
    Write-ColorOutput Cyan @"
[*] Google Cloud Run Deployment Script

USAGE:
    .\deploy-cloudrun.ps1 -ProjectId "your-project-id" [options]

REQUIRED PARAMETERS:
    -ProjectId <id>              Google Cloud Project ID

OPTIONAL PARAMETERS:
    -Region <region>              Cloud Run region (default: us-east4)
    -ServiceName <name>           Service name (default: welding-analyzer-api)
    -ImageTag <tag>               Docker image tag (default: latest)
    -Memory <gb>                  Memory in GB (default: 2)
    -Cpu <cores>                  CPU cores (default: 2)
    -Timeout <seconds>            Request timeout (default: 300)
    -MaxInstances <count>         Max instances (default: 10)
    -CorsOrigins <origins>        Comma-separated CORS origins
    -UseArtifactRegistry          Use Artifact Registry instead of Container Registry
    -SkipBuild                    Skip Docker build (use existing image)
    -Help                         Show this help message

EXAMPLES:
    # Basic deployment
    .\deploy-cloudrun.ps1 -ProjectId "my-project-id"

    # With CORS origins
    .\deploy-cloudrun.ps1 -ProjectId "my-project-id" -CorsOrigins "https://myapp.com,http://localhost:3000"

    # Using Artifact Registry
    .\deploy-cloudrun.ps1 -ProjectId "my-project-id" -UseArtifactRegistry

    # Skip build (redeploy existing image)
    .\deploy-cloudrun.ps1 -ProjectId "my-project-id" -SkipBuild
"@
}

if ($Help) {
    Show-Help
    exit 0
}

Write-ColorOutput Green "[*] Google Cloud Run Deployment"
Write-ColorOutput Green "================================`n"

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>&1
    Write-ColorOutput Green "[OK] Google Cloud SDK found"
} catch {
    Write-ColorOutput Red "[ERROR] Google Cloud SDK not found"
    Write-ColorOutput Yellow "[*] Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if logged in
try {
    $currentAccount = gcloud config get-value account 2>&1
    if (-not $currentAccount -or $currentAccount -match "unset") {
        Write-ColorOutput Yellow "[*] Not logged in. Logging in..."
        gcloud auth login
    } else {
        Write-ColorOutput Green "[OK] Logged in as: $currentAccount"
    }
} catch {
    Write-ColorOutput Red "[ERROR] Failed to check authentication"
    exit 1
}

# Set project
Write-ColorOutput Yellow "[*] Setting project to: $ProjectId"
gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "[ERROR] Failed to set project"
    exit 1
}

# Enable required APIs
Write-ColorOutput Yellow "[*] Enabling required APIs..."
$apis = @(
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com",
    "aiplatform.googleapis.com"
)

foreach ($api in $apis) {
    Write-ColorOutput Cyan "  Enabling $api..."
    gcloud services enable $api --quiet 2>&1 | Out-Null
}

Write-ColorOutput Green "[OK] APIs enabled`n"

# Determine image path
if ($UseArtifactRegistry) {
    # Check if repository exists, create if not
    $repoName = "welding-analyzer-repo"
    Write-ColorOutput Yellow "[*] Checking Artifact Registry repository..."
    $repoExists = gcloud artifacts repositories describe $repoName --location=$Region 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Yellow "[*] Creating Artifact Registry repository..."
        gcloud artifacts repositories create $repoName `
            --repository-format=docker `
            --location=$Region `
            --description="Docker repository for Welding Analyzer API" `
            --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "[OK] Repository created"
        }
    }
    
    # Configure Docker auth
    gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet 2>&1 | Out-Null
    
    $imagePath = "$Region-docker.pkg.dev/$ProjectId/$repoName/$ServiceName`:$ImageTag"
} else {
    $imagePath = "gcr.io/$ProjectId/$ServiceName`:$ImageTag"
}

# Build and push Docker image
if (-not $SkipBuild) {
    Write-ColorOutput Yellow "[*] Building and pushing Docker image..."
    Write-ColorOutput Cyan "  Image: $imagePath"
    
    gcloud builds submit --tag $imagePath
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "[ERROR] Docker build failed"
        exit 1
    }
    Write-ColorOutput Green "[OK] Image built and pushed`n"
} else {
    Write-ColorOutput Yellow "[*] Skipping build (using existing image)"
}

# Prepare environment variables
$envVars = @("GOOGLE_CLOUD_PROJECT=$ProjectId")
if ($CorsOrigins) {
    $envVars += "CORS_ORIGINS=$CorsOrigins"
}

# Deploy to Cloud Run
Write-ColorOutput Yellow "[*] Deploying to Cloud Run..."
Write-ColorOutput Cyan "  Service: $ServiceName"
Write-ColorOutput Cyan "  Region: $Region"
Write-ColorOutput Cyan "  Memory: ${Memory}Gi"
Write-ColorOutput Cyan "  CPU: $Cpu"
Write-ColorOutput Cyan "  Timeout: $Timeout seconds"
Write-ColorOutput Cyan "  Max Instances: $MaxInstances"

$deployArgs = @(
    "run", "deploy", $ServiceName,
    "--image", $imagePath,
    "--platform", "managed",
    "--region", $Region,
    "--allow-unauthenticated",
    "--port", "8000",
    "--memory", "${Memory}Gi",
    "--cpu", $Cpu,
    "--timeout", $Timeout,
    "--max-instances", $MaxInstances,
    "--min-instances", "0"
)

# Add environment variables
foreach ($envVar in $envVars) {
    $deployArgs += "--set-env-vars"
    $deployArgs += $envVar
}

gcloud $deployArgs
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "[ERROR] Deployment failed"
    exit 1
}

Write-ColorOutput Green "[OK] Deployment successful!`n"

# Get service URL
Write-ColorOutput Yellow "[*] Getting service URL..."
$serviceUrl = gcloud run services describe $ServiceName `
    --region $Region `
    --format 'value(status.url)'

if ($serviceUrl) {
    Write-ColorOutput Green "[OK] Service deployed successfully!`n"
    Write-ColorOutput Cyan "Service URL: $serviceUrl"
    Write-ColorOutput Cyan "Health Check: $serviceUrl/health"
    Write-ColorOutput Cyan "API Docs: $serviceUrl/docs`n"
    
    # Test health endpoint
    Write-ColorOutput Yellow "[*] Testing health endpoint..."
    try {
        $response = Invoke-WebRequest -Uri "$serviceUrl/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput Green "[OK] Health check passed"
        }
    } catch {
        Write-ColorOutput Yellow "[WARNING] Health check failed (service may still be starting)"
    }
} else {
    Write-ColorOutput Yellow "[WARNING] Could not retrieve service URL"
}

Write-ColorOutput Green "`n[*] Deployment complete!"
Write-ColorOutput Yellow "[*] Next steps:"
Write-ColorOutput Yellow "  1. Update your frontend to use: $serviceUrl"
if (-not $CorsOrigins) {
    Write-ColorOutput Yellow "  2. Set CORS origins:"
    Write-ColorOutput Yellow "     gcloud run services update $ServiceName --region $Region --update-env-vars CORS_ORIGINS=`"https://your-frontend.com`""
}
Write-ColorOutput Yellow "  3. View logs:"
Write-ColorOutput Yellow "     gcloud run services logs tail $ServiceName --region $Region"

