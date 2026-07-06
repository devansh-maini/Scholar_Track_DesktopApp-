// Minimal, safe bridge. The renderer talks to the backend over HTTP/WebSocket only.
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('scholartrack', { platform: process.platform, isDesktop: true });
