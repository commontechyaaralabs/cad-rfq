# CAD RFQ Backend API

FastAPI backend for CAD drawing analysis and welding inspection using Google Gemini AI.

## 📁 Project Structure

```
backend/
├── api.py                 # Main FastAPI application
├── main.py                # Welding inspector implementation
├── run_server.py          # Development server runner
├── run_production.py      # Production server runner
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── Dockerfile            # Docker container configuration
├── docker-compose.yml    # Docker Compose configuration
├── cloudbuild.yaml       # Google Cloud Build configuration
├── .dockerignore         # Docker ignore patterns
├── .gitignore           # Git ignore patterns
│
├── docs/                 # Documentation
│   ├── DEPLOYMENT.md
│   ├── DEPLOY_TO_CLOUDRUN.md
│   ├── DEPLOY_WITHOUT_DOCKER.md
│   ├── QUICK_DEPLOY_CLOUDRUN.md
│   ├── SERVICE_ACCOUNT_SETUP.md
│   └── ...
│
├── scripts/              # Deployment and utility scripts
│   ├── deploy.ps1        # PowerShell deployment script
│   ├── deploy.bat        # Windows batch deployment
│   ├── deploy.sh         # Linux/Mac deployment
│   ├── deploy-cloudrun.ps1
│   ├── quick-start.ps1   # Quick setup script
│   ├── setup-env.ps1     # Environment setup
│   └── cleanup.ps1      # Cleanup utility
│
├── .venv/               # Virtual environment (not in git)
└── uploads/             # Upload directory (runtime)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Google Cloud Project with Vertex AI enabled
- Service account credentials JSON file

### Setup

1. **Create virtual environment:**
   ```bash
   python -m venv .venv
   ```

2. **Activate virtual environment:**
   ```powershell
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   
   # Windows CMD
   .\.venv\Scripts\activate.bat
   
   # Linux/Mac
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   ```bash
   # Copy example file
   copy env.example .env
   
   # Edit .env with your values
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
   ```

5. **Run development server:**
   ```bash
   python run_server.py
   ```

Or use the quick start script:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\quick-start.ps1
```

## 📚 Documentation

All documentation is available in the `docs/` directory:

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - General deployment guide
- **[DEPLOY_TO_CLOUDRUN.md](docs/DEPLOY_TO_CLOUDRUN.md)** - Google Cloud Run deployment
- **[QUICK_DEPLOY_CLOUDRUN.md](docs/QUICK_DEPLOY_CLOUDRUN.md)** - Quick Cloud Run deployment
- **[SERVICE_ACCOUNT_SETUP.md](docs/SERVICE_ACCOUNT_SETUP.md)** - Service account configuration
- **[RUN_SCRIPTS.md](docs/RUN_SCRIPTS.md)** - How to run PowerShell scripts

## 🛠️ Scripts

All deployment and utility scripts are in the `scripts/` directory:

- **deploy.ps1** - Full-featured PowerShell deployment script
- **quick-start.ps1** - Fastest way to get started
- **deploy-cloudrun.ps1** - Cloud Run specific deployment
- **setup-env.ps1** - Environment variable setup

## 🐳 Docker

### Build and Run
```bash
docker build -t cad-rfq-api .
docker run -p 8000:8000 \
  -e GOOGLE_CLOUD_PROJECT=your-project-id \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -v $(pwd)/credentials.json:/app/credentials.json:ro \
  cad-rfq-api
```

### Docker Compose
```bash
docker-compose up -d
```

## 🌐 API Endpoints

- `GET /` - Health check
- `GET /health` - Health status
- `POST /inspect` - Upload CAD drawing for inspection
- `POST /analyze` - Alias for /inspect
- `GET /docs` - Interactive API documentation (Swagger UI)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID | Yes |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | Yes |
| `PORT` | Server port (default: 8000) | No |
| `HOST` | Server host (default: 0.0.0.0) | No |

## 📦 Dependencies

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Google Genai** - Gemini AI client
- **Google Cloud AI Platform** - Vertex AI integration
- **Pandas** - Data processing
- **OpenCV** - Image processing
- **OpenPyXL** - Excel file handling

See `requirements.txt` for complete list.

## 🚢 Deployment

### Google Cloud Run

See detailed instructions in [docs/DEPLOY_TO_CLOUDRUN.md](docs/DEPLOY_TO_CLOUDRUN.md)

Quick deploy:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\deploy-cloudrun.ps1
```

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

