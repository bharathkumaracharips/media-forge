"use client";

import { useState, useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import ProgressBar from "@/components/ProgressBar";
import { Download, Sparkles, Layers, RefreshCw, Wand2, Zap } from "lucide-react";

export default function MediaDashboard() {
    const [mode, setMode] = useState<"clean" | "merge" | "enhance">("clean");
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressStatus, setProgressStatus] = useState("");
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);

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

        try {
            let endpoint = "";
            switch (mode) {
                case "clean": endpoint = "/api/clean-audio"; break;
                case "merge": endpoint = "/api/merge-videos"; break;
                case "enhance": endpoint = "/api/enhance-video"; break;
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
                        {mode === "merge" && "Studio Video Merge"}
                    </h2>
                    <p className="opacity-70 max-w-2xl mx-auto">
                        {mode === "clean" && "Maximum noise reduction: Dual-pass FFT denoising, aggressive frequency filtering at 120Hz/240Hz/360Hz/650Hz (fan harmonics), and strong noise gating at -42dB. Pushes the limits while preserving voice quality."}
                        {mode === "enhance" && "Upscale to 1080p/4K, sharpen details, reduce grain, and optimize colors for a crystal-clear premium look."}
                        {mode === "merge" && "Create a seamless montage. Select multiple video clips and we will intelligently stitch them together."}
                    </p>
                </div>

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
