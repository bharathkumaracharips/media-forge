import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Configure ffmpeg path
if (ffmpegPath) {
    console.log('Setting ffmpeg path to:', ffmpegPath);
    ffmpeg.setFfmpegPath(ffmpegPath);
} else {
    console.error('ffmpeg-static did not return a path');
}

export const cleanAudioAndMerge = async (
    inputFile: string,
    onProgress?: (progress: number, status: string) => void
): Promise<string> => {
    const outputDir = path.dirname(inputFile);
    const finalOutput = path.join(outputDir, `cleaned_${Date.now()}_${path.basename(inputFile)}`);

    console.log(`Starting audio cleanup for ${inputFile}`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .outputOptions([
                '-map 0:v',
                '-map 0:a',
                '-c:v copy',          // Copy video stream directly (fast, no loss)
                // Maximum noise reduction pipeline (8 stages):
                // 1. highpass=f=100: Remove low-frequency rumble (increased from 80Hz)
                // 2. lowpass=f=11000: Remove high-frequency hiss (lowered from 12kHz)
                // 3. afftdn (pass 1): Strong FFT denoising
                //    - nr=16: Stronger noise reduction (was 14)
                //    - nf=-55: Lower noise floor for better detection (was -50)
                //    - tn=1: Track noise over time
                // 4. afftdn (pass 2): Second pass for stubborn noise
                //    - nr=12: Stronger second pass (was 10)
                //    - nf=-48: Lower threshold (was -45)
                // 5. equalizer: Aggressively reduce fan motor frequency
                //    - 120Hz: -10dB (was -8dB)
                // 6. equalizer: Reduce first harmonic
                //    - 240Hz: -8dB (was -6dB)
                // 7. equalizer: Reduce fan blade whoosh
                //    - 650Hz: -9dB (was -7dB)
                // 8. equalizer: Additional reduction at 360Hz (second harmonic)
                //    - 360Hz: -6dB (new)
                // 9. agate: Aggressive noise gate
                //    - threshold=-42dB: Very aggressive (was -45dB)
                //    - ratio=4: Strong gating (was 3)
                //    - attack=10ms, release=150ms: Fast response (was 15/200)
                // 10. highpass=f=100: Final pass to remove any remaining rumble
                '-af', 'highpass=f=100,lowpass=f=11000,afftdn=nr=16:nf=-55:tn=1,afftdn=nr=12:nf=-48:tn=1,equalizer=f=120:width_type=h:width=50:g=-10,equalizer=f=240:width_type=h:width=50:g=-8,equalizer=f=360:width_type=h:width=50:g=-6,equalizer=f=650:width_type=h:width=200:g=-9,agate=threshold=-42dB:ratio=4:attack=10:release=150,highpass=f=100',
                '-c:a aac',           // Re-encode audio to AAC
                '-b:a 192k'           // High quality audio bitrate
            ])
            .save(finalOutput)
            .on('start', (cmd: any) => {
                console.log('FFmpeg command:', cmd);
                onProgress?.(0, 'Starting maximum noise reduction...');
            })
            .on('progress', (progress: any) => {
                if (progress.percent) {
                    const percent = Math.min(99, Math.max(0, progress.percent));
                    onProgress?.(percent, `Cleaning audio: ${Math.round(percent)}%`);
                    console.log(`Progress: ${percent.toFixed(1)}%`);
                }
            })
            .on('end', () => {
                console.log('Finished processing');
                onProgress?.(100, 'Complete!');
                resolve(finalOutput);
            })
            .on('error', (err: any, stdout: any, stderr: any) => {
                console.error('FFmpeg error:', err);
                console.error('ffmpeg stderr:', stderr);
                reject(err);
            });
    });
};

