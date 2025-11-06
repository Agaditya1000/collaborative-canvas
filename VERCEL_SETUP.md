# 🚀 Vercel Deployment Guide

## ⚠️ Critical Warning

**Vercel's serverless functions have limitations with WebSockets:**
- Serverless functions don't maintain persistent connections
- Socket.io may have connection issues
- Real-time features may not work reliably

## 📋 Deployment Steps

### Option 1: Full Vercel Deployment (May Have Issues)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Enter a name or press Enter)
   - Directory? (Press Enter for current directory)
   - Override settings? **No**

4. **Production Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Hybrid Approach (Recommended)

Deploy frontend on Vercel, backend on Railway/Render:

1. **Backend (Railway/Render):**
   - Deploy `server/server.js` to Railway or Render
   - Get the backend URL (e.g., `https://your-backend.railway.app`)

2. **Frontend (Vercel):**
   - Update `client/websocket.js` to connect to backend URL
   - Deploy frontend to Vercel

3. **Update WebSocket Connection:**
   ```javascript
   // In client/websocket.js, change:
   this.socket = io({
       // Add your backend URL
   });
   ```

## 🔧 Configuration Files

The following files are configured for Vercel:

- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to ignore
- `api/server.js` - Serverless function entry point

## 🧪 Testing After Deployment

1. Open your Vercel deployment URL
2. Open browser console (F12)
3. Check for WebSocket connection errors
4. Test real-time drawing with multiple tabs
5. Verify Socket.io connection status

## 🐛 Troubleshooting

### WebSocket Connection Fails

**Problem**: `WebSocket connection failed`

**Solutions**:
1. Use hybrid approach (backend on Railway/Render)
2. Check CORS settings in `api/server.js`
3. Verify Socket.io version compatibility
4. Check Vercel function logs

### Function Timeout

**Problem**: Functions timeout after 60 seconds

**Solution**: WebSocket connections need to stay alive longer - this is a Vercel limitation. Use Railway/Render for backend.

### Static Files Not Loading

**Problem**: CSS/JS files return 404

**Solution**: Check `vercel.json` routes configuration

## 📝 Environment Variables

Set in Vercel dashboard → Project Settings → Environment Variables:

- `NODE_ENV`: `production`
- `PORT`: (Vercel auto-sets this)

## 🔗 Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm
```

## ⚡ Quick Deploy

```bash
# One command deploy
vercel --prod
```

## 🎯 Expected Behavior

**What Will Work:**
- ✅ Static file serving
- ✅ API endpoints (`/api/stats`)
- ✅ Basic HTTP requests

**What May Not Work:**
- ❌ Persistent WebSocket connections
- ❌ Real-time drawing sync
- ❌ Room system
- ❌ User cursors

## 💡 Recommendation

For full functionality, use **Railway** or **Render** instead:
- Full WebSocket support
- Persistent connections
- Better for Socket.io apps
- Free tier available

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway/Render instructions.

