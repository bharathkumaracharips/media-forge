import { NextRequest } from "next/server";
import { getProgress } from "@/lib/progress-store";

export async function GET(req: NextRequest) {
    const jobId = req.nextUrl.searchParams.get("jobId");

    if (!jobId) {
        return new Response("Missing jobId", { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendProgress = () => {
                const progressData = getProgress(jobId);

                if (progressData) {
                    const data = `data: ${JSON.stringify(progressData)}\n\n`;
                    controller.enqueue(encoder.encode(data));

                    // Close stream when complete
                    if (progressData.progress >= 100) {
                        controller.close();
                        return true;
                    }
                }
                return false;
            };

            // Send initial progress
            sendProgress();

            // Poll for updates every 500ms
            const interval = setInterval(() => {
                const isDone = sendProgress();
                if (isDone) {
                    clearInterval(interval);
                }
            }, 500);

            // Cleanup after 5 minutes
            setTimeout(() => {
                clearInterval(interval);
                controller.close();
            }, 5 * 60 * 1000);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
