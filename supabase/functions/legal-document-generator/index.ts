import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentGenerationRequest {
  documentType: string;
  formData: Record<string, unknown>;
  sessionId?: string;
  title: string;
}

interface DocumentGenerationResponse {
  success: boolean;
  document?: {
    id: string;
    title: string;
    content: string;
    document_type: string;
    status: string;
  };
  error?: string;
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

    const { documentType, formData, sessionId, title }: DocumentGenerationRequest = await req.json();

    if (!documentType || !formData || !title) {
      return new Response(
        JSON.stringify({ error: 'Document type, form data, and title are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate document content using AI
    let documentContent = '';
    try {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Create document-specific prompt
      const prompt = createDocumentPrompt(documentType, formData, title);

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
              content: 'You are a legal document generator. Create professional, legally-sound documents based on the provided information. Always include appropriate disclaimers that this is not legal advice and users should consult with qualified legal professionals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      documentContent = openaiData.choices[0]?.message?.content || '';

    } catch (error) {
      console.error('Error generating document:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate document content',
          details: error.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Save document to database
    const { data: document, error: documentError } = await supabase
      .from('legal_drafts')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        title,
        content: documentContent,
        document_type: documentType,
        status: 'draft',
        metadata: {
          form_data: formData,
          generated_at: new Date().toISOString(),
          model: 'gpt-3.5-turbo'
        }
      })
      .select()
      .single();

    if (documentError) {
      throw documentError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          document_type: document.document_type,
          status: document.status
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in legal document generator:', error);
    
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

function createDocumentPrompt(documentType: string, formData: Record<string, unknown>, title: string): string {
  const basePrompt = `Generate a professional ${documentType} document with the title "${title}". Use the following information to create the document:

Form Data:
${JSON.stringify(formData, null, 2)}

Please create a comprehensive, professional document that includes:
1. Proper legal language and structure
2. All relevant clauses and sections
3. Appropriate disclaimers
4. Professional formatting

IMPORTANT DISCLAIMER: Include a clear disclaimer that this document is for informational purposes only and is not legal advice. Users should consult with qualified legal professionals for specific legal matters.

Document Type: ${documentType}
Title: ${title}`;

  // Add document-specific instructions
  switch (documentType) {
    case 'rental_agreement':
      return basePrompt + `

This should be a residential rental agreement that includes:
- Property details and address
- Landlord and tenant information
- Rent amount and payment terms
- Lease duration and renewal terms
- Security deposit details
- Maintenance responsibilities
- Termination clauses
- Legal compliance requirements`;

    case 'employment_contract':
      return basePrompt + `

This should be an employment contract that includes:
- Job title and description
- Compensation and benefits
- Work schedule and location
- Probationary period
- Confidentiality and non-compete clauses
- Termination conditions
- Legal compliance requirements`;

    case 'nda':
      return basePrompt + `

This should be a non-disclosure agreement that includes:
- Parties involved
- Definition of confidential information
- Obligations and restrictions
- Duration and scope
- Exceptions to confidentiality
- Remedies for breach
- Legal compliance requirements`;

    case 'service_agreement':
      return basePrompt + `

This should be a service agreement that includes:
- Service description and scope
- Payment terms and schedule
- Timeline and deliverables
- Intellectual property rights
- Liability and indemnification
- Termination conditions
- Legal compliance requirements`;

    default:
      return basePrompt;
  }
}
