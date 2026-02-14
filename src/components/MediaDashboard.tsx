"use client";

import { useState, useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import ProgressBar from "@/components/ProgressBar";
import { Download, Sparkles, Layers, RefreshCw, Wand2, Zap, Scissors } from "lucide-react";

export default function MediaDashboard() {
    const [mode, setMode] = useState<"clean" | "merge" | "enhance" | "removebg">("clean");
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressStatus, setProgressStatus] = useState("");
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);

    // Background removal settings
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [chromaKeyColor, setChromaKeyColor] = useState("green");
    const [customChromaColor, setCustomChromaColor] = useState("#00ff00"); // For custom color picker
    const [bgRemovalMode, setBgRemovalMode] = useState<"chromakey" | "auto">("chromakey");
    const [similarity, setSimilarity] = useState(0.10); // LOWER default - more conservative (0.0-1.0)
    const [blend, setBlend] = useState(0.05); // Edge blending (0.0-1.0)

    // Subscribe to progress updates via SSE
    useEffect(() => {
        if (!currentJobId) return;

        const eventSource = new EventSource(`/api/progress?jobId=${currentJobId}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setProgress(data.progress);
                setProgressStatus(data.status);

                if (data.progress >= 100) {
                    eventSource.close();
                }
            } catch (error) {
                console.error("Error parsing progress data:", error);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [currentJobId]);

    const handleProcess = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setDownloadUrl(null);
        setProgress(0);
        setProgressStatus("Uploading files...");

        // Generate a job ID upfront
        const jobId = `${mode}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        setCurrentJobId(jobId);

        const formData = new FormData();
        if (mode === "merge") {
            files.forEach((f) => formData.append("files", f));
        } else {
            formData.append("file", files[0]);
        }

        // Add background removal settings if in removebg mode
        if (mode === "removebg") {
            formData.append("backgroundColor", backgroundColor);
            // Use custom color if selected, otherwise use preset
            const actualChromaColor = chromaKeyColor === "custom" ? customChromaColor : chromaKeyColor;
            formData.append("chromaKeyColor", actualChromaColor);
            formData.append("mode", bgRemovalMode);
            formData.append("similarity", similarity.toString());
            formData.append("blend", blend.toString());
        }

        try {
            let endpoint = "";
            switch (mode) {
                case "clean": endpoint = "/api/clean-audio"; break;
                case "merge": endpoint = "/api/merge-videos"; break;
                case "enhance": endpoint = "/api/enhance-video"; break;
                case "removebg": endpoint = "/api/remove-background"; break;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Processing failed");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setProgress(100);
            setProgressStatus("Complete!");
        } catch (err) {
            alert("Error: " + (err as Error).message);
            setProgress(0);
            setProgressStatus("");
        } finally {
            setIsProcessing(false);
            setCurrentJobId(null);
        }
    };

    const handleFilesSelected = (newFiles: File[]) => {
        if (mode === "merge") {
            setFiles(prev => {
                const existingNames = new Set(prev.map(f => f.name));
                const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
                return [...prev, ...uniqueNewFiles];
            });
        } else {
            setFiles(newFiles);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
                <button
                    onClick={() => { setMode("clean"); setFiles([]); setDownloadUrl(null); }}
                    className={`glass-panel px-6 py-3 flex items-center gap-2 font-bold transition-all`}
                    style={{
                        background: mode === 'clean' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                        borderColor: mode === 'clean' ? 'var(--primary)' : 'transparent',
                        color: mode === 'clean' ? 'white' : 'rgba(255,255,255,0.6)'
                    }}
                >
                    <Sparkles size={20} />
                    Clean Audio
                </button>
                <button
                    onClick={() => { setMode("enhance"); setFiles([]); setDownloadUrl(null); }}
                    className={`glass-panel px-6 py-3 flex items-center gap-2 font-bold transition-all`}
                    style={{
                        background: mode === 'enhance' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                        borderColor: mode === 'enhance' ? '#eab308' : 'transparent',
                        color: mode === 'enhance' ? 'white' : 'rgba(255,255,255,0.6)'
                    }}
                >
                    <Zap size={20} />
                    Enhance 4K
                </button>
                <button
                    onClick={() => { setMode("removebg"); setFiles([]); setDownloadUrl(null); }}
                    className={`glass-panel px-6 py-3 flex items-center gap-2 font-bold transition-all`}
                    style={{
                        background: mode === 'removebg' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255,255,255,0.05)',
                        borderColor: mode === 'removebg' ? '#14b8a6' : 'transparent',
                        color: mode === 'removebg' ? 'white' : 'rgba(255,255,255,0.6)'
                    }}
                >
                    <Scissors size={20} />
                    Remove BG
                </button>
                <button
                    onClick={() => { setMode("merge"); setFiles([]); setDownloadUrl(null); }}
                    className={`glass-panel px-6 py-3 flex items-center gap-2 font-bold transition-all`}
                    style={{
                        background: mode === 'merge' ? 'rgba(217, 70, 239, 0.2)' : 'rgba(255,255,255,0.05)',
                        borderColor: mode === 'merge' ? 'var(--secondary)' : 'transparent',
                        color: mode === 'merge' ? 'white' : 'rgba(255,255,255,0.6)'
                    }}
                >
                    <Layers size={20} />
                    Merge Videos
                </button>
            </div>

            <div className="glass-panel p-8 animate-fade-in">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 title-gradient" style={{ marginBottom: "1rem" }}>
                        {mode === "clean" && "AI Noise Cancellation"}
                        {mode === "enhance" && "Premium Video Enhancer"}
                        {mode === "removebg" && "Background Removal Studio"}
                        {mode === "merge" && "Studio Video Merge"}
                    </h2>
                    <p className="opacity-70 max-w-2xl mx-auto">
                        {mode === "clean" && "Maximum noise reduction: Dual-pass FFT denoising, aggressive frequency filtering at 120Hz/240Hz/360Hz/650Hz (fan harmonics), and strong noise gating at -42dB. Pushes the limits while preserving voice quality."}
                        {mode === "enhance" && "Upscale to 1080p/4K, sharpen details, reduce grain, and optimize colors for a crystal-clear premium look."}
                        {mode === "removebg" && "Remove green screen or automatically detect and remove backgrounds. Replace with any solid color. Optimized for fast processing (720p output, 5-10x faster than standard quality)."}
                        {mode === "merge" && "Create a seamless montage. Select multiple video clips and we will intelligently stitch them together."}
                    </p>
                </div>

                {/* Background Removal Settings - CLEAN UI */}
                {mode === "removebg" && (
                    <div className="mb-6 space-y-4">
                        {/* Main Settings - 2 Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Screen Color to Remove */}
                            <div className="glass-panel p-5">
                                <label className="block text-base font-semibold mb-3">
                                    What color is your background?
                                </label>
                                <select
                                    value={chromaKeyColor}
                                    onChange={(e) => setChromaKeyColor(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/20 text-white font-medium text-base hover:border-white/40 transition-colors"
                                >
                                    <option value="green" className="bg-gray-800">🟢 Green Screen</option>
                                    <option value="blue" className="bg-gray-800">🔵 Blue Screen</option>
                                    <option value="white" className="bg-gray-800">⚪ White Background</option>
                                    <option value="custom" className="bg-gray-800">🎨 Custom Color</option>
                                </select>

                                {/* Custom Color Picker */}
                                {chromaKeyColor === "custom" && (
                                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-xs opacity-70 mb-2">Pick exact screen color:</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={customChromaColor}
                                                onChange={(e) => setCustomChromaColor(e.target.value)}
                                                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-white/30"
                                            />
                                            <input
                                                type="text"
                                                value={customChromaColor}
                                                onChange={(e) => setCustomChromaColor(e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-sm"
                                                placeholder="#00ff00"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Replace With Color */}
                            <div className="glass-panel p-5">
                                <label className="block text-base font-semibold mb-3">
                                    Replace background with:
                                </label>
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="color"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="w-14 h-14 rounded-lg cursor-pointer border-2 border-white/30"
                                    />
                                    <input
                                        type="text"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="flex-1 px-3 py-2.5 rounded-lg bg-white/10 border-2 border-white/20 text-white font-mono hover:border-white/40 transition-colors"
                                        placeholder="#ffffff"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setBackgroundColor("#ffffff")}
                                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-white text-black font-semibold hover:scale-105 transition-transform"
                                    >
                                        White
                                    </button>
                                    <button
                                        onClick={() => setBackgroundColor("#000000")}
                                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-black text-white border-2 border-white/40 font-semibold hover:scale-105 transition-transform"
                                    >
                                        Black
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Controls - Collapsed */}
                        {bgRemovalMode === "chromakey" && (
                            <details className="glass-panel p-5">
                                <summary className="font-semibold text-base cursor-pointer hover:opacity-80 select-none flex items-center gap-2">
                                    ⚙️ Fine-tune (if hair/beard affected)
                                </summary>
                                <div className="mt-4 space-y-4">
                                    {/* Sensitivity Slider */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium">Sensitivity</label>
                                            <span className="text-sm font-mono bg-white/10 px-3 py-1 rounded-lg">{similarity.toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.05"
                                            max="0.5"
                                            step="0.01"
                                            value={similarity}
                                            onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                                            className="w-full h-2 rounded-lg"
                                        />
                                        <p className="text-xs opacity-60 mt-1.5">
                                            Lower = safer for hair/beard | Higher = more removal
                                        </p>
                                    </div>

                                    {/* Edge Smoothness Slider */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium">Edge Smoothness</label>
                                            <span className="text-sm font-mono bg-white/10 px-3 py-1 rounded-lg">{blend.toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.0"
                                            max="0.3"
                                            step="0.01"
                                            value={blend}
                                            onChange={(e) => setBlend(parseFloat(e.target.value))}
                                            className="w-full h-2 rounded-lg"
                                        />
                                        <p className="text-xs opacity-60 mt-1.5">
                                            Lower = sharp edges | Higher = smooth edges
                                        </p>
                                    </div>

                                    {/* Helpful Tip */}
                                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                        <p className="text-xs text-blue-200">
                                            💡 <strong>Tip:</strong> If hair/beard is disappearing, set Sensitivity to <strong>0.08</strong> or lower
                                        </p>
                                    </div>
                                </div>
                            </details>
                        )}
                    </div>
                )}

                <UploadZone
                    label={mode === "merge" ? "Upload Multiple Video Clips" : "Upload Single Video Source"}
                    accept="video/mp4,video/quicktime,video/x-m4v,video/webm"
                    maxFiles={mode === "merge" ? 20 : 1}
                    files={files}
                    onFilesSelected={handleFilesSelected}
                    onRemove={(i) => setFiles(files.filter((_, idx) => idx !== i))}
                />

                {isProcessing && <ProgressBar progress={progress} status={progressStatus} />}

                <div className="mt-8 flex justify-center items-center h-16">
                    {isProcessing ? (
                        <button disabled className="btn btn-primary opacity-80 cursor-wait">
                            <RefreshCw className="animate-spin" /> Processing Media...
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            {downloadUrl ? (
                                <div className="flex gap-4 animate-fade-in">
                                    <a href={downloadUrl} download={
                                        mode === "clean" ? "clean_result.mp4" :
                                            mode === "enhance" ? "enhanced_result.mp4" :
                                                mode === "removebg" ? "bg_removed_result.mp4" :
                                                    "merged_result.mp4"
                                    } className="btn btn-primary" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                        <Download size={20} /> Download Result
                                    </a>
                                    <button onClick={() => { setFiles([]); setDownloadUrl(null); }} className="btn btn-secondary">
                                        Process Another
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleProcess}
                                    disabled={files.length === 0}
                                    className="btn btn-primary"
                                    style={{
                                        opacity: files.length === 0 ? 0.5 : 1,
                                        cursor: files.length === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <Sparkles size={20} /> Start Processing
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
