/**
 * Socket.io Service
 * Handles real-time communication with the backend
 */
import { io } from 'socket.io-client';
import { toast } from 'sonner';

// Create socket instance
const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
  autoConnect: false
});

// Connect when user is authenticated
export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.auth = { userId };
    socket.connect();
    
    // Set up event listeners
    setupEventListeners();
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Setup event listeners for real-time notifications
const setupEventListeners = () => {
  // Listen for file view events
  socket.on('share:viewed', (data) => {
    const { shareId, viewerEmail, timestamp, fileName } = data;
    
    // Show toast notification
    toast.info(
      `Your file "${fileName || 'Unnamed file'}" was viewed by ${viewerEmail}`,
      {
        description: `Viewed at ${new Date(timestamp).toLocaleTimeString()}`,
        duration: 5000
      }
    );
  });
  
  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
};

export default {
  socket,
  connectSocket,
  disconnectSocket
};
