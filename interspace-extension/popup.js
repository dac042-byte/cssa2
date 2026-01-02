// Configuration - UPDATE THIS with your Supabase Edge Function URL
const SUPABASE_FUNCTION_URL = 'YOUR_SUPABASE_FUNCTION_URL_HERE';

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

// API call to Supabase Edge Function
async function analyzeThought() {
  showScreen('loading');

  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        thought: state.thought,
        classification: state.classification,
        chosen_distortions: state.chosenDistortions,
        evidence_choice: state.evidenceChoice
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

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
