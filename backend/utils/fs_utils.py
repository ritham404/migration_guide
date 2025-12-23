import os

TEXT_EXTENSIONS = {
    ".py", ".js", ".ts", ".java",
    ".cs", ".json", ".yaml", ".yml"
}

IGNORED_DIRS = {
    "node_modules", ".git", "bin",
    "obj", ".venv", "dist", "target"
}

def iter_files(root):
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        for f in files:
            yield os.path.join(base, f)

def is_text_file(path):
    _, ext = os.path.splitext(path)
    return ext.lower() in TEXT_EXTENSIONS
