# PowerShell Deployment Script for Welding Analyzer API
# Usage: .\deploy.ps1 [options]

param(
    [string]$ProjectId = "playgroundai-470111",
    [string]$CredentialsPath = "",
    [string]$Port = "8000",
    [switch]$UseDocker = $false,
    [switch]$InstallDependencies = $false,
    [switch]$RunServer = $false,
    [switch]$Help = $false
)

# Colors for output
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
[*] Welding Analyzer API - Deployment Script

USAGE:
    .\deploy.ps1 [options]

OPTIONS:
    -ProjectId <id>              Google Cloud Project ID (default: playgroundai-470111)
    -CredentialsPath <path>      Path to Google Cloud credentials JSON file
    -Port <port>                 Server port (default: 8000)
    -UseDocker                   Use Docker for deployment
    -InstallDependencies         Install Python dependencies
    -RunServer                   Run the server after setup
    -Help                        Show this help message

EXAMPLES:
    # Setup and run locally
    .\deploy.ps1 -InstallDependencies -RunServer -CredentialsPath "C:\path\to\credentials.json"

    # Use Docker (requires Docker Desktop)
    .\deploy.ps1 -UseDocker -ProjectId "my-project-id"

    # Just install dependencies
    .\deploy.ps1 -InstallDependencies
"@
}

if ($Help) {
    Show-Help
    exit 0
}

Write-ColorOutput Green "[*] Welding Analyzer API - Deployment Script"
Write-ColorOutput Green "============================================`n"

# Check if Python is installed
function Test-Python {
    try {
        $pythonVersion = python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "[OK] Python found: $pythonVersion"
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Check if Docker is installed
function Test-Docker {
    try {
        $dockerVersion = docker --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput Green "[OK] Docker found: $dockerVersion"
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Install Python dependencies
function Install-Dependencies {
    Write-ColorOutput Yellow "`n[*] Installing Python dependencies...`n"
    
    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-ColorOutput Yellow "Creating virtual environment..."
        python -m venv venv
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput Red "[ERROR] Failed to create virtual environment"
            exit 1
        }
    }
    
    # Activate virtual environment
    Write-ColorOutput Yellow "Activating virtual environment..."
    & ".\venv\Scripts\Activate.ps1"
    
    # Upgrade pip
    Write-ColorOutput Yellow "Upgrading pip..."
    python -m pip install --upgrade pip --quiet
    
    # Install requirements
    Write-ColorOutput Yellow "Installing requirements from requirements.txt..."
    python -m pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "[OK] Dependencies installed successfully!`n"
    } else {
        Write-ColorOutput Red "[ERROR] Failed to install dependencies"
        exit 1
    }
}

# Setup environment variables
function Setup-Environment {
    Write-ColorOutput Yellow "`n[*] Setting up environment variables...`n"
    
    # Set project ID
    if ($ProjectId) {
        $env:GOOGLE_CLOUD_PROJECT = $ProjectId
        Write-ColorOutput Green "[OK] GOOGLE_CLOUD_PROJECT = $ProjectId"
    }
    
    # Set credentials path
    if ($CredentialsPath) {
        if (Test-Path $CredentialsPath) {
            $env:GOOGLE_APPLICATION_CREDENTIALS = (Resolve-Path $CredentialsPath).Path
            Write-ColorOutput Green "[OK] GOOGLE_APPLICATION_CREDENTIALS = $env:GOOGLE_APPLICATION_CREDENTIALS"
        } else {
            Write-ColorOutput Red "[ERROR] Credentials file not found: $CredentialsPath"
            Write-ColorOutput Yellow "[WARNING] Make sure to set GOOGLE_APPLICATION_CREDENTIALS manually"
        }
    } else {
        Write-ColorOutput Yellow "[WARNING] No credentials path provided. Set GOOGLE_APPLICATION_CREDENTIALS manually if needed."
    }
    
    Write-Output ""
}

# Run server
function Start-Server {
    Write-ColorOutput Yellow "`n[*] Starting server...`n"
    
    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-ColorOutput Red "[ERROR] Virtual environment not found. Run with -InstallDependencies first."
        exit 1
    }
    
    # Activate virtual environment
    & ".\venv\Scripts\Activate.ps1"
    
    # Check if dependencies are installed
    try {
        python -c "import fastapi" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput Red "[ERROR] Dependencies not installed. Run with -InstallDependencies first."
            exit 1
        }
    } catch {
        Write-ColorOutput Red "[ERROR] Dependencies not installed. Run with -InstallDependencies first."
        exit 1
    }
    
    Write-ColorOutput Green "[OK] Server starting on http://localhost:$Port"
    Write-ColorOutput Cyan "[*] API Documentation: http://localhost:$Port/docs"
    Write-ColorOutput Cyan "[*] Health Check: http://localhost:$Port/health"
    Write-ColorOutput Yellow "`nPress Ctrl+C to stop the server`n"
    
    # Run server
    python run_server.py
}

# Docker deployment
function Deploy-Docker {
    Write-ColorOutput Yellow "`n[*] Docker Deployment`n"
    
    if (-not (Test-Docker)) {
        Write-ColorOutput Red "[ERROR] Docker is not installed or not in PATH"
        Write-ColorOutput Yellow "[*] Download Docker Desktop: https://www.docker.com/products/docker-desktop/"
        exit 1
    }
    
    # Build Docker image
    Write-ColorOutput Yellow "Building Docker image..."
    docker build -t welding-analyzer-api:latest .
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "[OK] Docker image built successfully!`n"
        
        Write-ColorOutput Cyan "To run the container:"
        $dockerCmd = "  docker run -p ${Port}:8000 -e GOOGLE_CLOUD_PROJECT=$ProjectId welding-analyzer-api:latest"
        Write-Output $dockerCmd
        
        if ($CredentialsPath -and (Test-Path $CredentialsPath)) {
            $absPath = (Resolve-Path $CredentialsPath).Path
            $dockerCmd = @"
  docker run -p ${Port}:8000 \
    -e GOOGLE_CLOUD_PROJECT=$ProjectId \
    -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
    -v "$absPath":/app/credentials.json:ro \
    welding-analyzer-api:latest
"@
            Write-Output $dockerCmd
        }
    } else {
        Write-ColorOutput Red "[ERROR] Docker build failed"
        exit 1
    }
}

# Main execution
Write-Output ""

# Check Python
if (-not (Test-Python)) {
    Write-ColorOutput Red "[ERROR] Python is not installed or not in PATH"
    Write-ColorOutput Yellow "[*] Download Python: https://www.python.org/downloads/"
    exit 1
}

# Install dependencies if requested
if ($InstallDependencies) {
    Install-Dependencies
}

# Setup environment
Setup-Environment

# Docker deployment
if ($UseDocker) {
    Deploy-Docker
} else {
    # Run server if requested
    if ($RunServer) {
        Start-Server
    } else {
        Write-ColorOutput Cyan "`n[OK] Setup complete!`n"
        Write-ColorOutput Yellow "To run the server, use:"
        Write-Output "  .\deploy.ps1 -RunServer"
        Write-Output ""
        Write-ColorOutput Yellow "Or manually:"
        Write-Output "  .\venv\Scripts\Activate.ps1"
        Write-Output "  python run_server.py"
    }
}

