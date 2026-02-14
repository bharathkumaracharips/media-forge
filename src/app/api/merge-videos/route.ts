import { NextRequest, NextResponse } from "next/server";
import { mergeVideoFiles } from "@/lib/ffmpeg-helper";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { setProgress, clearProgress } from "@/lib/progress-store";

export async function POST(req: NextRequest) {
    const tempFiles: string[] = [];
    let processedFilePath: string | null = null;
    const jobId = `merge_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const tempDir = os.tmpdir();

        setProgress(jobId, 0, "Uploading files...");

        // Save all files to disk
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            // Sanitize filename to avoid weird character issues/command injection risks
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const tempPath = path.join(tempDir, `merge_${Date.now()}_${sanitizedName}`);
            await writeFile(tempPath, buffer);
            tempFiles.push(tempPath);
        }

        console.log("Starting merge process with files:", tempFiles);

        // Pass progress callback to mergeVideoFiles
        processedFilePath = await mergeVideoFiles(tempFiles, (progress, status) => {
            setProgress(jobId, progress, status);
        });

        console.log("Merge completed. Output path:", processedFilePath);

        if (!processedFilePath) throw new Error("Processing failed, no output file path returned.");

        const stats = await import("fs/promises").then(m => m.stat(processedFilePath!));
        console.log(`Merged file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        console.log("Reading merged file into memory...");
        const processedBuffer = await readFile(processedFilePath);
        console.log("File read into memory. Buffer size:", processedBuffer.byteLength);

        // Clear progress after a delay to ensure SSE sends final 100% update
        setTimeout(() => clearProgress(jobId), 1000);

        return new NextResponse(processedBuffer, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="merged_video.mp4"`,
                "Content-Length": stats.size.toString(),
                "X-Job-Id": jobId,
            },
        });

    } catch (error) {
        console.error("Error merging files:", error);
        clearProgress(jobId);
        return NextResponse.json({ error: "Merging failed: " + (error as Error).message }, { status: 500 });
    } finally {
        // Cleanup temp inputs immediately
        for (const f of tempFiles) await unlink(f).catch(() => { });

        // Cleanup output file after a short delay to ensure response is sent (?) 
        // Actually, since we read into buffer, we can delete immediately from disk.
        if (processedFilePath) {
            console.log("Cleaning up merged file from disk...");
            await unlink(processedFilePath).catch(err => console.error("Error cleaning up merged file:", err));
        }
    }
}
