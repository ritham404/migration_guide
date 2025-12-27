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
The file '{filename}' contains Python code that uses the following cloud services:
{service_list}

You are a cloud migration compiler, not an explainer.

The input code is written for AWS Lambda or Azure Functions.
Your job is to produce a **fully functional, directly deployable Google Cloud Function (HTTP-triggered, Gen-2 compatible)**.

ABSOLUTE REQUIREMENTS (NON-NEGOTIABLE):

1. The output MUST be valid Python code that RUNS on Google Cloud Functions.
2. The output MUST NOT require any manual fixes after generation.
3. The output MUST be executable with `gcloud functions deploy`.

HANDLER RULES (CRITICAL):

4. You MUST define exactly ONE HTTP handler using this signature:

   @functions_framework.http
   def handler(request):

5. You MUST NOT use:
   - lambda_handler
   - event
   - context
   - statusCode
   - body
   - Azure bindings
   - API Gateway assumptions

REQUEST PARSING RULES:

6. You MUST parse input ONLY using:
   - request.get_json(silent=True)
   - request.args
   - request.headers

7. You MUST NOT read request data from dictionaries like event["body"].

RESPONSE RULES:

8. You MUST return responses ONLY in GCP-valid formats:
   - return (response_body, status_code)
   - OR return (response_body, status_code, headers)

9. You MUST NOT return AWS-style dictionaries such as:
   { "statusCode": 200, "body": "..." }

SDK & DEPENDENCY RULES:

10. You MUST replace all AWS/Azure SDKs with official Google Cloud SDKs.
11. You MUST use only supported Google Cloud Python libraries.
12. Assume Application Default Credentials.
13. Do NOT include placeholder or pseudo-code.

FAILURE CONDITIONS (IMPORTANT):

14. If you cannot produce a fully functional GCP Cloud Function,
    return ONLY a Python comment explaining why conversion is not possible.

FINAL OUTPUT RULES:

15. Output ONLY Python code.
16. No markdown, no explanations outside comments.
17. Code MUST be deployable without modification.

NOW CONVERT THE CODE BELOW INTO A WORKING GCP CLOUD FUNCTION:
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
