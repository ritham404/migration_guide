import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash-lite"

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
