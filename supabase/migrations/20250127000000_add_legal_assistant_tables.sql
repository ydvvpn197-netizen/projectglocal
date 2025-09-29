-- Legal Assistant Feature - Database Schema
-- This migration creates all necessary tables for the AI Legal Assistant feature

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE legal_question_category AS ENUM (
  'contract', 'property', 'employment', 'family', 
  'criminal', 'business', 'other'
);

CREATE TYPE legal_question_status AS ENUM (
  'pending', 'processing', 'completed', 'error'
);

CREATE TYPE legal_document_type AS ENUM (
  'rental_agreement', 'contract', 'will', 
  'power_of_attorney', 'other'
);

CREATE TYPE legal_document_status AS ENUM (
  'draft', 'review', 'final', 'generated'
);

CREATE TYPE chat_message_role AS ENUM (
  'user', 'assistant'
);

-- Legal Questions Table
CREATE TABLE public.legal_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category legal_question_category NOT NULL DEFAULT 'other',
  context TEXT,
  status legal_question_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal Responses Table
CREATE TABLE public.legal_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.legal_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  sources TEXT[] DEFAULT '{}',
  disclaimers TEXT[] DEFAULT '{}',
  confidence DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal Documents Table
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type legal_document_type NOT NULL DEFAULT 'other',
  content TEXT,
  status legal_document_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal Chat Messages Table
CREATE TABLE public.legal_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  role chat_message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_legal_questions_user_id ON public.legal_questions(user_id);
CREATE INDEX idx_legal_questions_status ON public.legal_questions(status);
CREATE INDEX idx_legal_questions_category ON public.legal_questions(category);
CREATE INDEX idx_legal_questions_created_at ON public.legal_questions(created_at);

CREATE INDEX idx_legal_responses_question_id ON public.legal_responses(question_id);

CREATE INDEX idx_legal_documents_user_id ON public.legal_documents(user_id);
CREATE INDEX idx_legal_documents_type ON public.legal_documents(type);
CREATE INDEX idx_legal_documents_status ON public.legal_documents(status);

CREATE INDEX idx_legal_chat_messages_session_id ON public.legal_chat_messages(session_id);
CREATE INDEX idx_legal_chat_messages_timestamp ON public.legal_chat_messages(timestamp);

-- Enable Row Level Security
ALTER TABLE public.legal_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_questions
CREATE POLICY "Users can view their own legal questions"
  ON public.legal_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own legal questions"
  ON public.legal_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal questions"
  ON public.legal_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal questions"
  ON public.legal_questions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for legal_responses
CREATE POLICY "Users can view responses to their questions"
  ON public.legal_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.legal_questions 
      WHERE id = question_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert legal responses"
  ON public.legal_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update responses to their questions"
  ON public.legal_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.legal_questions 
      WHERE id = question_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for legal_documents
CREATE POLICY "Users can view their own legal documents"
  ON public.legal_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own legal documents"
  ON public.legal_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal documents"
  ON public.legal_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal documents"
  ON public.legal_documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for legal_chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON public.legal_chat_messages FOR SELECT
  USING (true); -- Session-based access control will be handled in application layer

CREATE POLICY "Users can insert chat messages"
  ON public.legal_chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own chat messages"
  ON public.legal_chat_messages FOR UPDATE
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_legal_questions_updated_at
  BEFORE UPDATE ON public.legal_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically process legal questions
CREATE OR REPLACE FUNCTION process_legal_question()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called by the application layer
  -- to process the legal question using AI
  PERFORM pg_notify('legal_question_created', NEW.id::text);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for processing legal questions
CREATE TRIGGER trigger_process_legal_question
  AFTER INSERT ON public.legal_questions
  FOR EACH ROW EXECUTE FUNCTION process_legal_question();

-- Add comments for documentation
COMMENT ON TABLE public.legal_questions IS 'Stores legal questions submitted by users';
COMMENT ON TABLE public.legal_responses IS 'Stores AI-generated responses to legal questions';
COMMENT ON TABLE public.legal_documents IS 'Stores generated legal documents';
COMMENT ON TABLE public.legal_chat_messages IS 'Stores chat messages for real-time legal assistance';

COMMENT ON COLUMN public.legal_questions.category IS 'Category of the legal question for better organization';
COMMENT ON COLUMN public.legal_questions.status IS 'Processing status of the legal question';
COMMENT ON COLUMN public.legal_responses.confidence IS 'Confidence score of the AI response (0.0 to 1.0)';
COMMENT ON COLUMN public.legal_documents.status IS 'Status of the legal document generation';
COMMENT ON COLUMN public.legal_chat_messages.metadata IS 'Additional metadata like sources, disclaimers, confidence';
