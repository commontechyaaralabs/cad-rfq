# Deploy Backend Without Docker

## Option 1: Direct Python Deployment (Local/Server)

### Step 1: Install Python 3.11+
Download from: https://www.python.org/downloads/

### Step 2: Set Up Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Set Environment Variables
```bash
set GOOGLE_CLOUD_PROJECT=your-project-id
set GOOGLE_APPLICATION_CREDENTIALS=path\to\credentials.json
```

### Step 5: Run the Server
```bash
python run_server.py
```

Or for production:
```bash
python run_production.py
```

---

## Option 2: Deploy to Google Cloud Run (Without Docker Locally)

### Using Cloud Build (Recommended)

1. **Install Google Cloud SDK**
   - Download: https://cloud.google.com/sdk/docs/install
   - Run installer and authenticate: `gcloud auth login`

2. **Set Your Project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable Required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

4. **Deploy Using Cloud Build**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

   This will:
   - Build the Docker image in the cloud
   - Push to Container Registry
   - Deploy to Cloud Run

---

## Option 3: Deploy to Railway (No Docker Required Locally)

1. **Sign up at Railway.app**
2. **Create New Project**
3. **Connect GitHub Repository**
4. **Add Environment Variables:**
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_APPLICATION_CREDENTIALS` (paste JSON content)
5. **Set Build Command:** `pip install -r requirements.txt`
6. **Set Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
7. **Deploy**

---

## Option 4: Deploy to Render (No Docker Required Locally)

1. **Sign up at render.com**
2. **Create New Web Service**
3. **Connect Repository**
4. **Configure:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables:**
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_APPLICATION_CREDENTIALS` (paste JSON)
6. **Deploy**

---

## Option 5: Install Docker Desktop (If You Want Docker)

### Windows Installation:
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Start Docker Desktop
4. Verify: `docker --version`

Then you can use:
```bash
docker build -t welding-analyzer-api .
docker run -p 8000:8000 -e GOOGLE_CLOUD_PROJECT=your-project-id welding-analyzer-api
```

---

## Quick Start (No Docker - Local Testing)

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment variables
set GOOGLE_CLOUD_PROJECT=playgroundai-470111
set GOOGLE_APPLICATION_CREDENTIALS=path\to\your\credentials.json

# 5. Run server
python run_server.py
```

Server will be available at: http://localhost:8000

---

## Troubleshooting

### If Python is not recognized:
- Add Python to PATH during installation
- Or use full path: `C:\Python311\python.exe`

### If pip is not recognized:
- Use: `python -m pip install -r requirements.txt`

### If OpenCV fails to install:
- Install Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe

