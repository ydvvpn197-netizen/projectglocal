import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ChatService } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, MessageCircle, AlertCircle } from 'lucide-react';

export const ChatDebugTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugTest = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run debug test",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const debugData: Record<string, unknown> = {};

    try {
      // Step 1: Get user's accepted bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('artist_bookings')
        .select(`
          *,
          chat_conversations!artist_bookings_id_fkey(id as chat_id)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      debugData.bookings = bookings;
      debugData.bookingsError = bookingsError;

      if (bookingsError || !bookings || bookings.length === 0) {
        debugData.error = 'No accepted bookings found';
        setDebugInfo(debugData);
        setIsLoading(false);
        return;
      }

      // Step 2: Test the first accepted booking
      const testBooking = bookings[0];
      debugData.testBooking = testBooking;

      // Step 3: Test ChatService.getOrCreateConversationForBooking
      const conversationId = await ChatService.getOrCreateConversationForBooking(testBooking.id);
      debugData.conversationId = conversationId;

      // Step 4: Test conversation access
      if (conversationId) {
        const { data: conversation, error: convError } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        debugData.conversation = conversation;
        debugData.conversationError = convError;

        // Step 5: Test messages in conversation
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        debugData.messages = messages;
        debugData.messagesError = messagesError;
      }

      // Step 6: Test navigation
      debugData.navigationTest = {
        canNavigate: !!conversationId,
        targetUrl: conversationId ? `/chat/${conversationId}` : null
      };

    } catch (error) {
      debugData.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(debugData);
    setIsLoading(false);
  };

  const testNavigation = () => {
    if (debugInfo?.conversationId) {
      navigate(`/chat/${debugInfo.conversationId}`);
      toast({
        title: "Navigation Test",
        description: "Attempting to navigate to chat...",
      });
    }
  };

  const testDirectChat = () => {
    // Test direct navigation to a known conversation
    const knownConversationId = '9fd226c7-f2f3-48f9-b910-79b065fbdec9';
    navigate(`/chat/${knownConversationId}`);
    toast({
      title: "Direct Chat Test",
      description: "Attempting direct navigation to known conversation...",
    });
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat Debug Test</CardTitle>
          <CardDescription>Please log in to run debug test</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Chat Debug Test
          </CardTitle>
          <CardDescription>
            Comprehensive debugging of the chat system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDebugTest} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {isLoading ? 'Running Debug...' : 'Run Debug Test'}
            </Button>
            
            {debugInfo?.conversationId && (
              <Button 
                onClick={testNavigation} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Test Navigation
              </Button>
            )}
            
            <Button 
              onClick={testDirectChat} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Test Direct Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugInfo.error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-800">Error:</span>
                  </div>
                  <p className="text-red-700 mt-1">{debugInfo.error}</p>
                </div>
              )}

              {debugInfo.bookings && (
                <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-800">Accepted Bookings:</span>
                  </div>
                  <p className="text-blue-700 mt-1">
                    Found {debugInfo.bookings.length} accepted booking(s)
                  </p>
                  {(debugInfo as { bookings: unknown[] }).bookings.map((booking: unknown, index: number) => (
                    <div key={index} className="mt-2 p-2 bg-white rounded border">
                      <p className="text-sm"><strong>ID:</strong> {booking.id}</p>
                      <p className="text-sm"><strong>Event:</strong> {booking.event_description}</p>
                      <p className="text-sm"><strong>Chat ID:</strong> {booking.chat_id || 'None'}</p>
                    </div>
                  ))}
                </div>
              )}

              {debugInfo.conversationId && (
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-800">Conversation ID:</span>
                  </div>
                  <p className="text-green-700 mt-1 font-mono">{debugInfo.conversationId}</p>
                </div>
              )}

              {debugInfo.conversation && (
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-800">Conversation Details:</span>
                  </div>
                  <div className="text-green-700 mt-1 space-y-1">
                    <p><strong>Status:</strong> {debugInfo.conversation.status}</p>
                    <p><strong>Client ID:</strong> {debugInfo.conversation.client_id}</p>
                    <p><strong>Artist ID:</strong> {debugInfo.conversation.artist_id}</p>
                    <p><strong>Created:</strong> {new Date(debugInfo.conversation.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {debugInfo.messages && (
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-800">Messages:</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    Found {debugInfo.messages.length} message(s)
                  </p>
                  {(debugInfo as { messages: unknown[] }).messages.map((message: unknown, index: number) => (
                    <div key={index} className="mt-2 p-2 bg-white rounded border">
                      <p className="text-sm"><strong>From:</strong> {message.sender_id}</p>
                      <p className="text-sm"><strong>Message:</strong> {message.message}</p>
                      <p className="text-sm"><strong>Time:</strong> {new Date(message.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {debugInfo.navigationTest && (
                <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-purple-800">Navigation Test:</span>
                  </div>
                  <div className="text-purple-700 mt-1">
                    <p><strong>Can Navigate:</strong> {debugInfo.navigationTest.canNavigate ? 'Yes' : 'No'}</p>
                    {debugInfo.navigationTest.targetUrl && (
                      <p><strong>Target URL:</strong> {debugInfo.navigationTest.targetUrl}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
