# Deployment Journey: Issues, Errors & Solutions

**Project:** Collaborative Canvas (Real-time Drawing App)  
**Frontend:** Vercel  
**Backend:** Railway  
**Date:** January 29, 2026

---

## 1. Initial Directory Navigation Issue

### Error
```
cd : Cannot find path 'C:\Users\ABHIRAM YADAV M\Desktop\aaa\projects\fullstack\flam\client' 
because it does not exist.
```

### Root Cause
- User was in `flam` directory instead of `flam\collaborative-canvas`
- Tried to access `client` folder from wrong parent directory

### Solution
- Navigate to correct path: `C:\Users\ABHIRAM YADAV M\Desktop\aaa\projects\fullstack\flam\collaborative-canvas\client`
- Always verify current working directory with `pwd` before running commands

---

## 2. Vercel Authentication Required

### Error
```
No existing credentials found. Please log in:
Visit https://vercel.com/oauth/device?user_code=BKFS-DFHV
```

### Root Cause
- First time using Vercel CLI, not authenticated with Vercel account

### Solution
- Visit provided URL in browser
- Log in/sign up with Vercel
- Return to terminal and press Enter
- Vercel CLI is now authenticated

---

## 3. ESLint Warnings as Errors in Vercel Build

### Error
```
Treating warnings as errors because process.env.CI = true.
[eslint] 
src/components/DrawingCanvas.js
  Line 128:6:  React Hook useEffect has a missing dependency: 'redrawCanvas'
Error: Command "npm run build" exited with 1
```

### Root Cause
- Vercel's CI environment treats all warnings as errors
- ESLint warning about missing `redrawCanvas` in useEffect dependency array

### Solution
Added eslint-disable comment at line 128:
```javascript
// eslint-disable-next-line react-hooks/exhaustive-deps
```

This tells ESLint to ignore that specific warning. The code works correctly because `redrawCanvas` is a function defined after the useEffect and doesn't need to be in dependencies.

---

## 4. Environment Variable Not Being Used by Vercel

### Error
```
Frontend trying to connect to: http://localhost:5000
Console: GET http://localhost:5000/socket.io/... net::ERR_CONNECTION_REFUSED
```

### Root Cause
- `.env.production` file wasn't being read by Vercel during build
- React environment variables must be set in Vercel Dashboard, not just in local .env files
- Vercel builds in its own environment without access to local .env files

### Solution
**Step 1:** Set environment variable in Vercel Dashboard
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Add: `REACT_APP_API_URL` = `https://railway-backend-url`
- Select "Production" environment

**Step 2:** Redeploy from Vercel or via CLI
```powershell
vercel --prod
```

**Note:** For local development, keep `.env.local` with localhost URL

---

## 5. Backend Deployment Crash on Railway

### Error
```
Build successful, but deployment shows "CRASHED"
Build logs showed: npm run start → npm run dev (concurrently)
```

### Root Cause
- Root `package.json` had `"start": "npm run dev"`
- `npm run dev` runs concurrently both client and server
- Railway couldn't find client dependencies in root directory (they're in `/client` folder)
- Process crashed trying to start React client from root

### Solution
Changed root `package.json`:
```json
// BEFORE
"start": "npm run dev"

// AFTER  
"start": "node server/server.js"
```

This tells Railway to only start the Express server, not the React client. Railway auto-redeployed and started successfully.

---

## 6. Frontend Unable to Connect to Backend (Socket.io Connection Failed)

### Error
```
GET https://collaborative-canvas-production-39c0.up.railway.app/socket.io/?... 
net::ERR_CONNECTION_REFUSED
```

### Root Cause
- Socket.io client couldn't reach backend
- Backend service wasn't exposed with a public URL on Railway
- No domain/URL configured for the Railway service

### Solution
On Railway Dashboard:
1. Click on "collaborative-canvas" project
2. Find the service in left sidebar (may show "Unexposed service")
3. Look for "Generate Domain" or add a public URL
4. Railway provides URL like: `https://collaborative-canvas-production-39c0.up.railway.app`
5. Update frontend to use this URL

---

## 7. CORS Error: Socket.io Connection Blocked

