# ✅ Deployment Checklist

Follow this checklist to deploy both client and server.

---

## 📦 Pre-Deployment

- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] All files are committed: `git status` shows clean
- [ ] You have accounts on both Vercel and Render

---

## 🖥️ Step 1: Deploy Server to Render

### Render Setup
- [ ] Go to [render.com](https://render.com) and sign up/login
- [ ] Click "New +" → "Web Service"
- [ ] Connect your Git account (GitHub/GitLab/Bitbucket)
- [ ] Select repository: `collaborative-canvas`

### Render Configuration
- [ ] **Name**: `collaborative-canvas-server`
- [ ] **Region**: Choose closest to you
- [ ] **Branch**: `main` (or `master`)
- [ ] **Root Directory**: `.` (empty)
- [ ] **Runtime**: `Node`
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `npm start`
- [ ] **Plan**: `Free` (or `Starter` for $7/month)

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-3 minutes)
- [ ] **Copy Render URL**: `https://collaborative-canvas-server.onrender.com`
- [ ] Test: Open `https://your-render-url.onrender.com/api/stats` in browser
- [ ] Should see JSON response ✅

**✅ Render URL**: `_________________________________`

---

## 🎨 Step 2: Configure Client with Render URL

### Update Config
- [ ] Open `client/config.js`
- [ ] Find line with `backendUrl: ''`
- [ ] Replace with your Render URL:
  ```javascript
  backendUrl: 'https://your-render-url.onrender.com',
  ```
- [ ] Save file

### Commit Changes
- [ ] `git add client/config.js`
- [ ] `git commit -m "Configure Render server URL"`
- [ ] `git push origin main`

---

## 🌐 Step 3: Deploy Client to Vercel

### Vercel Setup
- [ ] Go to [vercel.com](https://vercel.com) and sign up/login
- [ ] Click "Add New..." → "Project"
- [ ] Import your Git repository
- [ ] Select repository: `collaborative-canvas`

### Vercel Configuration
- [ ] **Framework Preset**: `Other`
- [ ] **Root Directory**: `.` (empty)
- [ ] **Build Command**: Leave empty
- [ ] **Output Directory**: `client`
- [ ] **Install Command**: Leave empty

### Environment Variables (Optional but Recommended)
- [ ] Go to "Environment Variables"
- [ ] Add: `NEXT_PUBLIC_SERVER_URL` = `https://your-render-url.onrender.com`
- [ ] Apply to: Production, Preview, Development

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment (1-2 minutes)
- [ ] **Copy Vercel URL**: `https://your-app.vercel.app`

**✅ Vercel URL**: `_________________________________`

---

## ✅ Step 4: Test Everything

### Test Frontend
- [ ] Open Vercel URL in browser
- [ ] Open browser console (F12)
- [ ] Check for: `🔗 Connecting to server: https://your-render-url.onrender.com`
- [ ] Check for: `✅ Connected to server`
- [ ] Try drawing - should work locally ✅

### Test Real-time Collaboration
- [ ] Open Vercel URL in **two different browsers** (or incognito)
- [ ] Draw in one browser
- [ ] Drawing should appear in other browser in real-time ✅
- [ ] Test user cursors - should see other user's cursor ✅
- [ ] Test rooms - create/join rooms ✅

---

## 🎉 Success!

Your app is now fully deployed!

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-render-url.onrender.com`

---

## 🔄 Future Updates

### Update Server
```bash
# Edit server files
git add .
git commit -m "Update server"
git push
# Render auto-deploys
```

### Update Client
```bash
# Edit client files
git add .
git commit -m "Update client"
git push
# Vercel auto-deploys
```

---

## 🐛 Troubleshooting

### Server Not Connecting
- [ ] Check Render service is running (not sleeping)
- [ ] Test Render URL: `https://your-render-url.onrender.com/api/stats`
- [ ] Check Render logs in dashboard
- [ ] Verify `client/config.js` has correct Render URL

### Client Can't Connect
- [ ] Check browser console for errors
- [ ] Verify Render URL in `client/config.js`
- [ ] Try adding `?server=https://your-render-url.onrender.com` to Vercel URL
- [ ] Check Vercel deployment logs

---

**Need help?** Check `DEPLOY_BOTH.md` for detailed instructions!

