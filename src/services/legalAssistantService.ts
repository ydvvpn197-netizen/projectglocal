/**
 * AI Legal Assistant Service
 * Provides legal advice, document generation, and chat functionality
 */

import { supabase } from '@/integrations/supabase/client';

export interface LegalQuestion {
  id: string;
  userId: string;
  question: string;
  category: 'contract' | 'property' | 'employment' | 'family' | 'criminal' | 'business' | 'other';
  context?: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface LegalResponse {
  id: string;
  questionId: string;
  answer: string;
  sources: string[];
  disclaimers: string[];
  confidence: number;
  createdAt: string;
}

export interface LegalDocument {
  id: string;
  userId: string;
  title: string;
  type: 'rental_agreement' | 'contract' | 'will' | 'power_of_attorney' | 'other';
  content: string;
  status: 'draft' | 'review' | 'final' | 'generated';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    sources?: string[];
    confidence?: number;
    disclaimers?: string[];
  };
}

export class LegalAssistantService {
  private static instance: LegalAssistantService;
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  static getInstance(): LegalAssistantService {
    if (!LegalAssistantService.instance) {
      LegalAssistantService.instance = new LegalAssistantService();
    }
    return LegalAssistantService.instance;
  }

  /**
   * Submit a legal question for AI analysis
   */
  async submitQuestion(question: string, category: string, context?: string): Promise<LegalQuestion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('legal_questions')
      .insert({
        user_id: user.id,
        question,
        category,
        context,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Process the question asynchronously
    this.processQuestion(data.id).catch(console.error);

    return data;
  }

  /**
   * Process a legal question using AI
   */
  private async processQuestion(questionId: string): Promise<void> {
    try {
      // Update status to processing
      await supabase
        .from('legal_questions')
        .update({ status: 'processing' })
        .eq('id', questionId);

      // Get the question
      const { data: question, error: questionError } = await supabase
        .from('legal_questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (questionError || !question) throw questionError;

      // Generate AI response
      const response = await this.generateLegalResponse(question);

      // Save the response
      await supabase
        .from('legal_responses')
        .insert({
          question_id: questionId,
          answer: response.answer,
          sources: response.sources,
          disclaimers: response.disclaimers,
          confidence: response.confidence
        });

      // Update question status
      await supabase
        .from('legal_questions')
        .update({ status: 'completed' })
        .eq('id', questionId);

    } catch (error) {
      console.error('Error processing legal question:', error);
      await supabase
        .from('legal_questions')
        .update({ status: 'error' })
        .eq('id', questionId);
    }
  }

  /**
   * Generate legal response using OpenAI
   */
  private async generateLegalResponse(question: LegalQuestion): Promise<Omit<LegalResponse, 'id' | 'questionId' | 'createdAt'>> {
    const prompt = this.buildLegalPrompt(question);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful legal assistant. Provide accurate, helpful legal information while always emphasizing that this is not a substitute for professional legal advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return {
      answer,
      sources: this.extractSources(answer),
      disclaimers: [
        'This response is for informational purposes only and does not constitute legal advice.',
        'Please consult with a qualified attorney for specific legal matters.',
        'Laws may vary by jurisdiction and change over time.'
      ],
      confidence: 0.8 // Could be calculated based on response quality
    };
  }

  /**
   * Build legal prompt for AI
   */
  private buildLegalPrompt(question: LegalQuestion): string {
    const basePrompt = `
Legal Question Category: ${question.category}
Question: ${question.question}
${question.context ? `Context: ${question.context}` : ''}

Please provide:
1. A clear, helpful answer to the legal question
2. Relevant legal principles or considerations
3. Suggested next steps
4. Important caveats or limitations

Remember to emphasize that this is not professional legal advice and recommend consulting an attorney for specific matters.
`;

    return basePrompt;
  }

  /**
   * Extract sources from AI response (simplified)
   */
  private extractSources(answer: string): string[] {
    // This is a simplified implementation
    // In a real system, you'd parse the response more carefully
    const sources: string[] = [];
    
    if (answer.includes('Constitution')) sources.push('Indian Constitution');
    if (answer.includes('Code')) sources.push('Indian Penal Code');
    if (answer.includes('Act')) sources.push('Relevant Indian Acts');
    
    return sources.length > 0 ? sources : ['General legal principles'];
  }

  /**
   * Get user's legal questions
   */
  async getUserQuestions(): Promise<LegalQuestion[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('legal_questions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get response for a question
   */
  async getQuestionResponse(questionId: string): Promise<LegalResponse | null> {
    const { data, error } = await supabase
      .from('legal_responses')
      .select('*')
      .eq('question_id', questionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Generate legal document
   */
  async generateDocument(type: string, title: string, requirements: string): Promise<LegalDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('legal_documents')
      .insert({
        user_id: user.id,
        title,
        type,
        content: '',
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    // Generate document content
    this.generateDocumentContent(data.id, type, requirements).catch(console.error);

    return data;
  }

  /**
   * Generate document content using AI
   */
  private async generateDocumentContent(documentId: string, type: string, requirements: string): Promise<void> {
    try {
      const prompt = this.buildDocumentPrompt(type, requirements);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a legal document generator. Create professional legal documents with proper structure and language.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Update document with generated content
      await supabase
        .from('legal_documents')
        .update({ 
          content,
          status: 'review',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

    } catch (error) {
      console.error('Error generating document:', error);
      await supabase
        .from('legal_documents')
        .update({ status: 'error' })
        .eq('id', documentId);
    }
  }

  /**
   * Build document generation prompt
   */
  private buildDocumentPrompt(type: string, requirements: string): string {
    const templates = {
      rental_agreement: 'Create a rental agreement template',
      contract: 'Create a service contract template',
      will: 'Create a will template',
      power_of_attorney: 'Create a power of attorney template'
    };

    const baseTemplate = templates[type as keyof typeof templates] || 'Create a legal document template';

    return `${baseTemplate} based on these requirements:
${requirements}

Please include:
1. Proper legal structure and language
2. Standard clauses and terms
3. Placeholder fields for customization
4. Legal disclaimers

Remember to note that this is a template and should be reviewed by a qualified attorney.`;
  }

  /**
   * Get user's legal documents
   */
  async getUserDocuments(): Promise<LegalDocument[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(documentId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('legal_documents')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) throw error;
  }

  /**
   * Chat functionality for real-time legal assistance
   */
  async sendChatMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Save user message
    const { data: userMessage, error: userError } = await supabase
      .from('legal_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message
      })
      .select()
      .single();

    if (userError) throw userError;

    // Generate AI response
    const aiResponse = await this.generateChatResponse(message, sessionId);

    // Save AI response
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('legal_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse.content,
        metadata: aiResponse.metadata
      })
      .select()
      .single();

    if (assistantError) throw assistantError;

    return assistantMessage;
  }

  /**
   * Generate chat response
   */
  private async generateChatResponse(message: string, sessionId: string): Promise<Omit<ChatMessage, 'id' | 'sessionId' | 'timestamp'>> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful legal assistant. Provide clear, helpful legal information while always emphasizing that this is not a substitute for professional legal advice.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return {
      role: 'assistant',
      content,
      metadata: {
        sources: ['General legal principles'],
        confidence: 0.7,
        disclaimers: [
          'This response is for informational purposes only.',
          'Please consult with a qualified attorney for specific legal matters.'
        ]
      }
    };
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('legal_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const legalAssistantService = LegalAssistantService.getInstance();