"""
Run the FastAPI server in production mode.
"""
import uvicorn
import os

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    workers = int(os.getenv("WORKERS", 2))
    
    uvicorn.run(
        "api:app",
        host=host,
        port=port,
        workers=workers,
        reload=False,
        log_level="info"
    )

