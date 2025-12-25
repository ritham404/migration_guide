def build_rewrite_prompt(filename, services):
    service_list = ", ".join(services)
    return f"""
    You are an expert cloud migration architect.
    The file '{filename}' contains code that uses the following Azure services: {service_list}.
    
    Your task is to rewrite the code to use the equivalent Google Cloud Platform (GCP) services.
    
    Rules:
    1. Replace Azure SDK calls with Google Cloud SDK calls.
    2. Maintain the original logic and functionality.
    3. If direct translation is not possible, add a comment explaining why and suggest a workaround.
    4. Return ONLY the python code, no markdown backticks or explanations outside comments.
    5. Handle authentication: assume Default Credentials or standard client initialization.
    6. If a file is not translatable, respond with a comment block explaining why.

    
    Output the full converted code:
    """
