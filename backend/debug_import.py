import sys
import os
sys.path.insert(0, os.getcwd())

try:
    import server
    print("Server imported successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
