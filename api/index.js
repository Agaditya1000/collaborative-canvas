// Vercel serverless function entry point
// This file imports and exports the Express app from server/server.js

const path = require('path');

// Set Vercel environment variable so server.js knows it's running on Vercel
process.env.VERCEL = '1';

// Import the server (which exports the app when VERCEL is set)
const app = require('../server/server.js');

// Export for Vercel
module.exports = app;

