# Cloudflare Workers Setup (Easiest Option - 10 Minutes)

**Even simpler than Vercel!** No CLI needed, all in the browser.

---

## Why Cloudflare Workers?

- ✅ **Easiest setup** - All in browser, no CLI
- ✅ **Free tier** - 100k requests/day
- ✅ **Faster** - Edge network worldwide
- ✅ **Simple** - One file, copy/paste, done

---

## Step-by-Step (10 Minutes)

### Step 1: Get Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Create API key → Copy it
3. Save it somewhere (you'll need it in Step 5)

### Step 2: Create Cloudflare Account

1. Go to: https://dash.cloudflare.com/sign-up
2. Sign up with email
3. Verify your email
4. You'll land on the dashboard

### Step 3: Create a Worker

1. In the left sidebar, click **"Workers & Pages"**
2. Click **"Create application"**
3. Click **"Create Worker"**
4. Give it a name: **`interspace-backend`**
5. Click **"Deploy"**

### Step 4: Add Your Code

1. After deployment, click **"Edit code"**
2. You'll see a code editor with default code
3. **Delete all the default code**
4. **Copy and paste this entire code:**

```javascript
export default {
  async fetch(request, env) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { thought, classification, chosen_distortions, evidence_choice } = await request.json();

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
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

      const geminiData = await geminiResponse.json();
      let generatedText = geminiData.candidates[0].content.parts[0].text.trim();
      generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const analysisResult = JSON.parse(generatedText);

      return new Response(JSON.stringify(analysisResult), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
```

5. Click **"Save and Deploy"** (top right)

### Step 5: Add Your API Key as Secret

1. Click **"Settings"** tab (top of editor)
2. Scroll down to **"Variables and Secrets"** section
3. Click **"Add variable"**
4. For "Variable name" enter: **`GEMINI_API_KEY`**
5. For "Value" paste your Gemini API key
6. Click "Encrypt" to make it a secret
7. Click **"Save and deploy"**

### Step 6: Get Your Worker URL

1. Go back to **"Workers & Pages"** in sidebar
2. Click on your **`interspace-backend`** worker
3. You'll see a URL like: **`https://interspace-backend.YOUR-SUBDOMAIN.workers.dev`**
4. **Copy this URL**

### Step 7: Update Your Extension

1. Open `interspace-extension/popup.js`
2. Find line 2:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'YOUR_SUPABASE_FUNCTION_URL_HERE';
   ```
3. Replace with your Cloudflare Worker URL:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'https://interspace-backend.YOUR-SUBDOMAIN.workers.dev';
   ```
4. Save the file

**Note:** Unlike Vercel, you DON'T add `/api/reflect` - just use the worker URL directly.

### Step 8: Create Icons & Load in Chrome

(Same as before - see main guide)

---

## That's It!

**Total time:** ~10 minutes
**Total cost:** $0
**Total files deployed:** 1

**Free tier includes:**
- 100,000 requests/day
- Unlimited bandwidth
- Global edge network

---

## Comparison

| Feature | Cloudflare | Vercel |
|---------|-----------|---------|
| Setup | Browser only | CLI or Browser |
| Free tier | 100k req/day | 100k req/month |
| Speed | Faster (edge) | Fast |
| Complexity | 1 file | 2 files |
| URL | workers.dev | vercel.app |

**Bottom line:** Cloudflare Workers is simpler and has better free tier.

---

## Testing Your Worker

Visit your worker URL in browser:
```
https://interspace-backend.YOUR-SUBDOMAIN.workers.dev
```

You should see: "Method not allowed" (this is correct - it only accepts POST requests)

---

## Monitoring

1. Go to Cloudflare dashboard
2. Click your worker
3. See **"Metrics"** tab for request counts

---

This is probably the easiest option! ✨
