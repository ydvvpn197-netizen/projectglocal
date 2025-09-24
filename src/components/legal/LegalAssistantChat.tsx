import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  MessageSquare, 
  FileText, 
  Download, 
  Trash2, 
  Plus,
  Loader2,
  AlertTriangle,
  Shield,
  Clock
} from 'lucide-react';
import { legalAssistantService, LegalChatSession, LegalChatMessage } from '@/services/legalAssistantService';
import { toast } from 'sonner';

interface LegalAssistantChatProps {
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export const LegalAssistantChat: React.FC<LegalAssistantChatProps> = ({ 
  sessionId, 
  onSessionChange 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat sessions
  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ['legal-chat-sessions'],
    queryFn: () => legalAssistantService.getChatSessions(),
  });

  // Fetch messages for current session
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['legal-chat-messages', sessionId],
    queryFn: () => sessionId ? legalAssistantService.getChatMessages(sessionId) : Promise.resolve([]),
    enabled: !!sessionId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      legalAssistantService.sendMessage(sessionId, content),
    onSuccess: () => {
      refetchMessages();
      refetchSessions();
      setMessage('');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    },
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: (sessionName: string) => legalAssistantService.createChatSession(sessionName),
    onSuccess: (newSession) => {
      setShowNewSessionDialog(false);
      setNewSessionName('');
      refetchSessions();
      if (onSessionChange) {
        onSessionChange(newSession.id);
      }
      toast.success('New chat session created');
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast.error('Failed to create chat session');
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => legalAssistantService.deleteChatSession(sessionId),
    onSuccess: () => {
      refetchSessions();
      if (onSessionChange) {
        onSessionChange('');
      }
      toast.success('Chat session deleted');
    },
    onError: (error) => {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete chat session');
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;

    setIsLoading(true);
    try {
      await sendMessageMutation.mutateAsync({ sessionId, content: message.trim() });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = () => {
    if (!newSessionName.trim()) return;
    createSessionMutation.mutate(newSessionName.trim());
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-full">
      {/* Sessions Sidebar */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Legal Assistant</h3>
            <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Chat Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Session Name</label>
                    <Input
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Enter session name..."
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateSession}
                    disabled={!newSessionName.trim() || createSessionMutation.isPending}
                    className="w-full"
                  >
                    {createSessionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Your conversations are private and secure</span>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-2 space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-colors ${
                  sessionId === session.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => onSessionChange?.(session.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{session.session_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(session.updated_at)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {sessionId ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.message_type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.message_type === 'assistant' && (
                          <Badge variant="secondary" className="text-xs">
                            AI Assistant
                          </Badge>
                        )}
                        <span className="text-xs opacity-70">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      {msg.metadata?.disclaimer && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <strong>Disclaimer:</strong>
                          </div>
                          <p className="mt-1">{msg.metadata.disclaimer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask your legal question..."
                  className="min-h-[60px] resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  size="icon"
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Welcome to Legal Assistant</h3>
              <p className="text-muted-foreground">
                Get professional legal guidance and document assistance. 
                Start a new conversation or select an existing session.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>All conversations are private and secure</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
