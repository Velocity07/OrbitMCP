<div align="center">

<img src="./orbitmcp-cover.png" alt="OrbitMCP Cover Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

# OrbitMCP

**Edge-Native Model Context Protocol (MCP) Control Plane & Autonomous Tool Dispatcher**

*A lightweight, air-gapped desktop cockpit connecting local LLMs (Llama 3.2) to standard MCP tools with deterministic hardware safety.*

[![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-blue?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![FastMCP](https://img.shields.io/badge/FastMCP-Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://github.com/jlowin/fastmcp)
[![Ollama](https://img.shields.io/badge/Ollama-Llama_3.2-black?style=flat-square&logo=ollama&logoColor=white)](https://ollama.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=flat-square)](LICENSE)

</div>

---

## The Core Problem

Standard Large Language Models—both proprietary cloud APIs and local weights—are isolated text predictors. They are fundamentally blind to the physical machine they execute on:

1. **No Native Hardware Awareness:** An LLM cannot independently check remaining VRAM, inspect project repositories, run shell routines, or read SQLite databases without external glue code.
2. **Cloud Privacy & Egress Risk:** Transmitting proprietary codebase structures, internal documents, and host machine telemetry across cloud APIs introduces recurring token costs and data compliance vulnerabilities.
3. **Electron Bloat:** Existing agent GUIs frequently rely on Electron, consuming 800MB–1.5GB of RAM before an inference model even loads into memory.

## What OrbitMCP Solves

**OrbitMCP converts your local workstation into a zero-latency, air-gapped agent environment.** 

Built with a native **Rust (Tauri v2)** shell and a Python **FastMCP** sidecar, OrbitMCP operates at under **100MB RAM overhead**, reserving your system resources entirely for model weights and fast local inference.


```

┌────────────────────────────────────────────────────────────────────────┐
│                        User Prompt / Directive                         │
└───────────────────────────────────┬────────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────────────────────────┐
│               Local Quantized LLM (Ollama / Llama-3.2)                 │
│  - Analyzes intent & generates standard JSON tool execution schema     │
└───────────────────────────────────┬────────────────────────────────────┘
│ (MCP Tool Call)
▼
┌────────────────────────────────────────────────────────────────────────┐
│               OrbitMCP FastMCP Gateway (Local :8765)                   │
│  - Validates sandbox path boundaries & executes kernel functions       │
└───────────────────┬────────────────────────────────┬───────────────────┘
│                                │
▼                                ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│   system_telemetry()    │      │      list_files()       │
│  (RAM / CPU / Headroom) │      │  (Safe Workspace Tree)  │
└────────────┬────────────┘      └────────────┬────────────┘
│                                │
└────────────────┬───────────────┘
│
▼
┌────────────────────────────────────────────────────────────────────────┐
│           React 18 Control Plane (Geist UI + Claude Thinking)          │
│  - Real-time hardware stream, collapsible trace & typewriter output    │
└────────────────────────────────────────────────────────────────────────┘

```

---

## Key Features

### 1. Autonomous MCP Tool Execution Loop
OrbitMCP translates user queries into OpenAI-compatible tool specifications for local Ollama models. When a query requires OS context, the model interrupts standard generation, dispatches structured tool arguments to the FastMCP gateway, executes the Python script locally, and summarizes the final payload.

### 2. Live Kernel Telemetry Polling
Direct hardware polling via `psutil` monitors CPU core utilization, resident RAM consumption, and available memory headroom every 3 seconds to prevent Out-Of-Memory (OOM) lockups during heavy inference.

### 3. Claude-Style Thinking Process Block
Includes an oscillating 4-bar waveform animation and live elapsed timer (`Thought for 11.4s`). Thinking blocks can be collapsed into an internal monologue scratchpad detailing schema resolution and safety boundary checks.

### 4. Four Curated Developer Themes
Includes four high-contrast developer color palettes switchable at runtime with instant token re-rendering:
* **Obsidian Amber** (Dark Charcoal + Warm Amber)
* **Tokyo Violet** (Cyber Synth Indigo + Purple)
* **Matrix Emerald** (Terminal Green + Jet Black)
* **Linear Cobalt** (Deep Space Slate + Sky Blue)

### 5. Dynamic Model Discovery & Parameter Tuning
* **Model Dropdown:** Auto-queries the local Ollama daemon on launch (`/api/tags`) to populate installed weights (`llama3.2:3b`, `qwen2.5-coder`, `mistral`, etc.).
* **Sampling Temperature:** Integrated slider (0.0 to 1.0) to dynamically adjust generation determinism.
* **Tool Gating:** Independent toggles on each tool card to enable or disable specific MCP functions from the model's schema dynamically.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Desktop Container** | Tauri v2 (Rust) | Native Windows window lifecycle, minimal RAM footprint, zero-overhead IPC |
| **Frontend UI** | React 18, TypeScript, Vite | Reactive dashboard state, live metrics polling, hotkeys |
| **Styling & Icons** | Tailwind CSS, Lucide Icons | Responsive slate theme, micro-transitions, developer glyphs |
| **Typography** | Geist Sans & JetBrains Mono | Claude-inspired developer readability and monospace traces |
| **Tool Engine** | FastMCP, FastAPI, Uvicorn | Standardized Model Context Protocol implementation |
| **Local Inference** | Ollama (Llama 3.2 3B) | Fully offline, privacy-first local language model execution |

---

## Project Structure

```text
orbit-mcp/
├── backend/                  # FastMCP Python engine
│   ├── tools/
│   │   ├── telemetry.py      # Kernel hardware metrics polling
│   │   └── fs.py             # Sandboxed workspace filesystem inspector
│   ├── server.py             # FastAPI gateway & Ollama tool loop dispatcher
│   └── requirements.txt      # Python dependencies
├── src/                      # React frontend source
│   ├── App.tsx               # Main OrbitMCP Control Plane component
│   ├── main.tsx              # React DOM entry point
│   ├── index.css             # Tailwind base styles & Claude wave keyframes
│   └── vite-env.d.ts         # Vite client TypeScript definitions
├── src-tauri/                # Native Rust desktop application
│   ├── capabilities/         # Tauri v2 security policies
│   ├── icons/                # Multi-platform application icon sets
│   ├── src/main.rs           # Rust application entry point
│   ├── Cargo.toml            # Rust dependencies & metadata
│   └── tauri.conf.json       # Window geometry, title, and build targets
├── orbitmcp-cover.png        # Repository hero cover banner
├── orbit-icon.png            # Master 1024x1024 application icon
├── package.json              # Node dependencies and scripts
├── tailwind.config.js        # Color tokens & typography configuration
└── tsconfig.json             # TypeScript compiler rules (TS5 bundler mode)

```

---

## Getting Started

### Prerequisites

Ensure the following runtimes are installed on your host system:

* [Node.js](https://nodejs.org/) (v18.0 or later)
* [Python](https://www.python.org/) (v3.10 to v3.12)
* [Rust & Cargo](https://rustup.rs/) (for Tauri desktop compilation)
* [Ollama](https://ollama.com/) (with `llama3.2:3b` pulled)

---

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone [https://github.com/Velocity07/OrbitMCP.git](https://github.com/Velocity07/OrbitMCP.git)
cd OrbitMCP

```

#### 2. Configure the Python FastMCP Backend

Create and activate a virtual environment, then install the dependencies:

```powershell
# Windows PowerShell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend requirements
pip install -r backend/requirements.txt

```

#### 3. Install Frontend Dependencies

```powershell
npm install

```

#### 4. Pull the Local Inference Model

Ensure Ollama is running, then pull the default lightweight tool-calling model:

```powershell
ollama pull llama3.2:3b

```

---

### Running OrbitMCP

#### Step A: Start the FastMCP Backend Server

In your first terminal (with `.venv` activated):

```powershell
python backend/server.py

```

*The gateway will initialize on `http://127.0.0.1:8765`.*

#### Step B: Launch the Native Desktop Window

In your second terminal:

```powershell
npx tauri dev

```

OrbitMCP will compile the native Rust binary, launch the desktop window, and automatically establish a live IPC bridge with the FastMCP backend.

---

## Writing Custom FastMCP Tools

OrbitMCP is designed to be easily extensible. To register a new tool with the agent loop:

1. Define your tool function in `backend/tools/` using FastMCP:

```python
# backend/tools/network.py
import socket
from typing import Dict, Any

def test_port(host: str, port: int) -> Dict[str, Any]:
    """Check if a specific host and port is accepting connections."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2.0)
    try:
        s.connect((host, port))
        s.close()
        return {"host": host, "port": port, "open": True}
    except Exception as e:
        return {"host": host, "port": port, "open": False, "error": str(e)}

```

2. Register the tool decorator and schema in `backend/server.py`:

```python
from tools.network import test_port

@mcp.tool()
def check_port(host: str, port: int) -> Dict[str, Any]:
    """Test connection status for a remote host and port."""
    return test_port(host, port)

```

3. Restart `server.py`. The tool will instantly populate in the **Registered Tools** panel and be available for autonomous invocation.

---

## Roadmap

* [x] FastMCP Python gateway integration
* [x] Real-time host hardware telemetry polling (CPU / RAM)
* [x] Llama 3.2 autonomous tool execution loop
* [x] Claude-style thinking accordion and elapsed timer
* [x] Multi-theme runtime switcher (Obsidian, Tokyo, Emerald, Cobalt)
* [x] Native Tauri v2 Windows shell integration
* [ ] Server-Sent Events (SSE) token-by-token streaming
* [ ] Automated PyInstaller sidecar binary packaging
* [ ] Multi-turn conversational memory scratchpad

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.





