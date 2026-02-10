import { useEffect, useState } from "react";

interface ProgressData {
    progress: number;
    status: string;
}

export function useProgress(jobId: string | null) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!jobId) {
            setProgress(0);
            setStatus("");
            return;
        }

        const eventSource = new EventSource(`/api/progress?jobId=${jobId}`);

        eventSource.onmessage = (event) => {
            try {
                const data: ProgressData = JSON.parse(event.data);
                setProgress(data.progress);
                setStatus(data.status);

                // Close connection when complete
                if (data.progress >= 100) {
                    eventSource.close();
                }
            } catch (error) {
                console.error("Error parsing progress data:", error);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [jobId]);

    return { progress, status };
}
