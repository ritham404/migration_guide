# -*- coding: utf-8 -*-
import os
import shutil
import tempfile
import zipfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from main import migrate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MigrationRequest(BaseModel):
    source_url: str
    include_suggestions: bool = False

@app.get("/")
def health_check():
    # print("test")
    return {"status": "ok", "service": "Azure to GCP Migration Backend"}

@app.get("/pgs")
def get_pgs(request: Request):
    print(dict(request.query_params))
    return {"message": "testSer is running"}

@app.post("/migrate/url")
def migrate_url(request: MigrationRequest):
    """
    Migrate from a Git repository URL.
    Accepts GitHub URLs (e.g., https://github.com/user/repo or https://github.com/user/repo.git)
    """
    temp_dirs = []
    try:
        # Validate URL format
        if not request.source_url.startswith("http"):
            raise ValueError("Invalid URL format. Must be a valid Git repository URL.")
        
        result = migrate(request.source_url, include_suggestions=request.include_suggestions)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
    finally:
        # Cleanup any temporary directories created during migration
        for temp_dir in temp_dirs:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/migrate/file")
async def migrate_file(file: UploadFile = File(...), include_suggestions: bool = False):
    """
    Migrate from an uploaded ZIP file.
    """
    # Create a temp directory
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)
    print("ogck",file_path)
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            # f=open(f"")
            shutil.copyfileobj(file.file, buffer)
        
        # Verify it's a zip file
        # print(file_path)
        if not zipfile.is_zipfile(file_path):
            raise ValueError("Uploaded file must be a valid ZIP file")
            
        result = migrate(file_path, include_suggestions=include_suggestions)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp directory
        shutil.rmtree(temp_dir, ignore_errors=True)
