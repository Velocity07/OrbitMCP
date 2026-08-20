import React, { useEffect, useState } from 'react';
import {
    Activity,
    Cpu,
    HardDrive,
    Terminal,
    Wrench,
    Send,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

interface Telemetry {
    ram_total_mb: number;
    ram_used_mb: number;
    ram_available_mb: number;
    ram_percent: number;
    cpu_percent: number;
    cpu_count: number;
}

interface MCPTool {
    name: string;
    description: string;
    parameters: any;
}

export default function App() {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [tools, setTools] = useState<MCPTool[]>([]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [executionResult, setExecutionResult] = useState<any>(null);
    const [backendOnline, setBackendOnline] = useState(false);

    const fetchStatus = async () => {
        try {
            const healthRes = await fetch('http://127.0.0.1:8765/api/health');
            if (healthRes.ok) {
                const healthData = await healthRes.json();
                setTelemetry(healthData.telemetry);
                setBackendOnline(true);
            } else {
                setBackendOnline(false);
            }

            const toolsRes = await fetch('http://127.0.0.1:8765/api/tools');
            if (toolsRes.ok) {
                const toolsData = await toolsRes.json();
                setTools(toolsData.tools || []);
            }
        } catch {
            setBackendOnline(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleDispatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || loading) return;

        setLoading(true);
        setExecutionResult(null);

        try {
            const res = await fetch('http://127.0.0.1:8765/api/run-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, model: 'llama3.2:3b' })
            });
            const data = await res.json();
            setExecutionResult(data);
        } catch (err: any) {
            setExecutionResult({ error: `Connection failed: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-6 lg:p-8 flex flex-col gap-6">
            {/* Top Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#27272a]">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight text-white">OrbitMCP</h1>
                        <span className="text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono">
                            Edge-Native v1.0
                        </span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] mt-1">
                        Local MCP Tool Server & Autonomous LLM Dispatcher
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] text-xs">
                        <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="font-mono text-[#a1a1aa]">
                            {backendOnline ? 'Gateway :8765 Active' : 'Gateway Offline'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Telemetry Row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#27272a] bg-[#18181b]/70 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[#a1a1aa]">CPU Load ({telemetry?.cpu_count || 8} Cores)</div>
                        <div className="text-lg font-bold font-mono text-white mt-0.5">
                            {telemetry ? `${telemetry.cpu_percent}%` : '---'}
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-[#27272a] bg-[#18181b]/70 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <HardDrive className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-[#a1a1aa]">
                            <span>RAM Resident</span>
                            <span className="font-mono">{telemetry?.ram_percent || 0}%</span>
                        </div>
                        <div className="text-lg font-bold font-mono text-white mt-0.5">
                            {telemetry ? `${Math.round(telemetry.ram_used_mb)} / ${Math.round(telemetry.ram_total_mb)} MB` : '---'}
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-[#27272a] bg-[#18181b]/70 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[#a1a1aa]">Available Headroom</div>
                        <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                            {telemetry ? `${Math.round(telemetry.ram_available_mb)} MB` : '---'}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Left Column: Registered Tools */}
                <div className="p-5 rounded-xl border border-[#27272a] bg-[#18181b]/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Wrench className="w-4 h-4 text-amber-400" />
                            <span>Registered Tools ({tools.length})</span>
                        </div>
                        <button
                            onClick={fetchStatus}
                            className="p-1 text-[#a1a1aa] hover:text-white transition-colors"
                            title="Refresh tools"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                        {tools.map((t) => (
                            <div
                                key={t.name}
                                className="p-3.5 rounded-lg border border-[#27272a] bg-[#09090b] hover:border-amber-500/40 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-semibold text-amber-400">
                                        {t.name}()
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                                        MCP Tool
                                    </span>
                                </div>
                                <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">
                                    {t.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Dispatcher */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-[#27272a] bg-[#18181b]/50 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Terminal className="w-4 h-4 text-amber-400" />
                        <span>Agent Dispatcher</span>
                    </div>

                    <form onSubmit={handleDispatch} className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Check my system memory and list the files in the workspace..."
                            className="flex-1 px-4 py-2.5 rounded-lg bg-[#09090b] border border-[#27272a] text-sm text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-amber-500/80 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading || !backendOnline}
                            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>Run</span>
                        </button>
                    </form>

                    <div className="flex-1 rounded-lg border border-[#27272a] bg-[#09090b] p-4 font-mono text-xs overflow-y-auto max-h-[420px]">
                        {loading && (
                            <div className="flex items-center gap-2 text-amber-400">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Orchestrating local Ollama tool call chain...</span>
                            </div>
                        )}

                        {!loading && !executionResult && (
                            <div className="text-zinc-500 italic">
                                Awaiting agent dispatch. Enter a prompt above to invoke local FastMCP tools.
                            </div>
                        )}

                        {executionResult && (
                            <div className="space-y-4">
                                {executionResult.error ? (
                                    <div className="flex items-start gap-2 text-rose-400">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{executionResult.error}</span>
                                    </div>
                                ) : (
                                    <>
                                        {executionResult.tool_calls && executionResult.tool_calls.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>MCP Tools Executed:</span>
                                                </div>
                                                {executionResult.tool_calls.map((call: any, idx: number) => (
                                                    <div key={idx} className="p-3 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                                                        <div className="text-amber-400 font-semibold">
                                                            &gt; {call.tool}({JSON.stringify(call.arguments)})
                                                        </div>
                                                        <pre className="text-zinc-300 text-[11px] overflow-x-auto">
                                                            {JSON.stringify(call.result, null, 2)}
                                                        </pre>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {executionResult.content && (
                                            <div className="pt-2 border-t border-zinc-800 text-zinc-200">
                                                <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Model Synthesis:</div>
                                                <p className="text-sm font-sans leading-relaxed">{executionResult.content}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}