#!/usr/bin/env python3
"""
Test script to verify GitHub repository migration works.
Usage: python test_github.py <github_url>
Example: python test_github.py https://github.com/user/repo
"""

import sys
import shutil
from core.source_loader import load_source

def test_github_clone(repo_url):
    """Test cloning and loading a GitHub repository."""
    print(f"\n📋 Testing GitHub repository migration...")
    print(f"Repository URL: {repo_url}")
    
    try:
        print("\n🔄 Loading source code from GitHub...")
        workspace = load_source(repo_url)
        print(f"✅ Successfully cloned to: {workspace}")
        
        # List directory contents
        import os
        contents = os.listdir(workspace)
        print(f"\n📁 Repository contents ({len(contents)} items):")
        for item in sorted(contents)[:10]:  # Show first 10 items
            item_path = os.path.join(workspace, item)
            if os.path.isdir(item_path):
                print(f"  📂 {item}/")
            else:
                print(f"  📄 {item}")
        if len(contents) > 10:
            print(f"  ... and {len(contents) - 10} more items")
        
        print("\n✅ GitHub repository test passed!")
        
        # Cleanup
        shutil.rmtree(workspace, ignore_errors=True)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_github.py <github_url>")
        print("Example: python test_github.py https://github.com/user/repo")
        sys.exit(1)
    
    repo_url = sys.argv[1]
    success = test_github_clone(repo_url)
    sys.exit(0 if success else 1)
