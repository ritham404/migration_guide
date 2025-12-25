import os
import google.generativeai as genai
from config.settings import MODEL_NAME, GEMINI_API_KEY
from core.chunker import chunk_code
from core.prompts import build_rewrite_prompt

# print(GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# print(os.getenv("GEMINI_API_KEY"))
# Mapping extensions to comment styles for migration suggestions
COMMENT_MAP = {
    '.py': ('# ', ''),
    '.js': ('// ', ''),
    '.ts': ('// ', ''),
    '.cs': ('// ', ''),
    '.java': ('// ', ''),
    '.ps1': ('# ', ''),
    '.json': ('/* ', ' */'),
    '.xml': ('<!-- ', ' -->'),
    '.yaml': ('# ', ''),
    '.yml': ('# ', ''),
    '.tsx': ('// ', ''),
    '.jsx': ('// ', '')
}

def _get_comment_style(filename):
    """Get comment style for a given file type"""
    ext = os.path.splitext(filename)[1].lower()
    return COMMENT_MAP.get(ext, ('# ', ''))

def rewrite_code(filename, content, services):
    rewritten = ""
    for chunk in chunk_code(content):
        prompt = build_rewrite_prompt(filename, services)
        response = model.generate_content([prompt, chunk])
        rewritten += response.text + "\n"
    return rewritten

def rewrite_new(filename, content):
    prompt="""
    You are an expert cloud migration architect.
    The file '{filename}' contains code that uses the following Azure services: {service_list}.
    
    Your task is to rewrite the code to use the equivalent Google Cloud Platform (GCP) services.
    
    Rules:
    1. Replace Azure SDK calls with Google Cloud SDK calls.
    2. Maintain the original logic and functionality.
    3. If direct translation is not possible, add a comment explaining why and suggest a workaround.
    4. Return ONLY the python code, no markdown backticks or explanations outside comments.
    5. Handle authentication: assume Default Credentials or standard client initialization.
    
    Output the full converted code:
    """
    resp=model.generate_content([prompt,content])

    print(resp.text)
    return resp.text
def generate_migration_suggestions(filename, content):
    """
    Generate GCP migration suggestions as a comment block.
    This function analyzes the file and returns migration guidance
    without modifying the original code.
    """
    prefix, suffix = _get_comment_style(filename)
    
    prompt = f"""
    ACT AS: Senior Cloud Migration Architect.
    SOURCE: Azure Functions/Services. TARGET: Google Cloud Functions/Services.
    FILE: {filename}
    
    TASK:
    1. Analyze imports/libraries and suggest GCP equivalents (e.g., Azure.Storage -> google-cloud-storage).
    2. Identify Trigger types (HTTP, Timer, Queue, Service Bus) and map to GCF equivalents.
    3. Suggest changes for the function signature and deployment structure.
    4. List any environment variables in this file that need to move to GCP Secret Manager.
    5. Highlight any breaking changes or behavioral differences.
    
    FORMAT:
    Return ONLY the suggestion text. Start with 'GCP MIGRATION ANALYSIS'.
    Be concise and actionable. Do not repeat the original code.
    """
    
    try:
        response = model.generate_content([prompt, content])
        suggestion = response.text
        
        # Formatting the comment block
        analysis_block = f"\n\n{prefix}{'='*50}\n"
        analysis_block += f"{prefix}GCP MIGRATION SUGGESTIONS\n"
        analysis_block += f"{prefix}{'='*50}\n"
        for line in suggestion.splitlines():
            analysis_block += f"{prefix}{line}{suffix}\n"
        analysis_block += f"{prefix}{'='*50}\n"
        
        return analysis_block
    except Exception as e:
        return f"\n\n{prefix}Error generating suggestions: {str(e)}\n"
