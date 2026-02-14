import { NextRequest, NextResponse } from "next/server";
import { cleanAudioAndMerge } from "@/lib/ffmpeg-helper";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { setProgress, clearProgress } from "@/lib/progress-store";

export async function POST(req: NextRequest) {
    let tempFilePath: string | null = null;
    let processedFilePath: string | null = null;
    const jobId = `clean_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        setProgress(jobId, 0, "Uploading file...");

        const buffer = Buffer.from(await file.arrayBuffer());
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);

        await writeFile(tempFilePath, buffer);

        processedFilePath = await cleanAudioAndMerge(tempFilePath, (progress, status) => {
            setProgress(jobId, progress, status);
        });

        // Read the processed file into memory to send it back
        // Note: For very large files, streams should be used instead of Buffers
        const processedBuffer = await readFile(processedFilePath);

        // Clear progress after a delay to ensure SSE sends final 100% update
        setTimeout(() => clearProgress(jobId), 1000);

        return new NextResponse(processedBuffer, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="cleaned_${file.name}"`,
                "X-Job-Id": jobId,
            },
        });

    } catch (error) {
        console.error("Error processing file:", error);
        clearProgress(jobId);
        return NextResponse.json({ error: "Processing failed: " + (error as Error).message }, { status: 500 });
    } finally {
        // Cleanup
        if (tempFilePath) await unlink(tempFilePath).catch(() => { });
        if (processedFilePath) await unlink(processedFilePath).catch(() => { });
    }
}
