// Application Configuration
// For hybrid deployment: Frontend on Vercel, Backend on Render
//
// IMPORTANT: After deploying to Render, update the Render URL below:
// Replace 'YOUR_RENDER_URL_HERE' with your actual Render server URL
// Example: 'https://collaborative-canvas-server.onrender.com'

const RENDER_SERVER_URL = 'YOUR_RENDER_URL_HERE'; // ⬅️ UPDATE THIS AFTER RENDER DEPLOYMENT

window.appConfig = {
    // Backend URL - Will be set from URL parameter, meta tag, or default to current origin
    backendUrl: RENDER_SERVER_URL !== 'YOUR_RENDER_URL_HERE' ? RENDER_SERVER_URL : '',
    
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

// Initialize backend URL from various sources
(function() {
    // Priority 1: URL parameter (for easy testing)
    const urlParams = new URLSearchParams(window.location.search);
    const serverUrl = urlParams.get('server');
    if (serverUrl) {
        window.appConfig.backendUrl = serverUrl;
        console.log('🔗 Using server URL from URL parameter:', serverUrl);
        return;
    }
    
    // Priority 2: Meta tag (set in index.html, can be injected by Vercel)
    const metaTag = document.querySelector('meta[name="server-url"]');
    if (metaTag && metaTag.content) {
        window.appConfig.backendUrl = metaTag.content;
        console.log('🔗 Using server URL from meta tag:', metaTag.content);
        return;
    }
    
    // Priority 3: Global variable (can be set via Vercel build script)
    if (window.__SERVER_URL__) {
        window.appConfig.backendUrl = window.__SERVER_URL__;
        console.log('🔗 Using server URL from global variable:', window.__SERVER_URL__);
        return;
    }
    
    // Priority 4: Local storage (for user preference)
    const savedUrl = localStorage.getItem('serverUrl');
    if (savedUrl && window.location.hostname.includes('vercel.app')) {
        window.appConfig.backendUrl = savedUrl;
        console.log('🔗 Using server URL from localStorage:', savedUrl);
        return;
    }
    
    // Default: Use current origin (for local development or same-domain deployment)
    window.appConfig.backendUrl = window.location.origin;
    
    // Warn if on Vercel without server URL configured
    if (window.location.hostname.includes('vercel.app')) {
        console.warn('⚠️ Vercel deployment detected. Render server URL not configured.');
        console.warn('💡 Option 1: Add ?server=https://your-render-url.onrender.com to the URL');
        console.warn('💡 Option 2: Add <meta name="server-url" content="https://your-render-url.onrender.com"> to index.html');
        console.warn('💡 Option 3: Set localStorage.setItem("serverUrl", "https://your-render-url.onrender.com") in browser console');
    }
})();

