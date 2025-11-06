# 🚀 Heroku Deployment Guide

## ✅ Why Heroku?

Heroku **fully supports WebSocket connections**, unlike Vercel. This means:
- ✅ Real-time drawing synchronization
- ✅ User cursors
- ✅ Room system
- ✅ All collaboration features work perfectly!

---

## 📋 Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://www.heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Make sure your project is a Git repository

---

## 🚀 Deployment Steps

### Step 1: Login to Heroku

```bash
heroku login
```

This will open a browser window for authentication.

### Step 2: Create a Heroku App

```bash
heroku create your-app-name
```

Replace `your-app-name` with your desired app name (or leave it blank for a random name).

**Example:**
```bash
heroku create collaborative-canvas-app
```

### Step 3: Verify Files

Make sure these files exist:
- ✅ `Procfile` (already created)
- ✅ `package.json` (with `start` script)
- ✅ `server/server.js` (main server file)

### Step 4: Deploy to Heroku

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

**Note:** If your default branch is `master` instead of `main`:
```bash
git push heroku master
```

### Step 5: Open Your App

```bash
heroku open
```

Or visit: `https://your-app-name.herokuapp.com`

---

## 🔧 Configuration

### Environment Variables (Optional)

If you need to set environment variables:

```bash
heroku config:set NODE_ENV=production
```

### View Logs

```bash
heroku logs --tail
```

### Restart App

```bash
heroku restart
```

---

## 📊 Monitoring

### Check App Status

```bash
heroku ps
```

### View Real-time Logs

```bash
heroku logs --tail
```

### Access Stats Endpoint

Visit: `https://your-app-name.herokuapp.com/api/stats`

---

## 🔄 Updating Your App

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push heroku main
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found`
- **Solution:** Make sure all dependencies are in `package.json` and run `npm install` locally first

**Error:** `Procfile not found`
- **Solution:** Ensure `Procfile` exists in the root directory with: `web: node server/server.js`

### WebSocket Connection Fails

**Check:**
1. Verify the app is running: `heroku ps`
2. Check logs: `heroku logs --tail`
3. Ensure Socket.io is properly configured in `server/server.js`

### Port Issues

Heroku automatically sets `process.env.PORT`. Your server.js already handles this correctly.

### Static Files Not Loading

Verify that `server/server.js` has:
```javascript
app.use(express.static(path.join(__dirname, '../client')));
```

---

## 💰 Heroku Pricing

### Free Tier (Hobby)
- **Dyno Hours:** 550 hours/month (shared across all apps)
- **Sleep:** Apps sleep after 30 minutes of inactivity
- **WebSockets:** ✅ Fully supported
- **Perfect for:** Development and testing

### Paid Tiers
- **Hobby:** $7/month - No sleep, always on
- **Standard:** $25/month - Better performance

**Note:** Free tier is sufficient for testing. Apps will wake up when accessed.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App opens without errors
- [ ] Can draw on canvas
- [ ] WebSocket connects (check browser console)
- [ ] Multiple users can connect simultaneously
- [ ] Real-time drawing sync works
- [ ] User cursors appear
- [ ] Room system works
- [ ] Undo/Redo functions correctly

---

## 🎉 Success!

Your collaborative canvas is now live on Heroku with **full WebSocket support**!

**Your app URL:** `https://your-app-name.herokuapp.com`

Share this URL with others to test real-time collaboration!

---

## 📚 Additional Resources

- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Heroku WebSockets](https://devcenter.heroku.com/articles/node-websockets)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)

---

## 🔄 Quick Commands Reference

```bash
# Create app
heroku create app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Open app
heroku open

# Restart
heroku restart

# Check status
heroku ps

# Set config
heroku config:set KEY=value

# View config
heroku config
```

---

**Need help?** Check Heroku logs: `heroku logs --tail`

