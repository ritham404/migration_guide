FORBIDDEN = ["@azure/", "Microsoft.Azure", "azure.functions"]

def validate(code):
    for f in FORBIDDEN:
        if f in code:
            return False, f
    return True, None
