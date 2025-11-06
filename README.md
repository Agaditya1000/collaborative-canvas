# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously on the same canvas with real-time synchronization. Built with vanilla JavaScript, HTML5 Canvas, Node.js, and Socket.io.

## 🎯 Features

### Core Features
- ✅ **Real-time Drawing**: See other users' drawings as they draw (not after they finish)
- ✅ **Drawing Tools**: Brush and eraser with customizable colors and stroke width
- ✅ **User Indicators**: See where other users are currently drawing (cursor positions)
- ✅ **Global Undo/Redo**: Works across all users with per-user undo stacks
- ✅ **User Management**: See who's online with assigned colors
- ✅ **Touch Support**: Works on mobile devices with touch events

### Technical Highlights
- **Vanilla JavaScript**: No frontend frameworks - raw DOM and Canvas API
- **Real-time Sync**: WebSocket-based with Socket.io
- **Efficient Canvas Operations**: Optimized drawing with path smoothing
- **Conflict Resolution**: Handles simultaneous drawing gracefully
- **Modular Architecture**: Clean separation of concerns

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the repository**
   ```bash
   cd collaborative-canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Open `http://localhost:3000` in your browser
   - Open the same URL in multiple browser windows/tabs to test collaboration
   - Or share the URL with others on your network

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## 🧪 Testing with Multiple Users

### Local Testing
1. Start the server: `npm start`
2. Open `http://localhost:3000` in multiple browser windows
3. Each window represents a different user
4. Draw simultaneously and watch real-time synchronization

### Network Testing
1. Find your local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
2. Share `http://YOUR_IP:3000` with others on the same network
3. Multiple users can now collaborate in real-time

### What to Test
- ✅ Draw simultaneously from multiple browsers
- ✅ Verify real-time stroke updates appear immediately
- ✅ Test undo/redo from different users
- ✅ Check cursor positions update in real-time
- ✅ Test eraser tool
- ✅ Change colors and brush sizes
- ✅ Clear canvas and verify all users see it

## 🎮 Usage

### Drawing Tools
- **Brush Tool**: Click and drag to draw (or press `B`)
- **Eraser Tool**: Click and drag to erase (or press `E`)
- **Color Picker**: Select any color from the color picker
- **Brush Size**: Adjust with slider or press `1-9` keys (5px to 45px)
- **Quick Colors**: Click color swatches for quick color selection

### Keyboard Shortcuts
- `B` - Switch to brush tool
- `E` - Switch to eraser tool
- `1-9` - Set brush size (5px, 10px, 15px, ..., 45px)
- `Ctrl+Z` / `Cmd+Z` - Undo last action
- `Ctrl+Y` / `Cmd+Y` - Redo last undone action
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo (alternative)

### Actions
- **Undo**: Removes your last stroke (affects all users' view)
- **Redo**: Restores your last undone stroke
- **Clear Canvas**: Clears the entire canvas for all users (with confirmation)

## 📁 Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html          # Main HTML structure
│   ├── style.css           # Styling and layout
│   ├── main.js             # App initialization & UI events
│   ├── canvas.js           # Canvas drawing logic
│   └── websocket.js        # WebSocket client communication
├── server/
│   ├── server.js           # Express + Socket.io server
│   ├── rooms.js            # Room management (extensible)
│   └── drawing-state.js    # Drawing history & undo/redo
├── package.json            # Dependencies and scripts
├── README.md               # This file
└── ARCHITECTURE.md         # Detailed architecture docs
```

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **Backend**: Node.js, Express
- **Real-time**: Socket.io (WebSocket)
- **No Frameworks**: Pure JavaScript to demonstrate raw skills

## 📊 API Endpoints

### WebSocket Events
See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete WebSocket protocol documentation.

### HTTP Endpoints
- `GET /api/stats` - Server statistics (users, strokes, history)

## 🐛 Known Limitations

1. **No Persistence**: Drawings are lost when the server restarts
2. **Memory Growth**: History limited to 1000 events (auto-cleanup)
3. **Single Room**: Multi-room infrastructure exists but not exposed in UI
4. **No Export**: Cannot save or export drawings
5. **Basic Error Handling**: Network errors handled but could be more robust

## 🎯 Architecture Highlights

### Real-time Synchronization
- **Event Streaming**: Each mouse move sends incremental updates
- **Throttling**: Updates throttled to ~120fps for performance
- **Client-side Prediction**: Local drawing appears immediately
- **Server Validation**: Server validates and broadcasts to others

### Undo/Redo Strategy
- **Per-User Stacks**: Each user has independent undo/redo stacks
- **Global Visibility**: Undo/redo affects all users' view
- **State Consistency**: Canvas redraw ensures all clients stay in sync
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanation

### Conflict Resolution
- **Canvas Layering**: Natural canvas behavior (last drawn on top)
- **Network Latency**: Eventual consistency via redraws
- **Simultaneous Actions**: No conflicts - canvas handles naturally

## 🚀 Deployment

### Local Deployment
The app runs on `http://localhost:3000` by default.

### Production Deployment

**⚠️ Important**: This app uses WebSockets (Socket.io) which requires persistent connections. Not all platforms support this.

**Recommended Platforms:**
- **Railway** (Recommended) - Easy setup, free tier, full WebSocket support
- **Render** - Free tier available, good WebSocket support
- **Heroku** - Requires credit card for free tier
- **DigitalOcean App Platform** - Paid but reliable
- **Fly.io** - Great for global distribution

**Not Recommended:**
- **Vercel/Netlify** - Serverless functions don't support persistent WebSocket connections

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy (Railway):**
1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Connect your repo
4. Railway auto-detects and deploys!

**Environment Variables:**
- `PORT`: Server port (auto-set by most platforms, default: 3000)

## 🔍 Monitoring

Visit `http://localhost:3000/api/stats` to see:
- Number of connected users
- Drawing history size
- Active strokes count
- Drawing state statistics

## 📝 Development Notes

### Time Spent
- **Initial Setup**: 2 hours
- **Core Drawing Logic**: 4 hours
- **Real-time Sync**: 3 hours
- **Undo/Redo Implementation**: 3 hours
- **UI/UX Polish**: 2 hours
- **Documentation**: 2 hours
- **Total**: ~16 hours

### Key Challenges Solved
1. **Real-time Sync**: Implementing smooth real-time drawing without lag
2. **Global Undo/Redo**: Per-user stacks with global visibility
3. **Canvas Efficiency**: Optimizing redraws for performance
4. **State Management**: Keeping all clients synchronized

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Report bugs
- Suggest improvements
- Fork and extend

## 📄 License

MIT License - feel free to use this code for learning or projects.

## 🙏 Acknowledgments

- Built as a technical assessment
- Demonstrates real-time collaboration, canvas manipulation, and WebSocket communication
- No external drawing libraries used - pure Canvas API

---

**Note**: This project focuses on core functionality and clean architecture. Production deployment would require additional features like authentication, persistence, and enhanced error handling.

