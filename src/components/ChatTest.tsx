import { useParams } from "react-router-dom";

export const ChatTest = () => {
  const { conversationId } = useParams();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chat Test Component</h1>
      <p>Conversation ID: {conversationId || 'No ID provided'}</p>
      <p>This component is working correctly!</p>
      <p>If you can see this, the routing is working.</p>
    </div>
  );
};
