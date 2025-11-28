import base64
import mimetypes
import re
import json
import logging
import asyncio
from pathlib import Path
import pandas as pd
from google import genai
from google.genai import types
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


# ----------------- Config -----------------
PROJECT = "logistics-479609"          # your GCP project ID
REGION = "us-east4"                      # your Vertex AI region
MODEL = "gemini-2.5-pro"                 # Gemini model name
IMAGE_PATH = "E:/Office/paligemma/backend/src/With Block_page-0001.jpg"  # your CAD/welding drawing


# ----------------- Logging Setup -----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("inspection.log", mode="a", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


# ----------------- Gemini Client -----------------
class GeminiClient:
    """Wrapper around Gemini 2.5 Pro via Vertex AI SDK."""

    def __init__(self, project: str, region: str, model_name: str):
        self.client = genai.Client(
            vertexai=True,
            project=project,
            location=region,
        )
        self.model_name = model_name

    def chat(self, image_path: str, prompt: str) -> str:
        """Send image + prompt to Gemini and return text response."""
        logger.info(f"Sending '{image_path}' to Gemini model {self.model_name}")

        # Detect MIME type (jpg, png, etc.)
        mime_type, _ = mimetypes.guess_type(image_path)
        if mime_type is None:
            mime_type = "image/jpeg"  # default

        # Load image bytes and encode as base64
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        # Create image part using inline data with base64
        image_part = types.Part(
            inline_data=types.Blob(
                mime_type=mime_type,
                data=image_b64
            )
        )

        # Generate content
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[
                prompt,
                image_part,
            ],
            config={
                "max_output_tokens": 16384,
                "temperature": 0,
            },
        )

        # Check if response was truncated
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'finish_reason'):
                if candidate.finish_reason == 'MAX_TOKENS':
                    logger.warning("⚠ Response may have been truncated due to token limit")
                logger.info(f"Finish reason: {candidate.finish_reason}")

        return response.text


# ----------------- Welding Inspector -----------------
class WeldingInspector:
    def __init__(self, client: GeminiClient):
        self.client = client
        self.output_dir = Path("output")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def inspect_drawing(self, image_path: str) -> str:
        """Analyze a CAD or welding drawing and generate a detailed report."""
        logger.info("=== START INSPECTION ===")
        logger.info(f"Processing image: {image_path}")

        prompt = (
            "You are an expert welding engineer analyzing a technical CAD or welding drawing. "
            "Carefully examine the entire drawing and identify ALL welds present in the diagram.\n\n"
            "INSTRUCTIONS:\n"
            "1. Identify every weld symbol, weld callout, and welding annotation visible in the drawing.\n"
            "2. Assign sequential serial numbers starting from W1, W2, W3, and continue for ALL welds found.\n"
            "3. Extract part numbers, plate numbers (PL), component numbers, and any other identifiers EXACTLY as shown in the drawing.\n"
            "4. Do NOT assume or invent part numbers - use only what is clearly visible in the drawing.\n"
            "5. Identify all welds regardless of their type or location.\n\n"
            "For each weld identified, provide:\n"
            "- Serial No (W1, W2, W3, ... - assign sequentially for all welds found)\n"
            "- Description (detailed description using EXACT part numbers, plate numbers, and component names as shown in the drawing)\n"
            "- Welding Type (e.g., Fillet Weld, Double Fillet Weld, Groove Weld, etc. - identify from weld symbols)\n"
            "- Welding Value (size in mm - extract exactly as specified in the drawing)\n"
            "- Remarks (any notes, flags, or annotations like TYP, OF DRIVE, OF MOTOR, M, etc. - use exactly as shown)\n"
            "- Position (location description referencing the exact parts, sections, or views shown)\n"
            "- Confidence (High if clearly visible, Medium if partially visible, Low if uncertain)\n\n"
            "CRITICAL OUTPUT REQUIREMENTS:\n"
            "1. Output ONLY valid JSON format with NO additional text before or after.\n"
            "2. The JSON structure must be:\n"
            "   {\n"
            "     \"welds\": [\n"
            "       {\n"
            "         \"Serial No\": \"W1\",\n"
            "         \"Description\": \"...\",\n"
            "         \"Welding Type\": \"...\",\n"
            "         \"Welding Value\": \"...\",\n"
            "         \"Remarks\": \"...\",\n"
            "         \"Position\": \"...\",\n"
            "         \"Confidence\": \"...\"\n"
            "       },\n"
            "       ...\n"
            "     ],\n"
            "     \"explanations\": \"Detailed explanations for each weld...\"\n"
            "   }\n"
            "3. Include ALL welds found - do not stop early. Continue until you have identified every weld in the drawing.\n"
            "4. Use EXACT part numbers, plate numbers, and identifiers as they appear in the drawing (e.g., Part 1, PL10-21, Beam B11, etc.).\n"
            "5. The \"welds\" array should contain one object per weld with all 7 fields.\n"
            "6. The \"explanations\" field should contain detailed explanations for each weld, referencing the exact locations and symbols from the drawing.\n"
            "7. Output ONLY valid JSON - no markdown, no code blocks, no explanations outside the JSON structure."
        )

        response_text = self.client.chat(image_path, prompt)

        base_name = Path(image_path).stem
        txt_file = self.output_dir / f"{base_name}_gemini_report.txt"
        with open(txt_file, "w", encoding="utf-8") as f:
            f.write(response_text)

        logger.info(f"Raw Gemini response saved -> {txt_file}")
        logger.info("=== INSPECTION COMPLETE ===")
        return response_text

    def parse_json_response(self, response_text: str):
        """Parse JSON response from Gemini and extract welds and explanations.
        
        Returns:
            tuple: (welds_list, explanations_string) or (None, None) if parsing fails
        """
        try:
            # Try to extract JSON from response (might have code blocks or extra text)
            response_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]  # Remove ```json
            elif response_text.startswith("```"):
                response_text = response_text[3:]  # Remove ```
            
            if response_text.endswith("```"):
                response_text = response_text[:-3]  # Remove closing ```
            
            response_text = response_text.strip()
            
            # Find JSON object in the text
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            
            if json_start == -1 or json_end == 0:
                logger.warning("⚠ No JSON object found in response.")
                return None, None
            
            json_str = response_text[json_start:json_end]
            
            # Parse JSON
            data = json.loads(json_str)
            
            # Extract welds array
            welds = data.get("welds", [])
            explanations = data.get("explanations", "")
            
            if not welds:
                logger.warning("⚠ No welds found in JSON response.")
                return None, None
            
            # Convert to list of dictionaries with consistent keys
            result = []
            for weld in welds:
                # Ensure all expected keys exist
                weld_dict = {
                    "Serial No": str(weld.get("Serial No", "")),
                    "Description": str(weld.get("Description", "")),
                    "Welding Type": str(weld.get("Welding Type", "")),
                    "Welding Value": str(weld.get("Welding Value", "")),
                    "Remarks": str(weld.get("Remarks", "")),
                    "Position": str(weld.get("Position", "")),
                    "Confidence": str(weld.get("Confidence", ""))
                }
                result.append(weld_dict)
            
            logger.info(f"✅ Successfully parsed {len(result)} welds from JSON")
            return result, explanations
            
        except json.JSONDecodeError as e:
            logger.error(f"⚠ JSON parsing error: {e}")
            logger.error(f"Response text (first 500 chars): {response_text[:500]}")
            return None, None
        except Exception as e:
            logger.error(f"⚠ Error parsing JSON response: {e}", exc_info=True)
            return None, None

    def export_table(self, response_text: str, image_path: str):
        """Extract welds from JSON response and save as CSV + Excel."""
        welds, explanations = self.parse_json_response(response_text)
        
        if welds is None:
            logger.warning("⚠ Could not parse welds from JSON response.")
            return None

        df = pd.DataFrame(welds)
        base_name = Path(image_path).stem
        csv_file = self.output_dir / f"{base_name}_gemini_inspection.csv"
        xlsx_file = self.output_dir / f"{base_name}_gemini_inspection.xlsx"

        # Try to export files, handling permission errors gracefully
        exported_files = []
        try:
            df.to_csv(csv_file, index=False)
            exported_files.append(str(csv_file))
        except (PermissionError, IOError) as e:
            logger.warning(f"⚠ Could not write CSV file (file may be open): {csv_file}")
            logger.warning(f"   Error: {e}")

        try:
            df.to_excel(xlsx_file, index=False)
            exported_files.append(str(xlsx_file))
        except (PermissionError, IOError) as e:
            logger.warning(f"⚠ Could not write Excel file (file may be open): {xlsx_file}")
            logger.warning(f"   Error: {e}")

        if exported_files:
            logger.info(f"Exported table -> {', '.join(exported_files)}")
        else:
            logger.warning("⚠ Could not export any files. Please close the CSV/Excel files if they are open.")

        return df


