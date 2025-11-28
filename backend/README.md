# CAD RFQ Backend API

FastAPI backend for CAD drawing analysis, welding inspection, and supply chain document automation using Google Gemini AI.

## 🌐 Deployed Service

**Production URL:** https://logistics-manufacturing-api-1033805860980.us-east4.run.app

**API Documentation:** https://logistics-manufacturing-api-1033805860980.us-east4.run.app/docs

## 📁 Project Structure

```
backend/
├── api.py                 # Main FastAPI application with all endpoints
├── main.py                # Welding inspector implementation
├── run_server.py          # Development server runner
├── run_production.py      # Production server runner
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── Dockerfile            # Docker container configuration
├── .dockerignore         # Docker ignore patterns
├── .gitignore           # Git ignore patterns
│
├── docs/                 # Documentation
│   ├── MIGRATION_TO_LOGISTICS_PROJECT.md  # Cloud project migration guide
│   └── STRUCTURE.md      # Project structure documentation
│
├── scripts/              # Deployment scripts
│   └── deploy-gcloud.ps1 # PowerShell Cloud Run deployment
│
└── uploads/              # Runtime upload directory
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Google Cloud Project: `logistics-479609`
- Application Default Credentials (ADC) for local development

### Local Development Setup

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

4. **Set up Application Default Credentials:**
   ```bash
   gcloud auth application-default login
   gcloud config set project logistics-479609
   ```

5. **Create .env file:**
   ```bash
   # Copy example file
   copy env.example .env
   ```

6. **Run development server:**
   ```bash
   python run_server.py
   ```

   Server runs at: http://localhost:8000

## 🌐 API Endpoints

### Health & Status
- `GET /` - Root endpoint with welcome message
- `GET /health` - Health check status

### Welding Analysis
- `POST /inspect` - Upload CAD drawing for welding inspection
- `POST /analyze` - Alias for /inspect

### RFQ Comparison
- `POST /compare-rfq` - Compare multiple vendor RFQ documents
- `POST /rfq-cad-compare` - Compare RFQ requirements with CAD drawing

### Supply Chain Document Automation
- `POST /supply-chain/upload` - Upload documents for processing
- `GET /supply-chain/status/{document_id}` - Get document processing status
- `GET /supply-chain/documents` - Get all documents
- `POST /supply-chain/approve/{document_id}` - Approve document processing
- `POST /supply-chain/reject/{document_id}` - Reject document

### Interactive Documentation
- `GET /docs` - Swagger UI (interactive API documentation)
- `GET /redoc` - ReDoc API documentation

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID (`logistics-479609`) | Yes |
| `PORT` | Server port (default: 8000) | No |
| `HOST` | Server host (default: 0.0.0.0) | No |

## 🚢 Deployment to Cloud Run

### Using Deployment Script
```powershell
cd backend
.\scripts\deploy-gcloud.ps1
```

### Manual Deployment
```bash
# Set project
gcloud config set project logistics-479609

# Build and deploy
gcloud builds submit --tag us-east4-docker.pkg.dev/logistics-479609/cloud-run-source-deploy/logistics-manufacturing-api

# Deploy to Cloud Run
gcloud run deploy logistics-manufacturing-api \
  --image us-east4-docker.pkg.dev/logistics-479609/cloud-run-source-deploy/logistics-manufacturing-api \
  --platform managed \
  --region us-east4 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=logistics-479609
```

## 📦 Dependencies

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Google Genai** - Gemini AI client
- **Google Cloud AI Platform** - Vertex AI integration
- **Pandas** - Data processing
- **OpenCV** - Image processing
- **OpenPyXL** - Excel file handling

See `requirements.txt` for complete list.

## 📚 Documentation

- **[MIGRATION_TO_LOGISTICS_PROJECT.md](docs/MIGRATION_TO_LOGISTICS_PROJECT.md)** - Cloud project migration guide
- **[STRUCTURE.md](docs/STRUCTURE.md)** - Detailed project structure

## 🔍 Testing

### Health Check
```powershell
Invoke-WebRequest -Uri "https://logistics-manufacturing-api-1033805860980.us-east4.run.app/health" -UseBasicParsing
```

### Local Testing
```powershell
# Start server
python run_server.py

# Test health
curl http://localhost:8000/health
```
