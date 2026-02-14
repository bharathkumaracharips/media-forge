import { NextRequest, NextResponse } from "next/server";
import { removeVideoBackground, removeBackgroundAuto } from "@/lib/background-removal";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { setProgress, clearProgress } from "@/lib/progress-store";

export async function POST(req: NextRequest) {
    let tempFilePath: string | null = null;
    let processedFilePath: string | null = null;
    const jobId = `remove_bg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const backgroundColor = (formData.get("backgroundColor") as string) || "#ffffff";
        const chromaKeyColor = (formData.get("chromaKeyColor") as string) || "green";
        const mode = (formData.get("mode") as string) || "chromakey"; // "chromakey" or "auto"
        const similarity = parseFloat((formData.get("similarity") as string) || "0.10");
        const blend = parseFloat((formData.get("blend") as string) || "0.05");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        setProgress(jobId, 0, "Uploading file...");

        const buffer = Buffer.from(await file.arrayBuffer());
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `bg_remove_${Date.now()}_${file.name}`);

        await writeFile(tempFilePath, buffer);

        setProgress(jobId, 5, "Processing video...");

        // Choose processing mode
        if (mode === "auto") {
            processedFilePath = await removeBackgroundAuto(
                tempFilePath,
                backgroundColor,
                (progress, status) => {
                    setProgress(jobId, progress, status);
                }
            );
        } else {
            processedFilePath = await removeVideoBackground(
                tempFilePath,
                {
                    backgroundColor,
                    chromaKeyColor,
                    similarity,
                    blend
                },
                (progress, status) => {
                    setProgress(jobId, progress, status);
                }
            );
        }

        const processedBuffer = await readFile(processedFilePath);

        // Clear progress after a delay to ensure SSE sends final 100% update
        setTimeout(() => clearProgress(jobId), 1000);

        return new NextResponse(processedBuffer, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="bg_removed_${file.name}"`,
                "X-Job-Id": jobId,
            },
        });

    } catch (error) {
        console.error("Error removing background:", error);
        clearProgress(jobId);
        return NextResponse.json({
            error: "Background removal failed: " + (error as Error).message
        }, { status: 500 });
    } finally {
        if (tempFilePath) await unlink(tempFilePath).catch(() => { });
        if (processedFilePath) await unlink(processedFilePath).catch(() => { });
    }
}
