class DrawingApp {
    constructor() {
        this.canvas = null;
        this.websocket = null;
        this.init();
    }

    init() {
        // Initialize components after DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCanvas();
            this.initializeWebSocket();
            this.setupEventHandlers();
        });
    }

    initializeCanvas() {
        this.canvas = new DrawingCanvas('drawingCanvas', 'cursorCanvas');
        window.drawingCanvas = this.canvas;
    }

    initializeWebSocket() {
        this.websocket = new DrawingWebSocket();
        this.websocket.connect();
        window.drawingApp = this;
    }

    setupEventHandlers() {
        // Tool selection
        document.querySelectorAll('.tool[data-tool]').forEach(button => {
            button.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.setActiveTool(tool);
                this.canvas.setTool(tool);
            });
        });

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.canvas.setColor(e.target.value);
            });
        }

        // Brush size
        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        if (brushSize && brushSizeValue) {
            brushSize.addEventListener('input', (e) => {
                const size = e.target.value;
                this.canvas.setBrushSize(size);
                brushSizeValue.textContent = `${size}px`;
            });
        }

        // Clear canvas
        const clearCanvas = document.getElementById('clearCanvas');
        if (clearCanvas) {
            clearCanvas.addEventListener('click', () => {
                if (confirm('Clear the entire canvas for all users?')) {
                    this.canvas.clearCanvas();
                    this.websocket.emitClearCanvas();
                }
            });
        }

        // Undo/Redo
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.websocket.emitUndo();
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.canvas.setupCanvas();
            }, 100);
        });
    }

    setActiveTool(tool) {
        // Remove active class from all tools
        document.querySelectorAll('.tool[data-tool]').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to selected tool
        const activeTool = document.querySelector(`[data-tool="${tool}"]`);
        if (activeTool) {
            activeTool.classList.add('active');
        }
    }

    emitDrawingData(data) {
        this.websocket.emitDrawingData(data);
    }

    emitCursorMove(cursor) {
        this.websocket.emitCursorMove(cursor);
    }
}

// Start the application
new DrawingApp();