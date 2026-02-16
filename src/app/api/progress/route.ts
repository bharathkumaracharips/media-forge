import { NextRequest } from "next/server";
import { getProgress } from "@/lib/progress-store";

export async function GET(req: NextRequest) {
    const jobId = req.nextUrl.searchParams.get("jobId");

    if (!jobId) {
        return new Response("Missing jobId", { status: 400 });
    }

    const encoder = new TextEncoder();

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const stream = new ReadableStream({
        start(controller) {
            let isClosed = false;

            const closeStream = () => {
                if (!isClosed) {
                    isClosed = true;
                    clearInterval(interval);
                    clearTimeout(timeout);
                    try {
                        controller.close();
                    } catch (e) {
                        // Ignore if already closed
                    }
                }
            };

            const sendProgress = () => {
                if (isClosed) return true;

                const progressData = getProgress(jobId);

                if (progressData) {
                    const data = `data: ${JSON.stringify(progressData)}\n\n`;
                    try {
                        controller.enqueue(encoder.encode(data));
                    } catch (e) {
                        closeStream();
                        return true;
                    }

                    // Close stream when complete
                    if (progressData.progress >= 100) {
                        closeStream();
                        return true;
                    }
                }
                return false;
            };

            // Send initial progress
            sendProgress();

            // Poll for updates every 500ms
            interval = setInterval(() => {
                sendProgress();
            }, 500);

            // Cleanup after 5 minutes
            timeout = setTimeout(() => {
                closeStream();
            }, 5 * 60 * 1000);
        },
        cancel() {
            clearInterval(interval);
            clearTimeout(timeout);
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
