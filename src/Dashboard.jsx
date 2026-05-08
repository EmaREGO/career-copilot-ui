import { useState, useCallback, useRef, useEffect } from "react";
import {
    Upload, Link2, Briefcase, CheckCircle2, AlertTriangle, Zap,
    Copy, Check, ChevronRight, FileText, Loader2, Sparkles,
    TrendingUp, ShieldAlert, Star, RotateCcw, ExternalLink
} from "lucide-react";

// ── Gauge Chart ────────────────────────────────────────────────────────────────
function GaugeChart({ value = 0 }) {
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 60);
    const timer = setInterval(() => {
        start += step;
        if (start >= value) { setDisplayed(value); clearInterval(timer); }
        else setDisplayed(start);
        }, 16);
        return () => clearInterval(timer);
    }, [value]);

    const radius = 80;
    const stroke = 10;
    const normalizedR = radius - stroke / 2;
    const circumference = normalizedR * 2 * Math.PI;
    // Only bottom 3/4 arc (270°)
    const arcFraction = 0.75;
    const dashArray = circumference * arcFraction;
    const dashOffset = dashArray - (displayed / 100) * dashArray;

    const color =
        displayed >= 80 ? "#10b981"
        : displayed >= 60 ? "#f59e0b"
        : "#ef4444";

    return (
        <div className="flex flex-col items-center gap-2">
        <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 180 180">
            {/* Track */}
            <circle
                cx="90" cy="90" r={normalizedR}
                fill="none" stroke="#1e293b" strokeWidth={stroke}
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeLinecap="round"
            />
            {/* Progress */}
            <circle
                cx="90" cy="90" r={normalizedR}
                fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.4s ease transition-all duration-700" }}
            />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-4xl font-black text-white tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
                {displayed}
                <span className="text-xl text-slate-400">%</span>
            </span>
            <span className="text-xs font-semibold tracking-widest uppercase text-slate-500">Match</span>
            </div>
        </div>
        <div className="flex gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Bajo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Medio</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Alto</span>
        </div>
        </div>
    );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
    );
}

function AnalysisSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-slate-700/60 bg-slate-800/40">
            <Skeleton className="w-48 h-48 rounded-full" />
            <Skeleton className="w-32 h-4" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 space-y-2">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
            </div>
            ))}
        </div>
        </div>
    );
}

// ── Tag Pill ───────────────────────────────────────────────────────────────────
function Tag({ label, color = "slate" }) {
    const colors = {
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        red: "bg-red-500/10 text-red-400 border-red-500/30",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        slate: "bg-slate-700/50 text-slate-400 border-slate-600/30",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
        {label}
        </span>
    );
}

// ── Red Flag Card ──────────────────────────────────────────────────────────────
function RedFlagCard({ flag }) {
    const severityColor = { High: "red", Medium: "amber", Low: "slate" };
    return (
        <div className="flex gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
        <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-red-300">{flag.flag}</span>
            <Tag label={flag.severity} color={severityColor[flag.severity] || "slate"} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{flag.reason}</p>
        </div>
        </div>
    );
}

