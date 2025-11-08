# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously on the same canvas with real-time synchronization. Built with vanilla JavaScript, HTML5 Canvas, Node.js, and Socket.io.

## 🎯 Features

### Core Features
- ✅ **Real-time Drawing**: See other users' drawings as they draw (not after they finish)
- ✅ **Drawing Tools**: Brush and eraser with customizable colors and stroke width
- ✅ **Shape Tools**: Rectangle, circle, and line tools for geometric shapes
- ✅ **Text Tool**: Add text annotations to your drawings
- ✅ **Image Upload**: Upload and draw images on the canvas
- ✅ **User Indicators**: See where other users are currently drawing (cursor positions)
- ✅ **Global Undo/Redo**: Works across all users with per-user undo stacks
- ✅ **User Management**: See who's online with assigned colors
- ✅ **Room System**: Create and join multiple isolated drawing rooms
- ✅ **Drawing Persistence**: Save and load drawings locally
- ✅ **Performance Metrics**: Real-time FPS counter and latency display
- ✅ **Touch Support**: Full mobile touch support for drawing
- ✅ **Responsive UI**: Clean, professional interface that works on all screen sizes

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

### Local Installation

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

## 🚀 Deploy on Render (Production)

### Quick Deployment (3 minutes)

1. **Go to Render**
   - Sign up/Login at [render.com](https://render.com)
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Connect your GitHub account
   - Select the `collaborative-canvas` repository

3. **Configure Service**
   - **Name**: `collaborative-canvas` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or `master`)
   - **Root Directory**: `.` (leave empty)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or `Starter` for $7/month - always on)

4. **Deploy**
   - Click **"Create Web Service"**
   - Wait 2-3 minutes for deployment
   - Copy your Render URL: `https://your-app.onrender.com`

5. **Test It**
   - Open your Render URL in browser
   - Open browser console (F12)
   - Look for: `✅ Connected to server`
   - Try drawing - it works! 🎉

### Deployment Checklist

**Pre-Deployment:**
- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] All files are committed: `git status` shows clean
- [ ] You have a Render account

**Render Setup:**
- [ ] Go to [render.com](https://render.com) and sign up/login
- [ ] Click "New +" → "Web Service"
- [ ] Connect your Git account
- [ ] Select repository: `collaborative-canvas`

**Render Configuration:**
- [ ] **Name**: `collaborative-canvas` (or your choice)
- [ ] **Region**: Choose closest to you
- [ ] **Branch**: `main` (or `master`)
- [ ] **Root Directory**: `.` (empty)
- [ ] **Runtime**: `Node`
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `npm start`
- [ ] **Plan**: `Free` (or `Starter` for $7/month - always on)

**Deploy:**
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-3 minutes)
- [ ] **Copy Render URL**: `https://your-app.onrender.com`
- [ ] Test: Open `https://your-app.onrender.com/api/stats` in browser
- [ ] Should see JSON response ✅

### Updating Your Deployment

After making changes:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will **automatically redeploy** (if auto-deploy is enabled).

### Troubleshooting

**Server Not Starting:**
- Check Render logs: Render dashboard → Your service → Logs
- Verify `package.json` has: `"start": "node server/server.js"`
- Check that `server/server.js` exists

**WebSocket Connection Fails:**
- Browser console (F12) for errors
- Render service is running (not sleeping)
- First request on free tier takes ~30 seconds to wake up
- Check Render logs for connection errors

**Static Files Not Loading:**
- Verify `server/server.js` serves static files from `client` directory
- Check Render logs for file serving errors

### Render Pricing

**Free Tier:**
- ✅ **WebSocket support** - Full support
- ⚠️ **Sleep**: Services sleep after 15 minutes of inactivity
- ⚠️ **Wake-up**: First request takes ~30 seconds
- ✅ **Perfect for**: Development and testing

**Starter Plan ($7/month):**
- ✅ **Always on** - No sleep
- ✅ **Faster wake-up** - Instant
- ✅ **Better performance**
- ✅ **Perfect for**: Production use

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
- ✅ Test all drawing tools (brush, eraser, shapes, text)
- ✅ Test image upload functionality
- ✅ Test room creation and switching
- ✅ Test save/load functionality
- ✅ Change colors and brush sizes
- ✅ Clear canvas and verify all users see it
- ✅ Test on mobile devices (touch support)
- ✅ Verify responsive UI on different screen sizes

