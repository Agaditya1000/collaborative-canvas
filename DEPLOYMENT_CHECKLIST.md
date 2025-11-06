# ✅ Render Deployment Checklist

Follow this checklist to deploy your collaborative canvas on Render.

---

## 📦 Pre-Deployment

- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] All files are committed: `git status` shows clean
- [ ] You have a Render account

---

## 🚀 Step 1: Deploy to Render

### Render Setup
- [ ] Go to [render.com](https://render.com) and sign up/login
- [ ] Click "New +" → "Web Service"
- [ ] Connect your Git account (GitHub/GitLab/Bitbucket)
- [ ] Select repository: `collaborative-canvas`

### Render Configuration
- [ ] **Name**: `collaborative-canvas` (or your choice)
- [ ] **Region**: Choose closest to you
- [ ] **Branch**: `main` (or `master`)
- [ ] **Root Directory**: `.` (empty)
- [ ] **Runtime**: `Node`
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `npm start`
- [ ] **Plan**: `Free` (or `Starter` for $7/month - always on)

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-3 minutes)
- [ ] **Copy Render URL**: `https://your-app.onrender.com`
- [ ] Test: Open `https://your-app.onrender.com/api/stats` in browser
- [ ] Should see JSON response ✅

**✅ Render URL**: `_________________________________`

---

## ✅ Step 2: Test Everything

### Test Application
- [ ] Open Render URL in browser
- [ ] Open browser console (F12)
- [ ] Check for: `🔗 Connecting to server: https://your-app.onrender.com`
- [ ] Check for: `✅ Connected to server`
- [ ] Try drawing - should work locally ✅

### Test Real-time Collaboration
- [ ] Open Render URL in **two different browsers** (or incognito)
- [ ] Draw in one browser
- [ ] Drawing should appear in other browser in real-time ✅
- [ ] Test user cursors - should see other user's cursor ✅
- [ ] Test rooms - create/join rooms ✅

---

## 🎉 Success!

Your app is now fully deployed on Render!

**URL**: `https://your-app.onrender.com`

Both client and server are on the same domain, so WebSocket connections work perfectly!

---

## 🔄 Future Updates

### Update Application
```bash
# Make changes to any files
git add .
git commit -m "Update application"
git push origin main
# Render auto-deploys
```

---

## 🐛 Troubleshooting

### Server Not Starting
- [ ] Check Render logs in dashboard
- [ ] Verify `package.json` has `start` script: `"start": "node server/server.js"`
- [ ] Check that `server/server.js` exists

### WebSocket Connection Fails
- [ ] Check browser console for errors
- [ ] Verify Render service is running (not sleeping)
- [ ] First request on free tier takes ~30 seconds to wake up
- [ ] Check Render logs in dashboard

### Static Files Not Loading
- [ ] Verify `server/server.js` serves static files from `client` directory
- [ ] Check Render logs for file serving errors

---

**Need help?** Check Render logs: Render dashboard → Your service → Logs
