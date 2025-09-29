/**
 * Enhanced Real-time Service
 * Provides WebSocket connections, real-time notifications, and live collaboration features
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeConnection {
  id: string;
  type: 'notification' | 'chat' | 'collaboration' | 'analytics' | 'custom';
  channel: RealtimeChannel;
  isConnected: boolean;
  lastActivity: Date;
}

export interface RealtimeMessage {
  id: string;
  type: 'message' | 'notification' | 'update' | 'presence' | 'typing';
  payload: Record<string, unknown>;
  timestamp: Date;
  sender?: string;
  target?: string;
}

export interface CollaborationSession {
  id: string;
  participants: string[];
  documentId?: string;
  isActive: boolean;
  lastActivity: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export class EnhancedRealtimeService {
  private static instance: EnhancedRealtimeService;
  private connections: Map<string, RealtimeConnection> = new Map();
  private messageHandlers: Map<string, (message: RealtimeMessage) => void> = new Map();
  private collaborationSessions: Map<string, CollaborationSession> = new Map();
  private typingIndicators: Map<string, TypingIndicator> = new Map();
  private presenceUsers: Set<string> = new Set();

  static getInstance(): EnhancedRealtimeService {
    if (!EnhancedRealtimeService.instance) {
      EnhancedRealtimeService.instance = new EnhancedRealtimeService();
    }
    return EnhancedRealtimeService.instance;
  }

  /**
   * Create a real-time connection
   */
  async createConnection(
    id: string,
    type: RealtimeConnection['type'],
    config: {
      table?: string;
      event?: string;
      filter?: string;
      broadcast?: boolean;
      presence?: boolean;
    } = {}
  ): Promise<RealtimeConnection> {
    try {
      const channelName = `${type}_${id}`;
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: config.broadcast || false },
          presence: { key: config.presence ? id : undefined }
        }
      });

      // Set up event listeners
      if (config.table && config.event) {
        channel.on(
          'postgres_changes',
          {
            event: config.event as any,
            schema: 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            this.handleRealtimeMessage({
              id: `${Date.now()}_${Math.random()}`,
              type: 'update',
              payload,
              timestamp: new Date(),
              sender: payload.new?.user_id || payload.old?.user_id
            });
          }
        );
      }

      // Set up presence tracking
      if (config.presence) {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          this.presenceUsers.clear();
          Object.values(state).forEach((presences: Record<string, unknown>[]) => {
            presences.forEach((presence: Record<string, unknown>) => {
              this.presenceUsers.add(presence.user_id);
            });
          });
        });

        channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        });

        channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        });
      }

      // Subscribe to the channel
      const subscription = channel.subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
      });

      const connection: RealtimeConnection = {
        id,
        type,
        channel,
        isConnected: true,
        lastActivity: new Date()
      };

      this.connections.set(id, connection);
      return connection;
    } catch (error) {
      console.error('Error creating real-time connection:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notifications
   */
  async subscribeToNotifications(
    userId: string,
    onNotification: (notification: Record<string, unknown>) => void
  ): Promise<RealtimeConnection> {
    const connection = await this.createConnection(
      `notifications_${userId}`,
      'notification',
      {
        table: 'personal_notifications',
        event: '*',
        filter: `user_id=eq.${userId}`
      }
    );

    this.messageHandlers.set(connection.id, (message) => {
      if (message.type === 'update') {
        onNotification(message.payload);
      }
    });

    return connection;
  }

  /**
   * Subscribe to chat messages
   */
  async subscribeToChat(
    chatId: string,
    onMessage: (message: Record<string, unknown>) => void,
    onTyping?: (typing: TypingIndicator) => void
  ): Promise<RealtimeConnection> {
    const connection = await this.createConnection(
      `chat_${chatId}`,
      'chat',
      {
        table: 'chat_messages',
        event: 'INSERT',
        filter: `chat_room_id=eq.${chatId}`
      }
    );

    // Handle new messages
    this.messageHandlers.set(connection.id, (message) => {
      if (message.type === 'update') {
        onMessage(message.payload);
      }
    });

    // Set up typing indicators
    if (onTyping) {
      connection.channel.on('broadcast', { event: 'typing' }, (payload) => {
        const typingIndicator: TypingIndicator = {
          userId: payload.userId,
          userName: payload.userName,
          isTyping: payload.isTyping,
          timestamp: new Date()
        };
        onTyping(typingIndicator);
      });
    }

    return connection;
  }

  /**
   * Subscribe to collaboration sessions
   */
  async subscribeToCollaboration(
    sessionId: string,
    userId: string,
    onCollaborationUpdate: (update: Record<string, unknown>) => void
  ): Promise<RealtimeConnection> {
    const connection = await this.createConnection(
      `collaboration_${sessionId}`,
      'collaboration',
      {
        broadcast: true,
        presence: true
      }
    );

    // Track presence
    await connection.channel.track({
      user_id: userId,
      online_at: new Date().toISOString(),
      session_id: sessionId
    });

    // Handle collaboration updates
    connection.channel.on('broadcast', { event: 'collaboration_update' }, (payload) => {
      onCollaborationUpdate(payload);
    });

    // Handle cursor positions
    connection.channel.on('broadcast', { event: 'cursor_position' }, (payload) => {
      onCollaborationUpdate({
        type: 'cursor',
        ...payload
      });
    });

    // Handle document changes
    connection.channel.on('broadcast', { event: 'document_change' }, (payload) => {
      onCollaborationUpdate({
        type: 'document',
        ...payload
      });
    });

    this.messageHandlers.set(connection.id, (message) => {
      onCollaborationUpdate(message.payload);
    });

    return connection;
  }

  /**
   * Subscribe to analytics updates
   */
  async subscribeToAnalytics(
    analyticsType: 'community' | 'business' | 'events' | 'news',
    onAnalyticsUpdate: (analytics: Record<string, unknown>) => void
  ): Promise<RealtimeConnection> {
    const connection = await this.createConnection(
      `analytics_${analyticsType}`,
      'analytics',
      {
        table: `${analyticsType}_analytics`,
        event: '*'
      }
    );

    this.messageHandlers.set(connection.id, (message) => {
      if (message.type === 'update') {
        onAnalyticsUpdate(message.payload);
      }
    });

    return connection;
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    chatId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    const connection = this.connections.get(`chat_${chatId}`);
    if (connection) {
      await connection.channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId,
          userName,
          isTyping,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Send collaboration update
   */
  async sendCollaborationUpdate(
    sessionId: string,
    update: {
      type: 'cursor' | 'document' | 'selection';
      data: Record<string, unknown>;
      userId: string;
    }
  ): Promise<void> {
    const connection = this.connections.get(`collaboration_${sessionId}`);
    if (connection) {
      await connection.channel.send({
        type: 'broadcast',
        event: 'collaboration_update',
        payload: {
          ...update,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Send cursor position
   */
  async sendCursorPosition(
    sessionId: string,
    userId: string,
    position: { x: number; y: number }
  ): Promise<void> {
    const connection = this.connections.get(`collaboration_${sessionId}`);
    if (connection) {
      await connection.channel.send({
        type: 'broadcast',
        event: 'cursor_position',
        payload: {
          userId,
          position,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Send document change
   */
  async sendDocumentChange(
    sessionId: string,
    documentId: string,
    change: {
      type: 'insert' | 'delete' | 'format';
      position: number;
      content?: string;
      userId: string;
    }
  ): Promise<void> {
    const connection = this.connections.get(`collaboration_${sessionId}`);
    if (connection) {
      await connection.channel.send({
        type: 'broadcast',
        event: 'document_change',
        payload: {
          documentId,
          ...change,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Create collaboration session
   */
  async createCollaborationSession(
    sessionId: string,
    participants: string[],
    documentId?: string
  ): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: sessionId,
      participants,
      documentId,
      isActive: true,
      lastActivity: new Date()
    };

    this.collaborationSessions.set(sessionId, session);
    return session;
  }

  /**
   * Join collaboration session
   */
  async joinCollaborationSession(
    sessionId: string,
    userId: string
  ): Promise<RealtimeConnection> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
    }

    return this.subscribeToCollaboration(sessionId, userId, (update) => {
      console.log('Collaboration update:', update);
    });
  }

  /**
   * Leave collaboration session
   */
  async leaveCollaborationSession(sessionId: string, userId: string): Promise<void> {
    const connection = this.connections.get(`collaboration_${sessionId}`);
    if (connection) {
      await connection.channel.untrack();
      await this.disconnect(connection.id);
    }

    const session = this.collaborationSessions.get(sessionId);
    if (session) {
      session.participants = session.participants.filter(id => id !== userId);
      if (session.participants.length === 0) {
        session.isActive = false;
      }
    }
  }

  /**
   * Get active connections
   */
  getActiveConnections(): RealtimeConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.isConnected);
  }

  /**
   * Get collaboration sessions
   */
  getCollaborationSessions(): CollaborationSession[] {
    return Array.from(this.collaborationSessions.values()).filter(session => session.isActive);
  }

  /**
   * Get online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.presenceUsers);
  }

  /**
   * Disconnect a specific connection
   */
  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      await connection.channel.unsubscribe();
      connection.isConnected = false;
      this.connections.delete(connectionId);
      this.messageHandlers.delete(connectionId);
    }
  }

  /**
   * Disconnect all connections
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.keys()).map(id => this.disconnect(id));
    await Promise.all(disconnectPromises);
  }

  /**
   * Handle real-time messages
   */
  private handleRealtimeMessage(message: RealtimeMessage): void {
    const handler = this.messageHandlers.get(message.id);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Clean up inactive connections
   */
  cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [id, connection] of this.connections) {
      if (now.getTime() - connection.lastActivity.getTime() > inactiveThreshold) {
        this.disconnect(id);
      }
    }
  }
}

export const enhancedRealtimeService = EnhancedRealtimeService.getInstance();
