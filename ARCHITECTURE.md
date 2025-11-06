# Architecture Documentation

## Overview

This document describes the architecture, data flow, and technical decisions for the Real-Time Collaborative Drawing Canvas application.

## System Architecture

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

## Data Flow

### Drawing Event Flow

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

### Undo/Redo Flow

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

## WebSocket Protocol

### Client → Server Messages

| Event | Payload | Description |
|-------|---------|-------------|
| `stroke-start` | `{strokeId, tool, color, brushSize, points}` | Begin a new drawing stroke |
| `stroke-update` | `{strokeId, points}` | Add points to active stroke |
| `stroke-end` | `{strokeId, endTime, totalPoints}` | Complete a stroke |
| `cursor-move` | `{x, y}` | Update cursor position |
| `undo` | `{}` | Request undo of last action |
| `redo` | `{}` | Request redo of last undone action |
| `clear-canvas` | `{}` | Clear entire canvas |

### Server → Client Messages

| Event | Payload | Description |
|-------|---------|-------------|
| `user-connected` | `{userId, color, users, history}` | Initial connection data |
| `user-joined` | `{id, color, name}` | New user joined |
| `user-left` | `userId` | User disconnected |
| `stroke-start` | `{strokeId, tool, color, brushSize, points, userId}` | Remote stroke started |
| `stroke-update` | `{strokeId, points, userId}` | Remote stroke updated |
| `stroke-end` | `{strokeId, userId, endTime}` | Remote stroke completed |
| `cursor-move` | `{userId, cursor}` | Remote cursor moved |
| `undo-action` | `{userId, actionId, stroke}` | Stroke was undone |
| `redo-action` | `{userId, actionId, stroke}` | Stroke was redone |
| `canvas-cleared` | `{clearedBy, timestamp}` | Canvas was cleared |
| `undo-redo-state` | `{undo, redo}` | Update button states |

## Undo/Redo Strategy

### Problem Statement

Global undo/redo in a collaborative environment is challenging because:
- Multiple users can perform actions simultaneously
- Undoing one user's action shouldn't affect another user's undo stack
- All clients must maintain consistent canvas state

### Solution

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

4. **Conflict Resolution:**
   - If User A undoes User B's stroke: Only User B's undo stack is affected
   - Canvas state is maintained by redrawing all visible strokes
   - Stroke visibility determined by undo/redo stacks

## Performance Decisions

### 1. Real-time Stroke Updates

**Decision:** Emit every mouse move event (throttled to ~120fps)

**Rationale:**
- Provides smooth real-time drawing experience
- Throttling prevents network congestion
- Incremental updates reduce latency vs. batching

**Trade-offs:**
- Higher network usage
- More server processing
- Better user experience

### 2. Canvas Redrawing Strategy

**Decision:** Full canvas redraw on undo/redo

**Rationale:**
- Simpler implementation
- Guarantees consistency
- Canvas operations are fast for typical drawing sizes

**Trade-offs:**
- Slight performance hit on large canvases
- Could optimize with layer management in future

### 3. Stroke Storage

**Decision:** Store complete stroke data (all points) in memory

**Rationale:**
- Fast access for undo/redo
- Simple history management
- No database overhead for demo

**Trade-offs:**
- Memory usage grows with drawing complexity
- Not suitable for very large drawings
- Would need persistence layer for production

### 4. Room Management

**Decision:** Single default room with room infrastructure ready

**Rationale:**
- Meets core requirements
- Easy to extend for multiple rooms
- RoomManager class ready for future use

## Conflict Resolution

### Simultaneous Drawing

**Scenario:** Two users draw in overlapping areas at the same time

**Resolution:**
- Canvas uses `source-over` composite operation
- Last stroke drawn appears on top
- No explicit conflict resolution needed - natural canvas behavior

### Network Latency

**Scenario:** User A draws, but User B's network is slow

**Resolution:**
- Client-side prediction: User A sees their drawing immediately
- Server validates and broadcasts to others
- Remote clients receive updates asynchronously
- Canvas redraws ensure eventual consistency

