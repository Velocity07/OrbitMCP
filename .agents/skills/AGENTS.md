# Agent Execution Standards

1. **Hardware Ceiling**: Maximum resident memory for Python backend is 100MB RAM. Ollama inference must target 3B models to strictly conserve 4GB VRAM.
2. **MCP Tool Contract**: Every new tool must expose a valid JSON schema with type hints, comprehensive docstrings, and a dedicated unit test in `backend/tests/`.
3. **Error Boundaries**: All API routes must return structured JSON exceptions `{"status": "error", "code": string, "message": string}`. Unhandled 500 crashes are forbidden.