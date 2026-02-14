# Background Removal - User Guide for Non-Green-Screen Videos

## ⚠️ IMPORTANT: Your Video Type Matters!

### Your Video (Patterned Background)
Looking at your video, you have a **beige/brown patterned background** (floral/geometric pattern). This is **NOT a green screen**, so:

❌ **DON'T use Chromakey mode** - It will remove you along with the background!
✅ **DO use Auto mode** - Better for complex backgrounds

---

## How to Remove Your Background Correctly

### Option 1: Use Auto Mode (RECOMMENDED for your video)
1. Click "Remove BG" tab
2. **Select "Auto" mode** (not Chromakey)
3. Pick your background color (white, black, or custom)
4. Upload your video
5. Process

**Why Auto Mode?**
- Works with patterned backgrounds
- Doesn't require uniform color
- Uses edge detection instead of color keying

### Option 2: Use Chromakey Mode (Only if you have green/blue screen)
If you DO have a proper green/blue screen:
1. Select "Chromakey" mode
2. Choose screen color (green/blue)
3. **Adjust Advanced Controls**:
   - **Similarity**: Start at 0.15 (default)
     - Too high? You disappear → Lower it
     - Background still visible? → Increase it slightly
   - **Edge Blend**: Start at 0.05 (default)
     - Rough edges? → Increase to 0.10-0.15
     - Subject looks fuzzy? → Decrease it

---

## What Went Wrong in Your Case

### The Problem:
```
Screen Color: Green (default)
Your Background: Beige/brown pattern
Result: Filter tried to remove green, got confused, removed everything
```

### Why You Disappeared:
1. Chromakey looks for green color
2. Your video has NO green screen
3. Filter got aggressive and removed similar tones
4. Your skin/clothing had similar color values
5. Result: You got removed too!

---

## Quick Fix for Your Video

### Step-by-Step:
1. **Switch to Auto Mode**:
   - Click the "Auto" button in Processing Mode
   - This uses edge detection, not color keying

2. **Pick Background Color**:
   - White (#ffffff) - Clean professional look
   - Black (#000000) - Dramatic effect
   - Custom color - Match your branding

3. **Upload and Process**:
   - Should take 30-60 seconds
   - You should appear correctly this time

---

## Understanding the Modes

### Chromakey Mode
**Best for:**
- ✅ Uniform green screens
- ✅ Uniform blue screens  
- ✅ Professional studio setups
- ✅ Even lighting

**NOT good for:**
- ❌ Patterned backgrounds (like yours!)
- ❌ Complex backgrounds
- ❌ Uneven lighting
- ❌ No green/blue screen

### Auto Mode
**Best for:**
- ✅ Patterned backgrounds (like yours!)
- ✅ Complex backgrounds
- ✅ No green screen available
- ✅ Quick processing

**Limitations:**
- ⚠️ Less precise than chromakey
- ⚠️ May need manual cleanup
- ⚠️ Works best with clear subject-background separation

---

## Advanced Tips

### If Auto Mode Still Doesn't Work Well:

**Option A: Record with Green Screen**
- Get a green screen backdrop ($20-50)
- Ensure even lighting
- Use Chromakey mode
- Best results!

**Option B: Adjust Lighting**
- Ensure subject is well-lit
- Background should be darker/lighter than subject
- Creates better edge detection

**Option C: Manual Editing**
- Use video editing software (DaVinci Resolve, Premiere)
- More control but slower
- Professional results

---

## Similarity & Blend Explained

### Similarity (0.05 - 0.5)
**What it does:** How similar colors get removed

```
0.05 = Very conservative (only exact color match)
0.15 = Default (safe for most cases)
0.30 = Aggressive (removes similar colors)
0.50 = Very aggressive (may remove subject!)
```

**When to adjust:**
- Background still visible → Increase similarity
- Subject disappearing → Decrease similarity

### Blend (0.0 - 0.3)
**What it does:** Smoothness of edges

```
0.00 = Sharp edges (may look cut-out)
0.05 = Default (slight smoothing)
0.15 = Smooth edges (natural look)
0.30 = Very smooth (may look blurry)
```

**When to adjust:**
- Edges look rough/jagged → Increase blend
- Subject looks fuzzy → Decrease blend

---

## Common Mistakes

### Mistake #1: Using Chromakey without Green Screen
**Problem:** Subject disappears
**Solution:** Switch to Auto mode

### Mistake #2: Similarity Too High
**Problem:** Subject partially removed
**Solution:** Lower similarity to 0.10-0.15

### Mistake #3: Wrong Screen Color Selected
**Problem:** Nothing happens or everything removed
**Solution:** Match screen color to actual background color

### Mistake #4: Poor Lighting
**Problem:** Uneven removal
**Solution:** Ensure even lighting on green screen

---

## Expected Results

### With Proper Green Screen + Chromakey:
- ✅ Clean removal
- ✅ Sharp edges
- ✅ No color spill
- ✅ Professional look

### With Patterned Background + Auto:
- ⚠️ Good removal (not perfect)
- ⚠️ May need fine-tuning
- ⚠️ Some edge artifacts possible
- ✅ Acceptable for most uses

---

## Next Steps for You

1. **Try Auto Mode** with your current video
2. If not satisfied, consider:
   - Recording with green screen
   - Using professional editing software
   - Adjusting lighting setup

---

## Summary

**For your specific video (patterned background):**
- ❌ Don't use Chromakey mode
- ✅ Use Auto mode
- ✅ Start with default settings
- ✅ Expect good (not perfect) results

**For future videos:**
- 🎬 Record with green screen for best results
- 💡 Ensure even lighting
- 🎨 Use Chromakey mode with proper setup
