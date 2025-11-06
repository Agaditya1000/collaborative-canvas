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
    let currentRoomId = defaultRoomId;
    let room = roomManager.addUserToRoom(socket.id, user, currentRoomId);
    socket.join(currentRoomId);

    // Get drawing history from room's drawing state
    const drawingState = room.drawingState;
    const history = drawingState.getHistoryForUser();

    // Send current state to new user
    socket.emit('user-connected', {
        userId: socket.id,
        color: userColor,
        users: roomManager.getRoomUsers(currentRoomId),
        history: history // Send all completed strokes
    });

    // Notify others about new user
    socket.to(currentRoomId).emit('user-joined', user);

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
        socket.to(currentRoomId).emit('stroke-start', {
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
        const roomStrokes = getActiveStrokesForRoom(currentRoomId);
        const stroke = roomStrokes.get(data.strokeId);
        if (!stroke || stroke.userId !== socket.id) {
            console.log('⚠️ Invalid stroke update:', data.strokeId);
            return;
        }

        // Add new points to the stroke
        stroke.points.push(...data.points);
        stroke.lastUpdate = Date.now();

        // Broadcast to ALL other users in the room immediately
        socket.to(currentRoomId).emit('stroke-update', {
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
        socket.to(currentRoomId).emit('stroke-end', {
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
        socket.to(currentRoomId).emit('cursor-move', {
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
            io.to(currentRoomId).emit('undo-action', {
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
            
            // Build complete stroke object with all fields
            const strokeObject = {
                id: strokeData.actionId || strokeData.id,
                userId: strokeData.userId,
                tool: strokeData.tool,
                color: strokeData.color,
                brushSize: strokeData.brushSize
            };
            
            // Add fields based on type
            if (strokeData.points && Array.isArray(strokeData.points) && strokeData.points.length > 0) {
                strokeObject.points = strokeData.points;
            }
            if (strokeData.startPos && strokeData.endPos) {
                strokeObject.startPos = strokeData.startPos;
                strokeObject.endPos = strokeData.endPos;
            }
            if (strokeData.text && strokeData.pos) {
                strokeObject.text = strokeData.text;
                strokeObject.pos = strokeData.pos;
            }
            
            // Broadcast redo action to ALL clients in the room (including sender)
            io.to(currentRoomId).emit('redo-action', {
                userId: socket.id,
                actionId: redoResult.actionId,
                stroke: strokeObject
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
        const roomStrokes = getActiveStrokesForRoom(currentRoomId);
        roomStrokes.clear();
        
        io.to(currentRoomId).emit('canvas-cleared', {
            clearedBy: socket.id,
            timestamp: Date.now()
        });
    });

    // ========== ROOM MANAGEMENT ==========
    
    socket.on('create-room', (data) => {
        const roomName = data.roomName || `room_${Date.now()}`;
        roomManager.createRoom(roomName);
        socket.emit('room-created', { roomId: roomName });
        console.log('🏠 Room created:', roomName, 'by user:', socket.id);
        
        // Update room list for all clients
        io.emit('rooms-updated', { rooms: roomManager.getAllRooms() });
    });
    
    socket.on('join-room', (data) => {
        const roomName = data.roomName;
        if (!roomName) {
            socket.emit('room-error', { message: 'Room name required' });
            return;
        }
        
        if (roomName !== currentRoomId) {
            // Leave current room
            socket.leave(currentRoomId);
            roomManager.removeUserFromRoom(socket.id, currentRoomId);
            socket.to(currentRoomId).emit('user-left', socket.id);
            
            // Join new room
            currentRoomId = roomName;
            room = roomManager.getRoom(currentRoomId);
            if (!room) {
                room = roomManager.createRoom(currentRoomId);
            }
            room = roomManager.addUserToRoom(socket.id, user, currentRoomId);
            socket.join(currentRoomId);
            
            // Send room history and users
            const drawingState = room.drawingState;
            const history = drawingState.getHistoryForUser();
            socket.emit('room-joined', {
                roomId: currentRoomId,
                history: history,
                users: roomManager.getRoomUsers(currentRoomId)
            });
            
            // Notify others in the new room
            socket.to(currentRoomId).emit('user-joined', user);
            console.log('🏠 User', socket.id, 'joined room:', currentRoomId);
            
            // Update room list
            io.emit('rooms-updated', { rooms: roomManager.getAllRooms() });
        }
    });
    
    // ========== SHAPE AND TEXT EVENTS ==========
    
    socket.on('shape-drawn', (data) => {
        socket.to(currentRoomId).emit('shape-drawn', { ...data, userId: socket.id });
        room.drawingState.addDrawingEvent({
            actionId: data.shapeId,
            userId: socket.id,
            type: 'shape',
            tool: data.tool,
            color: data.color,
            brushSize: data.brushSize,
            startPos: data.startPos,
            endPos: data.endPos
        });
    });
    
    socket.on('text-added', (data) => {
        socket.to(currentRoomId).emit('text-added', { ...data, userId: socket.id });
        room.drawingState.addDrawingEvent({
            actionId: data.textId,
            userId: socket.id,
            type: 'text',
            tool: 'text',
            color: data.color,
            brushSize: data.brushSize,
            text: data.text,
            pos: data.pos
        });
    });
    
    // ========== PING/PONG FOR LATENCY ==========
    
    socket.on('ping', (data) => {
        socket.emit('pong', { timestamp: data.timestamp });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
        
        // Clean up user's active strokes in the room
        const roomStrokes = getActiveStrokesForRoom(currentRoomId);
        for (const [strokeId, stroke] of roomStrokes) {
            if (stroke.userId === socket.id) {
                roomStrokes.delete(strokeId);
                console.log('🧹 Cleaned up active stroke:', strokeId);
            }
        }
        
        // Remove user from room
        roomManager.removeUserFromRoom(socket.id, currentRoomId);
        
        // Notify others in the room
        socket.to(currentRoomId).emit('user-left', socket.id);
        
        const room = roomManager.getRoom(currentRoomId);
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

// Vercel compatibility: Export handler for serverless functions
// Note: WebSockets won't work properly on Vercel due to serverless limitations
if (process.env.VERCEL || process.env.VERCEL_ENV) {
    // For Vercel serverless functions, export the Express app
    // Socket.io will not work properly due to serverless limitations
    // Static files and API routes will work, but WebSocket connections will fail
    module.exports = app;
} else {
    // Normal server mode (local development or traditional hosting)
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🎨 Open http://localhost:${PORT} in multiple browsers to test`);
        console.log(`📊 Monitor: http://localhost:${PORT}/api/stats`);
    });
}