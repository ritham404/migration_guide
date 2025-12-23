from config.service_map import SERVICE_MAP

def detect_azure_services(content):
    detected = []
    for service, meta in SERVICE_MAP.items():
        for p in meta["patterns"]:
            if p in content:
                detected.append(service)
                break
    return detected
