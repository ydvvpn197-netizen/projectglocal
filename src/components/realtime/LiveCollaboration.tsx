import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, MessageSquare, Eye, Cursor, FileText, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedButton } from '@/design-system';
import { enhancedRealtimeService, CollaborationSession, TypingIndicator } from '@/services/EnhancedRealtimeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CollaborationUpdate {
  type: 'cursor' | 'typing' | 'selection' | 'presence';
  userId: string;
  position?: { x: number; y: number };
  selection?: { start: number; end: number };
  isTyping?: boolean;
}

interface LiveCollaborationProps {
  sessionId: string;
  documentId?: string;
  onDocumentChange?: (content: string) => void;
  className?: string;
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  cursorPosition?: { x: number; y: number };
  isTyping?: boolean;
  lastSeen: Date;
}

export const LiveCollaboration: React.FC<LiveCollaborationProps> = ({
  sessionId,
  documentId,
  onDocumentChange,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [documentContent, setDocumentContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
  }>>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  
  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const documentRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Initialize collaboration
  useEffect(() => {
    if (!user || !sessionId) return;

    const initializeCollaboration = async () => {
      try {
        // Join collaboration session
        await enhancedRealtimeService.joinCollaborationSession(sessionId, user.id);
        setIsConnected(true);

        // Set up collaboration updates
        const connection = await enhancedRealtimeService.subscribeToCollaboration(
          sessionId,
          user.id,
          (update) => {
            handleCollaborationUpdate(update);
          }
        );

        // Set up chat
        const chatConnection = await enhancedRealtimeService.subscribeToChat(
          sessionId,
          (message) => {
            setChatMessages(prev => [...prev, {
              id: message.id,
              userId: message.sender_id,
              userName: message.sender_name || 'Anonymous',
              message: message.content,
              timestamp: new Date(message.created_at)
            }]);
          },
          (typing) => {
            setTypingIndicators(prev => {
              const filtered = prev.filter(t => t.userId !== typing.userId);
              if (typing.isTyping) {
                return [...filtered, typing];
              }
              return filtered;
            });
          }
        );

        toast({
          title: "Connected",
          description: "You're now connected to the collaboration session",
        });

        return () => {
          enhancedRealtimeService.disconnect(connection.id);
          enhancedRealtimeService.disconnect(chatConnection.id);
        };
      } catch (error) {
        console.error('Error initializing collaboration:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to collaboration session",
          variant: "destructive",
        });
      }
    };

    initializeCollaboration();
  }, [user, sessionId, toast, handleCollaborationUpdate]);

  // Handle collaboration updates
  const handleCollaborationUpdate = useCallback((update: CollaborationUpdate) => {
    switch (update.type) {
      case 'cursor':
        setCollaborators(prev => prev.map(collab => 
          collab.id === update.userId 
            ? { ...collab, cursorPosition: update.position }
            : collab
        ));
        break;
      case 'document':
        if (update.documentId === documentId) {
          setDocumentContent(prev => {
            // Apply document changes
            const newContent = applyDocumentChange(prev, update);
            onDocumentChange?.(newContent);
            return newContent;
          });
        }
        break;
      case 'presence':
        // Handle user presence changes
        break;
    }
  }, [documentId, onDocumentChange]);

  // Apply document changes
  const applyDocumentChange = (content: string, change: any): string => {
    switch (change.type) {
      case 'insert':
        return content.slice(0, change.position) + change.content + content.slice(change.position);
      case 'delete':
        return content.slice(0, change.position) + content.slice(change.position + change.length);
      case 'format':
        // Handle formatting changes
        return content;
      default:
        return content;
    }
  };

  // Handle document content change
  const handleDocumentChange = useCallback((value: string) => {
    setDocumentContent(value);
    
    // Send document change
    if (documentId) {
      enhancedRealtimeService.sendDocumentChange(sessionId, documentId, {
        type: 'insert',
        position: value.length,
        content: value,
        userId: user!.id
      });
    }

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      enhancedRealtimeService.sendTypingIndicator(sessionId, user!.id, user!.display_name || 'User', true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      enhancedRealtimeService.sendTypingIndicator(sessionId, user!.id, user!.display_name || 'User', false);
    }, 1000);
  }, [sessionId, documentId, user, isTyping]);

  // Handle cursor movement
  const handleCursorMove = useCallback((event: React.MouseEvent) => {
    if (documentRef.current) {
      const rect = documentRef.current.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      enhancedRealtimeService.sendCursorPosition(sessionId, user!.id, position);
    }
  }, [sessionId, user]);

  // Send chat message
  const sendChatMessage = useCallback(async () => {
    if (!newChatMessage.trim() || !user) return;

    try {
      // In a real implementation, this would send to a chat service
      const message = {
        id: `${Date.now()}_${Math.random()}`,
        userId: user.id,
        userName: user.display_name || 'User',
        message: newChatMessage,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, message]);
      setNewChatMessage('');
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }, [newChatMessage, user]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Badge variant={isConnected ? 'success' : 'destructive'}>
              {collaborators.length} online
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Document Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Live Document</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={documentRef}
                value={documentContent}
                onChange={(e) => handleDocumentChange(e.target.value)}
                onMouseMove={handleCursorMove}
                placeholder="Start typing to collaborate in real-time..."
                className="min-h-[300px] resize-none"
              />
              
              {/* Typing Indicators */}
              {typingIndicators.length > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Typing:</span>
                  {typingIndicators.map((indicator) => (
                    <Badge key={indicator.userId} variant="secondary" className="text-xs">
                      {indicator.userName}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Collaborators</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback>
                        {collaborator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.isTyping ? 'Typing...' : 'Online'}
                      </p>
                    </div>
                    {collaborator.cursorPosition && (
                      <div className="flex items-center space-x-1">
                        <Cursor className="h-3 w-3 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(collaborator.cursorPosition.x)}, {Math.round(collaborator.cursorPosition.y)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Live Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat Messages */}
                <div 
                  ref={chatRef}
                  className="h-48 overflow-y-auto space-y-2 border rounded-md p-2"
                >
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {message.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{message.userName}</p>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <UnifiedButton
                    variant="primary"
                    size="sm"
                    onClick={sendChatMessage}
                    disabled={!newChatMessage.trim()}
                  >
                    Send
                  </UnifiedButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
