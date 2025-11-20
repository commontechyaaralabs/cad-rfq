import base64
import mimetypes
import json
from google import genai
from google.genai import types

# ------------------ CONFIG ------------------
PROJECT = "playgroundai-470111"       # your GCP project ID
REGION = "us-east4"                   # Vertex AI region
MODEL = "gemini-2.5-pro"              # Gemini model name
IMAGE_PATH = r"E:\Office\welding_analyzer\automotive cad\tallisdrawing-768x594.png"  # your drawing

# ------------------ PROMPT ------------------
PROMPT = (
    "You are an expert mechanical quality engineer specializing in CAD and GD&T analysis. "
    "You are analyzing a detailed engineering drawing (for example, a spark plug drawing). "
    "Your task is to extract all *critical geometric and dimensional features* and evaluate their inspection relevance.\n\n"

    "INSTRUCTIONS:\n"
    "1. Identify every distinct dimensional feature (e.g., diameter, chamfer, radius, thread, spacing, etc.).\n"
    "2. Assign sequential IDs starting from F1, F2, F3, and so on.\n"
    "3. Extract the dimension value EXACTLY as written (e.g., Ø0.06, R0.2, M14x1.25 THREAD, etc.).\n"
    "4. Identify the Tolerance_Type — e.g., ± tolerance, Limit, GD&T, or None.\n"
    "5. Estimate Criticality_Score (1–5) based on its effect on function/assembly/safety.\n"
    "6. Define Measurement_Method — e.g., Vernier, Micrometer, CMM, Thread Gauge.\n"
    "7. Rate Accessibility_Rating (1–5) — 1=very hard to measure, 5=easy.\n"
    "8. Estimate Stack_Up_Impact — High, Medium, or Low.\n"
    "9. Assign a Confidence score (High, Medium, or Low) based on how clearly the feature and its tolerance can be interpreted from the drawing.\n\n"

    "OUTPUT REQUIREMENTS:\n"
    "1. Output ONLY valid JSON (no markdown, no code blocks).\n"
    "2. Use this exact structure:\n"
    "{\n"
    "  \"features\": [\n"
    "    {\n"
    "      \"Feature_ID\": \"F1\",\n"
    "      \"Dimension_Value\": \"...\",\n"
    "      \"Tolerance_Type\": \"...\",\n"
    "      \"Criticality_Score\": \"...\",\n"
    "      \"Measurement_Method\": \"...\",\n"
    "      \"Accessibility_Rating\": \"...\",\n"
    "      \"Stack_Up_Impact\": \"...\",\n"
    "      \"Confidence\": \"...\"\n"
    "    },\n"
    "    ...\n"
    "  ],\n"
    "  \"explanations\": \"Detailed reasoning for each feature, including why its confidence, criticality, and inspection parameters were assigned.\"\n"
    "}\n"
    "3. Cover ALL dimensional features visible in the drawing."
)
# ------------------ GEMINI CLIENT ------------------
def analyze_image_with_gemini(project, region, model, image_path, prompt):
    client = genai.Client(vertexai=True, project=project, location=region)

    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = "image/jpeg"

    with open(image_path, "rb") as f:
        image_b64 = base64.b64encode(f.read()).decode("utf-8")

    image_part = types.Part(
        inline_data=types.Blob(mime_type=mime_type, data=image_b64)
    )

    response = client.models.generate_content(
        model=model,
        contents=[prompt, image_part],
        config={"max_output_tokens": 16384, "temperature": 0},
    )

    return response.text


# ------------------ MAIN ------------------
if __name__ == "__main__":
    print("🔍 Running Gemini CAD feature extraction test...\n")
    result = analyze_image_with_gemini(PROJECT, REGION, MODEL, IMAGE_PATH, PROMPT)

    # Try parsing JSON for readability
    try:
        parsed = json.loads(result)
        print(json.dumps(parsed, indent=2))
    except Exception:
        print("\n⚠ Raw model response (not valid JSON):\n")
        print(result)