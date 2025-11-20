# Files to Remove from Backend Directory

## Summary
This document lists files and directories that should be removed from the backend directory as they are:
- Temporary/generated files
- Runtime artifacts
- Test files
- Duplicate virtual environments

## Files/Directories to Remove

### 1. Temporary/Generated Files (Runtime Artifacts)
- ✅ `__pycache__/` - Python bytecode cache (auto-generated)
- ✅ `inspection.log` - Runtime log file (467KB, 5748 lines)
- ✅ `output/` - Directory containing temporary generated reports (CSV, XLSX, TXT files)
- ✅ `src/` - Contains test files (PDF, JPG) that shouldn't be in version control

### 2. Duplicate Virtual Environment
- ⚠️ Either `venv/` OR `.venv/` (keep one, remove the other)
- Recommendation: Keep `.venv/` (more standard), remove `venv/`

### 3. Test/Development Files
- ✅ `cad_feature_test.py` - Test script with hardcoded paths to external directories

## Files to Keep
- All deployment scripts (deploy.ps1, deploy.bat, deploy.sh) - needed for different platforms
- All documentation files (*.md)
- Configuration files (Dockerfile, docker-compose.yml, cloudbuild.yaml, etc.)
- Source code files (api.py, main.py, run_server.py, etc.)
- requirements.txt, env.example

## Cleanup Commands

### Windows (PowerShell)
```powershell
# Remove temporary files
Remove-Item -Recurse -Force __pycache__
Remove-Item -Force inspection.log
Remove-Item -Recurse -Force output
Remove-Item -Recurse -Force src
Remove-Item -Force cad_feature_test.py

# Remove duplicate venv (keep .venv, remove venv)
Remove-Item -Recurse -Force venv
```

### Linux/Mac (Bash)
```bash
# Remove temporary files
rm -rf __pycache__
rm -f inspection.log
rm -rf output
rm -rf src
rm -f cad_feature_test.py

# Remove duplicate venv (keep .venv, remove venv)
rm -rf venv
```

## Notes
- The `output/` and `src/` directories are already listed in `.dockerignore`, indicating they shouldn't be in Docker builds
- These files should also be added to `.gitignore` if not already present
- The `uploads/` directory is empty and can stay (it's used at runtime)

