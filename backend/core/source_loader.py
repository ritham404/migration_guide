import os
import shutil
import zipfile
import tempfile
from git import Repo, GitCommandError

IGNORED_DIRS = {
    "node_modules", ".git", "bin", "obj",
    ".venv", "dist", "target"
}

def load_source(source: str) -> str:

    workspace = tempfile.mkdtemp(prefix="az2gcp_")

    try:
        if source.endswith(".zip"):
            _extract_zip(source, workspace)
        elif source.startswith("http") or source.endswith(".git"):
            _clone_repo(source, workspace)
        else:
            raise ValueError("Source must be a ZIP file path or Git repository URL (http/https or .git)")

        return workspace
    except Exception as e:
        # Cleanup workspace on error
        if os.path.exists(workspace):
            shutil.rmtree(workspace, ignore_errors=True)
        raise

def _extract_zip(zip_path, dest):
    """Extract ZIP file to destination directory."""
    try:
        if not os.path.exists(zip_path):
            raise FileNotFoundError(f"ZIP file not found: {zip_path}")
        
        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(dest)
    except zipfile.BadZipFile as e:
        raise ValueError(f"Invalid ZIP file: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to extract ZIP file: {str(e)}")

def _clone_repo(repo_url, dest):
    """Clone Git repository to destination directory."""
    try:
        # Ensure .git extension for GitHub URLs if not present
        if "github.com" in repo_url and not repo_url.endswith(".git"):
            repo_url = repo_url + ".git"
        
        print(f"Cloning repository: {repo_url}")
        Repo.clone_from(repo_url, dest)
    except GitCommandError as e:
        raise Exception(f"Failed to clone repository: {str(e)}")
    except Exception as e:
        raise Exception(f"Repository cloning error: {str(e)}")
