# ⚠️ Vercel Deployment Warning

## Important Limitations

**Vercel's serverless functions do NOT support persistent WebSocket connections**, which are required for Socket.io real-time collaboration.

### Why Vercel Won't Work Well

1. **Serverless Functions**: Vercel uses serverless functions that:
   - Don't maintain persistent connections
   - Have execution time limits
   - Can't keep WebSocket connections alive

2. **Socket.io Requirements**: This app needs:
   - Persistent TCP connections
   - Long-lived WebSocket connections
   - Stateful server (maintains room state, user connections)

### Possible Workarounds (Not Recommended)

If you still want to try Vercel, you would need to:

1. **Separate WebSocket Server**: 
   - Deploy backend (Socket.io server) on Railway/Render
   - Deploy frontend on Vercel
   - Connect frontend to external WebSocket server

2. **Use Vercel Edge Functions** (Limited):
   - Still won't support full Socket.io features
   - May have connection issues

### Better Alternatives

For this Socket.io application, use platforms that support WebSockets:

1. **Railway** ⭐ (Recommended)
   - Free tier available
   - Full WebSocket support
   - Easy GitHub integration
   - Auto-deploys

2. **Render**
   - Free tier available
   - Good WebSocket support
   - Easy setup

3. **Heroku**
   - Requires credit card
   - Reliable WebSocket support

4. **DigitalOcean App Platform**
   - Paid but reliable
   - Full WebSocket support

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## If You Still Want to Try Vercel

The `vercel.json` file is included, but **WebSocket connections will likely fail**.

### Steps:
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Test WebSocket connections (they will likely fail)

### Expected Issues:
- ❌ WebSocket connections won't establish
- ❌ Real-time drawing won't work
- ❌ Users won't see each other's drawings
- ❌ Room system won't work

---

## Recommendation

**Use Railway instead** - it's just as easy and actually works with WebSockets:

```bash
# 1. Sign up at railway.app
# 2. Connect GitHub repo
# 3. Railway auto-deploys!
```

That's it! Railway handles everything and WebSockets work perfectly.

