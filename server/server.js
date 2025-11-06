const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const RoomManager = require('./rooms');
const DrawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize room manager
const roomManager = new RoomManager();
const defaultRoomId = 'default';

// Store active strokes per room
const activeStrokes = new Map(); // Map<roomId, Map<strokeId, stroke>>

// Simple ID generator
function generateId() {
    return 'stroke_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Helper to get or create active strokes map for a room
function getActiveStrokesForRoom(roomId) {
    if (!activeStrokes.has(roomId)) {
        activeStrokes.set(roomId, new Map());
    }
    return activeStrokes.get(roomId);
}

io.on('connection', (socket) => {
    console.log('🔗 User connected:', socket.id);

    const userColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    const user = {
        id: socket.id,
        color: userColor,
        cursor: { x: 0, y: 0 },
        name: `User${socket.id.slice(-4)}`
    };

    // Add user to default room
    const room = roomManager.addUserToRoom(socket.id, user, defaultRoomId);
    socket.join(defaultRoomId);

    // Get drawing history from room's drawing state
    const drawingState = room.drawingState;
    const history = drawingState.getHistoryForUser();

    // Send current state to new user
    socket.emit('user-connected', {
        userId: socket.id,
        color: userColor,
        users: roomManager.getRoomUsers(defaultRoomId),
        history: history // Send all completed strokes
    });

    // Notify others about new user
    socket.to(defaultRoomId).emit('user-joined', user);

    // Handle drawing events
    socket.on('stroke-start', (data) => {
        console.log('🎨 Stroke START by', socket.id, 'ID:', data.strokeId);
        
        const roomStrokes = getActiveStrokesForRoom(defaultRoomId);
        
        // Store the stroke as active
        roomStrokes.set(data.strokeId, {
            ...data,
            userId: socket.id,
            points: [...data.points],
            startTime: Date.now()
        });

        // Broadcast to ALL other users in the room immediately
        // Include all necessary data for remote clients
        socket.to(defaultRoomId).emit('stroke-start', {
            strokeId: data.strokeId,
            tool: data.tool || 'brush',
            color: data.color || '#000000',
            brushSize: data.brushSize || 5,
            points: data.points || [],
            userId: socket.id,
            timestamp: Date.now()
        });
    });

    socket.on('stroke-update', (data) => {
        const roomStrokes = getActiveStrokesForRoom(defaultRoomId);
        const stroke = roomStrokes.get(data.strokeId);
        if (!stroke || stroke.userId !== socket.id) {
            console.log('⚠️ Invalid stroke update:', data.strokeId);
            return;
        }

        // Add new points to the stroke
        stroke.points.push(...data.points);
        stroke.lastUpdate = Date.now();

        // Broadcast to ALL other users in the room immediately
        socket.to(defaultRoomId).emit('stroke-update', {
            strokeId: data.strokeId,
            points: data.points || [], // Send only the new points
            userId: socket.id,
            timestamp: Date.now()
        });
    });

    socket.on('stroke-end', (data) => {
        const roomStrokes = getActiveStrokesForRoom(defaultRoomId);
        const stroke = roomStrokes.get(data.strokeId);
        if (!stroke || stroke.userId !== socket.id) {
            console.log('⚠️ Invalid stroke end:', data.strokeId);
            return;
        }

        // Create completed stroke object
        const completedStroke = {
            id: data.strokeId,
            userId: socket.id,
            tool: stroke.tool,
            color: stroke.color,
            brushSize: stroke.brushSize,
            points: [...stroke.points], // Copy all points
            startTime: stroke.startTime,
            endTime: Date.now(),
            totalPoints: data.totalPoints
        };

        // Add to room's drawing state history
        const drawingState = room.drawingState;
        drawingState.addDrawingEvent({
            userId: socket.id,
            type: 'stroke',
            tool: stroke.tool,
            color: stroke.color,
            brushSize: stroke.brushSize,
            points: completedStroke.points,
            timestamp: Date.now(),
            actionId: data.strokeId
        });

        // Broadcast completion to ALL other users in the room
        socket.to(defaultRoomId).emit('stroke-end', {
            strokeId: data.strokeId,
            userId: socket.id,
            endTime: data.endTime,
            totalPoints: data.totalPoints
        });

        // Clean up active stroke
        roomStrokes.delete(data.strokeId);

        console.log('✅ Stroke END:', data.strokeId, 'Total points:', completedStroke.points.length);
    });

    // Handle cursor movement
    socket.on('cursor-move', (cursor) => {
        user.cursor = cursor;
        socket.to(defaultRoomId).emit('cursor-move', {
            userId: socket.id,
            cursor: cursor
        });
    });

    // Handle undo - GLOBAL UNDO/REDO IMPLEMENTATION
    socket.on('undo', () => {
        console.log('↩️ Undo requested by:', socket.id);
        
        const drawingState = room.drawingState;
        const undoResult = drawingState.undo(socket.id);
        
        if (undoResult && undoResult.action) {
            const strokeData = undoResult.action;
            
            // Broadcast undo action to ALL clients in the room (including sender)
            io.to(defaultRoomId).emit('undo-action', {
                userId: socket.id,
                actionId: undoResult.actionId,
                stroke: {
                    id: strokeData.actionId || strokeData.id,
                    userId: strokeData.userId,
                    tool: strokeData.tool,
                    color: strokeData.color,
                    brushSize: strokeData.brushSize,
                    points: strokeData.points || []
                }
            });
            
            // Update undo/redo button states
            const stackSizes = drawingState.getUserStackSizes(socket.id);
            socket.emit('undo-redo-state', stackSizes);
            
            console.log('✅ Undo performed for stroke:', undoResult.actionId);
        } else {
            socket.emit('undo-failed', { message: 'Nothing to undo' });
            console.log('❌ Nothing to undo for user:', socket.id);
        }
    });

    // Handle redo - GLOBAL REDO IMPLEMENTATION
    socket.on('redo', () => {
        console.log('↪️ Redo requested by:', socket.id);
        
        const drawingState = room.drawingState;
        const redoResult = drawingState.redo(socket.id);
        
        if (redoResult && redoResult.action) {
            const strokeData = redoResult.action;
            
            // Broadcast redo action to ALL clients in the room (including sender)
            io.to(defaultRoomId).emit('redo-action', {
                userId: socket.id,
                actionId: redoResult.actionId,
                stroke: {
                    id: strokeData.actionId || strokeData.id,
                    userId: strokeData.userId,
                    tool: strokeData.tool,
                    color: strokeData.color,
                    brushSize: strokeData.brushSize,
                    points: strokeData.points || []
                }
            });
            
            // Update undo/redo button states
            const stackSizes = drawingState.getUserStackSizes(socket.id);
            socket.emit('undo-redo-state', stackSizes);
            
            console.log('✅ Redo performed for stroke:', redoResult.actionId);
        } else {
            socket.emit('redo-failed', { message: 'Nothing to redo' });
            console.log('❌ Nothing to redo for user:', socket.id);
        }
    });

    // Handle clear canvas
    socket.on('clear-canvas', () => {
        console.log('🗑️ Clear canvas requested by:', socket.id);
        
        const drawingState = room.drawingState;
        drawingState.clearCanvas(socket.id);
        
        // Clear active strokes for this room
        const roomStrokes = getActiveStrokesForRoom(defaultRoomId);
        roomStrokes.clear();
        
        io.to(defaultRoomId).emit('canvas-cleared', {
            clearedBy: socket.id,
            timestamp: Date.now()
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
        
        // Clean up user's active strokes in the room
        const roomStrokes = getActiveStrokesForRoom(defaultRoomId);
        for (const [strokeId, stroke] of roomStrokes) {
            if (stroke.userId === socket.id) {
                roomStrokes.delete(strokeId);
                console.log('🧹 Cleaned up active stroke:', strokeId);
            }
        }
        
        // Remove user from room
        roomManager.removeUserFromRoom(socket.id, defaultRoomId);
        
        // Notify others in the room
        io.to(defaultRoomId).emit('user-left', socket.id);
        
        const room = roomManager.getRoom(defaultRoomId);
        const drawingState = room.drawingState;
        console.log('📊 Stats - Users:', room.users.size, 'Active strokes:', roomStrokes.size, 'History:', drawingState.drawingHistory.length);
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// API endpoint for monitoring
app.get('/api/stats', (req, res) => {
    const room = roomManager.getRoom(defaultRoomId);
    const drawingState = room.drawingState;
    const roomStrokes = getActiveStrokesForRoom(defaultRoomId);
    
    res.json({
        users: Array.from(room.users.values()),
        drawingHistory: drawingState.drawingHistory.length,
        activeStrokes: roomStrokes.size,
        drawingStateStats: drawingState.getStats()
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🎨 Open http://localhost:${PORT} in multiple browsers to test`);
    console.log(`📊 Monitor: http://localhost:${PORT}/api/stats`);
});