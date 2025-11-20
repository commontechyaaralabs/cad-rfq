# Backend Directory Structure

This document explains the organization of the backend directory.

## 📁 Directory Layout

```
backend/
│
├── 📄 Core Application Files
│   ├── api.py              # Main FastAPI application and routes
│   ├── main.py             # Welding inspector implementation
│   ├── run_server.py       # Development server (with auto-reload)
│   └── run_production.py   # Production server (multi-worker)
│
├── ⚙️ Configuration Files
│   ├── requirements.txt    # Python dependencies
│   ├── env.example         # Environment variables template
│   ├── Dockerfile          # Docker container definition
│   ├── docker-compose.yml  # Docker Compose configuration
│   ├── cloudbuild.yaml     # Google Cloud Build config
│   ├── .dockerignore       # Files to exclude from Docker builds
│   └── .gitignore          # Files to exclude from Git
│
├── 📚 docs/                # All Documentation
│   ├── README.md           # (if exists)
│   ├── DEPLOYMENT.md       # General deployment guide
│   ├── DEPLOY_TO_CLOUDRUN.md
│   ├── DEPLOY_WITHOUT_DOCKER.md
│   ├── QUICK_DEPLOY_CLOUDRUN.md
│   ├── SERVICE_ACCOUNT_SETUP.md
│   ├── RUN_SCRIPTS.md      # How to run PowerShell scripts
│   └── STRUCTURE.md        # This file
│
├── 🔧 scripts/             # Deployment & Utility Scripts
│   ├── deploy.ps1          # Full PowerShell deployment script
│   ├── deploy.bat          # Windows batch deployment
│   ├── deploy.sh           # Linux/Mac deployment
│   ├── deploy-cloudrun.ps1 # Cloud Run specific deployment
│   ├── quick-start.ps1     # Quick setup and run
│   ├── setup-env.ps1       # Environment variable setup
│   ├── cleanup.ps1        # Cleanup utility
│   └── start.sh            # Docker/Cloud Run startup script
│
├── 🐍 .venv/               # Python Virtual Environment (not in git)
│
└── 📁 Runtime Directories
    └── uploads/            # User uploaded files (runtime)
```

## 📝 File Descriptions

### Core Application
- **api.py**: Main FastAPI application with all API endpoints
- **main.py**: Welding inspector class and Gemini client implementation
- **run_server.py**: Development server with hot-reload enabled
- **run_production.py**: Production server with multiple workers

### Configuration
- **requirements.txt**: All Python package dependencies
- **env.example**: Template for environment variables
- **Dockerfile**: Container image definition
- **docker-compose.yml**: Local Docker development setup
- **cloudbuild.yaml**: Google Cloud Build configuration

### Documentation (docs/)
All markdown documentation files are organized here for easy access.

### Scripts (scripts/)
All executable scripts for deployment, setup, and utilities.

## 🎯 Why This Structure?

1. **Separation of Concerns**: Code, config, docs, and scripts are clearly separated
2. **Easy Navigation**: Related files are grouped together
3. **Clean Root**: Root directory only contains essential files
4. **Scalability**: Easy to add new documentation or scripts without cluttering
5. **Standard Practice**: Follows common Python project structure conventions

## 📌 Notes

- Virtual environment (`.venv/`) is excluded from git
- Runtime directories (`uploads/`, `output/`) are excluded from git
- All temporary files are excluded via `.gitignore`
- Scripts maintain their original functionality, just organized better

