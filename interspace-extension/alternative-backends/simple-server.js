// Simple backend server alternative to Supabase Edge Functions
// Run this with: node server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// IMPORTANT: Add your Gemini API key here
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

app.use(cors());
app.use(express.json());

app.post('/reflect', async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Update popup.js SUPABASE_FUNCTION_URL to: http://localhost:${PORT}/reflect`);
});
