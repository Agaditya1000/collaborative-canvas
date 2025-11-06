class DrawingApp {
    constructor() {
        this.canvas = null;
        this.websocket = null;
        this.currentColor = '#000000';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCanvas();
            this.initializeWebSocket();
            this.setupEventHandlers();
            this.setupKeyboardShortcuts();
            this.setupColorSwatches();
            this.setupQuickActions();
        });
    }

    initializeCanvas() {
        this.canvas = new DrawingCanvas('drawingCanvas', 'cursorCanvas');
        window.drawingCanvas = this.canvas;
        
        // Add resize handler for responsive canvas
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.canvas.setupCanvas();
            }, 250);
        });
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
                const tool = e.target.dataset.tool || e.target.closest('[data-tool]').dataset.tool;
                this.setActiveTool(tool);
                this.canvas.setTool(tool);
                this.updateQuickActions(tool);
            });
        });

        // Color picker with preview
        const colorPicker = document.getElementById('colorPicker');
        const colorPreview = document.getElementById('colorPreview');
        const colorHex = document.getElementById('colorHex');
        
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.currentColor = e.target.value;
                this.canvas.setColor(this.currentColor);
                this.updateActiveColorSwatch(this.currentColor);
                
                // Update color preview
                if (colorPreview) {
                    colorPreview.style.backgroundColor = this.currentColor;
                    colorPreview.style.borderColor = this.currentColor;
                }
                
                // Update hex display
                if (colorHex) {
                    colorHex.textContent = this.currentColor.toUpperCase();
                }
                
                // Update brush tool color indicator
                const brushTool = document.querySelector('[data-tool="brush"]');
                if (brushTool) {
                    brushTool.style.borderLeftColor = this.currentColor;
                }
            });
            
            // Set initial color
            colorPicker.value = this.currentColor;
            if (colorPreview) {
                colorPreview.style.backgroundColor = this.currentColor;
            }
            if (colorHex) {
                colorHex.textContent = this.currentColor.toUpperCase();
            }
        }

        // Brush size with preview
        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        const sizePreview = document.getElementById('sizePreview');
        
        if (brushSize && brushSizeValue) {
            const updateSizePreview = (size) => {
                if (sizePreview) {
                    const previewSize = Math.max(20, Math.min(60, size * 1.5));
                    sizePreview.style.width = `${previewSize}px`;
                    sizePreview.style.height = `${previewSize}px`;
                    sizePreview.textContent = `${size}px`;
                    sizePreview.style.background = `radial-gradient(circle, ${this.currentColor} 0%, ${this.currentColor}dd 100%)`;
                }
            };
            
            brushSize.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                this.canvas.setBrushSize(size);
                brushSizeValue.textContent = `${size}px`;
                brushSizeValue.style.color = this.currentColor;
                brushSizeValue.style.fontWeight = 'bold';
                
                // Update size preview
                updateSizePreview(size);
                
                // Update slider background gradient
                const percentage = ((size - 1) / 49) * 100;
                e.target.style.background = `linear-gradient(to right, #3498db 0%, #3498db ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
            });
            
            // Set initial value
            brushSize.value = this.canvas.brushSize;
            brushSizeValue.textContent = `${this.canvas.brushSize}px`;
            updateSizePreview(this.canvas.brushSize);
            
            // Set initial slider gradient
            const initialPercentage = ((this.canvas.brushSize - 1) / 49) * 100;
            brushSize.style.background = `linear-gradient(to right, #3498db 0%, #3498db ${initialPercentage}%, #ddd ${initialPercentage}%, #ddd 100%)`;
        }

        // Clear canvas
        const clearCanvas = document.getElementById('clearCanvas');
        if (clearCanvas) {
            clearCanvas.addEventListener('click', () => {
                if (confirm('Clear the entire canvas for all users? This cannot be undone.')) {
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
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.websocket.emitRedo();
            });
        }

        // Canvas container hover effects
        const canvasContainer = document.getElementById('canvasContainer');
        if (canvasContainer) {
            canvasContainer.addEventListener('mouseenter', () => {
                canvasContainer.classList.add('drawing-active');
            });
            
            canvasContainer.addEventListener('mouseleave', () => {
                canvasContainer.classList.remove('drawing-active');
            });
        }
        
        // Close instructions button
        const closeInstructions = document.getElementById('closeInstructions');
        const instructions = document.getElementById('instructions');
        if (closeInstructions && instructions) {
            closeInstructions.addEventListener('click', () => {
                instructions.style.animation = 'slideOutLeft 0.3s ease-out';
                setTimeout(() => {
                    instructions.style.display = 'none';
                }, 300);
            });
        }
        
        // Auto-hide instructions after 10 seconds
        if (instructions) {
            setTimeout(() => {
                if (instructions.style.display !== 'none') {
                    instructions.style.opacity = '0.7';
                }
            }, 10000);
        }
        
        // Update drawing stats
        this.updateDrawingStats();
        setInterval(() => {
            this.updateDrawingStats();
        }, 2000);
    }

    setupQuickActions() {
        // Quick action buttons
        const quickBrush = document.getElementById('quickBrush');
        const quickEraser = document.getElementById('quickEraser');
        
        if (quickBrush) {
            quickBrush.addEventListener('click', () => {
                this.setActiveTool('brush');
                this.canvas.setTool('brush');
                this.updateQuickActions('brush');
            });
        }
        
        if (quickEraser) {
            quickEraser.addEventListener('click', () => {
                this.setActiveTool('eraser');
                this.canvas.setTool('eraser');
                this.updateQuickActions('eraser');
            });
        }
    }

    setupColorSwatches() {
        // Color swatch selection
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.currentColor = color;
                this.canvas.setColor(color);
                
                // Update color picker
                const colorPicker = document.getElementById('colorPicker');
                if (colorPicker) {
                    colorPicker.value = color;
                }
                
                this.updateActiveColorSwatch(color);
            });
        });
    }

    updateQuickActions(tool) {
        // Update quick action buttons
        const quickBrush = document.getElementById('quickBrush');
        const quickEraser = document.getElementById('quickEraser');
        
        if (quickBrush) {
            quickBrush.classList.toggle('active', tool === 'brush');
        }
        if (quickEraser) {
            quickEraser.classList.toggle('active', tool === 'eraser');
        }
    }

    updateActiveColorSwatch(color) {
        // Update active color swatch
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.toggle('active', swatch.dataset.color === color);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only process shortcuts if not typing in an input
            if (e.target.tagName === 'INPUT') return;

            // Ctrl+Z or Cmd+Z for Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.websocket.emitRedo(); // Ctrl+Shift+Z for Redo
                } else {
                    this.websocket.emitUndo(); // Ctrl+Z for Undo
                }
            }

            // Ctrl+Y for Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.websocket.emitRedo();
            }

            // Number keys for brush sizes (1-9: 5px to 45px)
            if (e.key >= '1' && e.key <= '9') {
                const size = parseInt(e.key) * 5;
                this.canvas.setBrushSize(size);
                const brushSize = document.getElementById('brushSize');
                const brushSizeValue = document.getElementById('brushSizeValue');
                if (brushSize && brushSizeValue) {
                    brushSize.value = size;
                    brushSizeValue.textContent = `${size}px`;
                }
            }

            // B for brush, E for eraser
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                this.setActiveTool('brush');
                this.canvas.setTool('brush');
                this.updateQuickActions('brush');
            }
            if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                this.setActiveTool('eraser');
                this.canvas.setTool('eraser');
                this.updateQuickActions('eraser');
            }
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
            
            // Add visual feedback
            activeTool.style.transform = 'scale(0.95)';
            setTimeout(() => {
                activeTool.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // Drawing emission methods
    emitStrokeStart(stroke) {
        this.websocket.emitStrokeStart(stroke);
    }

    emitStrokeUpdate(update) {
        this.websocket.emitStrokeUpdate(update);
    }

    emitStrokeEnd(endData) {
        this.websocket.emitStrokeEnd(endData);
    }

    emitCursorMove(cursor) {
        if (cursor && cursor.x !== undefined && cursor.y !== undefined) {
            this.websocket.emitCursorMove(cursor);
        }
    }

    updateDrawingStats() {
        const strokeCount = document.getElementById('strokeCount');
        const activeStrokes = document.getElementById('activeStrokes');
        
        if (this.canvas && strokeCount && activeStrokes) {
            const stats = this.canvas.getStats();
            strokeCount.textContent = stats.completedStrokes || 0;
            activeStrokes.textContent = stats.remoteStrokes || 0;
            
            // Add animation when stats change
            [strokeCount, activeStrokes].forEach(el => {
                el.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 200);
            });
        }
    }
    
    // Utility method to get app state
    getState() {
        return {
            canvas: this.canvas ? this.canvas.getState() : null,
            websocket: this.websocket ? this.websocket.getStatus() : null,
            currentColor: this.currentColor,
            currentTool: this.canvas ? this.canvas.currentTool : null
        };
    }
}

// Initialize the application
new DrawingApp();