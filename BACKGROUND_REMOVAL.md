# Video Background Removal Feature

## Overview
The new **Background Removal Studio** feature allows you to remove backgrounds from videos and replace them with custom solid colors while maintaining pixel-perfect quality.

## Features

### 🎨 Custom Background Colors
- **Color Picker**: Choose any color using the visual color picker
- **Hex Input**: Enter specific hex color codes (e.g., #ffffff)
- **Quick Presets**: One-click buttons for White, Black, and Green backgrounds

### 🎬 Two Processing Modes

#### 1. Chromakey Mode (Recommended for Green/Blue Screens)
- **Best for**: Videos recorded with green screen or blue screen backgrounds
- **Supported Colors**: 
  - Green Screen (default)
  - Blue Screen
  - White Background
  - Black Background
- **Quality**: Uses advanced chromakey filtering with edge refinement
- **Settings**:
  - Similarity: 0.3 (how similar colors are removed)
  - Blend: 0.1 (edge smoothness)

#### 2. Auto Mode (Automatic Detection)
- **Best for**: Videos without uniform backgrounds
- **Technology**: Uses edge detection and segmentation
- **Process**: Automatically detects subject and removes background

## Technical Implementation

### FFmpeg Filters Used

#### Chromakey Mode
```bash
color=<backgroundColor>:s=1920x1080[bg];
[0:v]chromakey=<color>:similarity=0.3:blend=0.1:yuv=1,
despill=<color>,
eq=contrast=1.02:brightness=0.0[fg];
[bg][fg]overlay=format=auto[out]
```

**Filter Breakdown**:
1. **color**: Creates solid color background layer
2. **chromakey**: Removes specified color with YUV color space for better keying
3. **despill**: Removes color spill from edges
4. **eq**: Slight contrast adjustment to maintain quality
5. **overlay**: Composites the keyed video over the background

#### Auto Mode
```bash
color=<backgroundColor>:s=1920x1080[bg];
[0:v]split[original][mask];
[mask]edgedetect=low=0.1:high=0.4,
negate,
erosion=threshold0=1:threshold1=1:threshold2=1:threshold3=1,
dilation=threshold0=1:threshold1=1:threshold2=1:threshold3=1[alpha];
[original][alpha]alphamerge[fg];
[bg][fg]overlay=format=auto[out]
```

**Filter Breakdown**:
1. **split**: Duplicates video stream for processing
2. **edgedetect**: Detects edges in the video
3. **negate**: Inverts the mask
4. **erosion/dilation**: Morphological operations to refine the mask
5. **alphamerge**: Creates alpha channel from mask
6. **overlay**: Composites over background

### Quality Preservation Settings
- **Codec**: H.264 (libx264)
- **Preset**: medium (balanced speed/quality)
- **CRF**: 18 (visually lossless quality)
- **Pixel Format**: yuv420p (maximum compatibility)
- **Audio**: Copied without re-encoding (no quality loss)
- **Optimization**: Fast start enabled for web playback

## API Endpoint

### POST `/api/remove-background`

**Request Parameters** (FormData):
- `file`: Video file (required)
- `backgroundColor`: Hex color code (default: "#ffffff")
- `chromaKeyColor`: Color to remove - "green", "blue", "white", "black" (default: "green")
- `mode`: Processing mode - "chromakey" or "auto" (default: "chromakey")
- `similarity`: Float 0.0-1.0 (default: 0.3)
- `blend`: Float 0.0-1.0 (default: 0.1)

**Response**:
- Content-Type: `video/mp4`
- File: Processed video with background removed

## File Structure

```
src/
├── lib/
│   └── background-removal.ts          # Core background removal logic
├── app/api/
│   └── remove-background/
│       └── route.ts                   # API endpoint handler
└── components/
    └── MediaDashboard.tsx             # UI with color picker and settings
```

## Usage Instructions

1. **Select Remove BG Mode**: Click the "Remove BG" tab (teal color)
2. **Configure Settings**:
   - Choose your desired background color
   - Select the screen color to remove (green/blue/white/black)
   - Pick processing mode (Chromakey for green screens, Auto for others)
3. **Upload Video**: Drag and drop or click to upload your video
4. **Process**: Click "Start Processing"
5. **Download**: Once complete, download your video with the new background

## Performance Notes

- **Processing Time**: Depends on video length and resolution
- **Resolution**: Output maintains input resolution (scaled to 1920x1080 if needed)
- **File Size**: Similar to input due to high-quality CRF 18 setting
- **Memory**: Temporary files are automatically cleaned up after processing

## Best Practices

### For Best Results with Chromakey:
- Use videos with uniform green/blue screen backgrounds
- Ensure good lighting on the background
- Avoid shadows on the background
- Subject should not wear colors similar to the background

### For Auto Mode:
- Works best with clear subject-background separation
- May require experimentation with different videos
- Less precise than chromakey but more versatile

## Troubleshooting

**Issue**: Background not fully removed
- **Solution**: Try adjusting similarity (increase for more aggressive removal)

**Issue**: Subject edges look rough
- **Solution**: Increase blend value for smoother edges

**Issue**: Subject has color spill
- **Solution**: The despill filter should handle this, but ensure good lighting in original video

**Issue**: Auto mode not working well
- **Solution**: Switch to Chromakey mode if you have a uniform background color

## Future Enhancements

Potential improvements for future versions:
- [ ] Adjustable similarity and blend sliders in UI
- [ ] Preview before processing
- [ ] Support for transparent backgrounds (WebM with alpha)
- [ ] Batch processing multiple videos
- [ ] AI-powered background removal (using ML models)
- [ ] Custom background images (not just solid colors)
