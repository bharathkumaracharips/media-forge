// Simple in-memory progress store for tracking FFmpeg operations
type ProgressData = {
    progress: number;
    status: string;
    timestamp: number;
};

const progressStore = new Map<string, ProgressData>();

export function setProgress(jobId: string, progress: number, status: string) {
    progressStore.set(jobId, {
        progress,
        status,
        timestamp: Date.now()
    });
}

export function getProgress(jobId: string): ProgressData | null {
    return progressStore.get(jobId) || null;
}

export function clearProgress(jobId: string) {
    progressStore.delete(jobId);
}

// Clean up old progress entries (older than 1 hour)
setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [jobId, data] of progressStore.entries()) {
        if (now - data.timestamp > oneHour) {
            progressStore.delete(jobId);
        }
    }
}, 5 * 60 * 1000); // Run every 5 minutes
