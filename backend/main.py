import os
import shutil

from core.source_loader import load_source
from core.detector import detect_azure_services
from core.rewriter import rewrite_new, generate_migration_suggestions
from core.validator import validate
from utils.fs_utils import iter_files, is_text_file
from utils.report import MigrationReport

OUTPUT_DIR = "output"

def migrate(source, include_suggestions=False):
    """
    Migrate Azure code to GCP.
    
    Args:
        source: Path to zip file or Git URL
        include_suggestions: If True, adds migration suggestion comments to files

    """
    print("source",source)
    workspace = load_source(source)
    report = MigrationReport()

    for path in iter_files(workspace):
        if not is_text_file(path):
            continue

        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                # print(content)
        except Exception:
            continue

        services = detect_azure_services(content)
        services.append(1)
        print(services)
        if not services:
            report.add(path, "No Azure dependency")
            continue
        tc=0
        linelist=content.split("\n")
        for l in linelist:
            tc+=len(l.split(" "))
        print("caLLAI",tc)
        rewritten = rewrite_new(path, content)
        
        # Add migration suggestions as comments if requested
        if include_suggestions:
            suggestions = generate_migration_suggestions(path, content)
            rewritten += suggestions
        
        ok, reason = validate(rewritten)

        with open(path + ".azure.bak", "w", encoding="utf-8") as f:
            f.write(content)

        if ok:
            with open(path, "w", encoding="utf-8") as f:
                f.write(rewritten)
            report.add(path, "Converted" + (" (with suggestions)" if include_suggestions else ""))
        else:
            report.add(path, f"FAILED ({reason})")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("test",OUTPUT_DIR)
    report_content = report.render()
    with open(os.path.join(OUTPUT_DIR, "report.txt"), "w") as f:
        f.write(report_content)

    print("Migration completed")
    print(f"Workspace: {workspace}")
    
    return {
        "workspace": workspace,
        "report": report_content
    }

if __name__ == "__main__":
    migrate(
        source="https://github.com/USER/REPO.git",
        include_suggestions=True
        # OR source="input.zip"
    )
