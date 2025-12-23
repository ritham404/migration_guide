import os
import shutil
import zipfile
import tempfile
from git import Repo

IGNORED_DIRS = {
    "node_modules", ".git", "bin", "obj",
    ".venv", "dist", "target"
}

def load_source(source: str) -> str:
    """
    Returns a local workspace directory
    """
    workspace = tempfile.mkdtemp(prefix="az2gcp_")

    if source.endswith(".zip"):
        _extract_zip(source, workspace)
    elif source.startswith("http"):
        _clone_repo(source, workspace)
    else:
        raise ValueError("Source must be ZIP file or Git URL")

    return workspace

def _extract_zip(zip_path, dest):
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(dest)

def _clone_repo(repo_url, dest):
    Repo.clone_from(repo_url, dest)
