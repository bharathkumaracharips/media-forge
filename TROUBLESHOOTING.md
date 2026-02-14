# Chroma Key Troubleshooting - Hair & Beard Issues

## Quick Fix Summary

Your hair and beard are being removed because the chroma key settings are too aggressive. Here's what I've fixed:

### ✅ Changes Made:
1. **Lowered default Sensitivity from 0.15 → 0.10** (more conservative)
2. **Added Custom Color Picker** - pick exact green screen color
3. **Simplified UI** - cleaner 2-column layout
4. **Added helpful tips** in the interface

---

## How to Use (Step-by-Step)

### 1. **Select Your Background Color**
In the "What color is your background?" dropdown:
- If you have a **green screen** → Select "🟢 Green Screen"
- If you have a **blue screen** → Select "🔵 Blue Screen"  
- If you have a **white background** → Select "⚪ White Background"
- If your green screen is a specific shade → Select "🎨 Custom Color" and use the color picker

### 2. **Choose Replacement Color**
Pick what color you want instead of the green screen (usually white or black)

### 3. **Fine-Tune if Needed**
If your hair/beard is still being removed, click "⚙️ Fine-tune (if hair/beard affected)" and:

**Lower the Sensitivity slider:**
- Current default: **0.10**
- If still having issues: **0.08**
- For very dark hair with green reflections: **0.06** or **0.05**

**Adjust Edge Smoothness:**
- Keep at **0.05** for most cases
- Increase to **0.08-0.10** if you see green fringing on edges

---

## Why This Happens

### The Problem:
When you stand in front of a green screen, green light reflects onto your hair and beard. The chroma key algorithm tries to remove anything "similar" to green, which can include:
- Dark hair with green reflections
- Beard with green tint from the screen
- Even clothing if it has similar tones

### The Solution:
**Lower Sensitivity** = The algorithm is more selective about what it removes. It only removes pure green, not colors that are "similar" to green.

---

## Best Practices

### 🎬 Recording Setup:
1. **Stand 3-4 feet away** from the green screen
2. **Light the green screen evenly** (no shadows or bright spots)
3. **Light yourself separately** from the green screen
4. **Avoid green clothing** or accessories

### 🎨 Processing Settings:
1. **Start with Sensitivity at 0.10**
2. **If hair disappears** → Lower to 0.08 or 0.06
3. **If green edges remain** → Increase Edge Smoothness to 0.08
4. **Use Custom Color** if your green screen is a specific shade

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Hair/beard disappearing | Lower Sensitivity to 0.08 or less |
| Green edges on hair | Increase Edge Smoothness to 0.08-0.10 |
| Uneven removal (some parts work, some don't) | Use Custom Color picker to match exact green |
| Entire person being removed | Check that you selected the right background color (green/blue/white) |
| Low quality output | This is expected - we process at 1080p for speed. Original quality is preserved for edges. |

---

## Technical Details

### Current Settings:
- **Resolution**: 1920x1080 (Full HD)
- **Encoding**: H.264, CRF 23 (high quality)
- **Preset**: Medium (balanced speed/quality)
- **Filters**: Chromakey + Despill (removes green color cast)

### What Each Setting Does:
- **Sensitivity (similarity)**: How "similar" a color needs to be to green to get removed
  - Range: 0.05 (very selective) to 0.50 (removes everything greenish)
  - Default: 0.10 (conservative, preserves hair/beard)

- **Edge Smoothness (blend)**: How much to blend/feather the edges
  - Range: 0.0 (sharp edges) to 0.3 (very soft edges)
  - Default: 0.05 (smooth but not blurry)

---

## Still Having Issues?

If you're still experiencing problems after trying these settings:

1. **Check your original video** - Is the green screen evenly lit?
2. **Try the Custom Color picker** - Select the exact shade of green from your screen
3. **Lower Sensitivity even more** - Try 0.05 or even 0.03
4. **Check lighting** - Make sure you're not too close to the green screen

The key is to find the right balance between removing the background and preserving your hair/beard details.