### Test Real-time Collaboration
1. Open your app URL in **two different browsers** (or incognito windows)
2. Draw in one browser
3. Drawing should appear in the other browser in real-time! ✅
4. Test user cursors - should see other user's cursor ✅
5. Test rooms - create/join rooms ✅

## 🎮 Usage

### Drawing Tools
- **Brush Tool**: Click and drag to draw (or press `B`)
- **Eraser Tool**: Click and drag to erase (or press `E`)
- **Rectangle Tool**: Draw rectangles (or press `R`)
- **Circle Tool**: Draw circles (or press `C`)
- **Line Tool**: Draw straight lines (or press `L`)
- **Text Tool**: Add text to canvas (or press `T`)
- **Color Picker**: Select any color from the color picker
- **Brush Size**: Adjust with slider or press `1-9` keys (1px to 50px)
- **Quick Colors**: Click color swatches for quick color selection
- **Image Upload**: Upload images to draw on the canvas
- **Save/Load**: Save drawings locally and load them later

### Keyboard Shortcuts
- `B` - Switch to brush tool
- `E` - Switch to eraser tool
- `R` - Switch to rectangle tool
- `C` - Switch to circle tool
- `L` - Switch to line tool
- `T` - Switch to text tool
- `1-9` - Set brush size (1px to 50px)
- `Ctrl+Z` / `Cmd+Z` - Undo last action
- `Ctrl+Y` / `Cmd+Y` - Redo last undone action
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo (alternative)

