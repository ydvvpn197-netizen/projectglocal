import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  FileText, 
  Download, 
  AlertTriangle, 
  Shield, 
  Info,
  Scale,
  BookOpen,
  Users,
  Clock
} from 'lucide-react';
import { LegalAssistantChat } from '@/components/legal/LegalAssistantChat';
import { LegalDocumentForm } from '@/components/legal/LegalDocumentForm';
import { legalAssistantService, LegalDraft } from '@/services/legalAssistantService';

const LegalAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  // Fetch drafts for the dashboard
  const { data: drafts = [], refetch: refetchDrafts } = useQuery({
    queryKey: ['legal-drafts'],
    queryFn: () => legalAssistantService.getDrafts(),
  });

  const handleDraftCreated = (draft: LegalDraft) => {
    refetchDrafts();
    setActiveTab('drafts');
  };

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'review':
        return 'bg-blue-100 text-blue-700';
      case 'final':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legal Assistant</h1>
            <p className="text-gray-600">Get professional legal guidance and create documents</p>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important:</strong> This AI assistant provides general legal information and document templates. 
            It is not a substitute for professional legal advice. Always consult with a qualified attorney for your specific legal needs.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Create Documents
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            My Drafts
          </TabsTrigger>
        </TabsList>

        {/* Chat Assistant Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Features Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Chat Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Real-time legal Q&A</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Session history</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Professional disclaimers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Secure conversations</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-gray-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span>All conversations are private</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      <span>AI responses include disclaimers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full">
                  <LegalAssistantChat
                    sessionId={selectedSessionId}
                    onSessionChange={handleSessionChange}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Create Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Document Types Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/rental-agreement')}
                      className="w-full p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                    >
                      <h4 className="font-medium text-sm">Rental Agreement</h4>
                      <p className="text-xs text-gray-500 mt-1">Standard residential lease</p>
                    </button>
                    <button 
                      onClick={() => navigate('/employment-contract')}
                      className="w-full p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                    >
                      <h4 className="font-medium text-sm">Employment Contract</h4>
                      <p className="text-xs text-gray-500 mt-1">Work agreement template</p>
                    </button>
                    <button 
                      onClick={() => navigate('/nda')}
                      className="w-full p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                    >
                      <h4 className="font-medium text-sm">NDA</h4>
                      <p className="text-xs text-gray-500 mt-1">Confidentiality agreement</p>
                    </button>
                    <button 
                      onClick={() => navigate('/service-agreement')}
                      className="w-full p-3 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                    >
                      <h4 className="font-medium text-sm">Service Agreement</h4>
                      <p className="text-xs text-gray-500 mt-1">Service provider contract</p>
                    </button>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-gray-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      <span>Export to PDF & DOCX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Review with attorney</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Form */}
            <div className="lg:col-span-3">
              <LegalDocumentForm onDraftCreated={handleDraftCreated} />
            </div>
          </div>
        </TabsContent>

        {/* My Drafts Tab */}
        <TabsContent value="drafts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Drafts Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Drafts Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Drafts</span>
                      <Badge variant="secondary">{drafts.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Progress</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                        {drafts.filter(d => d.status === 'draft').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Finalized</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        {drafts.filter(d => d.status === 'final').length}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-xs text-gray-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Drafts are saved automatically</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-3 h-3" />
                      <span>Generate final documents</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Drafts List */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>My Legal Drafts</CardTitle>
                </CardHeader>
                <CardContent>
                  {drafts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first legal document to get started
                      </p>
                      <Button onClick={() => setActiveTab('documents')}>
                        Create Document
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{draft.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(draft.status)}>
                                {draft.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {draft.document_type.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                • {new Date(draft.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {draft.status === 'final' && draft.file_urls && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  PDF
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  DOCX
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalAssistant;
