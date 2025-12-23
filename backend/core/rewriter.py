import google.generativeai as genai
from config.settings import MODEL_NAME
from core.chunker import chunk_code
from core.prompts import build_rewrite_prompt

model = genai.GenerativeModel(MODEL_NAME)

def rewrite_code(filename, content, services):
    rewritten = ""
    for chunk in chunk_code(content):
        prompt = build_rewrite_prompt(filename, services)
        response = model.generate_content([prompt, chunk])
        rewritten += response.text + "\n"
    return rewritten
