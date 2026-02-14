# Green Screen Chroma Key - Hair & Beard Quality Fix

## Problem
When using chroma key background removal with a green screen, hair and beard areas were getting affected, resulting in:
- Transparent or semi-transparent hair/beard
- Green color spill on edges
- Low quality around fine details
- Loss of detail due to downscaling

## Solution Applied

### 1. **Lower Similarity (0.3 → 0.15)**
- **What it does**: Controls how "similar" a color needs to be to the chroma key color (green) to be removed
- **Why lower is better**: Your hair and beard can have green reflections from the green screen. A lower similarity value (0.15) is more selective and only removes pure green, preserving dark hair tones
- **Range**: 0.0 (very selective) to 1.0 (removes everything similar to green)

### 2. **Lower Blend (0.1 → 0.05)**
- **What it does**: Controls edge blending/feathering around the keyed areas
- **Why lower is better**: Creates smoother, more natural edges around fine details like individual hair strands and beard
- **Range**: 0.0 (sharp edges) to 1.0 (very soft edges)

### 3. **Added Despill Filter**
- **What it does**: Removes green color cast from the edges of your subject
- **Why it helps**: Even after removing the background, green light reflects onto your hair/beard edges. The despill filter neutralizes this green tint
- **Result**: Natural-looking edges without green fringing

### 4. **Maintained Original Resolution**
- **Before**: Downscaled to 720p (1280x720)
- **After**: Keeps original 1080p (1920x1080)
- **Why it matters**: Fine details like individual hair strands need full resolution to be preserved properly

### 5. **Better Encoding Quality**
- **Preset**: ultrafast → medium (better quality processing)
- **CRF**: 28 → 23 (lower CRF = higher quality)
- **Result**: Better overall video quality with preserved details

## How to Fine-Tune for Your Setup

If you still see issues, you can adjust these parameters in your UI:

### For Hair/Beard Still Disappearing:
```
Decrease similarity: 0.15 → 0.10 or 0.08
```
This makes it even more selective about what gets removed.

### For Green Edges Still Visible:
```
Increase blend slightly: 0.05 → 0.08
```
This softens the edges more to blend away green fringing.

### For Uneven Green Screen Lighting:
If your green screen has shadows or bright spots:
```
Increase similarity slightly: 0.15 → 0.20
Increase blend: 0.05 → 0.10
```

## Best Practices for Green Screen Recording

To get the best results:

1. **Lighting**:
   - Light the green screen evenly (no shadows or hot spots)
   - Light yourself separately from the green screen
   - Avoid green light spilling onto you

2. **Distance**:
   - Stand at least 3-4 feet away from the green screen
   - This reduces green light reflection on your hair/beard

3. **Camera Settings**:
   - Use the highest quality recording settings
   - Avoid heavy compression
   - Record in good lighting

4. **Clothing**:
   - Avoid wearing green or colors with green tones
   - Darker clothing works better than lighter

## Technical Details

The FFmpeg filter chain now works as follows:

```
1. Create solid color background (1920x1080)
2. Apply chromakey to remove green (similarity=0.15, blend=0.05)
3. Apply despill filter to remove green color cast
4. Overlay the keyed video on the background
5. Encode with high quality settings (CRF 23, medium preset)
```

## Performance Impact

- **Processing time**: Will take longer than the previous "ultrafast" mode (approximately 2-3x longer)
- **Quality improvement**: Significantly better, especially for hair/beard preservation
- **File size**: Slightly larger due to higher quality encoding

If you need faster processing and can accept slightly lower quality, you can adjust:
- Preset: medium → fast
- CRF: 23 → 25

## Testing Your Results

After processing, check:
- ✅ Hair and beard edges look natural
- ✅ No green fringing around edges
- ✅ Fine details preserved
- ✅ Smooth transitions between subject and background
- ✅ No transparency in hair/beard areas
