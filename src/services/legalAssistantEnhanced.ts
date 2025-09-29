import { supabase } from '@/integrations/supabase/client';
import { anonymousUserService } from './anonymousUserService';

export interface LegalQuestion {
  id: string;
  user_id?: string;
  session_id?: string;
  question: string;
  category: 'contract' | 'employment' | 'property' | 'family' | 'criminal' | 'civil' | 'business' | 'tax' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jurisdiction?: string;
  context?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalResponse {
  id: string;
  question_id: string;
  answer: string;
  sources: string[];
  disclaimers: string[];
  confidence: number;
  related_questions?: string[];
  suggested_actions?: string[];
  estimated_cost?: {
    consultation: number;
    documentation: number;
    court_fees?: number;
  };
  created_at: string;
}

export interface LegalDocument {
  id: string;
  user_id?: string;
  session_id?: string;
  title: string;
  document_type: 'contract' | 'agreement' | 'notice' | 'petition' | 'affidavit' | 'will' | 'power_of_attorney' | 'nda' | 'employment_contract' | 'lease_agreement';
  content: string;
  variables: Record<string, unknown>;
  is_anonymous: boolean;
  is_public: boolean;
  status: 'draft' | 'review' | 'final' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface LegalChatMessage {
  id: string;
  session_id: string;
  user_id?: string;
  message_type: 'user' | 'assistant' | 'system';
  content: string;
  context?: Record<string, unknown>;
  is_anonymous: boolean;
  created_at: string;
}

export interface LegalResearch {
  id: string;
  user_id?: string;
  session_id?: string;
  topic: string;
  jurisdiction?: string;
  research_type: 'case_law' | 'statute' | 'regulation' | 'precedent' | 'general';
  results: Array<{
    title: string;
    summary: string;
    relevance_score: number;
    source_url?: string;
    citation: string;
    date: string;
  }>;
  is_anonymous: boolean;
  created_at: string;
}

export interface LegalCostEstimate {
  service_type: string;
  estimated_hours: number;
  hourly_rate: number;
  total_cost: number;
  breakdown: Array<{
    task: string;
    hours: number;
    cost: number;
  }>;
  jurisdiction_specific: boolean;
  urgency_multiplier: number;
}

export class LegalAssistantEnhanced {
  private static instance: LegalAssistantEnhanced;
  private openaiApiKey: string;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private responseCache = new Map<string, { data: unknown; timestamp: number }>();

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  static getInstance(): LegalAssistantEnhanced {
    if (!LegalAssistantEnhanced.instance) {
      LegalAssistantEnhanced.instance = new LegalAssistantEnhanced();
    }
    return LegalAssistantEnhanced.instance;
  }

  /**
   * Submit a legal question with advanced categorization
   */
  async submitLegalQuestion(
    question: string,
    category: LegalQuestion['category'],
    options: {
      priority?: LegalQuestion['priority'];
      jurisdiction?: string;
      context?: string;
      isAnonymous?: boolean;
    } = {}
  ): Promise<LegalQuestion> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const questionData = {
        user_id: user?.id,
        session_id: sessionId,
        question,
        category,
        priority: options.priority || 'medium',
        jurisdiction: options.jurisdiction,
        context: options.context,
        status: 'pending' as const,
        is_anonymous: options.isAnonymous || false
      };

      const { data, error } = await supabase
        .from('legal_questions')
        .insert(questionData)
        .select()
        .single();

      if (error) throw error;

      // Process question asynchronously
      this.processQuestionAsync(data.id);

      // Log anonymous legal question
      if (options.isAnonymous && sessionId) {
        await this.logAnonymousLegalActivity(sessionId, 'question_submitted', data.id);
      }

      return data;
    } catch (error) {
      console.error('Error submitting legal question:', error);
      throw error;
    }
  }

