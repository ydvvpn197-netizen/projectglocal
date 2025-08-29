import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Save, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainLayout } from '@/components/MainLayout';

const serviceAgreementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  service_provider: z.string().min(1, 'Service provider is required'),
  client: z.string().min(1, 'Client is required'),
  services: z.string().min(1, 'Services description is required'),
  payment_terms: z.string().min(1, 'Payment terms are required'),
  additional_terms: z.string().optional(),
});

type FormData = z.infer<typeof serviceAgreementSchema>;

export const ServiceAgreement: React.FC = () => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(serviceAgreementSchema),
    defaultValues: {
      title: 'Service Agreement',
      service_provider: '',
      client: '',
      services: '',
      payment_terms: '',
      additional_terms: '',
    },
  });

  const generateDocument = async (data: FormData) => {
    setIsGenerating(true);
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = `
SERVICE AGREEMENT

This Service Agreement (the "Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between:

SERVICE PROVIDER: ${data.service_provider}
CLIENT: ${data.client}

1. SERVICES
   The Service Provider agrees to provide the following services to the Client:
   ${data.services}

2. TERM
   This Agreement shall commence on the date of execution and shall continue until terminated by either party in accordance with the terms herein.

3. COMPENSATION
   Payment Terms: ${data.payment_terms}
   
   The Client agrees to pay the Service Provider for services rendered in accordance with the payment schedule outlined above.

4. SERVICE PROVIDER OBLIGATIONS
   The Service Provider shall:
   - Perform all services in a professional and workmanlike manner
   - Use reasonable care and skill in the performance of services
   - Comply with all applicable laws and regulations
   - Maintain appropriate insurance coverage
   - Provide regular updates on project progress

5. CLIENT OBLIGATIONS
   The Client shall:
   - Provide necessary information and materials in a timely manner
   - Make payments in accordance with the payment schedule
   - Provide reasonable access to facilities and personnel as needed
   - Cooperate with the Service Provider in the performance of services

6. INTELLECTUAL PROPERTY
   - Any intellectual property created by the Service Provider specifically for the Client shall be assigned to the Client upon full payment
   - The Service Provider retains rights to any pre-existing intellectual property used in providing services
   - The Service Provider may use work product for portfolio and marketing purposes unless otherwise specified

7. CONFIDENTIALITY
   Both parties agree to maintain the confidentiality of any proprietary or confidential information shared during the course of this Agreement.

8. LIMITATION OF LIABILITY
   The Service Provider's liability shall be limited to the amount paid by the Client for services under this Agreement, except in cases of gross negligence or willful misconduct.

9. TERMINATION
   Either party may terminate this Agreement with 30 days written notice. Upon termination:
   - The Client shall pay for all services rendered up to the termination date
   - The Service Provider shall deliver any completed work product
   - Both parties shall return any confidential information

10. INDEPENDENT CONTRACTOR
    The Service Provider is an independent contractor and not an employee of the Client. The Service Provider is responsible for their own taxes, insurance, and compliance with applicable laws.

11. DISPUTE RESOLUTION
    Any disputes arising under this Agreement shall be resolved through good faith negotiation. If resolution cannot be reached, disputes shall be resolved through mediation or arbitration as mutually agreed.

12. GOVERNING LAW
    This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the Service Provider is located.

13. ADDITIONAL TERMS
    ${data.additional_terms || 'No additional terms specified.'}

14. ENTIRE AGREEMENT
    This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements, understandings, and negotiations.

SERVICE PROVIDER SIGNATURE: _________________ DATE: _______________
CLIENT SIGNATURE: _________________ DATE: _______________
      `;
      
      setGeneratedContent(content);
      setPreviewMode(true);
      toast.success('Document generated successfully!');
    } catch (error) {
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async (data: FormData) => {
    try {
      // Save draft logic would go here
      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    // Export logic would go here
    toast.success(`Document exported as ${format.toUpperCase()}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/legal-assistant')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Legal Assistant
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Service Agreement</h1>
            <p className="text-muted-foreground">Create a service provider contract</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Agreement Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(generateDocument)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Service Agreement"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_provider">Service Provider</Label>
                    <Input
                      id="service_provider"
                      {...form.register('service_provider')}
                      placeholder="Company or Individual Name"
                    />
                    {form.formState.errors.service_provider && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.service_provider.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      {...form.register('client')}
                      placeholder="Client Name"
                    />
                    {form.formState.errors.client && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.client.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="services">Services Description</Label>
                  <Textarea
                    id="services"
                    {...form.register('services')}
                    placeholder="Describe the services to be provided in detail..."
                    rows={3}
                  />
                  {form.formState.errors.services && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.services.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Textarea
                    id="payment_terms"
                    {...form.register('payment_terms')}
                    placeholder="Describe payment schedule, amounts, and methods..."
                    rows={3}
                  />
                  {form.formState.errors.payment_terms && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.payment_terms.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additional_terms">Additional Terms (Optional)</Label>
                  <Textarea
                    id="additional_terms"
                    {...form.register('additional_terms')}
                    placeholder="Any additional terms or conditions..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={form.handleSubmit(handleSaveDraft)}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Document
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewMode ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{generatedContent}</pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleExport('pdf')}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('docx')}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export DOCX
                    </Button>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This is a template document. Please review with a legal professional before use.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Fill out the form and generate your document to see a preview here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceAgreement;
