#!/usr/bin/env python3
import subprocess
import sys
import os

# Set environment variables
os.environ['PYTHONUNBUFFERED'] = '1'

# Try to run uvicorn
try:
    print("Starting server with uvicorn...")
    print(f"Python executable: {sys.executable}")
    print(f"Current directory: {os.getcwd()}")
    
    subprocess.run(
        [sys.executable, '-m', 'uvicorn', 'server:app', '--host', '0.0.0.0', '--port', '8000', '--reload'],
        check=True
    )
except subprocess.CalledProcessError as e:
    print(f"Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {e}")
    sys.exit(1)
