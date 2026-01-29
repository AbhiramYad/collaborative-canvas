# Deployment Guide - Option 1

## Step 1: Deploy Frontend to Vercel

### 1.1 Install Vercel CLI
```powershell
npm install -g vercel
```

### 1.2 Deploy from client folder
```powershell
cd client
vercel
```

You'll be prompted to:
- Link to your Vercel account (or create one)
- Choose project settings (accept defaults)
- Confirm deployment

**Your frontend URL:** `https://your-project-name.vercel.app`

---

## Step 2: Deploy Backend (Choose One)

### Option A: Using Render.com (Recommended - Free tier)

1. **Push your code to GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/collaborative-canvas.git
   git push -u origin main
   ```

2. **Create Render account** at https://render.com

3. **Create New Web Service:**
   - Connect GitHub repo
   - Set **Root Directory** to `server`
   - Set **Build Command:** `npm install`
   - Set **Start Command:** `npm start`
   - Choose free plan
   - Deploy

4. **Your backend URL:** `https://your-app-name.onrender.com`

### Option B: Using Railway (Even simpler)

1. **Go to** https://railway.app
2. **Click "Deploy Now"**
3. **Connect your GitHub repo**
4. Railway auto-detects Node.js and deploys automatically
5. **Your backend URL:** Shown in Railway dashboard

---

## Step 3: Update Environment Variable

After deploying the backend, update the frontend environment:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add new variable:**
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.com` (use your actual backend URL)

3. **Redeploy frontend:**
   ```powershell
   cd client
   vercel --prod
   ```

---

## Step 4: Update Backend CORS Settings

The backend needs to accept requests from your Vercel domain. Update `server/server.js`:

```javascript
const io = socketIO(server, {
  cors: {
    origin: ['https://your-project-name.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});
```

Or use environment variable:
```javascript
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});
```

Then in Render/Railway, add environment variable:
- `ALLOWED_ORIGINS=https://your-project-name.vercel.app,http://localhost:3000`

---

## Testing

1. **Local testing:** Run `npm start` from root (keeps using `http://localhost:5000`)
2. **Production:** Visit your Vercel URL - should connect to your backend

---

## Troubleshooting

### Socket.io connection fails
- Check backend URL in Vercel environment variables
- Verify CORS settings on backend
- Check backend is running on Render/Railway

### Canvas doesn't display
- Clear browser cache
- Check browser console for errors
- Verify frontend deployed correctly

### Updates not showing
- Force redeploy: `vercel --prod`
- Clear Vercel cache in Settings → Git if needed
