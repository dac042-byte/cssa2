# Alternative Setup Options

The original instructions used Supabase Edge Functions, but you have **3 easier alternatives**:

---

## Option 1: Direct API Key (Easiest - Personal Use Only)

**Pros:** No backend needed, works immediately
**Cons:** API key visible in extension code (only safe for personal use, NOT for sharing)

### Steps:

1. **Get Gemini API Key:**
   - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Create API key and copy it

2. **Update popup.js:**

   Replace the entire API call section in `popup.js` (around line 100-130):

```javascript
// Replace the analyzeThought function with this:
async function analyzeThought() {
  showScreen('loading');

  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // ADD YOUR KEY HERE
  const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  try {
    const prompt = `You are a CBT (Cognitive Behavioral Therapy) analysis tool. Analyze the following thought using strict CBT principles.

**User's Thought:** "${state.thought}"

**User classified it as:** ${state.classification}

**User identified potential distortions:** ${state.chosenDistortions.join(', ')}

**User's evidence assessment:** ${state.evidenceChoice}

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

    const geminiResponse = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    let generatedText = geminiData.candidates[0].content.parts[0].text.trim();
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(generatedText);

    if (!data.type || !data.distortions || !data.assumptions_vs_facts || !data.grounded_reframe) {
      throw new Error('Invalid response format from API');
    }

    displayResults(data);
    addPoints(5);
  } catch (error) {
    console.error('Error analyzing thought:', error);
    showError(error.message || 'Failed to analyze thought. Please try again.');
  }
}
```

3. **Remove the SUPABASE_FUNCTION_URL line** at the top of popup.js (line 2)

4. **Load extension in Chrome** and test!

**Warning:** Don't share this extension with others as your API key will be visible in the code.

---

## Option 2: Simple Node.js Server (Recommended)

**Pros:** API key is secure, easy to set up
**Cons:** Need to run a local server

### Steps:

1. **Get Gemini API Key** (same as Option 1)

2. **Navigate to the backend folder:**
```bash
cd interspace-extension/alternative-backends
```

3. **Install dependencies:**
```bash
npm install
```

4. **Edit `server.js`:**
   - Open `server.js`
   - Find line 9: `const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';`
   - Replace with your actual API key

5. **Start the server:**
```bash
npm start
```

You should see:
```
Server running at http://localhost:3000
Update popup.js SUPABASE_FUNCTION_URL to: http://localhost:3000/reflect
```

6. **Update popup.js:**
   - Open `popup.js`
   - Change line 2 to:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'http://localhost:3000/reflect';
   ```

7. **Load extension in Chrome** and test!

**Note:** Keep the terminal running while using the extension.

---

## Option 3: Deploy to Vercel/Netlify (Best for Sharing)

**Pros:** Free, secure, works anywhere
**Cons:** Slightly more setup

### Using Vercel:

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Create `api/reflect.js` in a new folder:**

```javascript
// api/reflect.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { thought, classification, chosen_distortions, evidence_choice } = req.body;

    if (!thought || !classification || !chosen_distortions || !evidence_choice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    let generatedText = geminiData.candidates[0].content.parts[0].text.trim();
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysisResult = JSON.parse(generatedText);

    if (!analysisResult.type || !analysisResult.distortions ||
        !analysisResult.assumptions_vs_facts || !analysisResult.grounded_reframe) {
      throw new Error('AI response missing required fields');
    }

    res.json(analysisResult);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
```

3. **Deploy:**
```bash
vercel
```

4. **Add environment variable:**
```bash
vercel env add GEMINI_API_KEY
```
Paste your API key when prompted.

5. **Redeploy:**
```bash
vercel --prod
```

6. **Update popup.js** with your Vercel URL:
```javascript
const SUPABASE_FUNCTION_URL = 'https://your-project.vercel.app/api/reflect';
```

---

## Option 4: Fixed Supabase Instructions

If you still want to use Supabase, here's the **correct** way:

### Step 1: Deploy Edge Function

1. Supabase Dashboard → **Edge Functions** → **Create Function**
2. Name: `reflect`
3. Paste the code from `supabase/functions/reflect/index.ts`
4. Click **Deploy**

### Step 2: Add Secret (SEPARATE from Edge Functions)

**Using Supabase CLI (Easiest):**
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Add the secret
supabase secrets set GEMINI_API_KEY=your_actual_api_key_here

# Deploy function to use the secret
supabase functions deploy reflect
```

**Using Dashboard:**
1. Go to **Project Settings** (gear icon in sidebar)
2. Find **Edge Functions** section in settings
3. Look for **"Secrets"** or **"Environment Variables"**
4. Add: `GEMINI_API_KEY` = your API key
5. Redeploy the function

### Step 3: Get Function URL

Format: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/reflect`

### Step 4: Update popup.js

Change line 2 to your function URL.

---

## Which Option Should You Choose?

| Option | Best For | Difficulty | Security |
|--------|----------|------------|----------|
| **Option 1: Direct API** | Personal use only, quick testing | ⭐ Easy | ⚠️ Low (key visible) |
| **Option 2: Node Server** | Local development | ⭐⭐ Moderate | ✅ Good |
| **Option 3: Vercel** | Sharing with others | ⭐⭐⭐ Advanced | ✅ Excellent |
| **Option 4: Supabase** | Learning serverless | ⭐⭐⭐ Advanced | ✅ Excellent |

**My Recommendation:** Start with **Option 1** for testing, then move to **Option 2** if it works well.

---

## Quick Start (Option 1 - Fastest)

1. Get Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open `popup.js`
3. Replace the `analyzeThought()` function with the code from Option 1 above
4. Add your API key where it says `YOUR_GEMINI_API_KEY_HERE`
5. Remove line 2 (`const SUPABASE_FUNCTION_URL...`)
6. Create icons (or comment out icon references in manifest.json)
7. Load extension in Chrome at `chrome://extensions/`
8. Test it!

Done in 5 minutes! 🎉
