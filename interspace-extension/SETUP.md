# Interspace Chrome Extension - Complete Setup Guide

This guide will walk you through setting up the Interspace CBT Chrome extension with Supabase Edge Functions and Gemini AI.

## Prerequisites

- A Google account (for Chrome extension and Gemini API)
- A Supabase account (free tier works fine)
- Supabase CLI installed (optional but recommended)

---

## Part 1: Get a Gemini API Key

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Get API key"**
3. Click **"Create API key in new project"** (or select an existing project)
4. Copy your API key and save it somewhere safe - you'll need it later

**Important:** Keep this key secret. Never commit it to version control or share it publicly.

---

## Part 2: Set Up Supabase Project

### Step 2: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (or your preferred method)
4. Click **"New Project"**
5. Fill in:
   - **Name:** `interspace` (or any name you prefer)
   - **Database Password:** Create a strong password (save it)
   - **Region:** Choose the closest region to you
   - **Pricing Plan:** Free tier is sufficient
6. Click **"Create new project"**
7. Wait 2-3 minutes for the project to initialize

### Step 3: Note Your Project Details

Once created, you'll see your project dashboard. Note these details:

- **Project URL:** `https://YOUR_PROJECT_REF.supabase.co`
- **Project Reference ID:** The part before `.supabase.co` (e.g., `abcdefghijklmnop`)

---

## Part 3: Deploy the Supabase Edge Function

You have two options: **Browser Method** (easier) or **CLI Method** (more powerful).

### Option A: Browser Method (Recommended for Beginners)

1. In your Supabase project dashboard, click **"Edge Functions"** in the left sidebar
2. Click **"Create Function"**
3. Name it: `reflect`
4. Replace the default code with this:

```typescript
// Supabase Edge Function: reflect
// This function calls the Gemini API to analyze thoughts using CBT principles

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the Gemini API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Parse request body
    const { thought, classification, chosen_distortions, evidence_choice } = await req.json();

    // Validate inputs
    if (!thought || !classification || !chosen_distortions || !evidence_choice) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for Gemini
    const prompt = `You are a CBT (Cognitive Behavioral Therapy) analysis tool. Analyze the following thought using strict CBT principles.

**User's Thought:** "${thought}"

**User classified it as:** ${classification}

**User identified potential distortions:** ${chosen_distortions.join(', ')}

**User's evidence assessment:** ${evidence_choice}

**CRITICAL INSTRUCTIONS:**
1. Use neutral, clinical CBT language only
2. Be concise and direct
3. NO reassurance, NO advice, NO diagnosis, NO treatment suggestions
4. NO emotional support or validation
5. Provide only objective analysis

**You must respond with ONLY valid JSON in this exact format:**
{
  "type": "A brief classification (e.g., 'Automatic negative thought', 'Prediction', 'Factual observation')",
  "distortions": ["List of 1-3 cognitive distortions identified"],
  "assumptions_vs_facts": "One short paragraph distinguishing what is assumed versus what is factual",
  "grounded_reframe": "One sentence reframing the thought in neutral, evidence-based language"
}

**Important:** Return ONLY the JSON object, no other text.`;

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API request failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();

    // Extract the generated text
    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Unexpected Gemini API response format');
    }

    let generatedText = geminiData.candidates[0].content.parts[0].text.trim();

    // Remove markdown code blocks if present
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate the response structure
    if (!analysisResult.type || !analysisResult.distortions ||
        !analysisResult.assumptions_vs_facts || !analysisResult.grounded_reframe) {
      throw new Error('AI response missing required fields');
    }

    // Return the analysis
    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in reflect function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
```

5. Click **"Deploy"** or **"Save"**

### Option B: CLI Method

If you have the Supabase CLI installed:

```bash
# Navigate to the extension directory
cd interspace-extension

# Login to Supabase
supabase login

# Link your project (use your project reference ID)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy reflect
```

---

## Part 4: Add the Gemini API Key as a Secret

### Step 4: Configure the Secret

1. In your Supabase dashboard, go to **"Edge Functions"**
2. Click on the **"reflect"** function
3. Go to the **"Secrets"** tab (or click "Manage secrets")
4. Click **"Add new secret"**
5. Enter:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Paste your Gemini API key from Step 1
6. Click **"Save"** or **"Add secret"**

**Note:** The function needs to be redeployed after adding secrets. If using the browser method, just click "Deploy" again. If using CLI:

```bash
supabase functions deploy reflect
```

---

## Part 5: Get Your Function URL

### Step 5: Copy the Function URL

