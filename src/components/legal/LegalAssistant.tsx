/**
 * Legal Assistant Component
 * Main component for AI-powered legal assistance
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, FileText, Scale, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { legalAssistantService, LegalQuestion, LegalResponse, LegalDocument } from '@/services/legalAssistantService';
import { useAuth } from '@/hooks/useAuth';

interface LegalAssistantProps {
  className?: string;
}

export function LegalAssistant({ className }: LegalAssistantProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<LegalQuestion[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userQuestions, userDocuments] = await Promise.all([
        legalAssistantService.getUserQuestions(),
        legalAssistantService.getUserDocuments()
      ]);
      setQuestions(userQuestions);
      setDocuments(userDocuments);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the Legal Assistant.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Scale className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AI Legal Assistant</h1>
        </div>
        <p className="text-muted-foreground">
          Get instant legal guidance and generate professional documents
        </p>
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Disclaimer:</strong> This AI assistant provides general legal information only. 
            It is not a substitute for professional legal advice. Please consult with a qualified attorney 
            for specific legal matters.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Questions</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Forms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <LegalChat />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <LegalQuestions questions={questions} onRefresh={loadUserData} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <LegalDocuments documents={documents} onRefresh={loadUserData} />
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <LegalForms onDocumentCreated={loadUserData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Legal Chat Component
function LegalChat() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await legalAssistantService.sendChatMessage(sessionId, inputMessage);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Legal Chat Assistant</span>
        </CardTitle>
        <CardDescription>
          Ask any legal question and get instant guidance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation by asking a legal question</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.metadata?.disclaimers && (
                    <div className="mt-2 text-xs opacity-75">
                      {message.metadata.disclaimers.map((disclaimer: string, index: number) => (
                        <p key={index}>• {disclaimer}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a legal question..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Legal Questions Component
function LegalQuestions({ questions, onRefresh }: { questions: LegalQuestion[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, LegalResponse>>({});

  const [formData, setFormData] = useState({
    question: '',
    category: '',
    context: ''
  });

  const submitQuestion = async () => {
    if (!formData.question.trim()) return;

    setLoading(true);
    try {
      await legalAssistantService.submitQuestion(
        formData.question,
        formData.category,
        formData.context
      );
      setFormData({ question: '', category: '', context: '' });
      setShowForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Legal Questions</h3>
        <Button onClick={() => setShowForm(true)}>
          Ask New Question
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Legal Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Question</label>
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Describe your legal question..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Additional Context (Optional)</label>
              <Textarea
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                placeholder="Provide any additional context..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={submitQuestion} disabled={loading || !formData.question.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Question'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(question.status)}
                    <Badge variant="outline">{question.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-medium mb-2">{question.question}</h4>
                  {question.context && (
                    <p className="text-sm text-muted-foreground mb-2">{question.context}</p>
                  )}
                  {question.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Load response
                        legalAssistantService.getQuestionResponse(question.id)
                          .then(response => {
                            if (response) {
                              setResponses(prev => ({ ...prev, [question.id]: response }));
                            }
                          })
                          .catch(console.error);
                      }}
                    >
                      View Response
                    </Button>
                  )}
                </div>
              </div>

              {responses[question.id] && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">AI Response:</h5>
                  <p className="whitespace-pre-wrap mb-3">{responses[question.id].answer}</p>
                  
                  {responses[question.id].sources.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-sm font-medium mb-1">Sources:</h6>
                      <ul className="text-sm text-muted-foreground">
                        {responses[question.id].sources.map((source, index) => (
                          <li key={index}>• {source}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {responses[question.id].disclaimers.map((disclaimer, index) => (
                      <p key={index}>• {disclaimer}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No legal questions yet</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Ask Your First Question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Legal Documents Component
function LegalDocuments({ documents, onRefresh }: { documents: LegalDocument[]; onRefresh: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'final': return 'bg-green-100 text-green-800';
      case 'generated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Legal Documents</h3>
      </div>

      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{document.title}</h4>
                    <Badge className={getStatusColor(document.status)}>
                      {document.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Type: {document.type} • Created: {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                  {document.content && (
                    <div className="max-h-32 overflow-hidden">
                      <p className="text-sm whitespace-pre-wrap">
                        {document.content.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {documents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No legal documents yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Generate your first document using the Forms tab
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Legal Forms Component
function LegalForms({ onDocumentCreated }: { onDocumentCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    requirements: ''
  });

  const generateDocument = async () => {
    if (!formData.title.trim() || !formData.type || !formData.requirements.trim()) return;

    setLoading(true);
    try {
      await legalAssistantService.generateDocument(
        formData.type,
        formData.title,
        formData.requirements
      );
      setFormData({ title: '', type: '', requirements: '' });
      onDocumentCreated();
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Legal Document</CardTitle>
        <CardDescription>
          Create professional legal documents tailored to your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Document Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rental_agreement">Rental Agreement</SelectItem>
              <SelectItem value="contract">Service Contract</SelectItem>
              <SelectItem value="will">Will</SelectItem>
              <SelectItem value="power_of_attorney">Power of Attorney</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Document Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter document title..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Requirements</label>
          <Textarea
            value={formData.requirements}
            onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
            placeholder="Describe your requirements and any specific clauses needed..."
            rows={6}
          />
        </div>

        <Button 
          onClick={generateDocument} 
          disabled={loading || !formData.title.trim() || !formData.type || !formData.requirements.trim()}
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Generate Document
        </Button>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Generated documents are templates and should be reviewed by a qualified attorney 
            before use. This service does not provide legal advice.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
