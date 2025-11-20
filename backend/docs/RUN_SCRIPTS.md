# How to Run PowerShell Scripts

## Quick Start

### 1. Open PowerShell
- Press `Win + X` → Select "Windows PowerShell" or "Terminal"
- Or search "PowerShell" in Start menu

### 2. Navigate to Backend Folder
```powershell
cd E:\Office\welding_analyzer\backend
```

### 3. Set Execution Policy (First Time Only)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Type `Y` when prompted.

### 4. Run Scripts

**Quick Start (Easiest):**
```powershell
.\quick-start.ps1
```

**Full Deployment Script:**
```powershell
# Install dependencies and run server
.\deploy.ps1 -InstallDependencies -RunServer

# Just install dependencies
.\deploy.ps1 -InstallDependencies

# Setup environment variables
.\setup-env.ps1 -ProjectId "your-project-id" -CredentialsPath "C:\path\to\credentials.json"

# Show help
.\deploy.ps1 -Help
```

## Common Issues

### Issue: "Execution Policy" Error
**Error:** `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "File cannot be loaded" Error
**Error:** `File cannot be loaded. The file is not digitally signed`

**Solution:** Use bypass (one-time):
```powershell
powershell -ExecutionPolicy Bypass -File .\quick-start.ps1
```

### Issue: Script Not Found
**Error:** `The term '.\quick-start.ps1' is not recognized`

**Solution:** Make sure you're in the correct directory:
```powershell
cd E:\Office\welding_analyzer\backend
ls *.ps1  # Should list: deploy.ps1, quick-start.ps1, setup-env.ps1
```

## Script Descriptions

### quick-start.ps1
- **Purpose:** Fastest way to get started
- **What it does:**
  - Creates virtual environment
  - Installs all dependencies
  - Sets environment variables
  - Starts the server
- **Usage:** `.\quick-start.ps1`

### deploy.ps1
- **Purpose:** Full-featured deployment script
- **Options:**
  - `-InstallDependencies` - Install Python packages
  - `-RunServer` - Start the server
  - `-UseDocker` - Use Docker deployment
  - `-ProjectId` - Set Google Cloud project ID
  - `-CredentialsPath` - Path to credentials JSON
  - `-Help` - Show help message
- **Usage:** `.\deploy.ps1 -InstallDependencies -RunServer`

### setup-env.ps1
- **Purpose:** Set up environment variables
- **Usage:** `.\setup-env.ps1 -ProjectId "project-id" -CredentialsPath "path\to\creds.json"`

## Step-by-Step Example

```powershell
# 1. Open PowerShell
# 2. Navigate to backend
cd E:\Office\welding_analyzer\backend

# 3. Set execution policy (first time only)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 4. Run quick start
.\quick-start.ps1

# Server will start at http://localhost:8000
```

## Alternative: Run Without Scripts

If scripts don't work, you can run commands manually:

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Set environment variables
$env:GOOGLE_CLOUD_PROJECT = "playgroundai-470111"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\credentials.json"

# Run server
python run_server.py
```

