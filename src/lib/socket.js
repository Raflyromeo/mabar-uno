import { io } from 'socket.io-client';

// Primary server (Railway) — set via VITE_SERVER_URL env variable
// Fallback server (Vercel) — set via VITE_SERVER_URL_FALLBACK env variable
const PRIMARY_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const FALLBACK_URL = import.meta.env.VITE_SERVER_URL_FALLBACK || 'https://mabar-uno-be.vercel.app';

// Use primary by default; can be swapped to fallback if primary fails
let activeServerUrl = PRIMARY_URL;

export const getActiveServerUrl = () => activeServerUrl;

export const socket = io(activeServerUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// If primary fails to connect after max attempts, try fallback
socket.on('reconnect_failed', () => {
  if (activeServerUrl === PRIMARY_URL && FALLBACK_URL !== PRIMARY_URL) {
    console.warn('[Socket] Primary server unreachable. Switching to fallback:', FALLBACK_URL);
    activeServerUrl = FALLBACK_URL;
    socket.io.uri = FALLBACK_URL;
    socket.io.opts.reconnectionAttempts = 5;
    socket.connect();
  }
});

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

