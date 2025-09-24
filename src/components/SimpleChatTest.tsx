import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, ArrowRight } from 'lucide-react';

export const SimpleChatTest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);

  const testDirectNavigation = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test chat navigation",
        variant: "destructive",
      });
      return;
    }

    setIsNavigating(true);
    
    try {
      // Test direct navigation to a known working conversation
      const conversationId = '9fd226c7-f2f3-48f9-b910-79b065fbdec9';
      
      toast({
        title: "Testing Navigation",
        description: `Navigating to chat: ${conversationId}`,
      });

      // Navigate to the chat
      navigate(`/chat/${conversationId}`);
      
    } catch (error) {
      console.error('Navigation test failed:', error);
      toast({
        title: "Navigation Failed",
        description: "Error during navigation test",
        variant: "destructive",
      });
    } finally {
      setIsNavigating(false);
    }
  };

  const testMessagesPage = () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test messages page",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Testing Messages Page",
      description: "Navigating to messages page",
    });

    navigate('/messages');
  };

  const testChatWithParameter = () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test chat with parameter",
        variant: "destructive",
      });
      return;
    }

    const conversationId = '9fd226c7-f2f3-48f9-b910-79b065fbdec9';
    
    toast({
      title: "Testing Chat with Parameter",
      description: `Navigating to messages with conversation: ${conversationId}`,
    });

    navigate(`/messages?conversation=${conversationId}`);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Simple Chat Test</CardTitle>
          <CardDescription>Please log in to test chat functionality</CardDescription>
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
            Simple Chat Test
          </CardTitle>
          <CardDescription>
            Test basic chat navigation and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testDirectNavigation} 
              disabled={isNavigating}
              className="flex items-center gap-2 h-20"
            >
              <MessageCircle className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Direct Chat</div>
                <div className="text-xs opacity-75">Navigate to /chat/{conversationId}</div>
              </div>
            </Button>
            
            <Button 
              onClick={testMessagesPage} 
              variant="outline"
              className="flex items-center gap-2 h-20"
            >
              <MessageCircle className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Messages Page</div>
                <div className="text-xs opacity-75">Navigate to /messages</div>
              </div>
            </Button>
            
            <Button 
              onClick={testChatWithParameter} 
              variant="outline"
              className="flex items-center gap-2 h-20"
            >
              <ArrowRight className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Messages with Param</div>
                <div className="text-xs opacity-75">Navigate to /messages?conversation=id</div>
              </div>
            </Button>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Test Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click "Direct Chat" to test direct navigation to a chat conversation</li>
              <li>2. Click "Messages Page" to test the messages page</li>
              <li>3. Click "Messages with Param" to test messages page with conversation parameter</li>
              <li>4. Check if the chat loads properly and you can see messages</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
