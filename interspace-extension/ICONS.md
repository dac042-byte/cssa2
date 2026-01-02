# Creating Extension Icons

The Chrome extension requires three icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Quick Methods to Create Icons

### Method 1: Use Favicon Generator (Easiest)

1. Go to [favicon.io](https://favicon.io/favicon-generator/)
2. Choose "Text" and enter a letter like "I" for Interspace
3. Pick colors (suggestion: blue background #5e72e4, white text)
4. Generate and download
5. Rename the files to `icon16.png`, `icon48.png`, `icon128.png`
6. Copy them to the `interspace-extension` folder

### Method 2: Use Figma/Canva

1. Create a square design (128x128)
2. Add a simple icon or letter
3. Export in three sizes: 16x16, 48x48, 128x128
4. Save as PNG files

### Method 3: Use an Existing Image

1. Find or create any square image
2. Use an online image resizer like [resizeimage.net](https://resizeimage.net/)
3. Resize to 16x16, 48x48, and 128x128
4. Save each size with the correct filename

### Method 4: Use ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Create a simple blue square with "I" text
convert -size 128x128 xc:#5e72e4 -pointsize 96 -fill white -gravity center \
  -annotate +0+0 "I" icon128.png

# Resize to other sizes
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

### Method 5: Simple Placeholder (For Testing Only)

For quick testing, you can use any three PNG files temporarily. They don't even need to be the right size - Chrome will resize them. But for production, use properly sized icons.

## Design Suggestions

- **Keep it simple:** A letter, simple shape, or minimal icon works best
- **High contrast:** Make sure it's visible against light and dark backgrounds
- **Brand colors:** Use #5e72e4 (blue) to match the extension's primary color
- **Recognizable:** Should be identifiable even at 16x16 pixels

## Alternative: Remove Icons Temporarily

If you just want to test the extension without icons, you can comment out the icon references in `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Interspace",
  "version": "1.0.0",
  "description": "CBT-style Thought Interrogator for clarity and grounded thinking",
  "permissions": ["storage"],
  "action": {
    "default_popup": "popup.html"
    // "default_icon": {
    //   "16": "icon16.png",
    //   "48": "icon48.png",
    //   "128": "icon128.png"
    // }
  }
  // "icons": {
  //   "16": "icon16.png",
  //   "48": "icon48.png",
  //   "128": "icon128.png"
  // }
}
```

**Note:** This is only for testing. You should add proper icons before sharing or publishing.