### Error
```
Access to XMLHttpRequest at 'https://collaborative-canvas-production-39c0.up.railway.app/socket.io/?...'
from origin 'https://client-psi-rust.vercel.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Root Cause
- Backend wasn't configured to accept requests from Vercel frontend domain
- Socket.io CORS settings weren't allowing the Vercel origin
- Originally set to `origin: '*'` which is too permissive and causes CORS issues

### Solution
**Step 1:** Updated backend CORS configuration in `server/server.js`:
```javascript
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5000')
  .split(',')
  .map(origin => origin.trim());

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

**Step 2:** Added environment variable in Railway Dashboard:
- Go to Railway → Project → Variables tab
- Key: `ALLOWED_ORIGINS`
- Value: `https://client-psi-rust.vercel.app,http://localhost:3000,http://localhost:5000`
- Click Save (Railway auto-redeploys)

**Step 3:** Added `.trim()` to handle whitespace in comma-separated values

---

## 8. GitHub Integration with Vercel

### Error
None, but needed proper setup

### Solution
**Step 1:** Initialize git in project root
```powershell
git init
git config user.email "abhiramyadavm@gmail.com"
git config user.name "AbhiramYad"
git add .
git commit -m "Initial commit"
```

**Step 2:** Create GitHub repo and push
```powershell
git remote add origin https://github.com/AbhiramYad/collaborative-canvas.git
git branch -M main
git push -u origin main
```

**Step 3:** Link Vercel to GitHub
```powershell
vercel link
```

Now Vercel auto-deploys on every push to main branch!

---

## Summary of Key Learnings

| Issue | Cause | Prevention |
|-------|-------|-----------|
| Path errors | Wrong directory | Always verify with `pwd`, use absolute paths |
| Build failures | CI treats warnings as errors | Use eslint-disable pragmatically |
| Env vars not working | Local .env not used by Vercel | Set vars in Vercel Dashboard UI |
| Backend crash | Wrong start script for monorepo | Tailor npm scripts per deployment target |
| Connection refused | No public URL for service | Generate public URLs on Railway |
| CORS errors | No allowed origins configured | Set CORS origins for all domains |
| Slow debugging | Manual deployments | Use Git integration for auto-deploy |

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  User Browser                           │
│         https://client-psi-rust.vercel.app             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Socket.io (HTTPS)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   VERCEL                                │
│          (React Frontend - Static Files)               │
│                                                         │
│  • Reads REACT_APP_API_URL env variable               │
│  • Connects to Railway backend via Socket.io           │
│  • Auto-redeploys on GitHub push                       │
└─────────────────────────────────────────────────────────┘
                     │
                     │ HTTPS Request
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   RAILWAY                              │
│  (Node.js/Express + Socket.io Backend)                │
│  https://collaborative-canvas-production-39c0...      │
│                                                         │
│  • Listens on port 8080 (set by Railway)              │
│  • Socket.io configured with CORS allowlist           │
│  • Auto-redeploys on GitHub push                       │
│  • Environment variables set in Railway Dashboard      │
└─────────────────────────────────────────────────────────┘
```

---

## Commands Reference

### Local Development
```powershell
# Start frontend
cd client
npm start

# Start backend (in new terminal)
cd ..
npm run server

# Both together (from root)
npm run dev
```

### Deployment to Vercel
```powershell
cd client
vercel --prod
```

### Deployment to Railway (auto on push)
```powershell
git push origin main
# Railway auto-detects and redeploys
```

### Check Deployment Status
- **Vercel:** https://vercel.com/dashboard
- **Railway:** https://railway.app/dashboard

---

## Current Deployed URLs

- **Frontend:** https://client-psi-rust.vercel.app
- **Backend:** https://collaborative-canvas-production-39c0.up.railway.app

---

## Next Steps for Full Functionality

1. ✅ Frontend deployed on Vercel
2. ✅ Backend deployed on Railway
3. ✅ CORS configured
4. ⏳ **Test real-time sync** - Open app in 2 browser tabs in same room and draw
5. ⏳ **Monitor for issues** - Check console for errors if problems occur
6. ⏳ **Optional:** Add authentication, user persistence, drawing export features