export const mergeVideoFiles = (
    inputFiles: string[],
    onProgress?: (progress: number, status: string) => void
): Promise<string> => {
    console.log("ENTERED mergeVideoFiles with", inputFiles);

    if (!inputFiles || inputFiles.length === 0) {
        return Promise.reject(new Error("No input files provided to mergeVideoFiles"));
    }

    const outputDir = path.dirname(inputFiles[0]);
    const finalOutput = path.join(outputDir, `merged_${Date.now()}.mp4`);

    console.log(`Merging ${inputFiles.length} files`);

    return new Promise((resolve, reject) => {
        const command = ffmpeg();

        inputFiles.forEach(file => {
            command.input(file);
        });

        // specific resolution to standardise on
        const width = 1920;
        const height = 1080;

        // Build complex filter
        // We need to scale (and pad) every video input to match the target resolution
        // Then we concat them.
        const filterComplex: string[] = [];
        const inputLabels: string[] = [];

        for (let i = 0; i < inputFiles.length; i++) {
            // Scale and pad video to 1920x1080
            // force_original_aspect_ratio=decrease ensures it fits INSIDE the box
            // pad fills the rest with black
            // setsar=1 ensures pixel aspect ratio is square, preventing mismatch errors
            filterComplex.push(
                `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`
            );
            // We assume audio is present in all files. If not, we'd need more complex fallback logic.
            // We'll map video from our scaled label [vi] and audio directly from input [i:a]
            inputLabels.push(`[v${i}][${i}:a]`);
        }

        // Concat filter: n=number of segments, v=1 video out, a=1 audio out
        filterComplex.push(`${inputLabels.join('')}concat=n=${inputFiles.length}:v=1:a=1[v][a]`);

        command
            .complexFilter(filterComplex, ['v', 'a'])
            .outputOptions([
                '-c:v libx264',   // Re-encode video to H.264
                '-preset medium', // Balanced speed/quality (much faster than slow)
                '-crf 18',        // High quality (lower is better, 18 is visually lossless)
                '-c:a aac',       // Re-encode audio to AAC
                '-b:a 192k',      // High quality audio
                '-movflags +faststart' // Optimize for web handling
            ])
            .on('start', (cmd: any) => {
                console.log('FFmpeg merge command:', cmd);
                onProgress?.(0, 'Starting merge process...');
            })
            .on('progress', (progress: any) => {
                if (progress.percent) {
                    const percent = Math.min(99, Math.max(0, progress.percent));
                    onProgress?.(percent, `Merging videos: ${Math.round(percent)}%`);
                    console.log(`Progress: ${percent.toFixed(1)}%`);
                }
            })
            .on('end', async () => {
                console.log('FFmpeg process finished. Verifying output:', finalOutput);
                onProgress?.(100, 'Finalizing...');
                try {
                    const stats = await fs.promises.stat(finalOutput);
                    console.log(`Output confirmed. Size: ${stats.size} bytes. Resolving path.`);
                    resolve(finalOutput);
                } catch (e) {
                    console.error("Output file missing or inaccessible:", e);
                    reject(new Error("FFmpeg finished but output file is missing"));
                }
            })
            .on('error', (err: any, stdout: any, stderr: any) => {
                console.error('FFmpeg error:', err);
                console.error('ffmpeg stderr:', stderr);
                reject(err);
            })
            .save(finalOutput);
    });
};

export const enhanceVideo = async (
    inputFile: string,
    onProgress?: (progress: number, status: string) => void
): Promise<string> => {
    const outputDir = path.dirname(inputFile);
    const finalOutput = path.join(outputDir, `enhanced_${Date.now()}_${path.basename(inputFile)}`);

    console.log(`Starting video enhancement for ${inputFile}`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            // Video Filters:
            // 1. scale=3840:2160:flags=lanczos: Force high quality scaling up to 4K
            // 2. unsharp=5:5:1.0:5:5:0.0: Strong sharpening to simulate "super resolution" crispness
            //    (luma_msize_x:luma_msize_y:luma_amount:chroma_msize_x:chroma_msize_y:chroma_amount)
            // 3. eq=saturation=1.2:contrast=1.1:bt=1.0: Slightly boost saturation and contrast for "pop"
            // 4. hqdn3d=1.5:1.5:6:6: Spatial/Temporal denoising to clean up grain
            .outputOptions([
                '-vf', 'scale=3840:2160:flags=lanczos,unsharp=5:5:1.0:5:5:0.0,eq=saturation=1.1:contrast=1.05,hqdn3d=1.5:1.5:6:6',
                '-c:v', 'libx264',
                '-preset', 'medium', // Balance speed vs quality
                '-crf', '18',        // High quality (lower is better, 18 is visually lossless)
                '-c:a', 'copy',      // Copy audio without touching it
                '-movflags', '+faststart'
            ])
            .save(finalOutput)
            .on('start', (cmd: any) => {
                console.log('FFmpeg enhance command:', cmd);
                onProgress?.(0, 'Starting video enhancement...');
            })
            .on('progress', (progress: any) => {
                if (progress.percent) {
                    const percent = Math.min(99, Math.max(0, progress.percent));
                    onProgress?.(percent, `Enhancing to 4K: ${Math.round(percent)}%`);
                    console.log(`Progress: ${percent.toFixed(1)}%`);
                }
            })
            .on('end', () => {
                console.log('Finished enhancement');
                onProgress?.(100, 'Complete!');
                resolve(finalOutput);
            })
            .on('error', (err: any, stdout: any, stderr: any) => {
                console.error('FFmpeg error:', err);
                console.error('ffmpeg stderr:', stderr);
                reject(err);
            });
    });
};
