// Application Configuration
// Deployed on Render - both client and server

window.appConfig = {
    // Backend URL - defaults to current origin (same domain on Render)
    backendUrl: window.location.origin,
    
    // Socket.io options
    socketOptions: {
        transports: ['websocket', 'polling'],
        upgrade: true,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
    }
};

// Backend URL is set to current origin (same domain on Render)
// This means client and server are on the same domain, so WebSocket connections work perfectly
console.log('🔗 Connecting to server:', window.appConfig.backendUrl);

