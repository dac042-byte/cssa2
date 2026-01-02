# Interspace - Quick Start Guide

This is a condensed setup guide. For detailed instructions, see [SETUP.md](SETUP.md).

## 1. Get Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Create API key in new project"
3. Copy and save your API key

## 2. Create Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/)
2. Create a new project (free tier is fine)
3. Wait for initialization (~2-3 minutes)
4. Note your Project URL: `https://YOUR_PROJECT_REF.supabase.co`

## 3. Create Edge Function in Supabase

1. In Supabase dashboard → **Edge Functions**
2. Click **"Create Function"**
3. Name: `reflect`
4. **Copy the entire code from** `supabase/functions/reflect/index.ts`
5. **Paste it into the function editor**
6. Click **"Deploy"**

### Code to Copy:

See the file: `interspace-extension/supabase/functions/reflect/index.ts`

Or see the full code in SETUP.md, Part 3.

## 4. Add Gemini API Key as Secret

1. In Supabase → **Edge Functions** → **reflect** → **Secrets** tab
2. Click **"Add new secret"**
3. Name: `GEMINI_API_KEY`
4. Value: Your Gemini API key from step 1
5. Click **"Save"**
6. **Important:** Redeploy the function (click "Deploy" again)

## 5. Get Function URL

Your function URL format:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/reflect
```

Example:
```
https://abcdefghijklmnop.supabase.co/functions/v1/reflect
```

Copy your actual URL.

## 6. Configure Extension

1. Open `interspace-extension/popup.js`
2. Find line 2:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'YOUR_SUPABASE_FUNCTION_URL_HERE';
   ```
3. Replace with your actual URL:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/reflect';
   ```
4. Save the file

## 7. Create Icons (Quick Method)

1. Go to [https://favicon.io/favicon-generator/](https://favicon.io/favicon-generator/)
2. Create an icon (use letter "I", blue background)
3. Download and extract
4. Rename three files to: `icon16.png`, `icon48.png`, `icon128.png`
5. Copy them to `interspace-extension/` folder

**Or see [ICONS.md](ICONS.md) for other methods.**

## 8. Load Extension in Chrome

1. Open Chrome → go to `chrome://extensions/`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `interspace-extension` folder
5. Extension should appear in your list

## 9. Test It

1. Click the Interspace icon in Chrome toolbar
2. Enter a test thought: "I'm going to fail"
3. Click Interrogate
4. Complete all three steps
5. Verify you get AI results
6. Check that Clarity Points increased to 25

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "YOUR_SUPABASE_FUNCTION_URL_HERE" error | Update URL in popup.js (step 6) |
| 404 or API request failed | Check function is deployed and URL is correct |
| "GEMINI_API_KEY not configured" | Add secret in Supabase and redeploy function |
| CORS error | Make sure you deployed the latest function code |
| Extension won't load | Create icon files or comment out icon references in manifest.json |

## What Gets Copied into Supabase

### 1. Edge Function Code Location:
```
interspace-extension/supabase/functions/reflect/index.ts
```
Copy the entire contents of this file into the Supabase function editor.

### 2. Secret Configuration:
- **Name:** `GEMINI_API_KEY`
- **Value:** [Your Gemini API key]

### 3. Function URL to Copy into Extension:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/reflect
```

## File Checklist

Before loading the extension, make sure you have:

- ✅ `manifest.json` (provided)
- ✅ `popup.html` (provided)
- ✅ `popup.js` (provided, **with URL updated**)
- ✅ `popup.css` (provided)
- ✅ `icon16.png` (create this)
- ✅ `icon48.png` (create this)
- ✅ `icon128.png` (create this)

## Next Steps

- Test the extension thoroughly
- Customize the styling in `popup.css`
- Share with friends (they'll need to load it as an unpacked extension)
- Consider publishing to Chrome Web Store

---

**Need more help?** See the detailed [SETUP.md](SETUP.md) guide.
