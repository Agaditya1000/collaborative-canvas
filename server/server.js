const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Store connected users and drawing state
const users = new Map();
const drawingHistory = [];
const MAX_HISTORY = 100;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Assign random color to user
    const userColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    const user = {
        id: socket.id,
        color: userColor,
        cursor: { x: 0, y: 0 }
    };
    users.set(socket.id, user);

    // Send current users and history to new user
    socket.emit('user-connected', {
        userId: socket.id,
        color: userColor,
        users: Array.from(users.values()),
        history: drawingHistory
    });

    // Notify other users
    socket.broadcast.emit('user-joined', user);

    // Handle drawing events
    socket.on('drawing-data', (data) => {
        const drawingEvent = {
            ...data,
            userId: socket.id,
            timestamp: Date.now()
        };

        // Add to history
        drawingHistory.push(drawingEvent);
        if (drawingHistory.length > MAX_HISTORY) {
            drawingHistory.shift();
        }

        // Broadcast to all other users
        socket.broadcast.emit('drawing-data', drawingEvent);
    });

    // Handle cursor movement
    socket.on('cursor-move', (cursor) => {
        user.cursor = cursor;
        socket.broadcast.emit('cursor-move', {
            userId: socket.id,
            cursor: cursor
        });
    });

    // Handle undo/redo
    socket.on('undo', (data) => {
        // Find last action by this user and remove it
        const lastIndex = drawingHistory.findLastIndex(
            event => event.userId === socket.id
        );
        
        if (lastIndex !== -1) {
            const removed = drawingHistory.splice(lastIndex, 1)[0];
            io.emit('undo-action', {
                userId: socket.id,
                actionId: removed.actionId
            });
        }
    });

    // Handle clear canvas
    socket.on('clear-canvas', () => {
        drawingHistory.length = 0;
        io.emit('canvas-cleared');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        users.delete(socket.id);
        io.emit('user-left', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in multiple browsers to test`);
});