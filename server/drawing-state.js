// Temporary fix - simple UUID generator
function generateSimpleId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

class DrawingState {
    constructor() {
        this.drawingHistory = [];
        this.undoStacks = new Map();
        this.redoStacks = new Map();
        this.MAX_HISTORY_SIZE = 1000;
        this.canvasSnapshot = null;
    }

    addDrawingEvent(event) {
        // Use provided actionId (strokeId) or generate one
        const actionId = event.actionId || generateSimpleId();
        
        const drawingEvent = {
            id: actionId, // Use actionId as the primary ID for easy lookup
            userId: event.userId,
            type: event.type || 'stroke',
            tool: event.tool,
            color: event.color,
            brushSize: event.brushSize,
            points: event.points || [],
            timestamp: event.timestamp || Date.now(),
            actionId: actionId
        };
        
        // Add shape-specific fields
        if (event.startPos && event.endPos) {
            drawingEvent.startPos = event.startPos;
            drawingEvent.endPos = event.endPos;
        }
        
        // Add text-specific fields
        if (event.text && event.pos) {
            drawingEvent.text = event.text;
            drawingEvent.pos = event.pos;
        }

        this.drawingHistory.push(drawingEvent);

        if (!this.undoStacks.has(event.userId)) {
            this.undoStacks.set(event.userId, []);
        }
        // Store actionId in undo stack (not the internal id)
        this.undoStacks.get(event.userId).push(actionId);

        // Clear redo stack when new action is performed
        if (this.redoStacks.has(event.userId)) {
            this.redoStacks.get(event.userId).length = 0;
        }

        if (this.drawingHistory.length > this.MAX_HISTORY_SIZE) {
            this.drawingHistory.shift();
            this.cleanupOrphanedActions();
        }

        return drawingEvent;
    }

    undo(userId) {
        const userUndoStack = this.undoStacks.get(userId);
        
        if (!userUndoStack || userUndoStack.length === 0) {
            return null;
        }

        const lastActionId = userUndoStack.pop();
        // Find by actionId (which is also the id)
        const actionIndex = this.drawingHistory.findIndex(event => 
            event.actionId === lastActionId || event.id === lastActionId
        );
        
        if (actionIndex === -1) {
            return null;
        }

        const undoneAction = this.drawingHistory[actionIndex];

        if (!this.redoStacks.has(userId)) {
            this.redoStacks.set(userId, []);
        }
        this.redoStacks.get(userId).push(lastActionId);

        return {
            actionId: lastActionId,
            userId: userId,
            action: undoneAction
        };
    }

    redo(userId) {
        const userRedoStack = this.redoStacks.get(userId);
        
        if (!userRedoStack || userRedoStack.length === 0) {
            return null;
        }

        const lastActionId = userRedoStack.pop();
        // Find by actionId (which is also the id)
        const actionIndex = this.drawingHistory.findIndex(event => 
            event.actionId === lastActionId || event.id === lastActionId
        );
        
        if (actionIndex === -1) {
            return null;
        }

        const redoneAction = this.drawingHistory[actionIndex];

        if (!this.undoStacks.has(userId)) {
            this.undoStacks.set(userId, []);
        }
        this.undoStacks.get(userId).push(lastActionId);

        return {
            actionId: lastActionId,
            userId: userId,
            action: redoneAction
        };
    }

    clearCanvas(clearedByUserId) {
        const clearEvent = {
            id: generateSimpleId(),
            userId: clearedByUserId,
            type: 'clear',
            timestamp: Date.now(),
            actionId: generateSimpleId()
        };

        this.drawingHistory.push(clearEvent);
        this.undoStacks.clear();
        this.redoStacks.clear();

        return clearEvent;
    }

    getHistoryForUser() {
        return this.drawingHistory.filter(event => event.type !== 'clear');
    }

    getEventsAfter(timestamp) {
        return this.drawingHistory.filter(event => event.timestamp > timestamp);
    }

    getUserStackSizes(userId) {
        return {
            undo: (this.undoStacks.get(userId) || []).length,
            redo: (this.redoStacks.get(userId) || []).length
        };
    }

    removeAction(actionId) {
        const actionIndex = this.drawingHistory.findIndex(event => event.id === actionId);
        
        if (actionIndex === -1) {
            return false;
        }

        this.drawingHistory.splice(actionIndex, 1)[0];
        
        this.undoStacks.forEach((stack, userId) => {
            this.undoStacks.set(userId, stack.filter(id => id !== actionId));
        });
        
        this.redoStacks.forEach((stack, userId) => {
            this.redoStacks.set(userId, stack.filter(id => id !== actionId));
        });

        return true;
    }

    cleanupOrphanedActions() {
        const validActionIds = new Set(this.drawingHistory.map(event => event.id));

        this.undoStacks.forEach((stack, userId) => {
            this.undoStacks.set(userId, stack.filter(id => validActionIds.has(id)));
        });

        this.redoStacks.forEach((stack, userId) => {
            this.redoStacks.set(userId, stack.filter(id => validActionIds.has(id)));
        });
    }

    getStats() {
        let totalUndoActions = 0;
        let totalRedoActions = 0;
        
        this.undoStacks.forEach(stack => totalUndoActions += stack.length);
        this.redoStacks.forEach(stack => totalRedoActions += stack.length);

        return {
            totalEvents: this.drawingHistory.length,
            totalUsersWithUndo: this.undoStacks.size,
            totalUndoActions,
            totalRedoActions
        };
    }

    batchAddEvents(events) {
        events.forEach(event => {
            this.addDrawingEvent(event);
        });
    }

    getUserActions(userId) {
        return this.drawingHistory.filter(event => event.userId === userId);
    }

    canUndo(userId) {
        const stack = this.undoStacks.get(userId);
        return stack && stack.length > 0;
    }

    canRedo(userId) {
        const stack = this.redoStacks.get(userId);
        return stack && stack.length > 0;
    }

    reset() {
        this.drawingHistory = [];
        this.undoStacks.clear();
        this.redoStacks.clear();
        this.canvasSnapshot = null;
    }
}

module.exports = DrawingState;