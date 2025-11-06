class DrawingCanvas {
    constructor(canvasId, cursorCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.cursorCanvas = document.getElementById(cursorCanvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cursorCtx = this.cursorCanvas.getContext('2d');
        
        this.isDrawing = false;
        this.currentStroke = null;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.userCursors = new Map();
        this.remoteStrokes = new Map();
        this.completedStrokes = []; // Store all completed strokes for undo/redo
        
        this.setupCanvas();
        this.setupEventListeners();
        
        console.log('🎨 Canvas initialized');
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = 600;
        this.cursorCanvas.width = rect.width;
        this.cursorCanvas.height = 600;

        // Set white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = this.currentColor;
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // Cursor tracking - track even when not drawing
        this.canvas.addEventListener('mousemove', this.trackCursor.bind(this));
        this.canvas.addEventListener('mouseenter', (e) => {
            const pos = this.getMousePos(e);
            if (pos) {
                this.trackCursor(e);
            }
        });
        
        // Update cursors periodically even if mouse isn't moving
        setInterval(() => {
            this.drawRemoteCursors();
        }, 100); // Update every 100ms
    }

    startDrawing(e) {
        e.preventDefault();
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        
        // Create new stroke with unique ID
        this.currentStroke = {
            id: 'stroke_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            tool: this.currentTool,
            color: this.currentColor,
            brushSize: this.brushSize,
            points: [pos],
            startTime: Date.now(),
            userId: window.drawingApp ? window.drawingApp.websocket.userId : 'unknown'
        };

        console.log('🎨 Starting stroke:', this.currentStroke.id);

        // Draw initial point
        this.drawPoint(pos);

        // Emit stroke start
        if (window.drawingApp) {
            window.drawingApp.emitStrokeStart(this.currentStroke);
        }
    }

    draw(e) {
        if (!this.isDrawing || !this.currentStroke) return;

        e.preventDefault();
        const pos = this.getMousePos(e);

        // Add point to current stroke
        this.currentStroke.points.push(pos);

        // Draw locally
        this.drawStrokeSegment([this.currentStroke.points[this.currentStroke.points.length - 2], pos]);

        // Emit stroke update (send every point for real-time sync)
        if (window.drawingApp) {
            window.drawingApp.emitStrokeUpdate({
                strokeId: this.currentStroke.id,
                points: [pos], // Send the new point
                timestamp: Date.now()
            });
        }
    }

    stopDrawing() {
        if (!this.isDrawing || !this.currentStroke) return;

        this.isDrawing = false;
        
        console.log('✅ Ending stroke:', this.currentStroke.id, 'Points:', this.currentStroke.points.length);

        // Add to completed strokes
        this.completedStrokes.push({...this.currentStroke});

        // Emit stroke end
        if (window.drawingApp) {
            window.drawingApp.emitStrokeEnd({
                strokeId: this.currentStroke.id,
                endTime: Date.now(),
                totalPoints: this.currentStroke.points.length
            });
        }

        this.currentStroke = null;
    }

    // ========== REMOTE STROKE HANDLING ==========

    handleRemoteStrokeStart(data) {
        console.log('📥 REMOTE stroke-start:', data.strokeId, 'from user:', data.userId, 'points:', data.points?.length || 0);
        
        // Get user color if available, otherwise use provided color
        const userColor = this.getUserColorFromId(data.userId) || data.color || '#000000';
        
        // Initialize remote stroke with all required properties
        const remoteStroke = {
            id: data.strokeId,
            strokeId: data.strokeId,
            userId: data.userId,
            tool: data.tool || 'brush',
            color: userColor,
            brushSize: data.brushSize || 5,
            points: data.points ? [...data.points].filter(p => p && typeof p.x === 'number' && typeof p.y === 'number') : [],
            lastDrawnIndex: 0
        };
        
        console.log('✅ Created remote stroke:', remoteStroke.id, 'with', remoteStroke.points.length, 'points');
        this.remoteStrokes.set(data.strokeId, remoteStroke);

        // Draw initial point(s) immediately
        if (remoteStroke.points && remoteStroke.points.length > 0) {
            console.log('🎨 Drawing initial points for stroke:', data.strokeId);
            if (remoteStroke.points.length === 1) {
                this.drawRemotePoint(data.strokeId, remoteStroke.points[0]);
            } else {
                // Draw the entire initial segment
                this.drawRemoteStrokeSegment(remoteStroke, remoteStroke.points);
            }
        } else {
            console.warn('⚠️ No points in remote stroke start:', data);
        }
        
        // Visual feedback - pulse effect
        this.showDrawingIndicator(data.userId);
        
        // Update cursor position if user is drawing
        const userData = this.userCursors.get(data.userId);
        if (remoteStroke.points.length > 0) {
            const lastPoint = remoteStroke.points[remoteStroke.points.length - 1];
            if (userData && lastPoint) {
                userData.cursor = { x: lastPoint.x, y: lastPoint.y };
                this.drawRemoteCursors();
            }
        }
    }

    handleRemoteStrokeUpdate(data) {
        console.log('📥 REMOTE stroke-update:', data.strokeId, 'points:', data.points ? data.points.length : 0, 'userId:', data.userId);
        
        let stroke = this.remoteStrokes.get(data.strokeId);
        if (!stroke) {
            console.log('⚠️ No stroke found for update, creating new one:', data.strokeId);
            // If stroke doesn't exist, create it - try to get user color
            const userColor = this.getUserColorFromId(data.userId) || '#000000';
            this.handleRemoteStrokeStart({
                strokeId: data.strokeId,
                userId: data.userId,
                tool: 'brush',
                color: userColor,
                brushSize: 5,
                points: data.points || []
            });
            stroke = this.remoteStrokes.get(data.strokeId);
            if (!stroke) {
                console.error('❌ Failed to create stroke:', data.strokeId);
                return;
            }
        }

        // Add new points
        if (data.points && Array.isArray(data.points) && data.points.length > 0) {
            // Ensure points array exists
            if (!stroke.points) {
                stroke.points = [];
            }
            
            // Filter out invalid points
            const validPoints = data.points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');
            
            if (validPoints.length > 0) {
                // Store the current length before adding new points
                const previousLength = stroke.points.length;
                
                // Add new points
                stroke.points.push(...validPoints);

                // Draw the new segments immediately - use only the new points for drawing
                // but we need to connect from the last existing point
                if (previousLength > 0) {
                    // We have existing points, draw from last existing to new points
                    const pointsToDraw = [stroke.points[previousLength - 1], ...validPoints];
                    this.drawRemoteStrokeSegment(stroke, pointsToDraw);
                } else {
                    // No existing points, just draw the new points
                    this.drawRemoteStrokeSegment(stroke, validPoints);
                }
                
                // Update cursor position
                const lastPoint = validPoints[validPoints.length - 1];
                const userData = this.userCursors.get(data.userId);
                if (userData && lastPoint) {
                    userData.cursor = { x: lastPoint.x, y: lastPoint.y };
                    this.drawRemoteCursors();
                }
            } else {
                console.warn('⚠️ No valid points in stroke update:', data);
            }
        } else {
            console.warn('⚠️ Invalid points data in stroke update:', data);
        }
    }
    
    getUserColorFromId(userId) {
        // Try to get user color from the user cursors map
        const userData = this.userCursors.get(userId);
        return userData ? userData.color : null;
    }

    handleRemoteStrokeEnd(data) {
        console.log('📥 REMOTE stroke-end:', data.strokeId);
        const stroke = this.remoteStrokes.get(data.strokeId);
        if (stroke) {
            // Add to completed strokes
            this.completedStrokes.push({...stroke});
            this.remoteStrokes.delete(data.strokeId);
        }
    }

    // ========== UNDO/REDO HANDLING ==========

    handleUndo(data) {
        console.log('↩️ Handling undo for stroke:', data.actionId);
        
        // Remove the stroke from completed strokes
        const strokeIndex = this.completedStrokes.findIndex(stroke => stroke.id === data.actionId);
        if (strokeIndex !== -1) {
            this.completedStrokes.splice(strokeIndex, 1);
        }
        
        // Remove from remote strokes if active
        this.remoteStrokes.delete(data.actionId);
        
        // Redraw entire canvas
        this.redrawCanvas();
    }

    handleRedo(data) {
        console.log('↪️ Handling redo for stroke:', data.actionId);
        
        // Check if stroke already exists
        const existingIndex = this.completedStrokes.findIndex(stroke => stroke.id === data.actionId);
        if (existingIndex === -1 && data.stroke) {
            // Add the stroke back to completed strokes
            this.completedStrokes.push({
                id: data.stroke.id,
                userId: data.stroke.userId,
                tool: data.stroke.tool,
                color: data.stroke.color,
                brushSize: data.stroke.brushSize,
                points: data.stroke.points || []
            });
        }
        
        // Redraw entire canvas
        this.redrawCanvas();
    }

    redrawCanvas() {
        console.log('🔄 Redrawing canvas...');
        
        // Clear canvas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw all completed strokes
        this.completedStrokes.forEach(stroke => {
            this.redrawStroke(stroke);
        });
        
        // Redraw active remote strokes
        this.remoteStrokes.forEach(stroke => {
            this.redrawStroke(stroke);
        });
    }

    redrawStroke(stroke) {
        if (!stroke.points || stroke.points.length < 2) return;
        
        this.ctx.save();
        
        if (stroke.tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = stroke.color;
        }

        this.ctx.lineWidth = stroke.brushSize;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        // Draw the entire stroke
        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
            this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }

    // ========== DRAWING METHODS ==========

    drawStrokeSegment(points) {
        if (points.length < 2) return;

        const from = points[0];
        const to = points[1];

        this.ctx.save();
        
        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        }

        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawPoint(point) {
        if (!point) return;

        this.ctx.save();
        
        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = this.currentColor;
        }

        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawRemotePoint(strokeId, point) {
        if (!point || point.x === undefined || point.y === undefined) return;

        const stroke = this.remoteStrokes.get(strokeId);
        if (!stroke) {
            // Try to draw with default values if stroke not found
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 5 / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            return;
        }

        this.ctx.save();
        
        if (stroke.tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = stroke.color || '#000000';
        }

        const brushSize = stroke.brushSize || 5;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawRemoteStrokeSegment(stroke, pointsToDraw) {
        if (!stroke || !pointsToDraw || pointsToDraw.length === 0) {
            console.warn('⚠️ drawRemoteStrokeSegment: Invalid input');
            return;
        }

        this.ctx.save();
        
        if (stroke.tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = stroke.color || '#000000';
        }

        this.ctx.lineWidth = stroke.brushSize || 5;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        // Draw segments connecting the points
        if (pointsToDraw.length >= 2) {
            this.ctx.beginPath();
            
            // Start from first point
            const firstPoint = pointsToDraw[0];
            if (firstPoint && typeof firstPoint.x === 'number' && typeof firstPoint.y === 'number') {
                this.ctx.moveTo(firstPoint.x, firstPoint.y);
                
                // Draw lines to all subsequent points
                for (let i = 1; i < pointsToDraw.length; i++) {
                    const point = pointsToDraw[i];
                    if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                        this.ctx.lineTo(point.x, point.y);
                    }
                }
                
                this.ctx.stroke();
            }
        } else if (pointsToDraw.length === 1) {
            // Draw a single point
            const point = pointsToDraw[0];
            if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                this.drawRemotePoint(stroke.id || stroke.strokeId || 'temp', point);
            }
        }

        this.ctx.restore();
    }

    // ========== UTILITY METHODS ==========

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    trackCursor(e) {
        const pos = this.getMousePos(e);
        if (window.drawingApp) {
            window.drawingApp.emitCursorMove(pos);
        }
        this.drawLocalCursor(pos);
    }

    drawLocalCursor(pos) {
        if (!pos || pos.x === undefined || pos.y === undefined) {
            // Just draw remote cursors if no local position
            this.drawRemoteCursors();
            return;
        }
        
        // Clear cursor canvas first
        this.cursorCtx.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);
        
        // Draw local cursor with preview
        this.cursorCtx.save();
        this.cursorCtx.fillStyle = this.currentColor;
        this.cursorCtx.globalAlpha = 0.5;
        this.cursorCtx.beginPath();
        const cursorSize = Math.max(3, this.brushSize / 2);
        this.cursorCtx.arc(pos.x, pos.y, cursorSize, 0, 2 * Math.PI);
        this.cursorCtx.fill();
        
        // Draw border
        this.cursorCtx.strokeStyle = this.currentColor;
        this.cursorCtx.lineWidth = 1;
        this.cursorCtx.globalAlpha = 0.8;
        this.cursorCtx.stroke();
        this.cursorCtx.restore();
        
        // Draw other users' cursors
        this.drawRemoteCursors();
    }

    drawRemoteCursors() {
        this.userCursors.forEach((user, userId) => {
            if (!user.cursor || user.cursor.x === undefined || user.cursor.y === undefined) return;
            
            this.cursorCtx.save();
            
            // Draw cursor circle with user's color
            this.cursorCtx.fillStyle = user.color || '#000000';
            this.cursorCtx.globalAlpha = 0.8;
            this.cursorCtx.beginPath();
            this.cursorCtx.arc(user.cursor.x, user.cursor.y, 8, 0, 2 * Math.PI);
            this.cursorCtx.fill();
            
            // Draw border
            this.cursorCtx.strokeStyle = '#fff';
            this.cursorCtx.lineWidth = 2;
            this.cursorCtx.stroke();
            
            // Draw user name with background
            const userName = `User ${userId.slice(-4)}`;
            const textMetrics = this.cursorCtx.measureText(userName);
            const textWidth = textMetrics.width;
            const textHeight = 14;
            
            // Background for text
            this.cursorCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.cursorCtx.fillRect(
                user.cursor.x + 12,
                user.cursor.y - 20,
                textWidth + 6,
                textHeight + 2
            );
            
            // Text
            this.cursorCtx.fillStyle = user.color || '#000000';
            this.cursorCtx.font = 'bold 11px Arial';
            this.cursorCtx.fillText(userName, user.cursor.x + 15, user.cursor.y - 8);
            
            this.cursorCtx.restore();
        });
    }

    updateUserCursor(userId, cursor, color) {
        if (!cursor || cursor.x === undefined || cursor.y === undefined) return;
        
        this.userCursors.set(userId, { cursor, color, lastUpdate: Date.now() });
        
        // Redraw cursors
        this.drawLocalCursor(this.getMousePos({clientX: 0, clientY: 0}));
        
        // Clean up old cursors (users who haven't moved in 5 seconds)
        const now = Date.now();
        for (const [uid, userData] of this.userCursors) {
            if (userData.lastUpdate && (now - userData.lastUpdate) > 5000) {
                this.userCursors.delete(uid);
            }
        }
    }
    
    showDrawingIndicator(userId) {
        // Visual feedback when someone starts drawing
        const userData = this.userCursors.get(userId);
        if (userData && userData.cursor) {
            // Create a temporary pulse effect
            const indicator = document.createElement('div');
            indicator.style.cssText = `
                position: absolute;
                left: ${userData.cursor.x}px;
                top: ${userData.cursor.y}px;
                width: 20px;
                height: 20px;
                border: 3px solid ${userData.color || '#000000'};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: pulse 0.6s ease-out;
                transform: translate(-50%, -50%);
            `;
            
            const container = this.canvas.parentElement;
            if (container) {
                container.style.position = 'relative';
                container.appendChild(indicator);
                
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 600);
            }
        }
    }

    removeUserCursor(userId) {
        this.userCursors.delete(userId);
        this.drawLocalCursor(this.getMousePos({clientX: 0, clientY: 0}));
    }

    clearCanvas() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.cursorCtx.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);
        this.remoteStrokes.clear();
        this.completedStrokes = [];
    }

    setTool(tool) {
        this.currentTool = tool;
        this.updateCursorDisplay();
    }

    setColor(color) {
        this.currentColor = color;
        this.updateCursorDisplay();
    }

    setBrushSize(size) {
        this.brushSize = parseInt(size);
        this.updateCursorDisplay();
    }

    updateCursorDisplay() {
        this.drawLocalCursor(this.getMousePos({clientX: 0, clientY: 0}));
    }

    getStats() {
        return {
            isDrawing: this.isDrawing,
            currentStroke: this.currentStroke ? this.currentStroke.points.length : 0,
            remoteStrokes: this.remoteStrokes.size,
            completedStrokes: this.completedStrokes.length,
            userCursors: this.userCursors.size
        };
    }
}