### Actions
- **Undo**: Removes your last action (affects all users' view)
- **Redo**: Restores your last undone action
- **Clear Canvas**: Clears the entire canvas for all users (with confirmation)
- **Save**: Save current drawing to browser's local storage
- **Load**: Load a previously saved drawing
- **Image Upload**: Upload and place images on the canvas

### Rooms
- **Create Room**: Create a new isolated drawing room
- **Join Room**: Switch to a different room
- **Default Room**: Always available for quick collaboration
- Each room has its own canvas and drawing history

### Performance
- **FPS Counter**: Real-time frames per second display
- **Latency Display**: Network latency in milliseconds
- **Room Indicator**: Shows current active room

## 📁 Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html          # Main HTML structure
│   ├── style.css           # Styling and layout
│   ├── main.js             # App initialization & UI events
│   ├── canvas.js           # Canvas drawing logic
│   ├── websocket.js        # WebSocket client communication
│   └── config.js           # Client configuration
├── server/
│   ├── server.js           # Express + Socket.io server
│   ├── rooms.js            # Room management
│   └── drawing-state.js    # Drawing history & undo/redo
├── package.json            # Dependencies and scripts
├── render.yaml             # Render deployment configuration
└── README.md               # This file
```

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **Backend**: Node.js, Express
- **Real-time**: Socket.io (WebSocket)
- **No Frameworks**: Pure JavaScript to demonstrate raw skills

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Client 1      │         │   Client 2      │
│  (Browser)      │         │  (Browser)      │
│                 │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │
│  │  Canvas   │  │         │  │  Canvas   │  │
│  │  Manager  │  │         │  │  Manager  │  │
│  └─────┬─────┘  │         │  └─────┬─────┘  │
│        │        │         │        │        │
│  ┌─────▼─────┐  │         │  ┌─────▼─────┐  │
│  │ WebSocket │  │         │  │ WebSocket │  │
│  │  Client   │  │         │  │  Client   │  │
│  └─────┬─────┘  │         │  └─────┬─────┘  │
└────────┼────────┘         └────────┼────────┘
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │   Server    │
              │  (Node.js)  │
              │             │
              │ ┌─────────┐ │
              │ │ Socket  │ │
              │ │   IO    │ │
              │ └────┬────┘ │
              │      │      │
              │ ┌────▼────┐ │
              │ │  Room   │ │
              │ │ Manager │ │
              │ └────┬────┘ │
              │      │      │
              │ ┌────▼────┐ │
              │ │Drawing  │ │
              │ │ State   │ │
              │ └─────────┘ │
              └─────────────┘
```

### Data Flow

#### Drawing Event Flow

1. **User Draws on Canvas**
   ```
   User Mouse/Touch Event
   → Canvas Manager captures point
   → Creates stroke object with unique ID
   → Emits 'stroke-start' via WebSocket
   ```

2. **Real-time Stroke Updates**
   ```
   Mouse Move Events (throttled to ~120fps)
   → Points added to current stroke
   → Emits 'stroke-update' with new points
   → Server broadcasts to other clients
   → Remote clients draw points immediately
   ```

3. **Stroke Completion**
   ```
   Mouse Up Event
   → Emits 'stroke-end'
   → Server adds stroke to DrawingState history
   → Server broadcasts completion
   → All clients mark stroke as complete
   ```

#### Undo/Redo Flow

1. **Undo Request**
   ```
   User presses Ctrl+Z
   → Client emits 'undo' event
   → Server's DrawingState finds last user action
   → Removes from undo stack, adds to redo stack
   → Server broadcasts 'undo-action' to all clients
   → All clients remove stroke from canvas and redraw
   ```

2. **Redo Request**
   ```
   User presses Ctrl+Y
   → Client emits 'redo' event
   → Server's DrawingState finds last undone action
   → Removes from redo stack, adds to undo stack
   → Server broadcasts 'redo-action' to all clients
   → All clients restore stroke and redraw
   ```

### WebSocket Protocol

#### Client → Server Messages

| Event | Payload | Description |
|-------|---------|-------------|
| `stroke-start` | `{strokeId, tool, color, brushSize, points}` | Begin a new drawing stroke |
| `stroke-update` | `{strokeId, points}` | Add points to active stroke |
| `stroke-end` | `{strokeId, endTime, totalPoints}` | Complete a stroke |
| `shape-drawn` | `{shapeId, tool, color, brushSize, startPos, endPos}` | Draw a shape (rectangle, circle, line) |
| `text-added` | `{textId, text, color, brushSize, pos}` | Add text to canvas |
| `cursor-move` | `{x, y}` | Update cursor position |
| `undo` | `{}` | Request undo of last action |
| `redo` | `{}` | Request redo of last undone action |
| `clear-canvas` | `{}` | Clear entire canvas |
| `create-room` | `{roomName}` | Create a new room |
| `join-room` | `{roomId}` | Join a room |
| `ping` | `{timestamp}` | Latency check |

#### Server → Client Messages

| Event | Payload | Description |
|-------|---------|-------------|
| `user-connected` | `{userId, color, users, history}` | Initial connection data |
| `user-joined` | `{id, color, name}` | New user joined |
| `user-left` | `userId` | User disconnected |
| `stroke-start` | `{strokeId, tool, color, brushSize, points, userId}` | Remote stroke started |
| `stroke-update` | `{strokeId, points, userId}` | Remote stroke updated |
| `stroke-end` | `{strokeId, userId, endTime}` | Remote stroke completed |
| `shape-drawn` | `{shapeId, tool, color, brushSize, startPos, endPos, userId}` | Remote shape drawn |
| `text-added` | `{textId, text, color, brushSize, pos, userId}` | Remote text added |
| `cursor-move` | `{userId, cursor}` | Remote cursor moved |
| `undo-action` | `{userId, actionId, stroke}` | Stroke was undone |
| `redo-action` | `{userId, actionId, stroke}` | Stroke was redone |
| `canvas-cleared` | `{clearedBy, timestamp}` | Canvas was cleared |
| `room-created` | `{roomId, roomName}` | Room was created |
| `room-joined` | `{roomId, history}` | Joined a room |
| `room-error` | `{message}` | Room operation error |
| `rooms-updated` | `{rooms}` | Room list updated |
| `pong` | `{timestamp}` | Latency response |
| `undo-redo-state` | `{undo, redo}` | Update button states |

### Undo/Redo Strategy

**Per-User Undo Stacks:**
- Each user has their own undo/redo stack
- Undo only affects the requesting user's actions
- All clients receive undo/redo events to maintain sync

**Implementation Details:**

1. **DrawingState Management:**
   ```javascript
   // Each user has separate stacks
   undoStacks: Map<userId, [actionId1, actionId2, ...]>
   redoStacks: Map<userId, [actionId1, actionId2, ...]>
   
   // All strokes stored in shared history
   drawingHistory: [stroke1, stroke2, ...]
   ```

2. **Undo Process:**
   - Find last action in user's undo stack
   - Move actionId from undo stack to redo stack
   - Broadcast undo event with stroke data
   - All clients remove stroke and redraw canvas

3. **Redo Process:**
   - Find last action in user's redo stack
   - Move actionId from redo stack to undo stack
   - Broadcast redo event with stroke data
   - All clients restore stroke and redraw canvas

### Performance Decisions

1. **Real-time Stroke Updates**
   - Emit every mouse move event (throttled to ~120fps)
   - Provides smooth real-time drawing experience
   - Throttling prevents network congestion

2. **Canvas Redrawing Strategy**
   - Full canvas redraw on undo/redo
   - Simpler implementation
   - Guarantees consistency

3. **Stroke Storage**
   - Store complete stroke data (all points) in memory
   - Fast access for undo/redo
   - Simple history management

### Conflict Resolution

**Simultaneous Drawing:**
- Canvas uses `source-over` composite operation
- Last stroke drawn appears on top
- No explicit conflict resolution needed - natural canvas behavior

**Network Latency:**
- Client-side prediction: User sees their drawing immediately
- Server validates and broadcasts to others
- Remote clients receive updates asynchronously
- Canvas redraws ensure eventual consistency

**Undo Conflicts:**
- Undo only affects completed strokes
- Active strokes continue normally
- User undo stacks remain independent

### State Synchronization

**Initial Connection:**
1. New client connects
2. Server sends: User ID, assigned color, list of online users, complete drawing history
3. Client draws all historical strokes
4. Client is now synchronized

**Ongoing Synchronization:**
- Drawing Events: Real-time via WebSocket
- Undo/Redo: Broadcast to all clients
- User Presence: Join/leave events
- Canvas Clear: Broadcast to all clients

**Consistency Guarantees:**
- All clients receive same events in order
- Server is source of truth
- Canvas redraw ensures visual consistency
- No client-side state conflicts possible

### Code Organization

**Client Structure:**
- `main.js`: UI event handling, tool selection, keyboard shortcuts
- `canvas.js`: Drawing operations, stroke management, canvas rendering
- `websocket.js`: Socket communication, user management, notifications
- `config.js`: Client configuration (backend URL, socket options)

**Server Structure:**
- `server.js`: WebSocket event handling, user management, broadcasting
- `rooms.js`: Room creation, user assignment, room management
- `drawing-state.js`: History storage, undo/redo stack management

### Scalability Considerations

**Current Limitations:**
- In-memory storage (lost on server restart)
- Single server instance
- No load balancing
- No database persistence

**Scaling to 1000+ Users (Future):**

1. **Database Persistence:**
   - Store drawing history in Redis or MongoDB
   - Use Redis for active strokes (fast, in-memory)
   - Use MongoDB for historical data

2. **Horizontal Scaling:**
   - Use Redis Pub/Sub for cross-server communication
   - Sticky sessions or shared state
   - Load balancer with WebSocket support

3. **Optimization:**
   - Batch stroke updates (reduce network traffic)
   - Implement canvas layers (reduce redraws)
   - Use CDN for static assets
   - Implement rate limiting per user

### Security Considerations

**Current Implementation:**
- No authentication (demo only)
- CORS enabled for all origins
- No rate limiting
- No input validation

**Production Recommendations:**
- User authentication (JWT tokens)
- Rate limiting per IP/user
- Input validation and sanitization
- HTTPS/WSS only
- Room access control
- Stroke size limits

## 📊 API Endpoints

### HTTP Endpoints
- `GET /api/stats` - Server statistics (users, strokes, history)

### Monitoring

Visit `http://localhost:3000/api/stats` (or `https://your-app.onrender.com/api/stats`) to see:
- Number of connected users
- Drawing history size
- Active strokes count
- Drawing state statistics

## 🐛 Known Limitations

1. **Server Restart**: Drawings are lost when the server restarts (no database persistence)
2. **Memory Growth**: History limited per room (auto-cleanup)
3. **Local Storage Only**: Saved drawings are stored in browser's local storage
4. **Image Size**: Large images may affect performance
5. **Basic Error Handling**: Network errors handled but could be more robust

## 📝 Development Notes

### Time Spent
- **Initial Setup**: 2 hours
- **Core Drawing Logic**: 4 hours
- **Real-time Sync**: 3 hours
- **Undo/Redo Implementation**: 3 hours
- **Shape Tools & Text**: 2 hours
- **Room System**: 2 hours
- **UI/UX Polish**: 2 hours
- **Responsive Design**: 2 hours
- **Documentation**: 2 hours
- **Total**: ~22 hours

### Key Challenges Solved
1. **Real-time Sync**: Implementing smooth real-time drawing without lag
2. **Global Undo/Redo**: Per-user stacks with global visibility
3. **Canvas Efficiency**: Optimizing redraws for performance
4. **State Management**: Keeping all clients synchronized
5. **Room System**: Isolated canvases with separate history
6. **Shape Drawing**: Preview and final rendering for shapes
7. **Mobile Support**: Touch events and responsive design

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
