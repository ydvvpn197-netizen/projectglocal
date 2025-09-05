import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ChatService } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, MessageCircle, Clock } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  data?: any;
}

export const ChatFlowTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const tests: TestResult[] = [
    { test: 'User Authentication', status: 'pending' },
    { test: 'Chat Service Import', status: 'pending' },
    { test: 'Database Connection', status: 'pending' },
    { test: 'Get User Conversations', status: 'pending' },
    { test: 'Chat Permissions Check', status: 'pending' },
    { test: 'Conversation Creation', status: 'pending' },
    { test: 'Navigation Test', status: 'pending' },
  ];

  const updateTestResult = (testName: string, status: TestResult['status'], message?: string, data?: any) => {
    setTestResults(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message, data }
        : test
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    updateTestResult(testName, 'running');
    
    try {
      const result = await testFn();
      updateTestResult(testName, 'passed', `Success: ${JSON.stringify(result)}`, result);
      return result;
    } catch (error) {
      updateTestResult(testName, 'failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const runAllTests = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run chat flow tests",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setTestResults(tests);

    try {
      // Test 1: User Authentication
      await runTest('User Authentication', async () => {
        if (!user?.id) throw new Error('User not authenticated');
        return { userId: user.id, email: user.email };
      });

      // Test 2: Chat Service Import
      await runTest('Chat Service Import', async () => {
        if (!ChatService) throw new Error('ChatService not imported');
        return { serviceAvailable: true };
      });

      // Test 3: Database Connection
      await runTest('Database Connection', async () => {
        const { data, error } = await supabase
          .from('chat_conversations')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        return { connected: true };
      });

      // Test 4: Get User Conversations
      const conversations = await runTest('Get User Conversations', async () => {
        const result = await ChatService.getUserConversations(user.id);
        return { conversationCount: result.length, conversations: result };
      });

      // Test 5: Chat Permissions Check
      await runTest('Chat Permissions Check', async () => {
        // Test with a known artist ID
        const canChat = await ChatService.canUserChatWithArtist(user.id, '94d1529d-71c1-4179-b0a3-d0311b78a654');
        return { canChat, artistId: '94d1529d-71c1-4179-b0a3-d0311b78a654' };
      });

      // Test 6: Conversation Creation (if we have an accepted booking)
      await runTest('Conversation Creation', async () => {
        // Find an accepted booking for this user
        const { data: booking, error: bookingError } = await supabase
          .from('artist_bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .limit(1)
          .single();

        if (bookingError || !booking) {
          return { message: 'No accepted bookings found for testing', bookingId: null };
        }

        const conversationId = await ChatService.getOrCreateConversationForBooking(booking.id);
        return { conversationId, bookingId: booking.id };
      });

      // Test 7: Navigation Test
      await runTest('Navigation Test', async () => {
        // This test just verifies the navigation function exists
        return { navigationAvailable: true, navigateFunction: typeof navigate };
      });

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testChatNavigation = async () => {
    if (!user?.id) return;

    try {
      // Find an accepted booking for this user
      const { data: booking, error: bookingError } = await supabase
        .from('artist_bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .limit(1)
        .single();

      if (bookingError || !booking) {
        toast({
          title: "No Accepted Bookings",
          description: "You need an accepted booking to test chat navigation",
          variant: "destructive",
        });
        return;
      }

      const conversationId = await ChatService.getOrCreateConversationForBooking(booking.id);
      
      if (conversationId) {
        navigate(`/chat/${conversationId}`);
        toast({
          title: "Navigation Test",
          description: "Successfully navigated to chat!",
        });
      } else {
        toast({
          title: "Navigation Failed",
          description: "Could not create or find conversation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Navigation test failed:', error);
      toast({
        title: "Navigation Test Failed",
        description: "Error during navigation test",
        variant: "destructive",
      });
    }
  };

  const testDirectChatAccess = async () => {
    if (!user?.id) return;

    try {
      // Test direct access to a known conversation
      const conversationId = '9fd226c7-f2f3-48f9-b910-79b065fbdec9'; // Known test conversation
      
      // Check if user has access to this conversation
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`)
        .single();

      if (error || !conversation) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this conversation",
          variant: "destructive",
        });
        return;
      }

      navigate(`/chat/${conversationId}`);
      toast({
        title: "Direct Chat Access",
        description: "Successfully accessed chat conversation!",
      });
    } catch (error) {
      console.error('Direct chat access test failed:', error);
      toast({
        title: "Direct Chat Access Failed",
        description: "Error during direct chat access test",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat Flow Test</CardTitle>
          <CardDescription>Please log in to run chat flow tests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Flow Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of the chat system functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              onClick={testChatNavigation} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Test Chat Navigation
            </Button>
            
            <Button 
              onClick={testDirectChatAccess} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Test Direct Chat Access
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
