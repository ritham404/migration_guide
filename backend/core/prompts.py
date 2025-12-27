def build_rewrite_prompt(filename, services):
    service_list = ", ".join(services)
    return f"""
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