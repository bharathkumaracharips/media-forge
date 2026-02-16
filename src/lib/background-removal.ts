import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

// Configure ffmpeg path
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export interface BackgroundRemovalOptions {
    backgroundType?: "color" | "image"; // Type of background replacement
    backgroundColor?: string; // Hex color like "#ffffff" or named color like "white"
    backgroundImagePath?: string | null; // Path to background image file
    chromaKeyColor?: string;  // Color to remove (default: green)
    similarity?: number;      // 0.0-1.0, how similar colors to remove (default: 0.3)
    blend?: number;          // 0.0-1.0, edge blending (default: 0.1)
}

/**
 * Remove background from video and replace with solid color or image
 * OPTIMIZED for speed with image backgrounds using -loop input
 */
export const removeVideoBackground = async (
    inputFile: string,
    options: BackgroundRemovalOptions = {},
    onProgress?: (progress: number, status: string) => void
): Promise<string> => {
    const {
        backgroundType = 'color',
        backgroundColor = '#ffffff',
        backgroundImagePath = null,
        chromaKeyColor = 'green',
        similarity = 0.10,
        blend = 0.05
    } = options;

    const outputDir = path.dirname(inputFile);
    const finalOutput = path.join(outputDir, `bg_removed_${Date.now()}_${path.basename(inputFile)}`);

    console.log(`Starting OPTIMIZED background removal for ${inputFile}`);
    console.log(`Options:`, { backgroundType, backgroundColor, backgroundImagePath, chromaKeyColor, similarity, blend });

    return new Promise((resolve, reject) => {
        let ffmpegCommand = ffmpeg(inputFile);
        let filterComplex: string;

        if (backgroundType === 'image' && backgroundImagePath) {
            // FAST approach: Use -loop 1 to repeat the image (10x faster than movie filter)
            ffmpegCommand = ffmpegCommand.input(backgroundImagePath).inputOptions(['-loop', '1']);

            filterComplex =
                `[1:v][0:v]scale2ref=w=iw:h=ih:flags=fast_bilinear[bg][vid];` +
                `[vid]chromakey=${chromaKeyColor}:similarity=${similarity}:blend=${blend}[keyed];` +
                `[keyed]despill=${chromaKeyColor}[despilled];` +
                `[bg][despilled]overlay=format=auto:shortest=1[out]`;
        } else {
            // Use solid color as background
            filterComplex =
                `[0:v]chromakey=${chromaKeyColor}:similarity=${similarity}:blend=${blend}[keyed];` +
                `[keyed]despill=${chromaKeyColor}[despilled];` +
                `[0:v]scale=iw:ih:flags=fast_bilinear,drawbox=c=${backgroundColor}@1.0:replace=1:t=fill[bg];` +
                `[bg][despilled]overlay=format=auto[out]`;
        }

        ffmpegCommand
            .outputOptions([
                '-filter_complex', filterComplex,
                '-map', '[out]',
                '-map', '0:a?',
                '-c:v', 'libx264',
                '-preset', 'faster',     // FAST preset for speed
                '-crf', '23',
                '-pix_fmt', 'yuv420p',
                '-c:a', 'copy',
                '-movflags', '+faststart',
                '-threads', '0'
            ])
            .save(finalOutput)
            .on('start', (cmd: any) => {
                console.log('FFmpeg OPTIMIZED command:', cmd);
                onProgress?.(0, 'Starting optimized background removal...');
            })
            .on('progress', (progress: any) => {
                if (progress.percent) {
                    const percent = Math.min(99, Math.max(0, progress.percent));
                    onProgress?.(percent, `Removing background: ${Math.round(percent)}%`);
                    console.log(`Progress: ${percent.toFixed(1)}%`);
                }
            })
            .on('end', () => {
                console.log('Finished OPTIMIZED background removal');
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

/**
 * Advanced background removal for non-green-screen videos
 * OPTIMIZED for speed - simplified edge detection
 */
export const removeBackgroundAuto = async (
    inputFile: string,
    backgroundColor: string = '#ffffff',
    onProgress?: (progress: number, status: string) => void
): Promise<string> => {
    const outputDir = path.dirname(inputFile);
    const finalOutput = path.join(outputDir, `auto_bg_removed_${Date.now()}_${path.basename(inputFile)}`);

    console.log(`Starting FAST automatic background removal for ${inputFile}`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .outputOptions([
                '-filter_complex',
                `[0:v]scale=1280:720:flags=fast_bilinear[scaled];` +
                `color=c=${backgroundColor}:s=1280x720:d=10[bg];` +
                `[scaled]chromakey=white:similarity=0.4:blend=0.15[keyed];` +
                `[bg][keyed]overlay=shortest=1[out]`,
                '-map', '[out]',
                '-map', '0:a?',
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '28',
                '-tune', 'fastdecode',
                '-pix_fmt', 'yuv420p',
                '-c:a', 'copy',
                '-movflags', '+faststart',
                '-threads', '0'
            ])
            .save(finalOutput)
            .on('start', (cmd: any) => {
                console.log('FFmpeg FAST auto background removal command:', cmd);
                onProgress?.(0, 'Detecting and removing background...');
            })
            .on('progress', (progress: any) => {
                if (progress.percent) {
                    const percent = Math.min(99, Math.max(0, progress.percent));
                    onProgress?.(percent, `Auto removing background: ${Math.round(percent)}%`);
                    console.log(`Progress: ${percent.toFixed(1)}%`);
                }
            })
            .on('end', () => {
                console.log('Finished FAST automatic background removal');
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
