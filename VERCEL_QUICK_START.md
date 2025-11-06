# ⚡ Quick Vercel Deployment

## 🚀 Deploy in 3 Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

That's it! Your app will be deployed to Vercel.

---

## 📝 What Happens

1. Vercel reads `vercel.json` configuration
2. Builds your Node.js server as a serverless function
3. Serves static files from `/client` directory
4. Routes Socket.io requests to serverless function
5. Provides you with a deployment URL

---

## ⚠️ Important Notes

### WebSocket Limitations

Vercel's serverless functions have **time limits** and **don't maintain persistent connections**. This means:

- ⚠️ WebSocket connections may disconnect frequently
- ⚠️ Real-time features may not work reliably
- ⚠️ You may need to refresh to reconnect

### Testing

After deployment:
1. Open your Vercel URL
2. Open browser console (F12)
3. Check for connection errors
4. Test drawing - it may work but be unstable

---

## 🔧 Environment Variables (Optional)

In Vercel Dashboard → Settings → Environment Variables:

- `NODE_ENV`: `production`
- `PORT`: (auto-set by Vercel)

---

## 🐛 Troubleshooting

### "Function Timeout"
- WebSocket connections need persistent connections
- Vercel functions timeout after 60 seconds
- **Solution**: Use Railway/Render for backend

### "WebSocket Connection Failed"
- Serverless functions can't maintain WebSocket connections
- **Solution**: Deploy backend separately on Railway/Render

### Static Files 404
- Check `vercel.json` routes
- Ensure files are in `/client` directory

---

## 💡 Better Alternative

For reliable WebSocket support, use **Railway**:

```bash
# 1. Go to railway.app
# 2. Connect GitHub repo
# 3. Auto-deploys!
```

Railway supports WebSockets perfectly and is just as easy.

---

## 📚 More Info

- See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed setup
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for other platforms

