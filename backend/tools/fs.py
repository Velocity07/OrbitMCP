import os
from typing import Dict, Any

# Anchor the boundary strictly to the OrbitMCP workspace root
SAFE_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def list_workspace_files(relative_path: str = ".") -> Dict[str, Any]:
    """
    Safely lists directory contents within the OrbitMCP project workspace.
    
    Args:
        relative_path: Path relative to project root (default: ".").
    """
    target_path = os.path.abspath(os.path.join(SAFE_BASE_DIR, relative_path))
    
    # Path Traversal Guardrail: Block access outside project boundary
    if not target_path.startswith(SAFE_BASE_DIR):
        return {
            "error": "Access Denied: Path traversal outside project boundary is prohibited."
        }
        
    if not os.path.exists(target_path):
        return {"error": f"Path not found: {relative_path}"}
        
    if not os.path.isdir(target_path):
        return {"error": f"Path is not a directory: {relative_path}"}
        
    entries = []
    for item in os.listdir(target_path):
        full = os.path.join(target_path, item)
        entries.append({
            "name": item,
            "is_dir": os.path.isdir(full),
            "size_bytes": os.path.getsize(full) if os.path.isfile(full) else 0
        })
        
    return {"path": relative_path, "contents": entries}
