# Vercel Deployment Guide (Recommended for Small-Medium Scale)

This guide shows you how to deploy a secure backend for your Interspace extension using Vercel.

**Perfect for:** Sharing with friends, teams, small communities (up to 100k requests/month on free tier)

---

## Why Vercel?

- ✅ **Free tier:** 100k requests/month (plenty for small-medium use)
- ✅ **Secure:** API key stays on the server, never exposed
- ✅ **Easy:** Deploy in 10 minutes
- ✅ **Fast:** Edge network for low latency
- ✅ **Scalable:** Auto-scales if you grow

---

## Step-by-Step Deployment

### Step 1: Get Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **"Create API key in new project"**
3. **Copy the API key** (you'll need it in Step 5)

---

### Step 2: Create Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub (recommended) or email
3. Complete the signup process

---

### Step 3: Install Vercel CLI

Open your terminal and install the Vercel CLI:

```bash
npm install -g vercel
```

Or if you use yarn:

```bash
yarn global add vercel
```

Verify installation:

```bash
vercel --version
```

---

### Step 4: Deploy the Backend

Navigate to the Vercel backend folder:

```bash
cd interspace-extension/vercel-backend
```

Login to Vercel:

```bash
vercel login
```

This will open your browser - follow the login prompts.

Deploy:

```bash
vercel
```

You'll be asked several questions - here's what to answer:

```
? Set up and deploy "~/path/to/vercel-backend"? [Y/n] Y
? Which scope do you want to deploy to? [Your username]
? Link to existing project? [y/N] N
? What's your project's name? interspace-backend
? In which directory is your code located? ./
? Want to modify these settings? [y/N] N
```

Wait for deployment... You'll see output like:

```
✅  Production: https://interspace-backend-xxx.vercel.app [copied to clipboard]
```

**Copy this URL!** You'll need it in Step 6.

---

### Step 5: Add Your Gemini API Key as Environment Variable

Now add your Gemini API key securely:

```bash
vercel env add GEMINI_API_KEY production
```

When prompted:
1. Paste your Gemini API key from Step 1
2. Press Enter

**Important:** Redeploy so the environment variable takes effect:

```bash
vercel --prod
```

---

### Step 6: Update the Chrome Extension

Now configure the extension to use your Vercel backend:

1. Open `interspace-extension/popup.js`
2. Find line 2:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'YOUR_SUPABASE_FUNCTION_URL_HERE';
   ```
3. Replace with your Vercel URL from Step 4:
   ```javascript
   const SUPABASE_FUNCTION_URL = 'https://interspace-backend-xxx.vercel.app/api/reflect';
   ```
   **Important:** Add `/api/reflect` at the end!

4. Save the file

---

### Step 7: Create Extension Icons

Quick method using favicon.io:

1. Go to [https://favicon.io/favicon-generator/](https://favicon.io/favicon-generator/)
2. Select **"Text"**, enter **"I"**
3. Background color: **#5e72e4**, Text color: **#ffffff**
4. Click **"Generate"** then **"Download"**
5. Extract the ZIP
6. Rename three files:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → `icon48.png` (or create 48x48)
   - `android-chrome-192x192.png` → `icon128.png` (or create 128x128)
7. Copy to `interspace-extension/` folder

Or use this quick command to create simple placeholders (requires ImageMagick):

```bash
cd interspace-extension
# Create simple blue icon with "I"
convert -size 128x128 xc:#5e72e4 -pointsize 96 -fill white -gravity center -annotate +0+0 "I" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

---

### Step 8: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `interspace-extension` folder
5. The extension should appear in your list

---

### Step 9: Test It!

1. Click the Interspace icon in your Chrome toolbar
2. Enter a test thought: **"I always mess things up"**
3. Click **"Interrogate"**
4. Complete all three steps:
   - Step A: Choose **"Thought"**
   - Step B: Select **"All-or-nothing"** and **"Overgeneralization"**
   - Step C: Choose **"No"**
5. Wait for the AI analysis (2-5 seconds)
6. Verify:
   - Results appear correctly
   - All 4 sections show up
   - Clarity Points increased to **25**

---

## Sharing Your Extension

### Option A: Share as Unpacked Extension (Easy)

1. Zip the `interspace-extension` folder
2. Send to users with instructions:
   - Extract the ZIP
   - Open Chrome → `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the extracted folder

**Pros:** Simple, free
**Cons:** Users need to enable Developer mode

### Option B: Publish to Chrome Web Store (Professional)

1. Create a Chrome Web Store developer account ($5 one-time fee)
2. Prepare store listing:
   - Extension name, description
   - Screenshots
   - Privacy policy (required for published extensions)
3. Upload ZIP of extension folder
4. Submit for review (usually 1-3 days)
5. Once approved, share the store URL

**Pros:** Professional, easy for users to install
**Cons:** $5 fee, review process, need privacy policy

---

## Monitoring Usage

### Check Deployment Stats

View your backend usage:

```bash
vercel ls
```

Or visit: [https://vercel.com/dashboard](https://vercel.com/dashboard)

You can see:
- Number of requests
- Response times
- Error rates
- Bandwidth usage

### Free Tier Limits

Vercel free tier includes:
- **100k requests/month** (serverless function invocations)
- **100 GB-hours** of compute time
- **100 GB** bandwidth

**Estimate:** With ~1-2 second response times, this supports:
- ~50-100k analyses per month
- ~1,500-3,000 analyses per day
- Perfect for small-medium communities

---

## Updating Your Backend

If you need to change the backend code:

1. Edit `vercel-backend/api/reflect.js`
2. Deploy the update:
   ```bash
   cd vercel-backend
   vercel --prod
   ```

The extension will automatically use the new version (no need to update extension).

---

## Troubleshooting

### Issue: "GEMINI_API_KEY is not defined"

**Solution:**
```bash
cd vercel-backend
vercel env add GEMINI_API_KEY production
# Paste your API key
vercel --prod
```

### Issue: CORS Error in Extension

**Solution:** Make sure your `SUPABASE_FUNCTION_URL` in popup.js ends with `/api/reflect`:
```javascript
const SUPABASE_FUNCTION_URL = 'https://your-project.vercel.app/api/reflect';
```

### Issue: 404 Not Found

**Solutions:**
1. Check the URL includes `/api/reflect` at the end
2. Verify deployment succeeded: `vercel ls`
3. Try deploying again: `vercel --prod`

### Issue: Rate Limit Errors

**Solutions:**
1. Check Vercel dashboard for usage stats
2. If over free tier limit, upgrade to Pro ($20/month)
3. Or reduce usage / implement caching

---

## Cost Estimates

### Free Tier (Vercel + Gemini)

- **Vercel:** Free (up to 100k requests/month)
- **Gemini API:** Free tier includes:
  - 15 requests per minute
  - 1 million tokens per day
  - 1,500 requests per day

**Total cost:** $0/month for small-medium use

### If You Exceed Free Tier

- **Vercel Pro:** $20/month (unlimited serverless invocations)
- **Gemini Pay-as-you-go:** ~$0.01 per 1k tokens
  - Each analysis: ~500 tokens = $0.005
  - 1,000 analyses/month: ~$5

**Small-medium scale estimate:** $0-25/month depending on usage

---

## Security Best Practices

1. ✅ **Never commit API keys** - Always use environment variables
2. ✅ **Monitor usage** - Check Vercel dashboard regularly
3. ✅ **Set up alerts** - Vercel can email you if usage spikes
4. ✅ **Rotate keys** - If compromised, generate new Gemini key and update:
   ```bash
   vercel env rm GEMINI_API_KEY production
   vercel env add GEMINI_API_KEY production
   vercel --prod
   ```

---

## Alternative: GitHub Deployment (No CLI Needed)

If you prefer not to use the CLI:

1. **Push to GitHub:**
   ```bash
   cd vercel-backend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/interspace-backend.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Add environment variable: `GEMINI_API_KEY`
   - Deploy

3. **Copy the URL** and update `popup.js`

---

## Next Steps

- ✅ Backend deployed and secured
- ✅ Extension connected to backend
- ✅ Ready to share with users
- 📊 Monitor usage in Vercel dashboard
- 🚀 Consider publishing to Chrome Web Store

---

## Quick Reference

**Your Vercel Backend URL:**
```
https://your-project-name.vercel.app/api/reflect
```

**Update Extension:**
Edit `popup.js` line 2 with your URL above

**Redeploy Backend:**
```bash
cd vercel-backend
vercel --prod
```

**Add/Update Environment Variable:**
```bash
vercel env add GEMINI_API_KEY production
vercel --prod
```

---

Need help? Check the [Vercel documentation](https://vercel.com/docs) or feel free to ask!
