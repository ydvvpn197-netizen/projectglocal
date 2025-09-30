/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedChat.tsx instead.
 * Category: chat
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "@/components/MessageComposer";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  
  // Debug logging
  console.log("Chat component: conversationId =", conversationId);
  console.log("Chat component: location =", window.location.href);
  
  const { loading, conversation, messages, sendMessage, isOwnMessage } = useChat(conversationId);


  // If conversationId is not provided, show error
  if (!conversationId) {
    return (
      <ResponsiveLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Chat</h1>
            <p className="text-gray-600 mb-4">No conversation ID provided</p>
            <Button onClick={() => navigate('/messages')}>Go to Messages</Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="text-sm text-gray-500">
            Chat ID: {conversationId}
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={conversation?.other_user?.avatar_url} />
                <AvatarFallback>{conversation?.other_user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {conversation?.other_user?.display_name || 'Loading...'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {conversation?.created_at ? `Started ${format(new Date(conversation.created_at), 'PPp')}` : 'Loading conversation...'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[50vh] overflow-y-auto space-y-3 p-2 bg-muted/30 rounded-md">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !conversation ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">Conversation not found</p>
                    <Button onClick={() => navigate('/messages')}>Go to Messages</Button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${isOwnMessage(m.sender_id) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${isOwnMessage(m.sender_id) ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                      <div className="whitespace-pre-wrap">{m.message}</div>
                      <div className={`mt-1 text-[10px] ${isOwnMessage(m.sender_id) ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(m.created_at), 'PPp')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Allow initiator to send while pending; recipient will see prompt to accept */}
            {conversation && (conversation.status === 'active' || conversation.status === 'pending') ? (
              <div className="mt-4">
                <MessageComposer onSubmit={sendMessage} placeholder="Send a message..." />
              </div>
            ) : conversation ? (
              <div className="mt-4 text-sm text-muted-foreground">
                {conversation.status === 'pending' ? (
                  <div>
                    This conversation is pending. Go to Messages to accept or decline.
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => navigate('/messages')}>Open Messages</Button>
                  </div>
                ) : (
                  <div>This conversation is closed.</div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default Chat;


