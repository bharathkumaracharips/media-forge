"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
    progress: number;
    status: string;
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
        // Smooth animation
        const timer = setTimeout(() => {
            setDisplayProgress(progress);
        }, 50);
        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className="w-full animate-fade-in" style={{ marginTop: "2rem" }}>
            <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="animate-spin" size={20} style={{ color: "var(--primary)" }} />
                    <span className="font-medium">{status}</span>
                </div>

                <div
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.1)",
                        position: "relative"
                    }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${displayProgress}%`,
                            background: "linear-gradient(90deg, #3b82f6, #d946ef)",
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
                        }}
                    />
                </div>

                <div className="mt-2 text-right">
                    <span className="text-sm opacity-70">{Math.round(displayProgress)}%</span>
                </div>
            </div>
        </div>
    );
}
