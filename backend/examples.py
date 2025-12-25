"""
Example usage of the Migration Agent.
Demonstrates various ways to use the migration system.
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from main import migrate


def example_1_migrate_from_git():
    """Example 1: Migrate from a Git repository."""
    print("\n" + "="*60)
    print("EXAMPLE 1: Migrate from Git Repository")
    print("="*60)
    
    source_url = "https://github.com/username/azure-functions-repo.git"
    
    try:
        result = migrate(source_url, include_suggestions=True)
        
        print(f"\n✓ Migration completed successfully!")
        print(f"\nWorkspace directory: {result['workspace']}")
        print(f"\nMigration Report:\n{result['report']}")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")


def example_2_migrate_from_zip():
    """Example 2: Migrate from a local ZIP file."""
    print("\n" + "="*60)
    print("EXAMPLE 2: Migrate from ZIP File")
    print("="*60)
    
    zip_file_path = "path/to/azure-project.zip"
    
    if not os.path.exists(zip_file_path):
        print(f"\nNote: ZIP file not found at {zip_file_path}")
        print("To use this example, provide a valid ZIP file path")
        return
    
    try:
        result = migrate(zip_file_path, include_suggestions=True)
        
        print(f"\n✓ Migration completed successfully!")
        print(f"\nWorkspace directory: {result['workspace']}")
        print(f"\nMigration Report:\n{result['report']}")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")


def example_3_analyze_without_rewriting():
    """Example 3: Generate migration suggestions without rewriting code."""
    print("\n" + "="*60)
    print("EXAMPLE 3: Analysis-Only Mode (Suggestions Only)")
    print("="*60)
    
    from core.rewriter import generate_migration_suggestions
    from core.detector import detect_azure_services
    
    sample_code = """
import azure.functions as func
from azure.storage.blob import BlobServiceClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    connection_string = "DefaultEndpointsProtocol=https;..."
    blob_client = BlobServiceClient.from_connection_string(connection_string)
    return func.HttpResponse("OK")
"""
    
    # Detect Azure services
    services = detect_azure_services(sample_code)
    print(f"\nDetected Azure services: {services}")
    
    # Generate suggestions
    suggestions = generate_migration_suggestions("example_function.py", sample_code)
    print(f"\nMigration Suggestions:\n{suggestions}")


def example_4_batch_migration():
    """Example 4: Migrate multiple projects."""
    print("\n" + "="*60)
    print("EXAMPLE 4: Batch Migration")
    print("="*60)
    
    projects = [
        "https://github.com/user/project1.git",
        "https://github.com/user/project2.git",
        "path/to/project3.zip",
    ]
    
    results = {}
    
    for project in projects:
        print(f"\nMigrating: {project}")
        try:
            result = migrate(project, include_suggestions=True)
            results[project] = "✓ Success"
            print(f"  ✓ Success - Workspace: {result['workspace']}")
        except Exception as e:
            results[project] = f"✗ Failed: {str(e)[:50]}..."
            print(f"  ✗ Failed: {e}")
    
    print("\n" + "="*60)
    print("Batch Migration Summary")
    print("="*60)
    for project, status in results.items():
        print(f"{project}: {status}")


def example_5_custom_configuration():
    """Example 5: Using different Gemini models."""
    print("\n" + "="*60)
    print("EXAMPLE 5: Custom Configuration")
    print("="*60)
    
    from config.settings import MODEL_NAME
    
    print(f"\nCurrent model: {MODEL_NAME}")
    print("""
To change the model:
1. Edit config/settings.py
2. Change MODEL_NAME to:
   - 'gemini-1.5-flash' (faster, good for most cases)
   - 'gemini-1.5-pro' (more accurate, for complex logic)
3. Restart the application
""")


def example_6_api_client():
    """Example 6: Using the API programmatically."""
    print("\n" + "="*60)
    print("EXAMPLE 6: API Client Usage")
    print("="*60)
    
    print("""
Using httpx to call the API:

```python
import httpx

# Migrate from Git repo
response = httpx.post(
    "http://localhost:8000/migrate/url",
    json={
        "source_url": "https://github.com/user/repo.git",
        "include_suggestions": True
    }
)
result = response.json()
print(result["report"])

# Migrate from ZIP file
with open("project.zip", "rb") as f:
    response = httpx.post(
        "http://localhost:8000/migrate/file",
        files={"file": ("project.zip", f)},
        data={"include_suggestions": "true"}
    )
result = response.json()
print(result["report"])
```
""")


def example_7_reading_migration_results():
    """Example 7: Reading and analyzing migration results."""
    print("\n" + "="*60)
    print("EXAMPLE 7: Reading Migration Results")
    print("="*60)
    
    print("""
After migration, your workspace will contain:

1. Migrated files with original names
2. Backup files with .azure.bak extension
3. Migration suggestions in comments

Example structure:
```
workspace/
├── src/
│   ├── function.py              (migrated code + suggestions)
│   ├── function.py.azure.bak    (original Azure code)
│   ├── utils.ts                 (migrated code)
│   └── utils.ts.azure.bak       (original code)
├── config/
│   └── settings.json            (updated config)
└── output/
    └── report.txt               (migration report)
```

To review the migration:
1. Check output/report.txt for overall summary
2. Review .azure.bak files to compare changes
3. Look for migration suggestion comments
4. Test thoroughly before deployment
""")


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║       Azure to GCP Migration Agent - Examples             ║
╚════════════════════════════════════════════════════════════╝
""")
    
    examples = [
        ("Git Repository Migration", example_1_migrate_from_git),
        ("ZIP File Migration", example_2_migrate_from_zip),
        ("Analysis Only", example_3_analyze_without_rewriting),
        ("Batch Migration", example_4_batch_migration),
        ("Custom Configuration", example_5_custom_configuration),
        ("API Client Usage", example_6_api_client),
        ("Reading Results", example_7_reading_migration_results),
    ]
    
    for i, (name, func) in enumerate(examples, 1):
        print(f"\n[{i}] {name}")
    
    print("\n" + "="*60)
    print("Running all examples...\n")
    
    for name, func in examples:
        try:
            func()
        except Exception as e:
            print(f"\n✗ Example error: {e}")
    
    print("\n" + "="*60)
    print("All examples completed!")
    print("="*60)
