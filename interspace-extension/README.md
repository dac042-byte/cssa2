# Interspace - CBT Thought Interrogator Chrome Extension

A simple, privacy-focused Chrome extension that helps you examine your thoughts using Cognitive Behavioral Therapy (CBT) principles.

## Features

- **Simple popup interface** - Opens when you click the extension icon
- **Guided 3-step flow** - Walk through classification, distortion identification, and evidence checking
- **AI-powered analysis** - Get neutral CBT insights using Gemini API
- **Points system** - Earn Clarity Points for participation (not correctness)
- **Privacy-first** - Your thoughts are never stored; only points are saved locally
- **No background interference** - Doesn't affect your browsing

## Quick Start

See [SETUP.md](SETUP.md) for complete step-by-step instructions.

### Overview

1. Get a Gemini API key
2. Create a Supabase project
3. Deploy the Edge Function
4. Add your API key as a secret
5. Update the extension with your function URL
6. Load the extension in Chrome

## How It Works

1. **Enter your thought** - Type any thought you want to examine
2. **Step A** - Classify it as Fact, Thought, or Prediction
3. **Step B** - Choose 1-2 potential cognitive distortions
4. **Step C** - Assess if you have direct evidence it's true
5. **Get results** - See AI analysis with type, distortions, assumptions vs facts, and a grounded reframe

## Points System

- +5 points after Step A
- +5 points after Step B
- +10 points after Step C
- +5 points when results are shown
- **Total per session: 25 points**

Points are cumulative and stored locally. They reward participation, not accuracy.

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Backend:** Supabase Edge Functions (Deno)
- **AI:** Google Gemini API
- **Storage:** Chrome Storage API (local only)

## Privacy

- ✅ No thought data stored
- ✅ No user tracking
- ✅ API key secured in Supabase
- ✅ All data stays local
- ✅ No analytics or telemetry

## Disclaimer

**This is not medical advice. This tool is not for diagnosis or treatment.**

If you're experiencing mental health concerns, please consult a licensed mental health professional.

## File Structure

```
interspace-extension/
├── manifest.json          # Chrome extension manifest
├── popup.html            # Popup UI structure
├── popup.js              # Logic and API integration
├── popup.css             # Styling
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
├── SETUP.md              # Complete setup guide
└── supabase/
    └── functions/
        └── reflect/
            └── index.ts  # Edge Function for Gemini API
```

## Development

### Prerequisites

- Node.js (for local development)
- Supabase CLI (optional)
- Chrome browser

### Local Development

1. Make changes to `popup.html`, `popup.js`, or `popup.css`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Interspace extension
4. Test your changes

### Updating the Edge Function

**Browser Method:**
1. Go to Supabase dashboard → Edge Functions
2. Click on "reflect"
3. Edit the code
4. Click "Deploy"

**CLI Method:**
```bash
supabase functions deploy reflect
```

## Customization

### Change the Prompt Style

Edit the `prompt` variable in `supabase/functions/reflect/index.ts` to adjust how Gemini analyzes thoughts.

### Adjust Points Values

Edit the `addPoints()` calls in `popup.js` to change point rewards.

### Modify Distortion Options

Edit the chip buttons in `popup.html` to add/remove cognitive distortions.

### Customize Styling

Edit `popup.css` to change colors, fonts, spacing, etc.

## Contributing

This is a personal project, but feel free to fork and modify for your own use.

## License

MIT License - Use freely, but remember this is not medical software.

## Acknowledgments

- Built with Supabase Edge Functions
- Powered by Google Gemini API
- Inspired by CBT principles

---

**Remember:** This tool is for self-reflection and learning. It's not a substitute for professional mental health care.