1. In Supabase dashboard, go to **"Edge Functions"**
2. Click on **"reflect"**
3. You'll see the function URL in this format:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/reflect
   ```
4. Copy this entire URL

---

## Part 6: Configure the Chrome Extension

### Step 6: Update the Extension Configuration

1. Open the file `popup.js` in the `interspace-extension` folder
2. Find this line at the top (around line 2):
   ```javascript
   const SUPABASE_FUNCTION_URL = 'YOUR_SUPABASE_FUNCTION_URL_HERE';
   ```
3. Replace it with your actual function URL:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/reflect';
   ```
4. Save the file

---

## Part 7: Create Extension Icons (Optional)

The extension needs icon files. You can either:

**Option A:** Create simple placeholder icons:

1. Create three square PNG images (or use any image):
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
2. Place them in the `interspace-extension` folder

**Option B:** Use online tools to generate icons:
- Go to a favicon generator like [favicon.io](https://favicon.io/)
- Create an icon and download the files
- Rename them to match the names above

**Option C:** For testing, you can temporarily remove the icon references from `manifest.json` (not recommended for production).

---

## Part 8: Load the Extension in Chrome

### Step 7: Install in Chrome

1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Navigate to and select the `interspace-extension` folder
6. The extension should now appear in your extensions list

### Step 8: Pin the Extension (Optional)

1. Click the puzzle piece icon in Chrome's toolbar (extensions icon)
2. Find "Interspace" in the list
3. Click the pin icon to pin it to your toolbar

---

## Part 9: Test the Extension

### Step 9: Test the Flow

1. Click the Interspace icon in your Chrome toolbar
2. The popup should open showing "Interspace" and "Your personal thought interrogator"
3. Enter a test thought, e.g., "I'm going to fail this presentation"
4. Click **"Interrogate"**
5. Go through each step:
   - **Step A:** Choose "Prediction"
   - **Step B:** Select 1-2 distortions like "Catastrophizing" and "Fortune telling"
   - **Step C:** Choose "No" for evidence
6. Wait for the AI analysis
7. You should see:
   - What this is
   - Likely distortions
   - Assumptions vs facts
   - Grounded reframe
   - Disclaimer
8. Check that your **Clarity Points** increased (should be 25 for one complete flow)

---

## Troubleshooting

### Issue: "YOUR_SUPABASE_FUNCTION_URL_HERE" Error

**Solution:** You forgot to update the URL in `popup.js`. Go back to Step 6.

### Issue: API Request Failed or 404 Error

**Solutions:**
1. Verify the function URL is correct
2. Make sure the function is deployed in Supabase
3. Check Edge Functions logs in Supabase dashboard for errors

### Issue: "GEMINI_API_KEY not configured"

**Solutions:**
1. Make sure you added the secret in Supabase (Part 4)
2. Redeploy the function after adding the secret
3. Double-check the secret name is exactly `GEMINI_API_KEY`

### Issue: Invalid JSON Response

**Solutions:**
1. Check the Gemini API key is valid
2. Look at the Edge Function logs in Supabase to see the actual error
3. Make sure you have API quota remaining in Google AI Studio

### Issue: CORS Error

**Solution:** The function includes CORS headers. If you still see CORS errors:
1. Make sure you deployed the latest version of the function
2. Check that the function code includes the `corsHeaders` object

### Issue: Extension Won't Load

**Solutions:**
1. Make sure all files are in the correct locations
2. Check `manifest.json` for syntax errors
3. Create placeholder icon files if they're missing
4. Check the Chrome extension error messages

---

## File Structure

Your final directory should look like this:

```
interspace-extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── icon16.png
├── icon48.png
├── icon128.png
├── config.template.js
├── SETUP.md (this file)
└── supabase/
    └── functions/
        └── reflect/
            └── index.ts
```

---

## Quick Reference: What to Copy/Paste into Supabase

### 1. Edge Function Code (from `supabase/functions/reflect/index.ts`)

See the full code in **Part 3, Option A** above.

### 2. Secret Configuration

- **Secret Name:** `GEMINI_API_KEY`
- **Secret Value:** Your actual Gemini API key (from Google AI Studio)

### 3. Function URL Format

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/reflect
```

Replace `YOUR_PROJECT_REF` with your actual project reference (visible in your project URL).

---

## Privacy & Security Notes

1. **No thought data is stored:** The extension only stores the points total locally
2. **API key is secure:** The Gemini API key is stored as a Supabase secret, never exposed to the client
3. **Local storage only:** All user data stays in the browser's local storage
4. **No tracking:** This extension does not track or collect user data

---

## Next Steps

- Customize the styling in `popup.css`
- Adjust the Gemini prompt in the Edge Function for different response styles
- Add more features like a history view (optional)
- Publish to Chrome Web Store (requires developer account)

---

## Support

If you encounter issues:

1. Check the browser console (F12) for client-side errors
2. Check Supabase Edge Function logs for server-side errors
3. Verify all configuration values are correct
4. Make sure your Gemini API key has available quota

---

## License

This is a personal CBT tool. Not medical advice. Not for diagnosis or treatment.
