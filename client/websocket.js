class DrawingWebSocket {
    constructor() {
        this.socket = null;
        this.userId = null;
        this.userColor = null;
        this.isConnected = false;
    }

    connect() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
        });

        this.socket.on('user-connected', (data) => {
            this.userId = data.userId;
            this.userColor = data.color;
            
            // Update UI
            this.updateUserInfo();
            this.updateUsersList(data.users);
            
            // Draw existing history
            data.history.forEach(event => {
                if (window.drawingCanvas) {
                    window.drawingCanvas.drawRemote(event);
                }
            });
        });

        this.socket.on('user-joined', (user) => {
            this.addUserToList(user);
        });

        this.socket.on('user-left', (userId) => {
            this.removeUserFromList(userId);
            if (window.drawingCanvas) {
                window.drawingCanvas.removeUserCursor(userId);
            }
        });

        this.socket.on('drawing-data', (data) => {
            if (window.drawingCanvas && data.userId !== this.userId) {
                window.drawingCanvas.drawRemote(data);
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

        this.socket.on('undo-action', (data) => {
            // Handle global undo - in a real implementation, 
            // you'd need to redraw the entire canvas from history
            console.log('Undo action received:', data);
        });

        this.socket.on('canvas-cleared', () => {
            if (window.drawingCanvas) {
                window.drawingCanvas.clearCanvas();
            }
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Disconnected from server');
        });
    }

    emitDrawingData(data) {
        if (this.isConnected) {
            this.socket.emit('drawing-data', data);
        }
    }

    emitCursorMove(cursor) {
        if (this.isConnected) {
            this.socket.emit('cursor-move', cursor);
        }
    }

    emitUndo() {
        if (this.isConnected) {
            this.socket.emit('undo');
        }
    }

    emitClearCanvas() {
        if (this.isConnected) {
            this.socket.emit('clear-canvas');
        }
    }

    updateUserInfo() {
        const userCount = document.getElementById('userCount');
        const userIdElement = document.getElementById('userId');
        
        if (userCount) {
            // Count will be updated when we get the users list
        }
        
        if (userIdElement) {
            userIdElement.textContent = `You: ${this.userId.slice(-6)}`;
            userIdElement.style.color = this.userColor;
        }
    }

    updateUsersList(users) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = '';
        users.forEach(user => {
            this.addUserToList(user);
        });

        // Update user count
        const userCount = document.getElementById('userCount');
        if (userCount) {
            userCount.textContent = `${users.length} users online`;
        }
    }

    addUserToList(user) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.id = `user-${user.id}`;
        
        userElement.innerHTML = `
            <div class="user-color" style="background-color: ${user.color}"></div>
            <span>User ${user.id.slice(-4)}</span>
        `;

        usersList.appendChild(userElement);
    }

    removeUserFromList(userId) {
        const userElement = document.getElementById(`user-${userId}`);
        if (userElement) {
            userElement.remove();
        }

        // Update user count
        const usersList = document.getElementById('usersList');
        if (usersList) {
            const userCount = document.getElementById('userCount');
            if (userCount) {
                const count = usersList.children.length;
                userCount.textContent = `${count} users online`;
            }
        }
    }

    getUserColor(userId) {
        // In a real app, you'd store user colors
        // For now, return a consistent color based on userId
        const userElement = document.getElementById(`user-${userId}`);
        if (userElement) {
            const colorElement = userElement.querySelector('.user-color');
            return colorElement.style.backgroundColor;
        }
        return '#000000';
    }
}