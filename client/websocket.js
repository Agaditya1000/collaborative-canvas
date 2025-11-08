class DrawingWebSocket {
    constructor() {
        this.socket = null;
        this.userId = null;
        this.userColor = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.connectionTimeout = null;
        
        // Remove batch processing - it's causing the real-time sync issue
        this.lastEmitTime = 0;
        this.EMIT_THROTTLE = 8; // ~120fps for smooth real-time
        
        // Room management
        this.currentRoom = 'default';
        
        // Latency tracking
        this.latency = 0;
        this.pingInterval = null;
    }

    connect() {
        try {
            // Use config if available, otherwise use defaults
            let backendUrl = (window.appConfig && window.appConfig.backendUrl) || window.location.origin;
            
            // If backendUrl is empty, use current origin
            if (!backendUrl) {
                backendUrl = window.location.origin;
            }
            
            const socketOptions = (window.appConfig && window.appConfig.socketOptions) || {
                transports: ['websocket', 'polling'],
                upgrade: true,
                forceNew: false,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                autoConnect: true
            };
            
            console.log('🔗 Connecting to server:', backendUrl);
            this.socket = io(backendUrl, socketOptions);

            this.setupEventHandlers();
            
            // Connection timeout
            this.connectionTimeout = setTimeout(() => {
                if (!this.isConnected) {
                    this.showNotification('Connection timeout. Please check your network.', 'error');
                }
            }, 10000);

        } catch (error) {
            console.error('❌ Failed to initialize socket:', error);
            this.showNotification('Failed to connect to server', 'error');
        }
    }

    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to server, Socket ID:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.startLatencyTracking();
            clearTimeout(this.connectionTimeout);
            this.showNotification('Connected to collaborative canvas!', 'success');
            this.updateConnectionStatus(true);
            
            // Initialize rooms list
            this.updateRoomsList();
        });

        this.socket.on('user-connected', (data) => {
            this.userId = data.userId;
            this.userColor = data.color;
            this.updateUserInfo();
            this.updateUsersList(data.users);
            
            console.log('👤 User initialized:', this.userId);
            console.log('📥 Received history:', data.history ? data.history.length : 0, 'strokes');
            console.log('👥 Connected users:', data.users ? data.users.length : 0);
            
            // Store user colors for cursor display
            if (data.users && window.drawingCanvas) {
                data.users.forEach(user => {
                    if (user.id && user.color) {
                        window.drawingCanvas.userCursors.set(user.id, {
                            cursor: user.cursor || { x: 0, y: 0 },
                            color: user.color,
                            lastUpdate: Date.now()
                        });
                    }
                });
            }
            
            // Draw existing history
            if (data.history && window.drawingCanvas) {
                this.loadHistory(data.history);
            }
        });

        this.socket.on('user-joined', (user) => {
            this.addUserToList(user);
            this.showNotification(`🎨 ${user.name} joined the canvas`, 'info');
            console.log('👥 User joined:', user.name);
            
            // Initialize cursor for new user
            if (window.drawingCanvas && user.id && user.color) {
                window.drawingCanvas.userCursors.set(user.id, {
                    cursor: user.cursor || { x: 0, y: 0 },
                    color: user.color,
                    lastUpdate: Date.now()
                });
            }
        });

        this.socket.on('user-left', (userId) => {
            const userName = this.getUserName(userId);
            this.removeUserFromList(userId);
            if (window.drawingCanvas) {
                window.drawingCanvas.removeUserCursor(userId);
            }
            this.showNotification(`👋 ${userName} left the canvas`, 'info');
            console.log('👋 User left:', userName);
        });

        // REAL-TIME STROKE EVENTS - CRITICAL FOR SYNC
        this.socket.on('stroke-start', (data) => {
            console.log('📥 REMOTE stroke-start:', data.strokeId, 'from:', data.userId);
            if (window.drawingCanvas && data.userId !== this.userId) {
                window.drawingCanvas.handleRemoteStrokeStart(data);
            }
        });

        this.socket.on('stroke-update', (data) => {
            console.log('📥 REMOTE stroke-update:', data.strokeId, 'points:', data.points ? data.points.length : 0);
            if (window.drawingCanvas && data.userId !== this.userId) {
                window.drawingCanvas.handleRemoteStrokeUpdate(data);
            }
        });

        this.socket.on('stroke-end', (data) => {
            console.log('📥 REMOTE stroke-end:', data.strokeId);
            if (window.drawingCanvas && data.userId !== this.userId) {
                window.drawingCanvas.handleRemoteStrokeEnd(data);
            }
        });

        this.socket.on('cursor-move', (data) => {
            if (window.drawingCanvas && data.userId !== this.userId) {
                window.drawingCanvas.updateUserCursor(
                    data.userId, 
                    data.cursor, 
                    this.getUserColor(data.userId)
                );
            }
        });

        // Undo/Redo events
        this.socket.on('undo-action', (data) => {
            if (window.drawingCanvas) {
                window.drawingCanvas.handleUndo(data);
                const userName = this.getUserName(data.userId);
                this.showNotification(`↩️ ${userName} undid an action`, 'info');
            }
        });

        this.socket.on('redo-action', (data) => {
            if (window.drawingCanvas) {
                window.drawingCanvas.handleRedo(data);
                const userName = this.getUserName(data.userId);
                this.showNotification(`↪️ ${userName} redid an action`, 'info');
            }
        });

        // Handle undo/redo state updates
        this.socket.on('undo-redo-state', (stackSizes) => {
            this.updateUndoRedoStates(stackSizes);
        });
        
        // ========== ROOM EVENTS ==========
        
        this.socket.on('room-created', (data) => {
            console.log('✅ Room created:', data.roomId);
            this.showNotification(`Room "${data.roomId}" created!`, 'success');
            this.updateRoomsList();
        });
        
        this.socket.on('room-joined', (data) => {
            console.log('✅ Joined room:', data.roomId);
            this.currentRoom = data.roomId;
            this.showNotification(`Joined room "${data.roomId}"`, 'success');
            
            // Update current room display
            const currentRoomElement = document.getElementById('currentRoom');
            if (currentRoomElement) {
                currentRoomElement.textContent = data.roomId;
            }
            
            // Clear canvas and load room history
            if (window.drawingCanvas) {
                window.drawingCanvas.completedStrokes = [];
                window.drawingCanvas.remoteStrokes.clear();
                
                // Load history
                if (data.history && Array.isArray(data.history)) {
                    data.history.forEach(event => {
                        if (event.type === 'stroke' && event.points && event.points.length > 0) {
                            window.drawingCanvas.completedStrokes.push({
                                id: event.actionId || event.id,
                                tool: event.tool || 'brush',
                                color: event.color || '#000000',
                                brushSize: event.brushSize || 5,
                                points: event.points,
                                userId: event.userId
                            });
                        } else if (event.type === 'shape') {
                            window.drawingCanvas.completedStrokes.push({
                                id: event.actionId || event.id,
                                tool: event.tool,
                                color: event.color || '#000000',
                                brushSize: event.brushSize || 5,
                                startPos: event.startPos,
                                endPos: event.endPos
                            });
                        } else if (event.type === 'text') {
                            window.drawingCanvas.completedStrokes.push({
                                id: event.actionId || event.id,
                                tool: 'text',
                                text: event.text,
                                color: event.color || '#000000',
                                brushSize: event.brushSize || 5,
                                pos: event.pos
                            });
                        }
                    });
                    window.drawingCanvas.redrawCanvas();
                }
            }
            
            // Update user list
            if (data.users) {
                this.updateUsersList(data.users);
            }
            
            this.updateRoomsList();
        });
        
        this.socket.on('room-error', (data) => {
            console.error('❌ Room error:', data.message);
            this.showNotification(`Room error: ${data.message}`, 'error');
        });
        
        this.socket.on('rooms-updated', (data) => {
            if (data && data.rooms) {
                this.updateRoomsList(data.rooms);
            }
        });
        
        // Handle remote shapes and text
        this.socket.on('shape-drawn', (data) => {
            if (window.drawingCanvas && data.userId !== this.userId) {
                const shape = {
                    id: data.shapeId,
                    tool: data.tool,
                    color: data.color,
                    brushSize: data.brushSize,
                    startPos: data.startPos,
                    endPos: data.endPos,
                    userId: data.userId
                };
                window.drawingCanvas.completedStrokes.push(shape);
                window.drawingCanvas.redrawCanvas();
            }
        });
        
        this.socket.on('text-added', (data) => {
            if (window.drawingCanvas && data.userId !== this.userId) {
                const textObj = {
                    id: data.textId,
                    tool: 'text',
                    text: data.text,
                    color: data.color,
                    brushSize: data.brushSize,
                    pos: data.pos,
                    userId: data.userId
                };
                window.drawingCanvas.completedStrokes.push(textObj);
                window.drawingCanvas.redrawCanvas();
            }
        });

        this.socket.on('canvas-cleared', (data) => {
            if (window.drawingCanvas) {
                window.drawingCanvas.clearCanvas();
            }
            const userName = this.getUserName(data.clearedBy);
            this.showNotification(`🗑️ Canvas cleared by ${userName}`, 'info');
        });

        // Connection management
        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log('🔌 Disconnected:', reason);
            this.updateConnectionStatus(false);
            
            if (reason === 'io server disconnect') {
                this.showNotification('🔒 Disconnected by server', 'error');
            } else {
                this.showNotification('📡 Connection lost - reconnecting...', 'warning');
            }
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            console.log('🔄 Reconnection attempt:', attempt);
            this.showNotification(`🔄 Reconnecting... (${attempt}/${this.maxReconnectAttempts})`, 'warning');
        });

        this.socket.on('reconnect_failed', () => {
            this.showNotification('❌ Failed to reconnect. Please refresh the page.', 'error');
            this.updateConnectionStatus(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error);
            this.showNotification('🌐 Connection error - check your network', 'error');
            this.updateConnectionStatus(false);
        });
    }

    // SIMPLIFIED emission methods - NO BATCHING for real-time sync
    emitStrokeStart(stroke) {
        if (this.isConnected) {
            console.log('📤 LOCAL stroke-start:', stroke.id);
            this.socket.emit('stroke-start', {
                strokeId: stroke.id,
                tool: stroke.tool,
                color: stroke.color,
                brushSize: stroke.brushSize,
                points: stroke.points,
                timestamp: Date.now(),
                userId: this.userId
            });
        } else {
            console.warn('⚠️ Not connected, cannot emit stroke start');
            this.showNotification('Not connected to server', 'warning');
        }
    }

    emitStrokeUpdate(update) {
        if (this.isConnected) {
            const currentTime = Date.now();
            
            // Simple throttling for performance
            if (currentTime - this.lastEmitTime > this.EMIT_THROTTLE) {
                console.log('📤 LOCAL stroke-update:', update.strokeId, 'points:', update.points.length);
                this.socket.emit('stroke-update', {
                    strokeId: update.strokeId,
                    points: update.points,
                    timestamp: currentTime,
                    userId: this.userId
                });
                this.lastEmitTime = currentTime;
            }
        }
    }

    emitStrokeEnd(endData) {
        if (this.isConnected) {
            console.log('📤 LOCAL stroke-end:', endData.strokeId);
            this.socket.emit('stroke-end', {
                strokeId: endData.strokeId,
                endTime: Date.now(),
                totalPoints: endData.totalPoints,
                userId: this.userId
            });
        }
    }

    emitCursorMove(cursor) {
        if (this.isConnected && cursor) {
            // Throttle cursor updates to avoid spam (update every 50ms)
            const now = Date.now();
            if (!this.lastCursorEmit || (now - this.lastCursorEmit) > 50) {
                this.socket.emit('cursor-move', cursor);
                this.lastCursorEmit = now;
            }
        }
    }

    emitUndo() {
        if (this.isConnected) {
            this.socket.emit('undo');
        } else {
            this.showNotification('Not connected to server', 'warning');
        }
    }

    emitRedo() {
        if (this.isConnected) {
            this.socket.emit('redo');
        } else {
            this.showNotification('Not connected to server', 'warning');
        }
    }

    emitClearCanvas() {
        if (this.isConnected) {
            if (confirm('Are you sure you want to clear the canvas for all users? This cannot be undone.')) {
                this.socket.emit('clear-canvas');
                this.showNotification('Clearing canvas...', 'info');
            }
        } else {
            this.showNotification('Not connected to server', 'warning');
        }
    }

    // UI Updates
    updateUndoRedoStates(stackSizes) {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            const canUndo = stackSizes && stackSizes.undo > 0;
            undoBtn.disabled = !canUndo;
            undoBtn.title = `Undo (${stackSizes?.undo || 0} available)`;
            undoBtn.style.opacity = canUndo ? '1' : '0.5';
        }

        if (redoBtn) {
            const canRedo = stackSizes && stackSizes.redo > 0;
            redoBtn.disabled = !canRedo;
            redoBtn.title = `Redo (${stackSizes?.redo || 0} available)`;
            redoBtn.style.opacity = canRedo ? '1' : '0.5';
        }
    }

    updateConnectionStatus(connected) {
        let statusElement = document.getElementById('connectionStatus');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'connectionStatus';
            statusElement.style.cssText = `
                position: fixed;
                bottom: 10px;
                left: 10px;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10000;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                border: 2px solid transparent;
            `;
            document.body.appendChild(statusElement);
        }

        if (connected) {
            statusElement.innerHTML = '🟢 Connected';
            statusElement.style.background = 'rgba(76, 175, 80, 0.9)';
            statusElement.style.color = 'white';
            statusElement.style.borderColor = '#4CAF50';
        } else {
            statusElement.innerHTML = '🔴 Disconnected';
            statusElement.style.background = 'rgba(244, 67, 54, 0.9)';
            statusElement.style.color = 'white';
            statusElement.style.borderColor = '#f44336';
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💡'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">${icons[type] || '💡'}</span>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background: ${this.getNotificationColor(type)};
            color: white;
            border-radius: 10px;
            z-index: 10000;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            animation: slideInRight 0.4s ease;
            max-width: 350px;
            word-wrap: break-word;
            border-left: 4px solid ${this.getNotificationBorderColor(type)};
        `;

        document.body.appendChild(notification);

        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }

    getNotificationBorderColor(type) {
        const colors = {
            success: '#2E7D32',
            error: '#C62828',
            warning: '#EF6C00',
            info: '#1565C0'
        };
        return colors[type] || colors.info;
    }

    loadHistory(history) {
        if (!history || !history.length) {
            console.log('📥 No history to load');
            return;
        }

        console.log('📥 Loading history:', history.length, 'strokes');
        
        if (!window.drawingCanvas) {
            console.warn('⚠️ Canvas not initialized, cannot load history');
            return;
        }
        
        // Load each stroke directly as completed strokes (not as active)
        history.forEach((stroke, index) => {
            setTimeout(() => {
                // Convert history format to canvas format
                const completedStroke = {
                    id: stroke.actionId || stroke.id,
                    userId: stroke.userId,
                    tool: stroke.tool || 'brush',
                    color: stroke.color || '#000000',
                    brushSize: stroke.brushSize || 5,
                    points: stroke.points || []
                };
                
                // Add to completed strokes and draw
                if (completedStroke.points && completedStroke.points.length > 0) {
                    window.drawingCanvas.completedStrokes.push(completedStroke);
                    window.drawingCanvas.redrawStroke(completedStroke);
                }
            }, index * 5); // Faster loading
        });
    }

    // User management methods
    getUserName(userId) {
        if (userId === this.userId) return 'You';
        const userElement = document.getElementById(`user-${userId}`);
        return userElement ? userElement.textContent.replace('(You)', '').trim() : `User ${userId.slice(-4)}`;
    }

    updateUserInfo() {
        const userCount = document.getElementById('userCount');
        const userIdElement = document.getElementById('userId');
        
        if (userIdElement) {
            userIdElement.textContent = `You: ${this.userId.slice(-6)}`;
            userIdElement.style.color = this.userColor;
            userIdElement.style.fontWeight = 'bold';
        }
        
        if (userCount) {
            // Will be updated when users list is populated
        }
    }

    updateUsersList(users) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = '';
        users.forEach(user => {
            this.addUserToList(user);
        });

        this.updateUserCount();
    }

    addUserToList(user) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.id = `user-${user.id}`;
        
        userElement.innerHTML = `
            <div class="user-color" style="background-color: ${user.color}; border: 2px solid ${user.color === '#ffffff' ? '#ccc' : user.color}"></div>
            <span>${user.name || `User ${user.id.slice(-4)}`}</span>
            ${user.id === this.userId ? '<small>(You)</small>' : ''}
        `;

        // Highlight current user
        if (user.id === this.userId) {
            userElement.style.backgroundColor = '#f0f8ff';
            userElement.style.fontWeight = 'bold';
        }

        usersList.appendChild(userElement);
    }

    removeUserFromList(userId) {
        const userElement = document.getElementById(`user-${userId}`);
        if (userElement) {
            userElement.remove();
        }
        this.updateUserCount();
    }

    updateUserCount() {
        const usersList = document.getElementById('usersList');
        const userCount = document.getElementById('userCount');
        if (usersList && userCount) {
            const count = usersList.children.length;
            userCount.textContent = `${count} user${count !== 1 ? 's' : ''} online`;
        }
    }

    getUserColor(userId) {
        // First try to get from canvas userCursors (most up-to-date)
        if (window.drawingCanvas) {
            const userData = window.drawingCanvas.userCursors.get(userId);
            if (userData && userData.color) {
                return userData.color;
            }
        }
        
        // Fallback to DOM element
        const userElement = document.getElementById(`user-${userId}`);
        if (userElement) {
            const colorElement = userElement.querySelector('.user-color');
            if (colorElement) {
                return colorElement.style.backgroundColor || colorElement.getAttribute('data-color');
            }
        }
        
        // Default fallback
        return '#000000';
    }

    handleRemoteDrawing(event) {
        if (window.drawingCanvas && event.userId !== this.userId) {
            console.log('📥 Loading history stroke:', event.id);
            // Handle different event types
            if (event.type === 'stroke' || event.type === 'stroke-start') {
                window.drawingCanvas.handleRemoteStrokeStart(event);
            } else if (event.type === 'draw' && event.points) {
                // Convert legacy format
                window.drawingCanvas.handleRemoteStrokeStart({
                    strokeId: event.actionId || event.id,
                    tool: event.tool,
                    color: event.color,
                    brushSize: event.brushSize,
                    points: event.points,
                    userId: event.userId
                });
            }
        }
    }

    getStatus() {
        return {
            connected: this.isConnected,
            userId: this.userId,
            color: this.userColor,
            socketId: this.socket?.id
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.showNotification('Disconnected from server', 'info');
        }
    }

    reconnect() {
        if (this.socket) {
            this.socket.connect();
        }
    }
    
    // ========== ROOM LIST MANAGEMENT ==========
    
    updateRoomsList(rooms) {
        const roomsList = document.getElementById('roomsList');
        if (!roomsList) return;
        
        // Clear existing rooms
        roomsList.innerHTML = '';
        
        // Add default room
        const defaultRoomItem = document.createElement('div');
        defaultRoomItem.className = 'room-item' + (this.currentRoom === 'default' ? ' active' : '');
        defaultRoomItem.setAttribute('data-room', 'default');
        defaultRoomItem.innerHTML = `
            <span>Default Room</span>
            <span class="room-users">?</span>
        `;
        defaultRoomItem.addEventListener('click', () => {
            this.joinRoom('default');
        });
        roomsList.appendChild(defaultRoomItem);
        
        // Add other rooms
        if (rooms && Array.isArray(rooms)) {
            rooms.forEach(roomId => {
                if (roomId !== 'default') {
                    const roomItem = document.createElement('div');
                    roomItem.className = 'room-item' + (this.currentRoom === roomId ? ' active' : '');
                    roomItem.setAttribute('data-room', roomId);
                    roomItem.innerHTML = `
                        <span>${roomId}</span>
                        <span class="room-users">?</span>
                    `;
                    roomItem.addEventListener('click', () => {
                        this.joinRoom(roomId);
                    });
                    roomsList.appendChild(roomItem);
                }
            });
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .user-item {
        transition: all 0.3s ease;
    }
    
    .user-item:hover {
        background-color: #f5f5f5;
        transform: translateX(5px);
    }
`;
document.head.appendChild(style);