const DrawingState = require('./drawing-state');

class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.defaultRoomId = 'default';
        
        // Initialize default room
        this.createRoom(this.defaultRoomId);
    }

    createRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                drawingState: new DrawingState(),
                users: new Map()
            });
        }
        return this.rooms.get(roomId);
    }

    getRoom(roomId) {
        return this.rooms.get(roomId) || this.createRoom(roomId);
    }

    deleteRoom(roomId) {
        if (roomId !== this.defaultRoomId) {
            this.rooms.delete(roomId);
        }
    }

    getUserRoom(userId) {
        for (const [roomId, room] of this.rooms) {
            if (room.users.has(userId)) {
                return roomId;
            }
        }
        return null;
    }

    addUserToRoom(userId, userData, roomId = this.defaultRoomId) {
        const room = this.getRoom(roomId);
        room.users.set(userId, userData);
        return room;
    }

    removeUserFromRoom(userId, roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.users.delete(userId);
            
            // Delete empty rooms (except default)
            if (room.users.size === 0 && roomId !== this.defaultRoomId) {
                this.deleteRoom(roomId);
            }
        }
    }

    getRoomUsers(roomId) {
        const room = this.rooms.get(roomId);
        return room ? Array.from(room.users.values()) : [];
    }

    getAllRooms() {
        return Array.from(this.rooms.keys());
    }
}

module.exports = RoomManager;