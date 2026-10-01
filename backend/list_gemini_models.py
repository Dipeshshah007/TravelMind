"""
Standalone diagnostic: prints every Gemini model your API key can actually
call, so you never have to guess a model name.

Run from inside backend/ with your venv activated:
    python list_gemini_models.py
"""
import os
from dotenv import load_dotenv

load_dotenv()

import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise SystemExit("GEMINI_API_KEY not found in backend/.env")

genai.configure(api_key=api_key)

print("Models this API key can use with generateContent:\n")
for m in genai.list_models():
    if "generateContent" in getattr(m, "supported_generation_methods", []):
        print(" -", m.name.replace("models/", ""))