  /**
   * Get legal response with enhanced AI processing
   */
  async getLegalResponse(questionId: string): Promise<LegalResponse | null> {
    try {
      const { data, error } = await supabase
        .from('legal_responses')
        .select(`
          *,
          question:legal_questions(*)
        `)
        .eq('question_id', questionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching legal response:', error);
      return null;
    }
  }

  /**
   * Generate legal document with AI assistance
   */
  async generateLegalDocument(
    documentType: LegalDocument['document_type'],
    title: string,
    variables: Record<string, unknown>,
    options: {
      isAnonymous?: boolean;
      isPublic?: boolean;
      jurisdiction?: string;
    } = {}
  ): Promise<LegalDocument> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      // Generate document content using AI
      const content = await this.generateDocumentContent(documentType, variables, options.jurisdiction);

      const documentData = {
        user_id: user?.id,
        session_id: sessionId,
        title,
        document_type: documentType,
        content,
        variables,
        is_anonymous: options.isAnonymous || false,
        is_public: options.isPublic || false,
        status: 'draft' as const
      };

      const { data, error } = await supabase
        .from('legal_documents')
        .insert(documentData)
        .select()
        .single();

      if (error) throw error;

      // Log anonymous document generation
      if (options.isAnonymous && sessionId) {
        await this.logAnonymousLegalActivity(sessionId, 'document_generated', data.id);
      }

      return data;
    } catch (error) {
      console.error('Error generating legal document:', error);
      throw error;
    }
  }

  /**
   * Conduct legal research with AI assistance
   */
  async conductLegalResearch(
    topic: string,
    researchType: LegalResearch['research_type'],
    options: {
      jurisdiction?: string;
      isAnonymous?: boolean;
      maxResults?: number;
    } = {}
  ): Promise<LegalResearch> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      // Conduct research using AI
      const researchResults = await this.performLegalResearch(topic, researchType, options.jurisdiction, options.maxResults);

      const researchData = {
        user_id: user?.id,
        session_id: sessionId,
        topic,
        jurisdiction: options.jurisdiction,
        research_type: researchType,
        results: researchResults,
        is_anonymous: options.isAnonymous || false
      };

      const { data, error } = await supabase
        .from('legal_research')
        .insert(researchData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error conducting legal research:', error);
      throw error;
    }
  }

  /**
   * Get cost estimate for legal services
   */
  async getCostEstimate(
    serviceType: string,
    jurisdiction?: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<LegalCostEstimate> {
    try {
      const cacheKey = `cost_estimate_${serviceType}_${jurisdiction}_${urgency}`;
      const cached = this.responseCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.data;
      }

      const prompt = `
        Provide a cost estimate for the following legal service:
        
        Service Type: ${serviceType}
        Jurisdiction: ${jurisdiction || 'General'}
        Urgency: ${urgency}
        
        Please provide:
        1. Estimated hours required
        2. Typical hourly rate range
        3. Breakdown of tasks and costs
        4. Any jurisdiction-specific considerations
        5. Urgency multiplier if applicable
        
        Format as JSON with the following structure:
        {
          "service_type": "string",
          "estimated_hours": number,
          "hourly_rate": number,
          "total_cost": number,
          "breakdown": [{"task": "string", "hours": number, "cost": number}],
          "jurisdiction_specific": boolean,
          "urgency_multiplier": number
        }
      `;

      const aiResponse = await this.callOpenAI(prompt, 0.2);
      const costEstimate = JSON.parse(aiResponse);

      this.responseCache.set(cacheKey, { data: costEstimate, timestamp: Date.now() });
      
      return costEstimate;
    } catch (error) {
      console.error('Error getting cost estimate:', error);
      // Return default estimate
      return {
        service_type: serviceType,
        estimated_hours: 5,
        hourly_rate: 150,
        total_cost: 750,
        breakdown: [
          { task: 'Initial consultation', hours: 1, cost: 150 },
          { task: 'Document preparation', hours: 2, cost: 300 },
          { task: 'Review and revision', hours: 1.5, cost: 225 },
          { task: 'Final review', hours: 0.5, cost: 75 }
        ],
        jurisdiction_specific: false,
        urgency_multiplier: urgency === 'high' ? 1.5 : urgency === 'medium' ? 1.2 : 1.0
      };
    }
  }

  /**
   * Get legal chat history
   */
  async getChatHistory(sessionId: string, limit: number = 50): Promise<LegalChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  /**
   * Send chat message with context awareness
   */
  async sendChatMessage(
    sessionId: string,
    message: string,
    context?: Record<string, unknown>,
    isAnonymous: boolean = true
  ): Promise<LegalChatMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Save user message
      const userMessageData = {
        session_id: sessionId,
        user_id: user?.id,
        message_type: 'user' as const,
        content: message,
        context,
        is_anonymous: isAnonymous
      };

      const { data: userMessage, error: userError } = await supabase
        .from('legal_chat_messages')
        .insert(userMessageData)
        .select()
        .single();

      if (userError) throw userError;

      // Get conversation history for context
      const history = await this.getChatHistory(sessionId, 10);
      
      // Generate AI response
      const aiResponse = await this.generateContextualResponse(message, history, context);

      // Save AI response
      const aiMessageData = {
        session_id: sessionId,
        user_id: user?.id,
        message_type: 'assistant' as const,
        content: aiResponse,
        context,
        is_anonymous: isAnonymous
      };

      const { data: aiMessage, error: aiError } = await supabase
        .from('legal_chat_messages')
        .insert(aiMessageData)
        .select()
        .single();

      if (aiError) throw aiError;

      return aiMessage;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Get user's legal documents
   */
  async getUserDocuments(
    userId?: string,
    sessionId?: string,
    options: {
      documentType?: LegalDocument['document_type'];
      status?: LegalDocument['status'];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<LegalDocument[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id;
      const currentSessionId = sessionId || (await anonymousUserService.getCurrentSessionId());

      let query = supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentUserId) {
        query = query.eq('user_id', currentUserId);
      } else if (currentSessionId) {
        query = query.eq('session_id', currentSessionId);
      } else {
        return [];
      }

      if (options.documentType) {
        query = query.eq('document_type', options.documentType);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user documents:', error);
      return [];
    }
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(
    documentId: string,
    status: LegalDocument['status']
  ): Promise<LegalDocument> {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  }

  /**
   * Process question asynchronously
   */
  private async processQuestionAsync(questionId: string): Promise<void> {
    try {
      // Update status to processing
      await supabase
        .from('legal_questions')
        .update({ status: 'processing' })
        .eq('id', questionId);

      // Get question details
      const { data: question, error: questionError } = await supabase
        .from('legal_questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;

      // Generate AI response
      const response = await this.generateAdvancedLegalResponse(question);

      // Save response
      await supabase
        .from('legal_responses')
        .insert({
          question_id: questionId,
          ...response
        });

      // Update question status
      await supabase
        .from('legal_questions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);

    } catch (error) {
      console.error('Error processing question:', error);
      // Update status to error
      await supabase
        .from('legal_questions')
        .update({ status: 'error' })
        .eq('id', questionId);
    }
  }

  /**
   * Generate advanced legal response with AI
   */
  private async generateAdvancedLegalResponse(question: LegalQuestion): Promise<Omit<LegalResponse, 'id' | 'question_id' | 'created_at'>> {
    const prompt = this.buildAdvancedLegalPrompt(question);
    
    const response = await this.callOpenAI(prompt, 0.3);

    return {
      answer: response,
      sources: this.extractSources(response),
      disclaimers: [
        'This response is for informational purposes only and does not constitute legal advice.',
        'Please consult with a qualified attorney for specific legal matters.',
        'Laws may vary by jurisdiction and change over time.',
        'This AI-generated response should not be considered a substitute for professional legal consultation.'
      ],
      confidence: 0.85,
      related_questions: this.extractRelatedQuestions(response),
      suggested_actions: this.extractSuggestedActions(response),
      estimated_cost: {
        consultation: 150,
        documentation: 300,
        court_fees: question.category === 'criminal' ? 500 : undefined
      }
    };
  }

  /**
   * Generate document content using AI
   */
  private async generateDocumentContent(
    documentType: LegalDocument['document_type'],
    variables: Record<string, unknown>,
    jurisdiction?: string
  ): Promise<string> {
    const prompt = `
      Generate a professional legal document of type: ${documentType}
      
      Variables provided: ${JSON.stringify(variables)}
      Jurisdiction: ${jurisdiction || 'General'}
      
      Please create a comprehensive, legally-sound document with:
      1. Proper legal language and structure
      2. All necessary clauses and provisions
      3. Placeholder fields for customization
      4. Appropriate disclaimers
      5. Jurisdiction-specific considerations where applicable
      
      Format the document professionally with clear sections and proper legal formatting.
    `;

    return await this.callOpenAI(prompt, 0.2);
  }

  /**
   * Perform legal research using AI
   */
  private async performLegalResearch(
    topic: string,
    researchType: LegalResearch['research_type'],
    jurisdiction?: string,
    maxResults: number = 10
  ): Promise<LegalResearch['results']> {
    const prompt = `
      Conduct legal research on the following topic:
      
      Topic: ${topic}
      Research Type: ${researchType}
      Jurisdiction: ${jurisdiction || 'General'}
      Max Results: ${maxResults}
      
      Please provide research results in the following JSON format:
      [
        {
          "title": "string",
          "summary": "string", 
          "relevance_score": number (0-100),
          "source_url": "string (optional)",
          "citation": "string",
          "date": "string"
        }
      ]
      
      Include relevant case law, statutes, regulations, or precedents as appropriate for the research type.
    `;

    const response = await this.callOpenAI(prompt, 0.2);
    return JSON.parse(response);
  }

  /**
   * Generate contextual response for chat
   */
  private async generateContextualResponse(
    message: string,
    history: LegalChatMessage[],
    context?: Record<string, unknown>
  ): Promise<string> {
    const conversationContext = history
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.message_type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `
      You are a helpful legal assistant. Please provide accurate, helpful legal information based on the user's question.
      
      Conversation History:
      ${conversationContext}
      
      Current Question: ${message}
      Context: ${context ? JSON.stringify(context) : 'None'}
      
      Please provide a helpful response with appropriate legal disclaimers. Be concise but comprehensive.
    `;

    return await this.callOpenAI(prompt, 0.3);
  }

  /**
   * Build advanced legal prompt
   */
  private buildAdvancedLegalPrompt(question: LegalQuestion): string {
    return `
      Legal Question Analysis:
      
      Question: ${question.question}
      Category: ${question.category}
      Priority: ${question.priority}
      Jurisdiction: ${question.jurisdiction || 'General'}
      Context: ${question.context || 'None'}
      
      Please provide a comprehensive legal analysis including:
      1. Direct answer to the question
      2. Relevant legal principles and precedents
      3. Jurisdiction-specific considerations
      4. Potential risks and considerations
      5. Recommended next steps
      6. Related legal issues to consider
      7. Estimated costs and timeline
      
      Always include appropriate disclaimers that this is not legal advice.
    `;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, temperature: number = 0.3): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        max_tokens: 2000,
        temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Extract sources from AI response
   */
  private extractSources(response: string): string[] {
    // Simple source extraction - could be enhanced with more sophisticated parsing
    const sources: string[] = [];
    const lines = response.split('\n');
    
    lines.forEach(line => {
      if (line.includes('Case:') || line.includes('Statute:') || line.includes('Regulation:')) {
        sources.push(line.trim());
      }
    });
    
    return sources.length > 0 ? sources : ['General legal principles'];
  }

  /**
   * Extract related questions from response
   */
  private extractRelatedQuestions(response: string): string[] {
    const questions: string[] = [];
    const lines = response.split('\n');
    
    lines.forEach(line => {
      if (line.includes('?') && (line.includes('What') || line.includes('How') || line.includes('When') || line.includes('Where') || line.includes('Why'))) {
        questions.push(line.trim());
      }
    });
    
    return questions.slice(0, 3); // Limit to 3 related questions
  }

  /**
   * Extract suggested actions from response
   */
  private extractSuggestedActions(response: string): string[] {
    const actions: string[] = [];
    const lines = response.split('\n');
    
    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.') || line.includes('3.')) {
        if (line.includes('consult') || line.includes('review') || line.includes('file') || line.includes('prepare') || line.includes('submit')) {
          actions.push(line.replace(/^[•\-123.]\s*/, '').trim());
        }
      }
    });
    
    return actions.slice(0, 5); // Limit to 5 suggested actions
  }

  /**
   * Log anonymous legal activity
   */
  private async logAnonymousLegalActivity(
    sessionId: string,
    action: string,
    resourceId: string
  ): Promise<void> {
    try {
      await supabase
        .from('privacy_audit_log')
        .insert({
          user_id: null,
          session_id: sessionId,
          action: `legal_${action}`,
          details: {
            resource_id: resourceId,
            privacy_level: 'anonymous'
          }
        });
    } catch (error) {
      console.error('Error logging anonymous legal activity:', error);
    }
  }
}

export const legalAssistantEnhanced = LegalAssistantEnhanced.getInstance();
