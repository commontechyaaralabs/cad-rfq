# Backend Directory Structure

This document explains the organization of the backend directory.

## 📁 Directory Layout

```
backend/
│
├── 📄 Core Application Files
│   ├── api.py              # Main FastAPI application with all endpoints
│   ├── main.py             # Welding inspector & Gemini client implementation
│   ├── run_server.py       # Development server (with auto-reload)
│   └── run_production.py   # Production server (multi-worker)
│
├── ⚙️ Configuration Files
│   ├── requirements.txt    # Python dependencies
│   ├── env.example         # Environment variables template
│   ├── Dockerfile          # Docker container definition
│   ├── .dockerignore       # Files to exclude from Docker builds
│   ├── .gcloudignore       # Files to exclude from gcloud builds
│   └── .gitignore          # Files to exclude from Git
│
├── 📚 docs/                # Documentation
│   ├── MIGRATION_TO_LOGISTICS_PROJECT.md  # Cloud project migration guide
│   └── STRUCTURE.md        # This file
│
├── 🔧 scripts/             # Deployment Scripts
│   └── deploy-gcloud.ps1   # PowerShell Cloud Run deployment script
│
├── 🐍 .venv/               # Python Virtual Environment (not in git)
│
└── 📁 uploads/             # Runtime upload directory
```

## 📝 File Descriptions

### Core Application
| File | Description |
|------|-------------|
| `api.py` | Main FastAPI application with all API endpoints (welding analysis, RFQ comparison, supply chain automation) |
| `main.py` | Welding inspector class with Gemini client implementation |
| `run_server.py` | Development server with hot-reload enabled (uvicorn --reload) |
| `run_production.py` | Production server with multiple workers |

### Configuration
| File | Description |
|------|-------------|
| `requirements.txt` | All Python package dependencies |
| `env.example` | Template for environment variables |
| `Dockerfile` | Container image definition for Cloud Run |
| `.dockerignore` | Files excluded from Docker builds |
| `.gcloudignore` | Files excluded from gcloud builds |

### Documentation (docs/)
| File | Description |
|------|-------------|
| `MIGRATION_TO_LOGISTICS_PROJECT.md` | Guide for migrating to `logistics-479609` project |
| `STRUCTURE.md` | This file - directory structure documentation |

### Scripts (scripts/)
| File | Description |
|------|-------------|
| `deploy-gcloud.ps1` | PowerShell script for Cloud Run deployment |

## 🌐 Deployed Service

- **Project:** `logistics-479609`
- **Service:** `logistics-manufacturing-api`
- **Region:** `us-east4`
- **URL:** https://logistics-manufacturing-api-1033805860980.us-east4.run.app

## 📌 Notes

- Virtual environment (`.venv/`) is excluded from git
- Runtime directories (`uploads/`) are excluded from git
- All temporary files are excluded via `.gitignore`
- Use Application Default Credentials for local development
- Cloud Run uses Workload Identity for authentication