// ── Dropzone ───────────────────────────────────────────────────────────────────
function Dropzone({ file, onFile }) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef();

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f && f.type === "application/pdf") onFile(f);
    }, [onFile]);

    const handleChange = (e) => {
        const f = e.target.files[0];
        if (f) onFile(f);
    };

    return (
        <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative cursor-pointer group rounded-2xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center gap-3
                ${dragging
                ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
                : file
                    ? "border-emerald-600/60 bg-emerald-500/5"
                    : "border-slate-600/60 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
        >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
        <div className={`p-3 rounded-xl transition-all duration-300 ${file ? "bg-emerald-500/20" : "bg-slate-700/50 group-hover:bg-slate-700"}`}>
            {file ? <CheckCircle2 size={24} className="text-emerald-400" /> : <Upload size={24} className="text-slate-400" />}
        </div>
        {file ? (
            <div className="text-center">
            <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB · PDF</p>
            </div>
        ) : (
            <div className="text-center">
            <p className="text-sm font-semibold text-slate-300">Arrastra tu CV aquí</p>
            <p className="text-xs text-slate-500 mt-0.5">o haz click para seleccionar · Solo PDF</p>
            </div>
        )}
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function CareerCopilotDashboard() {
    const [file, setFile] = useState(null);
    const [jobUrl, setJobUrl] = useState("");
    const [status, setStatus] = useState("idle"); 
    const [evalId, setEvalId] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [coverLoading, setCoverLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const pollRef = useRef(null);

    const fetchEvaluationDetails = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Evaluation/${id}`);
            const data = await res.json();
            
            if (data.status === "Completed") {
                setAnalysis(data.analysis);
                setEvalId(data.id);
                setStatus("completed");
                return true; // Terminó
            } else if (data.status === "Failed") {
                setErrorMsg("El análisis falló en el servidor.");
                setStatus("error");
                return true; // Terminó (con error)
            }
            return false; // Sigue pendiente
        } catch (e) {
            console.error("Error fetching eval:", e);
            return false;
        }
    };

    const loadHistory = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Evaluation/history`);
            const data = await res.json();
            setHistory(data);
        } catch (e) { console.error("Error cargando historial", e); }
    };

    useEffect(() => { loadHistory(); }, []);

  // ── Polling ────────────────────────────────────────────────────────────────
    const pollStatus = useCallback((id) => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            const isDone = await fetchEvaluationDetails(id);
            if (isDone) clearInterval(pollRef.current);
        }, 3000);
    }, []);

    const handleSelectHistory = async (id) => {
        setStatus("loading");
        setShowHistory(false);
        const isDone = await fetchEvaluationDetails(id);
        if (!isDone) {
            setStatus("processing");
            pollStatus(id);
        }
    };

  // ── Submit ─────────────────────────────────────────────────────────────────
    const handleAnalyze = async () => {
        if (!file || !jobUrl.trim()) return;
        setStatus("loading");
        
        try {
            const formData = new FormData();
            formData.append("File", file);      
            formData.append("JobUrl", jobUrl);  

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Evaluation/analyze`, {
                method: "POST",
                body: formData, 
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            setEvalId(data.evaluationId);
            setStatus("processing");
            pollStatus(data.evaluationId);
        } catch (e) {
            setErrorMsg("Error: " + e.message);
            setStatus("error");
        }
    };

  // ── Cover Letter ───────────────────────────────────────────────────────────
    const handleGenerateCoverLetter = async () => {
        if (!evalId || !file) return;
        setCoverLoading(true);
        try {
            const formData = new FormData();
            formData.append("File", file);
            
            // AGREGAMOS LA VARIABLE AQUÍ (Faltaba esta)
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/CoverLetter/generate/${evalId}?jobUrl=${encodeURIComponent(jobUrl)}`,
                { method: "POST", body: formData }
            );
            
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setCoverLetter(data.coverLetter);
        } catch (e) {
            setCoverLetter("Error al generar la carta: " + e.message);
        } finally {
            setCoverLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        clearInterval(pollRef.current);
        setFile(null); setJobUrl(""); setStatus("idle");
        setEvalId(null); setAnalysis(null); setCoverLetter(""); setErrorMsg("");
    };

    const canSubmit = file && jobUrl.trim() && status === "idle";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        {/* Nuevo Fondo con Líneas Topográficas */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden bg-slate-950">
        {/* Orbe esmeralda superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
        
        {/* Orbe azul inferior */}
        <   div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-sky-500/5 blur-[100px] rounded-full" />

        {/* Líneas topográficas SVG */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="#10b981" strokeLinecap="round">
                <path strokeWidth="0.5" opacity="0.07" d="M-40 680C120 640,280 620,480 650S720 700,960 675S1200 630,1480 650"/>
                <path strokeWidth="0.5" opacity="0.07" d="M-40 620C130 575,300 560,500 590S740 645,980 618S1220 574,1480 595"/>
                <path strokeWidth="0.8" opacity="0.12" d="M-40 560C140 508,320 493,520 528S760 588,1000 560S1240 518,1480 540"/>
                <path strokeWidth="0.5" opacity="0.07" d="M-40 500C150 440,340 422,540 462S780 530,1020 500S1260 460,1480 484"/>
                <path strokeWidth="0.5" opacity="0.07" d="M-40 440C160 372,358 352,558 396S798 472,1038 440S1278 400,1480 426"/>
                <path strokeWidth="0.8" opacity="0.12" d="M-40 380C170 305,375 282,576 330S816 414,1055 380S1296 340,1480 368"/>
                <path strokeWidth="0.5" opacity="0.07" d="M-40 320C180 238,392 212,594 264S832 356,1072 320S1312 278,1480 310"/>
                <path strokeWidth="0.5" opacity="0.07" d="M-40 260C190 172,408 142,612 198S848 298,1088 260S1328 216,1480 250"/>
                <path strokeWidth="0.8" opacity="0.10" d="M-40 200C200 106,424 72,628 132S864 240,1104 200S1344 154,1480 190"/>
                <path strokeWidth="0.5" opacity="0.06" d="M-40 140C210 40,440 4,642 68S878 182,1118 140S1358 92,1480 130"/>
                </g>
            </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-10">
            {/* Botón para abrir historial */}
            <button 
                onClick={() => { setShowHistory(true); loadHistory(); }}
                className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-xl"
            >
                <RotateCcw size={16} /> Historial
            </button>

            {/* Panel Lateral de Historial */}
            {showHistory && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
                    <div className="relative w-80 h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl animate-fade-in-right">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Briefcase size={18} className="text-emerald-400" /> Análisis Pasados
                        </h3>
                        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-120px)] pr-2 scrollbar-thin">
                            {history.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => { pollStatus(item.id); setShowHistory(false); setStatus("processing"); }}
                                    className="p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-emerald-500/50 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <Tag label={`${item.globalMatchPercentage || 0}%`} color={item.globalMatchPercentage > 70 ? 'emerald' : 'amber'} />
                                        <span className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate group-hover:text-slate-200">
                                        {item.vacancyUrl}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <header className="mb-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Briefcase size={20} className="text-emerald-400" />
                </div>
                <span className="text-xs font-bold tracking-[0.25em] uppercase text-slate-500">Career Copilot</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
                Analiza tu match con <span className="text-emerald-400">cualquier vacante</span>
            </h1>
            <p className="text-slate-400 mt-1.5 text-sm max-w-xl">
                Sube tu CV, pega la URL de la vacante y obtén un análisis ATS profundo con IA generativa.
            </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
            {/* ── LEFT PANEL: Input ────────────────────────────────────────── */}
            <div className="space-y-4 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <FileText size={14} className="text-emerald-400" /> Datos del análisis
                    </h2>
                    {status !== "idle" && (
                    <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                        <RotateCcw size={12} /> Reiniciar
                    </button>
                    )}
                </div>

                <Dropzone file={file} onFile={setFile} />

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Link2 size={12} /> URL de la vacante
                    </label>
                    <div className="relative">
                    <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        placeholder="https://linkedin.com/jobs/view/..."
                        disabled={status !== "idle"}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                    />
                    {jobUrl && <ExternalLink size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />}
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={!canSubmit}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                    ${canSubmit
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:-translate-y-0.5"
                        : "bg-slate-800 text-slate-600 cursor-not-allowed"
                    }`}
                >
                    {status === "loading" || status === "processing"
                    ? <><Loader2 size={16} className="animate-spin" /> Analizando...</>
                    : <><Sparkles size={16} /> Analizar con IA <ChevronRight size={14} /></>
                    }
                </button>
                </div>

                {/* Status pill */}
                {status === "processing" && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <div>
                    <p className="text-xs font-semibold text-amber-300">Procesando en background</p>
                    <p className="text-xs text-slate-500">Job #{evalId} · Consultando cada 3s via Hangfire</p>
                    </div>
                </div>
                )}

                {status === "error" && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5">
                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-300">{errorMsg}</p>
                </div>
                )}


                {/* Industry Badge (NUEVO) */}
                {status === "completed" && analysis?.detected_industry && (
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Industria Detectada</span>
                        <Tag label={analysis.detected_industry} color="emerald" />
                    </div>
                )}

                {/* Complexity Score */}
                {status === "completed" && analysis?.complexity_score != null && (
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Zap size={12} className="text-amber-400" /> Complexity Score
                    </p>
                    <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {analysis.complexity_score}
                    </span>
                    <span className="text-slate-500 text-lg mb-1">/10</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-1000"
                        style={{ width: `${analysis.complexity_score * 10}%` }}
                    />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Complejidad real de tus proyectos</p>
                </div>
                )}
            </div>

            {/* ── RIGHT PANEL: Results ─────────────────────────────────────── */}
            <div className="space-y-5">
                {/* Idle placeholder */}
                {status === "idle" && (
                <div className="rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/20 p-16 flex flex-col items-center gap-4 text-center">
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40">
                    <TrendingUp size={28} className="text-slate-600" />
                    </div>
                    <div>
                    <p className="text-sm font-semibold text-slate-500">Listo para el análisis</p>
                    <p className="text-xs text-slate-600 mt-1">Sube tu CV y la URL de la vacante para comenzar</p>
                    </div>
                </div>
                )}

                {/* Skeleton */}
                {(status === "loading" || status === "processing") && <AnalysisSkeleton />}

                {/* Results */}
                {status === "completed" && analysis && (
                <div className="space-y-5">
                    {/* Gauge + Strengths/Flags row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                    {/* Gauge */}
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col items-center justify-center gap-4 min-h-[280px]">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest self-start flex items-center gap-1.5">
                        <Star size={12} className="text-emerald-400" /> Compatibilidad
                        </p>
                        <GaugeChart value={analysis.match_percentage || 0} />
                    </div>

                    {/* Red Flags */}
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 space-y-3 min-h-[280px]">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldAlert size={12} className="text-red-400" /> Red Flags
                        </p>
                        {analysis.red_flags?.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto max-h-52 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {analysis.red_flags.map((f, i) => <RedFlagCard key={i} flag={f} />)}
                        </div>
                        ) : (
                        <div className="flex items-center gap-2 py-4 text-emerald-400">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-medium">Sin red flags detectados</span>
                        </div>
                        )}
                    </div>
                    </div>

                    {/* Strengths */}
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400" /> Fortalezas detectadas
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {analysis.strengths?.map((s, i) => <Tag key={i} label={s} color="emerald" />)}
                    </div>
                    </div>

                    {/* Missing skills + ATS Keywords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 space-y-3 min-h-[140px]">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-amber-400" /> Skills faltantes
                        </p>
                        <div className="flex flex-wrap gap-2">
                        {analysis.missing_skills?.map((s, i) => <Tag key={i} label={s} color="amber" />)}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap size={12} className="text-blue-400" /> Keywords ATS
                        </p>
                        <div className="flex flex-wrap gap-2">
                        {analysis.ats_keywords_to_add?.map((k, i) => <Tag key={i} label={k} color="blue" />)}
                        </div>
                    </div>
                    </div>

                    {/* CV Suggestions */}
                    {analysis.cv_improvement_suggestions?.length > 0 && (
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm p-5 space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-emerald-400" /> Sugerencias de mejora
                        </p>
                        <div className="space-y-2">
                        {analysis.cv_improvement_suggestions.map((s, i) => (
                            <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Tag label={s.section} color="blue" />
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-slate-600/60 pl-3">
                                    {s.suggestion}
                                </p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Cover Letter Section */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                        <Sparkles size={14} /> Carta de Presentación IA
                        </p>
                        {coverLetter && (
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        >
                            {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                        </button>
                        )}
                    </div>

                    {!coverLetter ? (
                        <button
                        onClick={handleGenerateCoverLetter}
                        disabled={coverLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/40 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                        >
                        {coverLoading
                            ? <><Loader2 size={15} className="animate-spin" /> Generando carta...</>
                            : <><Sparkles size={15} /> Generar Carta con IA <ChevronRight size={13} /></>
                        }
                        </button>
                    ) : (
                        <textarea
                        readOnly
                        value={coverLetter}
                        rows={12}
                        className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 text-sm text-slate-300 leading-7 resize-none focus:outline-none focus:border-emerald-500/40 transition-all scrollbar-thin"
                        style={{ fontFamily: "'Georgia', serif" }}
                        />
                    )}
                    </div>
                </div>
                )}
            </div>
        </div>

                {/* Sidebar de Historial (CON ANIMACIÓN CORREGIDA) */}
            {showHistory && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
                    <div className="relative w-85 h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl animate-slide-in">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <RotateCcw size={18} className="text-emerald-400" /> Historial
                            </h3>
                            <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3 overflow-y-auto h-[calc(100vh-120px)] pr-2 scrollbar-thin">
                            {history.length === 0 ? (
                                <p className="text-center text-slate-600 text-sm mt-10">No hay análisis previos.</p>
                            ) : (
                                history.map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => handleSelectHistory(item.id)}
                                        className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-emerald-500/50 hover:bg-slate-800/60 cursor-pointer transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <Tag label={`${item.globalMatchPercentage || 0}%`} color={item.globalMatchPercentage > 70 ? 'emerald' : 'amber'} />
                                            <span className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 break-all line-clamp-2 leading-relaxed">
                                            {item.vacancyUrl}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-slate-800/60 flex items-center justify-between">
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <Briefcase size={11} /> Career Copilot · Powered by Gemini AI + Hangfire by JERG
            </p>
            <p className="text-xs text-slate-700">ASP.NET Core 8 · SQL Server (LocalDB)</p>
            </footer>
        </div>

        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&family=DM+Mono:wght@400;500&display=swap');
            @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.4s ease forwards; }
            .scrollbar-thin::-webkit-scrollbar { width: 4px; }
            .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #475569; }
            .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
            @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); }}
            .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
        `}</style>
        </div>
    );
}