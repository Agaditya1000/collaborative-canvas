# 🚀 Quick Start: Deploy on Render

## ⚡ Fast Track (3 minutes)

### 1️⃣ Deploy to Render

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select `collaborative-canvas` repo
4. Settings:
   - **Name**: `collaborative-canvas` (or your choice)
   - **Build**: `npm install`
   - **Start**: `npm start`
   - **Plan**: Free
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. **Copy the URL**: `https://your-app.onrender.com` ✅

### 2️⃣ Test It

1. Open your Render URL
2. Open browser console (F12)
3. Look for: `✅ Connected to server`
4. Try drawing - it works! 🎉

---

## ✅ That's It!

**Your app is live at**: `https://your-app.onrender.com`

Both client and server are on the same domain, so:
- ✅ WebSocket connections work perfectly
- ✅ Real-time collaboration works
- ✅ All features work!

---

## 🔄 Update Your App

```bash
git add .
git commit -m "Update app"
git push origin main
# Render auto-deploys
```

---

## 🐛 Problems?

**Server not connecting?**
- First request takes ~30 seconds (Render free tier wakes up)
- Check Render logs in dashboard
- Verify service is running

**Need more details?**
- See `DEPLOYMENT_CHECKLIST.md` for step-by-step guide

---

**Ready?** Go to [render.com](https://render.com) and deploy! 🚀
