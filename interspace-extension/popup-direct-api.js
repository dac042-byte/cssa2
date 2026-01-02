// DIRECT API VERSION - For personal use only
// Replace popup.js with this file if you want to use Gemini API directly (no backend needed)

// Configuration - ADD YOUR GEMINI API KEY HERE
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// State
let state = {
  thought: '',
  classification: '',
  chosenDistortions: [],
  evidenceChoice: '',
  points: 0
};

// Screen management
const screens = {
  initial: document.getElementById('initial-screen'),
  stepA: document.getElementById('step-a-screen'),
  stepB: document.getElementById('step-b-screen'),
  stepC: document.getElementById('step-c-screen'),
  loading: document.getElementById('loading-screen'),
  results: document.getElementById('results-screen'),
  error: document.getElementById('error-screen')
};

function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

// Points management
function loadPoints() {
  chrome.storage.local.get(['clarityPoints'], (result) => {
    state.points = result.clarityPoints || 0;
    updatePointsDisplay();
  });
}

function addPoints(amount) {
  state.points += amount;
  chrome.storage.local.set({ clarityPoints: state.points });
  updatePointsDisplay();
}

function updatePointsDisplay() {
  document.getElementById('points-value').textContent = state.points;
}

// Initial screen
document.getElementById('interrogate-btn').addEventListener('click', () => {
  const thoughtInput = document.getElementById('thought-input');
  state.thought = thoughtInput.value.trim();

  if (!state.thought) {
    alert('Please enter a thought to interrogate.');
    return;
  }

  showScreen('stepA');
});

// Step A: Classification
document.querySelectorAll('#step-a-screen .option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.classification = btn.dataset.value;
    addPoints(5);
    showScreen('stepB');
  });
});

// Step B: Distortions
const distortionChips = document.querySelectorAll('.chip');
const stepBContinue = document.getElementById('step-b-continue');

distortionChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const distortion = chip.dataset.distortion;

    if (chip.classList.contains('selected')) {
      // Deselect
      chip.classList.remove('selected');
      state.chosenDistortions = state.chosenDistortions.filter(d => d !== distortion);
    } else {
      // Select (max 2)
      if (state.chosenDistortions.length < 2) {
        chip.classList.add('selected');
        state.chosenDistortions.push(distortion);
      }
    }

    // Enable continue button if at least 1 selected
    stepBContinue.disabled = state.chosenDistortions.length === 0;
  });
});

stepBContinue.addEventListener('click', () => {
  addPoints(5);
  showScreen('stepC');
});

// Step C: Evidence
document.querySelectorAll('.evidence-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    state.evidenceChoice = btn.dataset.value;
    addPoints(10);
    await analyzeThought();
  });
});

// Direct API call to Gemini (no backend needed)
async function analyzeThought() {
  showScreen('loading');

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
      headers: {
        'Content-Type': 'application/json'
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
    const data = JSON.parse(generatedText);

    // Validate response structure
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

// Display results
function displayResults(data) {
  document.getElementById('result-type').textContent = data.type;

  const distortionsList = document.getElementById('result-distortions');
  distortionsList.innerHTML = '';
  data.distortions.forEach(distortion => {
    const li = document.createElement('li');
    li.textContent = distortion;
    distortionsList.appendChild(li);
  });

  document.getElementById('result-assumptions').textContent = data.assumptions_vs_facts;
  document.getElementById('result-reframe').textContent = data.grounded_reframe;

  showScreen('results');
}

// Error handling
function showError(message) {
  document.getElementById('error-message').textContent = message;
  showScreen('error');
}

document.getElementById('error-back-btn').addEventListener('click', () => {
  showScreen('initial');
});

// Clear and Start over buttons
document.getElementById('clear-btn').addEventListener('click', () => {
  resetFlow();
  showScreen('initial');
});

document.getElementById('start-over-btn').addEventListener('click', () => {
  resetFlow();
  showScreen('initial');
});

// Reset flow (keep points)
function resetFlow() {
  state.thought = '';
  state.classification = '';
  state.chosenDistortions = [];
  state.evidenceChoice = '';

  // Clear UI
  document.getElementById('thought-input').value = '';
  distortionChips.forEach(chip => chip.classList.remove('selected'));
  stepBContinue.disabled = true;
}

// Initialize on load
loadPoints();
