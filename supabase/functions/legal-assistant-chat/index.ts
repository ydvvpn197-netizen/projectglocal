import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LegalChatRequest {
  sessionId: string;
  message: string;
  messageType: 'user' | 'assistant';
}

interface LegalChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  response?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { sessionId, message, messageType }: LegalChatRequest = await req.json();

    if (!sessionId || !message || !messageType) {
      return new Response(
        JSON.stringify({ error: 'Session ID, message, and message type are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('legal_chat_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Save user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from('legal_chat_messages')
      .insert({
        session_id: sessionId,
        message_type: 'user',
        content: message,
        metadata: { timestamp: new Date().toISOString() }
      })
      .select()
      .single();

    if (userMessageError) {
      throw userMessageError;
    }

    // Generate AI response if this is a user message
    let aiResponse = '';
    if (messageType === 'user') {
      try {
        // Get OpenAI API key
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
          throw new Error('OpenAI API key not configured');
        }

        // Get conversation history for context
        const { data: history } = await supabase
          .from('legal_chat_messages')
          .select('message_type, content')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(10);

        // Build conversation context
        const conversationContext = history?.map(msg => 
          `${msg.message_type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n') || '';

        const prompt = `You are a helpful legal assistant. Please provide accurate, helpful legal information based on the user's question. Always include appropriate disclaimers that this is not legal advice and users should consult with qualified legal professionals for specific legal matters.

Conversation History:
${conversationContext}

User Question: ${message}

Please provide a helpful response with appropriate legal disclaimers.`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful legal assistant. Always include disclaimers that this is not legal advice.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        aiResponse = openaiData.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

        // Save AI response
        const { data: aiMessage, error: aiMessageError } = await supabase
          .from('legal_chat_messages')
          .insert({
            session_id: sessionId,
            message_type: 'assistant',
            content: aiResponse,
            metadata: { 
              timestamp: new Date().toISOString(),
              model: 'gpt-3.5-turbo',
              tokens_used: openaiData.usage?.total_tokens || 0
            }
          })
          .select()
          .single();

        if (aiMessageError) {
          console.error('Error saving AI message:', aiMessageError);
        }

      } catch (error) {
        console.error('Error generating AI response:', error);
        aiResponse = 'I apologize, but I encountered an error while processing your request. Please try again later.';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message processed successfully',
        response: aiResponse,
        userMessage: userMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in legal assistant chat:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
