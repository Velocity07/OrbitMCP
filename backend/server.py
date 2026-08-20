import logging
from typing import Dict, Any, List, Optional
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastmcp import FastMCP
from pydantic import BaseModel, Field

from tools.telemetry import get_system_metrics
from tools.fs import list_workspace_files

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orbit-mcp")

# 1. Initialize FastMCP Protocol Core
mcp = FastMCP("OrbitMCP-Engine")

@mcp.tool()
def system_telemetry() -> Dict[str, Any]:
    """Query live RAM, CPU, and hardware performance metrics."""
    return get_system_metrics()

@mcp.tool()
def list_files(relative_path: str = ".") -> Dict[str, Any]:
    """Inspect files in the safe local workspace directory."""
    return list_workspace_files(relative_path)

# 2. Canonical Tool Registry
TOOL_REGISTRY = [
    {
        "name": "system_telemetry",
        "description": "Captures live CPU load, resident RAM, and memory headroom from OS kernel.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "list_files",
        "description": "Safely inspects files and directory hierarchy inside the project workspace.",
        "parameters": {
            "type": "object",
            "properties": {
                "relative_path": {
                    "type": "string",
                    "description": "Relative directory path to inspect (defaults to root '.')",
                    "default": "."
                }
            },
            "required": []
        }
    }
]

# 3. FastAPI Gateway
app = FastAPI(
    title="OrbitMCP Desktop Gateway",
    version="1.1.0",
    description="Edge-native IPC connecting UI to FastMCP & Local LLM"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentRequest(BaseModel):
    prompt: str = Field(..., description="The user prompt or query")
    model: str = Field(default="llama3.2:3b", description="Local Ollama model identifier")
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    enabled_tools: Optional[List[str]] = Field(
        default=None, 
        description="List of tool names allowed to be invoked by the model"
    )

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "OrbitMCP / FastMCP 0.1.0",
        "telemetry": get_system_metrics()
    }

@app.get("/api/models")
def get_installed_models():
    """Queries local Ollama daemon for available pulled models."""
    try:
        res = requests.get("http://127.0.0.1:11434/api/tags", timeout=3)
        if res.status_code == 200:
            models_data = res.json().get("models", [])
            model_names = [m["name"] for m in models_data]
            return {"models": model_names if model_names else ["llama3.2:3b"]}
    except Exception:
        pass
    return {"models": ["llama3.2:3b", "qwen2.5:3b", "mistral:latest", "phi3:mini"]}

@app.get("/api/tools")
def get_registered_tools():
    """Returns standardized MCP tool definitions for UI inspection."""
    return {"tools": TOOL_REGISTRY}

@app.post("/api/run-agent")
def run_agent_loop(req: AgentRequest):
    """Executes a single-turn agentic tool-calling cycle with local Ollama."""
    # Filter tools by enabled list
    active_tools = TOOL_REGISTRY
    if req.enabled_tools is not None:
        active_tools = [t for t in TOOL_REGISTRY if t["name"] in req.enabled_tools]

    ollama_tools = [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t["description"],
                "parameters": t["parameters"]
            }
        }
        for t in active_tools
    ]

    payload = {
        "model": req.model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are OrbitMCP, an edge assistant with access to local system tools. "
                    "Always invoke available tools when files or system metrics are requested."
                )
            },
            {"role": "user", "content": req.prompt}
        ],
        "tools": ollama_tools if len(ollama_tools) > 0 else None,
        "stream": False,
        "options": {
            "temperature": req.temperature,
            "num_ctx": 4096
        }
    }

    try:
        response = requests.post("http://127.0.0.1:11434/api/chat", json=payload, timeout=60)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Ollama error: {response.text}")
            
        data = response.json()
        message = data.get("message", {})
        tool_calls = message.get("tool_calls", [])

        if not tool_calls:
            return {
                "type": "text_response",
                "content": message.get("content", ""),
                "tool_calls": []
            }

        execution_results = []
        for call in tool_calls:
            func = call.get("function", {})
            tool_name = func.get("name")
            tool_args = func.get("arguments", {})
            
            logger.info(f"Invoking MCP tool: {tool_name} with arguments {tool_args}")
            
            if tool_name == "system_telemetry":
                result = get_system_metrics()
            elif tool_name == "list_files":
                result = list_workspace_files(tool_args.get("relative_path", "."))
            else:
                result = {"error": f"Tool '{tool_name}' is not allowed or unrecognized."}
                
            execution_results.append({
                "tool": tool_name,
                "arguments": tool_args,
                "result": result
            })

        return {
            "type": "tool_execution",
            "content": message.get("content", ""),
            "tool_calls": execution_results
        }

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama daemon is offline. Ensure Ollama is running locally via `ollama serve`."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8765, reload=True)