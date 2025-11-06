class DrawingCanvas {
    constructor(canvasId, cursorCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.cursorCanvas = document.getElementById(cursorCanvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cursorCtx = this.cursorCanvas.getContext('2d');
        
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.userCursors = new Map();
        
        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        // Set canvas dimensions
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = 600;
        this.cursorCanvas.width = rect.width;
        this.cursorCanvas.height = 600;

        // Set initial canvas style
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

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // Cursor tracking
        this.canvas.addEventListener('mousemove', this.trackCursor.bind(this));
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        [this.lastX, this.lastY] = [pos.x, pos.y];
        
        // Start new path
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }

    draw(e) {
        if (!this.isDrawing) return;

        e.preventDefault();
        const pos = this.getMousePos(e);
        const currentX = pos.x;
        const currentY = pos.y;

        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        }

        this.ctx.lineWidth = this.brushSize;
        
        // Draw line
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();

        // Emit drawing data
        if (window.drawingApp) {
            window.drawingApp.emitDrawingData({
                type: 'draw',
                tool: this.currentTool,
                color: this.currentColor,
                brushSize: this.brushSize,
                from: { x: this.lastX, y: this.lastY },
                to: { x: currentX, y: currentY },
                actionId: Date.now() + Math.random()
            });
        }

        [this.lastX, this.lastY] = [currentX, currentY];
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.closePath();
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    trackCursor(e) {
        const pos = this.getMousePos(e);
        if (window.drawingApp) {
            window.drawingApp.emitCursorMove(pos);
        }
    }

    // Method to draw remote user's strokes
    drawRemote(data) {
        this.ctx.save();
        
        if (data.tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = data.color;
        }

        this.ctx.lineWidth = data.brushSize;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(data.from.x, data.from.y);
        this.ctx.lineTo(data.to.x, data.to.y);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.restore();
    }

    // Update cursor display for other users
    updateUserCursor(userId, cursor, color) {
        this.userCursors.set(userId, { cursor, color });
        this.drawCursors();
    }

    drawCursors() {
        // Clear cursor canvas
        this.cursorCtx.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);
        
        // Draw all user cursors
        this.userCursors.forEach((user, userId) => {
            this.cursorCtx.save();
            this.cursorCtx.fillStyle = user.color;
            this.cursorCtx.beginPath();
            this.cursorCtx.arc(user.cursor.x, user.cursor.y, 5, 0, 2 * Math.PI);
            this.cursorCtx.fill();
            
            // Draw user name/ID
            this.cursorCtx.fillStyle = '#000';
            this.cursorCtx.font = '12px Arial';
            this.cursorCtx.fillText(`User ${userId.slice(-4)}`, user.cursor.x + 8, user.cursor.y - 8);
            this.cursorCtx.restore();
        });
    }

    removeUserCursor(userId) {
        this.userCursors.delete(userId);
        this.drawCursors();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    setColor(color) {
        this.currentColor = color;
    }

    setBrushSize(size) {
        this.brushSize = size;
    }
}