# ----------------- FastAPI App -----------------
# Global variables for client and inspector (initialized on startup)
client = None
inspector = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize client and inspector
    global client, inspector
    client = GeminiClient(PROJECT, REGION, MODEL)
    inspector = WeldingInspector(client)
    logger.info("Application startup: Gemini client initialized")
    yield
    # Shutdown: Cleanup if needed
    logger.info("Application shutdown")


app = FastAPI(title="Welding Inspector API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welding Inspector API is running"}


@app.post("/inspect")
async def inspect_drawing(file: UploadFile = File(...)):
    """Upload an image and get welding inspection report."""
    if inspector is None:
        return JSONResponse(
            status_code=503,
            content={"success": False, "message": "Service not initialized"}
        )
    try:
        # Save uploaded file temporarily
        temp_path = Path(f"temp_{file.filename}")
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Run blocking operations in thread pool to avoid blocking event loop
        def process_inspection():
            report = inspector.inspect_drawing(str(temp_path))
            inspector.export_table(report, str(temp_path))
            # Parse JSON to extract table data for frontend
            welds, explanations = inspector.parse_json_response(report)
            return report, welds, explanations
        
        # Execute blocking call in thread pool
        report, table_data, explanations = await asyncio.to_thread(process_inspection)
        
        # Clean up temp file
        temp_path.unlink(missing_ok=True)
        
        # Ensure table_data is always a list (empty list if None)
        table_data = table_data if table_data is not None else []
        
        return JSONResponse(content={
            "success": True,
            "report": report,
            "table": table_data,
            "explanations": explanations or "",
            "message": "Inspection complete. Check output directory for CSV/Excel files."
        })
    except Exception as e:
        logger.error(f"Error during inspection: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(e)}
        )


@app.post("/analyze")
async def analyze_drawing(file: UploadFile = File(...)):
    """Upload an image and get welding inspection report (alias for /inspect)."""
    return await inspect_drawing(file)


# ----------------- Main (for direct script execution) -----------------
def main():
    client = GeminiClient(PROJECT, REGION, MODEL)
    inspector = WeldingInspector(client)

    report = inspector.inspect_drawing(IMAGE_PATH)
    print("\nINSPECTION REPORT\n")
    print(report)

    inspector.export_table(report, IMAGE_PATH)


if __name__ == "__main__":
    main()