import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LegalChatSession {
  id: string;
  user_id: string;
  session_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface LegalChatMessage {
  id: string;
  session_id: string;
  message_type: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface LegalDraft {
  id: string;
  user_id: string;
  session_id?: string;
  title: string;
  content: string;
  document_type: string;
  status: 'draft' | 'review' | 'final';
  file_urls?: Record<string, string>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  template?: string;
  required_fields?: string[];
}

export class LegalAssistantService {
  private static instance: LegalAssistantService;
  private documentTypes: DocumentType[] = [
    {
      id: 'rental_agreement',
      name: 'Rental Agreement',
      description: 'Standard residential rental agreement',
      required_fields: ['landlord_name', 'tenant_name', 'property_address', 'rent_amount', 'lease_term']
    },
    {
      id: 'employment_contract',
      name: 'Employment Contract',
      description: 'Employment agreement between employer and employee',
      required_fields: ['employer_name', 'employee_name', 'position', 'salary', 'start_date']
    },
    {
      id: 'nda',
      name: 'Non-Disclosure Agreement',
      description: 'Confidentiality agreement',
      required_fields: ['disclosing_party', 'receiving_party', 'confidential_information', 'term']
    },
    {
      id: 'service_agreement',
      name: 'Service Agreement',
      description: 'Service provider agreement',
      required_fields: ['service_provider', 'client', 'services', 'payment_terms']
    }
  ];

  public static getInstance(): LegalAssistantService {
    if (!LegalAssistantService.instance) {
      LegalAssistantService.instance = new LegalAssistantService();
    }
    return LegalAssistantService.instance;
  }

  /**
   * Get all document types available for structured form
   */
  async getDocumentTypes(): Promise<DocumentType[]> {
    return this.documentTypes;
  }

  /**
   * Create a new chat session
   */
  async createChatSession(sessionName: string): Promise<LegalChatSession> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_sessions')
        .insert({
          session_name: sessionName,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to create chat session');
      throw error;
    }
  }

  /**
   * Get all chat sessions for the current user
   */
  async getChatSessions(): Promise<LegalChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      toast.error('Failed to fetch chat sessions');
      throw error;
    }
  }

  /**
   * Get chat messages for a specific session
   */
  async getChatMessages(sessionId: string): Promise<LegalChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('legal_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to fetch chat messages');
      throw error;
    }
  }

  /**
   * Send a message in a chat session
   */
  async sendMessage(sessionId: string, content: string): Promise<LegalChatMessage> {
    try {
      // Add user message
      const { data: userMessage, error: userError } = await supabase
        .from('legal_chat_messages')
        .insert({
          session_id: sessionId,
          message_type: 'user',
          content
        })
        .select()
        .single();

      if (userError) throw userError;

      // Generate AI response
      const aiResponse = await this.generateAIResponse(content, sessionId);

      // Add AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('legal_chat_messages')
        .insert({
          session_id: sessionId,
          message_type: 'assistant',
          content: aiResponse,
          metadata: {
            disclaimer: 'This is not a substitute for licensed legal advice. Please consult with a qualified attorney for your specific legal needs.'
          }
        })
        .select()
        .single();

      if (aiError) throw aiError;

      // Update session timestamp
      await supabase
        .from('legal_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return userMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }

  /**
   * Generate AI response using a mock LLM (replace with actual LLM integration)
   */
  private async generateAIResponse(userMessage: string, sessionId: string): Promise<string> {
    // This is a mock implementation - replace with actual LLM API call
    const responses = [
      "Based on your question, I can provide some general guidance. However, please note that this is not legal advice and you should consult with a qualified attorney for your specific situation.",
      "I understand your concern. Here are some general points to consider, but remember to seek professional legal counsel for your particular case.",
      "This is a complex legal matter that requires careful consideration. While I can offer some general information, I strongly recommend consulting with a licensed attorney.",
      "Thank you for your question. Here's some general information that might be helpful, but please consult with a legal professional for specific advice."
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${randomResponse}\n\n**Important Disclaimer**: This response is generated by an AI assistant and is not a substitute for professional legal advice. Always consult with a qualified attorney for your specific legal needs.`;
  }

  /**
   * Create a legal draft from chat session or structured form
   */
  async createDraft(draftData: Omit<LegalDraft, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<LegalDraft> {
    try {
      const { data, error } = await supabase
        .from('legal_drafts')
        .insert({
          ...draftData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating draft:', error);
      toast.error('Failed to create draft');
      throw error;
    }
  }

  /**
   * Get all drafts for the current user
   */
  async getDrafts(): Promise<LegalDraft[]> {
    try {
      const { data, error } = await supabase
        .from('legal_drafts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to fetch drafts');
      throw error;
    }
  }

  /**
   * Update a draft
   */
  async updateDraft(draftId: string, updates: Partial<LegalDraft>): Promise<LegalDraft> {
    try {
      const { data, error } = await supabase
        .from('legal_drafts')
        .update(updates)
        .eq('id', draftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating draft:', error);
      toast.error('Failed to update draft');
      throw error;
    }
  }

  /**
   * Generate document from draft (PDF and DOCX)
   */
  async generateDocument(draftId: string): Promise<{ pdfUrl: string; docxUrl: string }> {
    try {
      // Get draft content
      const { data: draft, error } = await supabase
        .from('legal_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

      if (error) throw error;

      // Mock document generation - replace with actual document generation service
      const pdfUrl = await this.generatePDF(draft);
      const docxUrl = await this.generateDOCX(draft);

      // Update draft with file URLs
      await this.updateDraft(draftId, {
        file_urls: { pdf: pdfUrl, docx: docxUrl },
        status: 'final'
      });

      return { pdfUrl, docxUrl };
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
      throw error;
    }
  }

  /**
   * Mock PDF generation - replace with actual PDF generation service
   */
  private async generatePDF(draft: LegalDraft): Promise<string> {
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `https://example.com/documents/${draft.id}.pdf`;
  }

  /**
   * Mock DOCX generation - replace with actual DOCX generation service
   */
  private async generateDOCX(draft: LegalDraft): Promise<string> {
    // Simulate DOCX generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `https://example.com/documents/${draft.id}.docx`;
  }

  /**
   * Delete a chat session and all its messages
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('legal_chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Chat session deleted successfully');
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast.error('Failed to delete chat session');
      throw error;
    }
  }

  /**
   * Delete a draft
   */
  async deleteDraft(draftId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('legal_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
      throw error;
    }
  }
}

export const legalAssistantService = LegalAssistantService.getInstance();
