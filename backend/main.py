import os
import shutil

from core.source_loader import load_source
from core.detector import detect_azure_services
from core.rewriter import rewrite_code
from core.validator import validate
from utils.fs_utils import iter_files, is_text_file
from utils.report import MigrationReport

OUTPUT_DIR = "output"

def migrate(source):
    workspace = load_source(source)
    report = MigrationReport()

    for path in iter_files(workspace):
        if not is_text_file(path):
            continue

        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception:
            continue

        services = detect_azure_services(content)
        if not services:
            report.add(path, "No Azure dependency")
            continue

        rewritten = rewrite_code(path, content, services)
        ok, reason = validate(rewritten)

        with open(path + ".azure.bak", "w", encoding="utf-8") as f:
            f.write(content)

        if ok:
            with open(path, "w", encoding="utf-8") as f:
                f.write(rewritten)
            report.add(path, "Converted")
        else:
            report.add(path, f"FAILED ({reason})")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "report.txt"), "w") as f:
        f.write(report.render())

    print("Migration completed")
    print(f"Workspace: {workspace}")

if __name__ == "__main__":
    migrate(
        source="https://github.com/USER/REPO.git"
        # OR source="input.zip"
    )
