# 🚀 Hybrid Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide explains how to deploy your collaborative canvas with:
- **Frontend (Static Files)** → Vercel
- **Backend (WebSocket Server)** → Render

This gives you the best of both worlds: Vercel's fast CDN for static files and Render's WebSocket support for real-time features!

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Git Repository**: Your code should be in a Git repo (GitHub, GitLab, or Bitbucket)

---

## 🎯 Step 1: Deploy Backend to Render

### 1.1 Create Render Account & New Web Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository (GitHub/GitLab/Bitbucket)

### 1.2 Configure Render Service

**Settings:**
- **Name**: `collaborative-canvas-server` (or your choice)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for better performance)

**Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render sets this automatically, but good to have)

### 1.3 Deploy

Click **"Create Web Service"** and wait for deployment (2-3 minutes).

### 1.4 Get Your Render URL

After deployment, you'll get a URL like:
```
https://collaborative-canvas-server.onrender.com
```

**Save this URL** - you'll need it for the frontend configuration!

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository

### 2.2 Configure Vercel Project

**Settings:**
- **Framework Preset**: Other
- **Root Directory**: `.` (root)
- **Build Command**: Leave empty or `echo 'No build required'`
- **Output Directory**: `client`
- **Install Command**: Leave empty (no build needed)

### 2.3 Set Environment Variable

**Important:** Add the Render server URL as an environment variable:

1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `NEXT_PUBLIC_SERVER_URL`
   - **Value**: `https://your-render-url.onrender.com` (your actual Render URL)
   - **Environment**: Production, Preview, Development (check all)

### 2.4 Deploy

Click **"Deploy"** and wait for deployment (1-2 minutes).

---

## 🔧 Step 3: Update Client Configuration

The `client/config.js` file will automatically use the environment variable, but you can also:

### Option A: Use Environment Variable (Recommended)
The config file automatically reads `NEXT_PUBLIC_SERVER_URL` from Vercel.

### Option B: Use URL Parameter (For Testing)
Add `?server=https://your-render-url.onrender.com` to your Vercel URL:
```
https://your-app.vercel.app?server=https://your-render-url.onrender.com
```

### Option C: Manual Configuration
Edit `client/config.js` and set:
```javascript
backendUrl: 'https://your-render-url.onrender.com'
```

---

## ✅ Step 4: Verify Deployment

### Test Backend (Render)
1. Visit: `https://your-render-url.onrender.com/api/stats`
2. Should return JSON with server stats

### Test Frontend (Vercel)
1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for connection logs:
   - ✅ Should see: `🔗 Connecting to server: https://your-render-url.onrender.com`
   - ✅ Should see: `✅ Connected to server`
4. Try drawing - it should work in real-time!

---

## 🔄 Updating Your Deployment

### Update Backend (Render)
```bash
git add .
git commit -m "Update backend"
git push
```
Render will automatically redeploy.

### Update Frontend (Vercel)
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel will automatically redeploy.

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: Console shows connection errors

**Solutions:**
1. Verify `NEXT_PUBLIC_SERVER_URL` is set in Vercel environment variables
2. Check that Render service is running (not sleeping)
3. Test Render URL directly: `https://your-render-url.onrender.com/api/stats`
4. Check browser console for CORS errors (shouldn't happen with Socket.io)

### Render Service is Sleeping

**Problem**: Free tier Render services sleep after 15 minutes of inactivity

**Solutions:**
1. First request will take ~30 seconds to wake up (this is normal)
2. Upgrade to paid plan for always-on service
3. Use a service like [UptimeRobot](https://uptimerobot.com) to ping your Render URL every 5 minutes

### CORS Errors

**Problem**: Browser blocks requests to Render server

**Solution**: Check `server/server.js` has CORS configured:
```javascript
cors: {
    origin: "*",
    methods: ["GET", "POST"]
}
```

---

## 📊 Monitoring

### Render Dashboard
- View logs: Render dashboard → Your service → Logs
- Check status: Render dashboard → Your service → Status
- View metrics: Render dashboard → Your service → Metrics

### Vercel Dashboard
- View deployments: Vercel dashboard → Your project → Deployments
- View logs: Vercel dashboard → Your project → Functions → Logs
- Check analytics: Vercel dashboard → Your project → Analytics

---

## 💰 Cost

### Free Tier
- **Vercel**: Free (unlimited deployments)
- **Render**: Free (services sleep after inactivity)

### Paid Tier (Recommended for Production)
- **Vercel Pro**: $20/month (better performance, analytics)
- **Render**: $7/month per service (always-on, no sleep)

---

## 🎉 Success!

Your app is now live with:
- ✅ Fast static file delivery (Vercel CDN)
- ✅ Full WebSocket support (Render)
- ✅ Real-time collaboration working!

**Frontend URL**: `https://your-app.vercel.app`  
**Backend URL**: `https://your-render-url.onrender.com`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Socket.io CORS Guide](https://socket.io/docs/v4/handling-cors/)

---

## 🔐 Security Notes

1. **CORS**: Your Render server allows all origins (`origin: "*"`). For production, consider restricting to your Vercel domain.

2. **Environment Variables**: Never commit sensitive data. Use environment variables in both Vercel and Render dashboards.

3. **HTTPS**: Both Vercel and Render provide HTTPS by default - always use HTTPS URLs.

---

**Need help?** Check the logs in both Render and Vercel dashboards!

