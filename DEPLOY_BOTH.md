# 🚀 Complete Deployment Guide: Vercel (Client) + Render (Server)

This guide will help you deploy both the frontend and backend in the correct order.

---

## 📋 Prerequisites

1. **GitHub/GitLab/Bitbucket Account** (for connecting to Render)
2. **Vercel Account**: [vercel.com](https://vercel.com) - Sign up free
3. **Render Account**: [render.com](https://render.com) - Sign up free
4. **Your code pushed to Git** (GitHub recommended)

---

## 🎯 Step 1: Deploy Server to Render (Do This First!)

### 1.1 Push Your Code to GitHub

If not already done:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Create Render Web Service

1. Go to [render.com](https://render.com) and **Sign Up/Login**
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** and connect your **GitHub** account
4. Select your repository: `collaborative-canvas`
5. Click **"Connect"**

### 1.3 Configure Render Service

Fill in these settings:

**Basic Settings:**
- **Name**: `collaborative-canvas-server`
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main` (or `master`)
- **Root Directory**: `.` (leave empty or put `.`)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (or `Starter` for $7/month - always on)

**Advanced Settings (Optional):**
- **Auto-Deploy**: `Yes` (redeploys on git push)
- **Health Check Path**: `/api/stats`

### 1.4 Create and Deploy

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. **Copy your Render URL** - it will look like:
   ```
   https://collaborative-canvas-server.onrender.com
   ```
   **SAVE THIS URL!** You'll need it in the next step.

### 1.5 Test Your Render Server

Open in browser:
```
https://your-render-url.onrender.com/api/stats
```

You should see JSON with server stats. ✅

---

## 🎨 Step 2: Deploy Client to Vercel

### 2.1 Update Client Config with Render URL

**Option A: Edit config.js directly (Recommended for first deployment)**

Edit `client/config.js` and add your Render URL:

```javascript
// At the top, add your Render URL
const RENDER_SERVER_URL = 'https://your-render-url.onrender.com';

window.appConfig = {
    backendUrl: RENDER_SERVER_URL, // Use your Render URL here
    // ... rest of config
};
```

**Option B: Use URL parameter (Easier for testing)**

You can skip this and use `?server=https://your-render-url.onrender.com` in the URL later.

### 2.2 Commit and Push Changes

```bash
git add client/config.js
git commit -m "Configure Render server URL"
git push origin main
```

### 2.3 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and **Sign Up/Login**
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Connect your **GitHub** account if not already connected
5. Select your repository: `collaborative-canvas`
6. Click **"Import"**

### 2.4 Configure Vercel Project

**Project Settings:**
- **Framework Preset**: `Other`
- **Root Directory**: `.` (leave as is)
- **Build Command**: Leave empty or `echo 'No build required'`
- **Output Directory**: `client`
- **Install Command**: Leave empty

**Environment Variables:**
Click **"Environment Variables"** and add:
- **Key**: `NEXT_PUBLIC_SERVER_URL`
- **Value**: `https://your-render-url.onrender.com` (your actual Render URL)
- **Environments**: Check all (Production, Preview, Development)

### 2.5 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for deployment
3. **Copy your Vercel URL** - it will look like:
   ```
   https://collaborative-canvas-xxxxx.vercel.app
   ```

---

## ✅ Step 3: Test Everything

### 3.1 Test Frontend

1. Open your Vercel URL
2. Open browser console (F12)
3. Look for:
   - ✅ `🔗 Connecting to server: https://your-render-url.onrender.com`
   - ✅ `✅ Connected to server`
4. Try drawing - it should work!

### 3.2 Test Real-time Collaboration

1. Open your Vercel URL in **two different browsers** (or incognito windows)
2. Draw in one browser
3. You should see the drawing appear in the other browser in real-time! ✅

---

## 🔄 Updating Your Deployment

### Update Server (Render)
```bash
# Make changes to server files
git add .
git commit -m "Update server"
git push origin main
# Render auto-deploys
```

### Update Client (Vercel)
```bash
# Make changes to client files
git add .
git commit -m "Update client"
git push origin main
# Vercel auto-deploys
```

---

## 🐛 Troubleshooting

### Client Can't Connect to Server

**Check:**
1. Render service is running (not sleeping) - first request takes ~30s to wake up
2. Render URL is correct in `client/config.js`
3. Browser console shows the correct server URL
4. No CORS errors in console

**Fix:**
- Test Render URL directly: `https://your-render-url.onrender.com/api/stats`
- Check Render logs: Render dashboard → Your service → Logs
- Verify `client/config.js` has the correct Render URL

### Render Service is Sleeping

**Problem**: Free tier sleeps after 15 minutes of inactivity

**Solutions:**
1. First request will wake it up (takes ~30 seconds)
2. Upgrade to paid plan ($7/month) for always-on
3. Use [UptimeRobot](https://uptimerobot.com) to ping every 5 minutes (free)

### CORS Errors

**Check:** `server/server.js` has:
```javascript
cors: {
    origin: "*",
    methods: ["GET", "POST"]
}
```

---

## 📊 Your Deployment URLs

After deployment, you'll have:

- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Render)**: `https://your-render-url.onrender.com`

---

## 🎉 Success!

Your collaborative canvas is now fully deployed with:
- ✅ Fast static file delivery (Vercel CDN)
- ✅ Full WebSocket support (Render)
- ✅ Real-time collaboration working!

---

## 💡 Pro Tips

1. **Bookmark both URLs** for easy access
2. **Monitor Render logs** during first deployment
3. **Test with multiple browsers** to verify real-time sync
4. **Upgrade Render to paid** if you want always-on service

---

**Need help?** Check the logs in both Render and Vercel dashboards!

