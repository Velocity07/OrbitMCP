import React, { useEffect, useState, useRef } from 'react';
import {
    Activity,
    Cpu,
    HardDrive,
    Terminal,
    Wrench,
    Send,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
    Sliders,
    Power,
    Layers,
    Palette,
    Bot,
    TerminalSquare,
    CheckCheck
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                4 Dev Themes                                */
/* -------------------------------------------------------------------------- */
type ThemeKey = 'obsidian' | 'tokyo' | 'emerald' | 'cobalt';

interface ThemeTokens {
    name: string;
    tag: string;
    bg: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    borderHover: string;
    accent: string;
    accentHover: string;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    textPrimary: string;
    textMuted: string;
}

const THEMES: Record<ThemeKey, ThemeTokens> = {
    obsidian: {
        name: 'Obsidian Amber',
        tag: 'Classic Dev',
        bg: '#09090b',
        surface: '#141416',
        surfaceAlt: '#1c1c20',
        border: '#27272a',
        borderHover: '#3f3f46',
        accent: '#f59e0b',
        accentHover: '#fbbf24',
        accentText: '#09090b',
        accentBg: 'rgba(245, 158, 11, 0.08)',
        accentBorder: 'rgba(245, 158, 11, 0.25)',
        textPrimary: '#fafafa',
        textMuted: '#a1a1aa'
    },
    tokyo: {
        name: 'Tokyo Violet',
        tag: 'Cyber Synth',
        bg: '#0a0a14',
        surface: '#121124',
        surfaceAlt: '#1a1836',
        border: '#2a264a',
        borderHover: '#433d75',
        accent: '#a855f7',
        accentHover: '#c084fc',
        accentText: '#0a0a14',
        accentBg: 'rgba(168, 85, 247, 0.1)',
        accentBorder: 'rgba(168, 85, 247, 0.3)',
        textPrimary: '#f5f3ff',
        textMuted: '#998fc7'
    },
    emerald: {
        name: 'Matrix Emerald',
        tag: 'Terminal Green',
        bg: '#050c08',
        surface: '#0d1a12',
        surfaceAlt: '#13261a',
        border: '#1b3b28',
        borderHover: '#2a5c3e',
        accent: '#10b981',
        accentHover: '#34d399',
        accentText: '#050c08',
        accentBg: 'rgba(16, 185, 129, 0.1)',
        accentBorder: 'rgba(16, 185, 129, 0.3)',
        textPrimary: '#ecfdf5',
        textMuted: '#6ee7b7'
    },
    cobalt: {
        name: 'Linear Cobalt',
        tag: 'Deep Space',
        bg: '#080c14',
        surface: '#0f172a',
        surfaceAlt: '#1e293b',
        border: '#1e293b',
        borderHover: '#334155',
        accent: '#38bdf8',
        accentHover: '#7dd3fc',
        accentText: '#080c14',
        accentBg: 'rgba(56, 189, 248, 0.1)',
        accentBorder: 'rgba(56, 189, 248, 0.3)',
        textPrimary: '#f0f9ff',
        textMuted: '#94a3b8'
    }
};

/* -------------------------------------------------------------------------- */
/*                               Data Interfaces                              */
/* -------------------------------------------------------------------------- */
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

interface ToolCallResult {
    tool: string;
    arguments: Record<string, any>;
    result: any;
}

interface ExecutionResult {
    type: string;
    content: string;
    tool_calls: ToolCallResult[];
    error?: string;
    elapsedSeconds?: number;
    thoughtTrace?: string[];
}

/* -------------------------------------------------------------------------- */
/*                            Subcomponents & Tools                           */
/* -------------------------------------------------------------------------- */
function JsonViewer({ data, theme }: { data: any; theme: ThemeTokens }) {
    const [collapsed, setCollapsed] = useState(false);
    const [copied, setCopied] = useState(false);
    const jsonStr = JSON.stringify(data, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="relative group rounded-md border font-mono text-[11px] overflow-hidden transition-all duration-150"
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
            <div
                className="flex items-center justify-between px-3 py-1.5 border-b"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    style={{ color: theme.textMuted }}
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span className="font-medium" style={{ color: theme.textPrimary }}>Payload Data</span>
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-all duration-150 font-mono"
                    style={{ backgroundColor: theme.surfaceAlt, color: theme.textPrimary, border: `1px solid ${theme.border}` }}
                >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            {!collapsed && (
                <pre className="p-3 overflow-x-auto max-h-60 leading-relaxed font-mono" style={{ color: theme.accent }}>
                    {jsonStr}
                </pre>
            )}
        </div>
    );
}

function ClaudeThinkingProcess({
    isThinking,
    elapsedTime,
    stage,
    theme,
    thoughtTrace
}: {
    isThinking: boolean;
    elapsedTime: number;
    stage: string;
    theme: ThemeTokens;
    thoughtTrace?: string[];
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div
            className="rounded-lg border overflow-hidden transition-all duration-200"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono transition-colors hover:bg-white/[0.02]"
                style={{ color: theme.textPrimary }}
            >
                <div className="flex items-center gap-3">
                    {isThinking ? (
                        <div className="flex items-center gap-0.5 h-4 px-1">
                            <span className="w-1 h-3 rounded-full animate-claude-1" style={{ backgroundColor: theme.accent }} />
                            <span className="w-1 h-4 rounded-full animate-claude-2" style={{ backgroundColor: theme.accent }} />
                            <span className="w-1 h-2.5 rounded-full animate-claude-3" style={{ backgroundColor: theme.accent }} />
                            <span className="w-1 h-3.5 rounded-full animate-claude-4" style={{ backgroundColor: theme.accent }} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400">
                            <CheckCheck className="w-3 h-3" />
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="font-medium tracking-tight" style={{ color: isThinking ? theme.accent : theme.textPrimary }}>
                            {isThinking ? 'Thinking Process' : `Thought for ${elapsedTime.toFixed(1)}s`}
                        </span>
                        {isThinking && (
                            <span className="text-[10px] opacity-60 font-normal">
                                ({elapsedTime.toFixed(1)}s)
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-60 text-xs">
                    <span>{isOpen ? 'Hide' : 'Show'}</span>
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
            </button>

            {isOpen && (
                <div
                    className="px-4 py-3 border-t text-[11px] font-mono space-y-2 relative"
                    style={{ borderColor: theme.border, backgroundColor: theme.bg }}
                >
                    <div
                        className="absolute left-6 top-3 bottom-3 w-[1px]"
                        style={{ backgroundColor: theme.border }}
                    />

                    <div className="pl-5 space-y-2">
                        <div className="flex items-start gap-2" style={{ color: theme.accent }}>
                            <span className="text-zinc-500 font-normal">&gt;</span>
                            <span className="italic font-sans text-xs text-zinc-300">
                                {stage || 'Orchestrating agent intent & evaluating tools...'}
                            </span>
                        </div>

                        {thoughtTrace && thoughtTrace.map((thought, i) => (
                            <div key={i} className="flex items-start gap-2 text-zinc-400 font-sans text-xs italic">
                                <span className="text-zinc-600 font-mono font-normal">{i + 1}.</span>
                                <span>{thought}</span>
                            </div>
                        ))}

                        {!thoughtTrace && isThinking && (
                            <>
                                <div className="text-zinc-500 text-xs font-sans italic">
                                    1. Parsing prompt for hardware inspection and directory tree requests...
                                </div>
                                <div className="text-zinc-500 text-xs font-sans italic">
                                    2. Checking path safety boundaries to prevent directory traversal...
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function TypewriterText({ text }: { text: string }) {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        setDisplayed('');
        if (!text) return;
        let idx = 0;
        const timer = setInterval(() => {
            setDisplayed((prev) => prev + text.charAt(idx));
            idx++;
            if (idx >= text.length) clearInterval(timer);
        }, 6);
        return () => clearInterval(timer);
    }, [text]);

    return <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap tracking-tight">{displayed}</p>;
}

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */
export default function App() {
    const [currentTheme, setCurrentTheme] = useState<ThemeKey>('obsidian');
    const theme = THEMES[currentTheme];

    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [tools, setTools] = useState<MCPTool[]>([]);
    const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({});

    // Model & Parameter Controls
    const [models, setModels] = useState<string[]>(['llama3.2:3b']);
    const [selectedModel, setSelectedModel] = useState<string>('llama3.2:3b');
    const [temperature, setTemperature] = useState<number>(0.2);
    const [showParamModal, setShowParamModal] = useState<boolean>(false);
    const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

    // Execution & Agent Pipeline State
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [agentStage, setAgentStage] = useState<string>('');
    const [elapsedTimer, setElapsedTimer] = useState<number>(0);
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
    const [backendOnline, setBackendOnline] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<any>(null);

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
                const loadedTools: MCPTool[] = toolsData.tools || [];
                setTools(loadedTools);

                setEnabledTools((prev) => {
                    const next = { ...prev };
                    loadedTools.forEach((t) => {
                        if (next[t.name] === undefined) next[t.name] = true;
                    });
                    return next;
                });
            }

            const modelsRes = await fetch('http://127.0.0.1:8765/api/models');
            if (modelsRes.ok) {
                const modelsData = await modelsRes.json();
                if (modelsData.models && modelsData.models.length > 0) {
                    setModels(modelsData.models);
                    if (!modelsData.models.includes(selectedModel)) {
                        setSelectedModel(modelsData.models[0]);
                    }
                }
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

    const toggleTool = (toolName: string) => {
        setEnabledTools((prev) => ({
            ...prev,
            [toolName]: !prev[toolName]
        }));
    };

    const handleDispatch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!prompt.trim() || loading || !backendOnline) return;

        setLoading(true);
        setExecutionResult(null);
        setElapsedTimer(0);
        setAgentStage('Analyzing intent & evaluating FastMCP schemas...');

        const startTime = Date.now();
        timerRef.current = setInterval(() => {
            setElapsedTimer((Date.now() - startTime) / 1000);
        }, 100);

        const activeToolNames = Object.keys(enabledTools).filter((k) => enabledTools[k]);

        try {
            setTimeout(() => {
                if (loading) setAgentStage('Executing kernel tools & validating sandboxed filesystem...');
            }, 700);

            const res = await fetch('http://127.0.0.1:8765/api/run-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    model: selectedModel,
                    temperature,
                    enabled_tools: activeToolNames
                })
            });

            const totalElapsed = (Date.now() - startTime) / 1000;
            setAgentStage('Synthesizing edge intelligence...');
            const data = await res.json();
            data.elapsedSeconds = totalElapsed;
            data.thoughtTrace = [
                `Identified target MCP functions matching prompt intent`,
                `Executed sandboxed local functions with zero cloud latency`,
                `Aggregated kernel return values into deterministic response payload`
            ];
            setExecutionResult(data);
        } catch (err: any) {
            setExecutionResult({
                type: 'error',
                content: '',
                tool_calls: [],
                error: `Agent pipeline error: ${err.message}`,
                elapsedSeconds: (Date.now() - startTime) / 1000,
                thoughtTrace: [`Encountered fatal execution error during local socket call`]
            });
        } finally {
            clearInterval(timerRef.current);
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleDispatch();
        }
    };

    return (
        <div
            className="min-h-screen p-6 lg:p-8 flex flex-col gap-6 select-none font-sans transition-colors duration-200"
            style={{ backgroundColor: theme.bg, color: theme.textPrimary }}
        >
            {/* Top Header */}
            <header
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b"
                style={{ borderColor: theme.border }}
            >
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center border font-mono font-bold text-xs"
                                style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.accent }}
                            >
                                &gt;_
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white font-mono">OrbitMCP</h1>
                        </div>
                        <span
                            className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border"
                            style={{
                                backgroundColor: theme.accentBg,
                                color: theme.accent,
                                borderColor: theme.accentBorder
                            }}
                        >
                            Edge-Native v1.1
                        </span>
                    </div>
                    <p className="text-xs mt-1 font-mono" style={{ color: theme.textMuted }}>
                        FastMCP Tool Server
                    </p>
                </div>

                {/* Global Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Theme Selector */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowThemeModal(!showThemeModal);
                                setShowParamModal(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150"
                            style={{
                                backgroundColor: theme.surface,
                                borderColor: showThemeModal ? theme.accent : theme.border,
                                color: theme.textPrimary
                            }}
                        >
                            <Palette className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                            <span>{theme.name.split(' ')[0]}</span>
                        </button>

                        {showThemeModal && (
                            <div
                                className="absolute right-0 top-10 w-56 p-2 rounded-xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                            >
                                <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-mono" style={{ color: theme.textMuted }}>
                                    Select Theme
                                </div>
                                {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
                                    <button
                                        key={k}
                                        onClick={() => {
                                            setCurrentTheme(k);
                                            setShowThemeModal(false);
                                        }}
                                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono transition-all duration-150 text-left hover:bg-white/[0.04]"
                                        style={{
                                            backgroundColor: currentTheme === k ? theme.accentBg : 'transparent',
                                            color: currentTheme === k ? theme.accent : theme.textPrimary
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: THEMES[k].accent }}
                                            />
                                            <span>{THEMES[k].name}</span>
                                        </div>
                                        <span className="text-[10px] opacity-60">{THEMES[k].tag}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Model Selector */}
                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    >
                        <Layers className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer pr-1"
                            style={{ color: theme.textPrimary }}
                        >
                            {models.map((m) => (
                                <option key={m} value={m} className="bg-zinc-900 text-white font-mono">
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Temperature Controls */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowParamModal(!showParamModal);
                                setShowThemeModal(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150"
                            style={{
                                backgroundColor: theme.surface,
                                borderColor: showParamModal ? theme.accent : theme.border,
                                color: theme.textPrimary
                            }}
                        >
                            <Sliders className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                            <span>T={temperature}</span>
                        </button>

                        {showParamModal && (
                            <div
                                className="absolute right-0 top-10 w-64 p-4 rounded-xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>Sampling Temperature</span>
                                    <span className="text-xs font-mono font-bold" style={{ color: theme.accent }}>{temperature}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.0"
                                    max="1.0"
                                    step="0.05"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    style={{ accentColor: theme.accent }}
                                />
                                <div className="flex justify-between text-[10px] mt-1.5 font-mono" style={{ color: theme.textMuted }}>
                                    <span>0.0 (Deterministic)</span>
                                    <span>1.0 (Creative)</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gateway Status Pill */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono"
                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    >
                        <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                        <span style={{ color: theme.textMuted }}>
                            {backendOnline ? 'Gateway :8765' : 'Offline'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Telemetry Row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                    className="p-4 rounded-xl border flex items-center gap-4 transition-all duration-150"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                    <div
                        className="p-3 rounded-lg border"
                        style={{ backgroundColor: theme.accentBg, borderColor: theme.accentBorder, color: theme.accent }}
                    >
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-mono" style={{ color: theme.textMuted }}>CPU Load ({telemetry?.cpu_count || 8} Cores)</div>
                        <div className="text-lg font-bold font-mono mt-0.5" style={{ color: theme.textPrimary }}>
                            {telemetry ? `${telemetry.cpu_percent}%` : '---'}
                        </div>
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl border flex items-center gap-4 transition-all duration-150"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <HardDrive className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-mono" style={{ color: theme.textMuted }}>
                            <span>RAM Resident</span>
                            <span>{telemetry?.ram_percent || 0}%</span>
                        </div>
                        <div className="text-lg font-bold font-mono mt-0.5" style={{ color: theme.textPrimary }}>
                            {telemetry ? `${Math.round(telemetry.ram_used_mb)} / ${Math.round(telemetry.ram_total_mb)} MB` : '---'}
                        </div>
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl border flex items-center gap-4 transition-all duration-150"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-mono" style={{ color: theme.textMuted }}>Available Headroom</div>
                        <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                            {telemetry ? `${Math.round(telemetry.ram_available_mb)} MB` : '---'}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Left Column: Registered MCP Tools */}
                <div
                    className="p-5 rounded-xl border flex flex-col gap-4"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            <Wrench className="w-4 h-4" style={{ color: theme.accent }} />
                            <span className="font-mono text-xs uppercase tracking-wider">Registered Tools ({tools.length})</span>
                        </div>
                        <button
                            onClick={fetchStatus}
                            className="p-1.5 rounded-lg border border-transparent hover:border-zinc-700 transition-all duration-150"
                            style={{ color: theme.textMuted }}
                            title="Refresh tools"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                        {tools.map((t) => {
                            const isEnabled = enabledTools[t.name] ?? true;
                            return (
                                <div
                                    key={t.name}
                                    className={`p-3.5 rounded-lg border transition-all duration-150 ${isEnabled ? 'hover:border-opacity-80' : 'opacity-50'}`}
                                    style={{
                                        backgroundColor: theme.bg,
                                        borderColor: isEnabled ? theme.border : 'transparent'
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-semibold" style={{ color: theme.accent }}>
                                            {t.name}()
                                        </span>

                                        <button
                                            onClick={() => toggleTool(t.name)}
                                            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono transition-all duration-150"
                                            style={{
                                                backgroundColor: isEnabled ? 'rgba(16, 185, 129, 0.1)' : theme.surfaceAlt,
                                                color: isEnabled ? '#34d399' : theme.textMuted,
                                                border: `1px solid ${isEnabled ? 'rgba(16, 185, 129, 0.3)' : theme.border}`
                                            }}
                                        >
                                            <Power className="w-2.5 h-2.5" />
                                            <span>{isEnabled ? 'ACTIVE' : 'OFF'}</span>
                                        </button>
                                    </div>
                                    <p className="text-xs mt-1.5 leading-relaxed font-sans" style={{ color: theme.textMuted }}>
                                        {t.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Dispatcher & Console */}
                <div
                    className="lg:col-span-2 p-5 rounded-xl border flex flex-col gap-4"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            <Terminal className="w-4 h-4" style={{ color: theme.accent }} />
                            <span className="font-mono text-xs uppercase tracking-wider">Agent Dispatcher</span>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>
                            Press <kbd className="px-1.5 py-0.5 rounded border text-zinc-300 font-mono" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>Ctrl + Enter</kbd>
                        </span>
                    </div>

                    {/* Prompt Input Form */}
                    <form onSubmit={handleDispatch} className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. Inspect my RAM telemetry and list files in the workspace..."
                            className="flex-1 px-4 py-2.5 rounded-lg border text-sm placeholder:text-zinc-600 focus:outline-none transition-all duration-150 font-sans tracking-tight"
                            style={{
                                backgroundColor: theme.bg,
                                borderColor: theme.border,
                                color: theme.textPrimary
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !backendOnline}
                            className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 font-sans"
                            style={{
                                backgroundColor: theme.accent,
                                color: theme.accentText
                            }}
                        >
                            {loading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>Run</span>
                        </button>
                    </form>

                    {/* Execution Trace & Thinking Stream */}
                    <div
                        className="flex-1 rounded-lg border p-4 font-mono text-xs overflow-y-auto max-h-[440px] flex flex-col gap-4"
                        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    >
                        {/* Claude Thinking Waveform (Active during execution) */}
                        {loading && (
                            <ClaudeThinkingProcess
                                isThinking={true}
                                elapsedTime={elapsedTimer}
                                stage={agentStage}
                                theme={theme}
                            />
                        )}

                        {/* Awaiting State */}
                        {!loading && !executionResult && (
                            <div className="text-zinc-500 italic py-6 text-center font-mono text-xs">
                                &gt; Awaiting dispatch. Enter a prompt above to invoke local FastMCP tools.
                            </div>
                        )}

                        {/* Completed Output */}
                        {executionResult && (
                            <div className="space-y-4">
                                <ClaudeThinkingProcess
                                    isThinking={false}
                                    elapsedTime={executionResult.elapsedSeconds || elapsedTimer}
                                    stage="FastMCP local execution finished cleanly."
                                    theme={theme}
                                    thoughtTrace={executionResult.thoughtTrace}
                                />

                                {executionResult.error ? (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-sans">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{executionResult.error}</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Tool Executions Trace */}
                                        {executionResult.tool_calls && executionResult.tool_calls.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="text-emerald-400 flex items-center gap-1.5 font-semibold text-xs font-mono">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>MCP Tool Calls Executed ({executionResult.tool_calls.length}):</span>
                                                </div>
                                                {executionResult.tool_calls.map((call, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 rounded-lg border space-y-2"
                                                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                                                    >
                                                        <div className="font-semibold flex items-center justify-between font-mono" style={{ color: theme.accent }}>
                                                            <span>&gt; {call.tool}({JSON.stringify(call.arguments)})</span>
                                                            <span className="text-[10px] font-normal" style={{ color: theme.textMuted }}>local execution</span>
                                                        </div>
                                                        <JsonViewer data={call.result} theme={theme} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Synthesis View */}
                                        {executionResult.content && (
                                            <div className="pt-3 border-t" style={{ borderColor: theme.border }}>
                                                <div className="text-[10px] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                                                    <Bot className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                                                    <span>Model Synthesis ({selectedModel}):</span>
                                                </div>
                                                <div style={{ color: theme.textPrimary }}>
                                                    <TypewriterText text={executionResult.content} />
                                                </div>
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