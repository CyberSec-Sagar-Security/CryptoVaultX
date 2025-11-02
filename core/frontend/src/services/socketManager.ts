/**
 * Socket Manager - WebSocket Connection for Real-time Dashboard Sync
 * Handles authentication, event listening, reconnection, and polling fallback
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
const POLLING_INTERVAL = 30000; // 30 seconds
const RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

export type SyncEventType = 
  | 'file_uploaded'
  | 'file_deleted'
  | 'file_shared'
  | 'file_unshared'
  | 'file_downloaded'
  | 'metadata_updated'
  | 'analytics_updated';

export interface SyncEventPayload {
  file_id?: string;
  file_ids?: string[];
  filename?: string;
  size_bytes?: number;
  content_type?: string;
  shared_with_user_ids?: number[];
  grantee_user_id?: number;
  grantee_username?: string;
  owner_id?: number;
  permission?: string;
  [key: string]: any;
}

export interface SyncEvent {
  event_id: string;
  type: SyncEventType;
  user_id: number;
  timestamp: string;
  payload: SyncEventPayload;
}

type EventHandler = (event: SyncEvent) => void;

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;
  private eventHandlers: Map<SyncEventType | 'any', EventHandler[]> = new Map();
  private pollingInterval: number | null = null;
  private lastSyncTimestamp: string | null = null;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private processedEventIds = new Set<string>();
  
  constructor() {
    // Load last sync timestamp from localStorage
    this.lastSyncTimestamp = localStorage.getItem('lastSyncTimestamp') || new Date().toISOString();
  }
  
  /**
   * Connect to WebSocket server with JWT authentication
   */
  connect(token: string): void {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      console.log('SocketManager: Already connecting or connected');
      return;
    }
    
    this.isConnecting = true;
    this.token = token;
    
    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_DELAY,
        timeout: 10000,
      });
      
      this.setupEventListeners();
      console.log('SocketManager: Connecting to WebSocket server...');
    } catch (error) {
      console.error('SocketManager: Failed to initialize socket:', error);
      this.isConnecting = false;
      this.startPolling();
    }
  }
  
  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('SocketManager: Connected to WebSocket server');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.stopPolling();
      
      // Fetch missed events since last connection
      this.fetchMissedEvents();
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('SocketManager: Disconnected from WebSocket server:', reason);
      
      // Start polling fallback if disconnected unexpectedly
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.startPolling();
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('SocketManager: Connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      // If max reconnect attempts reached, fallback to polling
      if (this.reconnectAttempts >= RECONNECT_ATTEMPTS) {
        console.log('SocketManager: Max reconnect attempts reached, falling back to polling');
        this.disconnect();
        this.startPolling();
      }
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`SocketManager: Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      this.fetchMissedEvents();
    });
    
    // Listen for sync events
    this.socket.on('sync_event', (event: SyncEvent) => {
      this.handleSyncEvent(event);
    });
    
    // Health check ping/pong
    this.socket.on('pong', (data) => {
      console.log('SocketManager: Received pong:', data);
    });
  }
  
  /**
   * Handle incoming sync event
   */
  private handleSyncEvent(event: SyncEvent): void {
    console.log('SocketManager: Received sync event:', event);
    
    // Deduplicate events
    if (this.processedEventIds.has(event.event_id)) {
      console.log('SocketManager: Skipping duplicate event:', event.event_id);
      return;
    }
    
    this.processedEventIds.add(event.event_id);
    
    // Update last sync timestamp
    this.lastSyncTimestamp = event.timestamp;
    localStorage.setItem('lastSyncTimestamp', event.timestamp);
    
    // Call event-specific handlers
    const specificHandlers = this.eventHandlers.get(event.type) || [];
    specificHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`SocketManager: Error in event handler for ${event.type}:`, error);
      }
    });
    
    // Call general 'any' handlers
    const anyHandlers = this.eventHandlers.get('any') || [];
    anyHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('SocketManager: Error in any event handler:', error);
      }
    });
    
    // Clean up old processed event IDs (keep only last 1000)
    if (this.processedEventIds.size > 1000) {
      const idsArray = Array.from(this.processedEventIds);
      this.processedEventIds = new Set(idsArray.slice(-1000));
    }
  }
  
  /**
   * Register event handler
   */
  on(eventType: SyncEventType | 'any', handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }
  
  /**
   * Unregister event handler
   */
  off(eventType: SyncEventType | 'any', handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.stopPolling();
    this.isConnecting = false;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
  
  /**
   * Start polling fallback
   */
  private startPolling(): void {
    if (this.pollingInterval) {
      return; // Already polling
    }
    
    console.log('SocketManager: Starting polling fallback');
    
    // Poll immediately
    this.pollForUpdates();
    
    // Then poll every 30 seconds
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, POLLING_INTERVAL);
  }
  
  /**
   * Stop polling fallback
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('SocketManager: Stopped polling fallback');
    }
  }
  
  /**
   * Poll for updates via HTTP
   */
  private async pollForUpdates(): Promise<void> {
    if (!this.token || !this.lastSyncTimestamp) {
      return;
    }
    
    try {
      const response = await fetch(
        `${SOCKET_URL}/api/sync/updates?since=${encodeURIComponent(this.lastSyncTimestamp)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.error('SocketManager: Polling failed:', response.statusText);
        return;
      }
      
      const data = await response.json();
      const events: SyncEvent[] = data.events || [];
      
      console.log(`SocketManager: Polled ${events.length} events`);
      
      // Process each event
      events.forEach(event => {
        this.handleSyncEvent(event);
      });
      
    } catch (error) {
      console.error('SocketManager: Polling error:', error);
    }
  }
  
  /**
   * Fetch events missed since last connection
   */
  private async fetchMissedEvents(): Promise<void> {
    if (!this.lastSyncTimestamp) {
      return;
    }
    
    console.log('SocketManager: Fetching missed events since', this.lastSyncTimestamp);
    await this.pollForUpdates();
  }
  
  /**
   * Send ping to server
   */
  ping(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ping');
    }
  }
}

// Global singleton instance
const socketManager = new SocketManager();

export default socketManager;
