// Vercel Serverless Function for Interspace Extension
// This keeps your API key secure and supports unlimited users

export default async function handler(req, res) {
  // Enable CORS for Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { thought, classification, chosen_distortions, evidence_choice } = req.body;

    // Validate inputs
    if (!thought || !classification || !chosen_distortions || !evidence_choice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build CBT analysis prompt
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
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();

    // Extract and clean the response
    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Unexpected Gemini API response format');
    }

    let generatedText = geminiData.candidates[0].content.parts[0].text.trim();
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse and validate JSON
    const analysisResult = JSON.parse(generatedText);

    if (!analysisResult.type || !analysisResult.distortions ||
        !analysisResult.assumptions_vs_facts || !analysisResult.grounded_reframe) {
      throw new Error('AI response missing required fields');
    }

    // Return analysis
    return res.status(200).json(analysisResult);

  } catch (error) {
    console.error('Error in reflect function:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
