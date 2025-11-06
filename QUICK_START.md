# 🚀 Quick Start: Deploy Both Client & Server

## ⚡ Fast Track (5 minutes)

### 1️⃣ Deploy Server to Render (2 minutes)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select `collaborative-canvas` repo
4. Settings:
   - **Name**: `collaborative-canvas-server`
   - **Build**: `npm install`
   - **Start**: `npm start`
   - **Plan**: Free
5. Click **"Create Web Service"**
6. **Copy the URL**: `https://collaborative-canvas-server.onrender.com` ⬅️ SAVE THIS!

### 2️⃣ Update Config (30 seconds)

1. Open `client/config.js`
2. Find line 8: `const RENDER_SERVER_URL = 'YOUR_RENDER_URL_HERE';`
3. Replace with your Render URL:
   ```javascript
   const RENDER_SERVER_URL = 'https://collaborative-canvas-server.onrender.com';
   ```
4. Save file

### 3️⃣ Commit & Push (30 seconds)

```bash
git add client/config.js
git commit -m "Add Render server URL"
git push origin main
```

### 4️⃣ Deploy Client to Vercel (2 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repo → Select `collaborative-canvas`
4. Settings:
   - **Framework**: `Other`
   - **Output Directory**: `client`
   - **Build Command**: (leave empty)
5. Click **"Deploy"**
6. **Copy the URL**: `https://your-app.vercel.app` ⬅️ DONE!

### 5️⃣ Test (30 seconds)

1. Open your Vercel URL
2. Open browser console (F12)
3. Look for: `✅ Connected to server`
4. Draw something - it works! 🎉

---

## ✅ That's It!

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://collaborative-canvas-server.onrender.com`

---

## 📚 Need More Details?

- **Full Guide**: See `DEPLOY_BOTH.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Hybrid Setup**: See `HYBRID_DEPLOYMENT.md`

---

## 🐛 Problems?

**Server not connecting?**
- First request takes ~30 seconds (Render free tier wakes up)
- Check Render URL: `https://your-render-url.onrender.com/api/stats`
- Verify `client/config.js` has correct Render URL

**Client not working?**
- Check browser console (F12) for errors
- Try: `https://your-vercel-url.vercel.app?server=https://your-render-url.onrender.com`

---

**Ready?** Start with Step 1! 🚀