### Undo Conflicts

**Scenario:** User A undoes while User B is still drawing

**Resolution:**
- Undo only affects completed strokes
- Active strokes continue normally
- When User B finishes, their stroke is added to history
- User A's undo stack remains independent

## State Synchronization

### Initial Connection

1. New client connects
2. Server sends:
   - User ID and assigned color
   - List of online users
   - Complete drawing history
3. Client draws all historical strokes
4. Client is now synchronized

### Ongoing Synchronization

- **Drawing Events:** Real-time via WebSocket
- **Undo/Redo:** Broadcast to all clients
- **User Presence:** Join/leave events
- **Canvas Clear:** Broadcast to all clients

### Consistency Guarantees

- All clients receive same events in order
- Server is source of truth
- Canvas redraw ensures visual consistency
- No client-side state conflicts possible

## Code Organization

### Client Structure

```
client/
├── index.html          # Main HTML structure
├── style.css           # Styling
├── main.js            # App initialization & event handling
├── canvas.js          # Canvas drawing logic & state
└── websocket.js       # WebSocket client & communication
```

**Responsibilities:**
- `main.js`: UI event handling, tool selection, keyboard shortcuts
- `canvas.js`: Drawing operations, stroke management, canvas rendering
- `websocket.js`: Socket communication, user management, notifications

### Server Structure

```
server/
├── server.js          # Express server & Socket.io setup
├── rooms.js           # Room management (extensible)
└── drawing-state.js   # Drawing history & undo/redo logic
```

**Responsibilities:**
- `server.js`: WebSocket event handling, user management, broadcasting
- `rooms.js`: Room creation, user assignment (prepared for multi-room)
- `drawing-state.js`: History storage, undo/redo stack management

## Scalability Considerations

### Current Limitations

- In-memory storage (lost on server restart)
- Single server instance
- No load balancing
- No database persistence

### Scaling to 1000+ Users

**Recommended Approach:**

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

4. **Architecture:**
   ```
   Load Balancer
   → Multiple Node.js Servers
   → Redis (Pub/Sub + State)
   → MongoDB (Persistence)
   ```

## Security Considerations

### Current Implementation

- No authentication (demo only)
- CORS enabled for all origins
- No rate limiting
- No input validation

### Production Recommendations

- User authentication (JWT tokens)
- Rate limiting per IP/user
- Input validation and sanitization
- HTTPS/WSS only
- Room access control
- Stroke size limits

## Testing Strategy

### Manual Testing

1. **Multi-User Testing:**
   - Open multiple browser windows
   - Test simultaneous drawing
   - Verify real-time sync

2. **Undo/Redo Testing:**
   - Draw strokes from multiple users
   - Test undo/redo from different users
   - Verify canvas consistency

3. **Network Testing:**
   - Test with slow network (throttle in DevTools)
   - Test disconnection/reconnection
   - Verify state recovery

### Automated Testing (Future)

- Unit tests for DrawingState
- Integration tests for WebSocket events
- E2E tests with multiple clients
- Performance tests for large drawings

## Known Limitations

1. **No Persistence:** Drawings lost on server restart
2. **Memory Growth:** History grows unbounded (limited to 1000 events)
3. **No Mobile Optimization:** Touch support basic, not optimized
4. **Single Room:** Multi-room infrastructure ready but not exposed
5. **No Image Export:** Cannot save/export drawings
6. **Basic Error Handling:** Network errors handled but not comprehensive

## Future Enhancements

1. **Persistence:** Save drawings to database
2. **Multi-Room:** Expose room system in UI
3. **Advanced Tools:** Shapes, text, images
4. **Export/Import:** PNG, SVG export
5. **Mobile Optimization:** Better touch handling
6. **Performance Metrics:** FPS counter, latency display
7. **Drawing Layers:** Layer management for complex drawings
8. **Collaborative Cursors:** Show what others are drawing in real-time (partially implemented)
