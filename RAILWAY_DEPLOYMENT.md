# Deployment Guide: Vercel Frontend + Railway Backend

## Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free: https://railway.app)

---

## Step 1: Push Code to GitHub

```powershell
# From root directory
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/collaborative-canvas.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Deploy Backend on Railway

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Click **"Create New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway with GitHub
5. Select your `collaborative-canvas` repo

### 2.2 Configure Railway
1. Railway auto-detects it's a Node.js project
2. It will prompt to select a service - select the `server` directory
3. Click **"Deploy Now"**

### 2.3 Set Environment Variables
1. In Railway dashboard, go to your project
2. Click **"Variables"** tab
3. Add this variable:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
   ```
   (Replace `your-vercel-app` with your actual Vercel project name)
4. Click **"Deploy"** to redeploy with new environment

### 2.4 Get Your Backend URL
1. In Railway, go to **"Deployments"** tab
2. Click on the active deployment
3. Copy the **Railway URL** (looks like `https://collaborative-canvas-production-xxxx.railway.app`)
4. This is your `BACKEND_URL`

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Install Vercel CLI
```powershell
npm install -g vercel
```

### 3.2 Deploy from Client Folder
```powershell
cd client
vercel
```

Follow prompts:
- Link to Vercel account
- Accept default settings
- Choose framework: **Next.js** (it may auto-detect as React)

### 3.3 Set Environment Variable in Vercel
1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-railway-url-here` (from Step 2.4)
4. Click **"Save"**

### 3.4 Redeploy Frontend
```powershell
vercel --prod
```

This redeploys with the new environment variable.

---

## Step 4: Verify Everything Works

1. Visit your Vercel frontend URL
2. Join a room and start drawing
3. Check browser console (F12) for any connection errors
4. If it works - you're done! 🎉

---

## Troubleshooting

### Socket.io connection fails
**Problem:** "Failed to connect to server"

**Solution:**
- Check Railway backend is running (Status should be "Active" in Railway dashboard)
- Verify `REACT_APP_API_URL` matches your Railway URL exactly
- Redeploy frontend: `vercel --prod`

### CORS errors in console
**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**
- Update `ALLOWED_ORIGINS` in Railway environment variables
- Format: `https://your-vercel-app.vercel.app,http://localhost:3000`
- Redeploy backend

### Drawing doesn't sync between users
**Problem:** Real-time updates not working

**Solution:**
- Make sure both frontend and backend are deployed (not running locally)
- Check network tab in browser - should connect to Railway URL
- Restart browser and try again

---

## Making Updates

### Update Backend
```powershell
git add .
git commit -m "Update backend"
git push origin main
```
Railway auto-redeploys when you push to main.

### Update Frontend
```powershell
cd client
git add .
git commit -m "Update frontend"
git push origin main
vercel --prod
```

---

## Useful Links
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Your Frontend: `https://your-vercel-app.vercel.app`
- Your Backend: Railway URL from deployment tab
