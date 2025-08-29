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

const ndaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  disclosing_party: z.string().min(1, 'Disclosing party is required'),
  receiving_party: z.string().min(1, 'Receiving party is required'),
  confidential_information: z.string().min(1, 'Confidential information description is required'),
  term: z.string().min(1, 'Term is required'),
  additional_terms: z.string().optional(),
});

type FormData = z.infer<typeof ndaSchema>;

export const NDA: React.FC = () => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(ndaSchema),
    defaultValues: {
      title: 'Non-Disclosure Agreement',
      disclosing_party: '',
      receiving_party: '',
      confidential_information: '',
      term: '',
      additional_terms: '',
    },
  });

  const generateDocument = async (data: FormData) => {
    setIsGenerating(true);
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between:

DISCLOSING PARTY: ${data.disclosing_party}
RECEIVING PARTY: ${data.receiving_party}

1. PURPOSE
   The parties wish to explore a potential business relationship and may disclose confidential information to each other for evaluation purposes.

2. CONFIDENTIAL INFORMATION
   "Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, either directly or indirectly, in writing, orally, or by inspection of tangible objects, which is designated as "Confidential," "Proprietary," or some similar designation, or that should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.

   Confidential Information includes, but is not limited to:
   ${data.confidential_information}

3. NON-DISCLOSURE AND NON-USE
   The Receiving Party agrees not to:
   - Disclose any Confidential Information to any third party
   - Use any Confidential Information for any purpose other than the stated business purpose
   - Copy, reproduce, or distribute any Confidential Information
   - Reverse engineer or attempt to derive the composition or underlying structure of any Confidential Information

4. EXCEPTIONS
   The obligations of confidentiality shall not apply to information that:
   - Was known to the Receiving Party prior to disclosure
   - Is or becomes publicly available through no fault of the Receiving Party
   - Is independently developed by the Receiving Party without use of the Confidential Information
   - Is required to be disclosed by law or court order

5. TERM
   This Agreement shall remain in effect for: ${data.term}
   The obligations of confidentiality shall survive termination of this Agreement for a period of 5 years.

6. RETURN OF MATERIALS
   Upon termination of this Agreement or upon written request of the Disclosing Party, the Receiving Party shall return all Confidential Information and any copies, notes, or other materials containing such information.

7. NO RIGHTS GRANTED
   Nothing in this Agreement shall be construed as granting any rights under any patent, copyright, or other intellectual property right, nor shall this Agreement grant any party any rights in or to the other party's Confidential Information other than the limited right to review such Confidential Information for the purposes described herein.

8. REMEDIES
   The Receiving Party acknowledges that unauthorized disclosure of Confidential Information may cause irreparable harm to the Disclosing Party, and that monetary damages may be inadequate to compensate for such harm. The Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law or in equity.

9. ADDITIONAL TERMS
   ${data.additional_terms || 'No additional terms specified.'}

10. GOVERNING LAW
    This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where the Disclosing Party is located.

11. ENTIRE AGREEMENT
    This Agreement constitutes the entire understanding between the parties concerning the subject matter hereof and supersedes all prior agreements, understandings, and negotiations.

DISCLOSING PARTY SIGNATURE: _________________ DATE: _______________
RECEIVING PARTY SIGNATURE: _________________ DATE: _______________
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
            <h1 className="text-2xl font-bold">Non-Disclosure Agreement</h1>
            <p className="text-muted-foreground">Create a confidentiality agreement</p>
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
                    placeholder="Non-Disclosure Agreement"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disclosing_party">Disclosing Party</Label>
                    <Input
                      id="disclosing_party"
                      {...form.register('disclosing_party')}
                      placeholder="Company Name"
                    />
                    {form.formState.errors.disclosing_party && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.disclosing_party.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="receiving_party">Receiving Party</Label>
                    <Input
                      id="receiving_party"
                      {...form.register('receiving_party')}
                      placeholder="Individual or Company Name"
                    />
                    {form.formState.errors.receiving_party && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.receiving_party.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="confidential_information">Confidential Information Description</Label>
                  <Textarea
                    id="confidential_information"
                    {...form.register('confidential_information')}
                    placeholder="Describe the confidential information that will be shared (e.g., trade secrets, business plans, customer data, technical specifications, etc.)"
                    rows={3}
                  />
                  {form.formState.errors.confidential_information && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.confidential_information.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="term">Agreement Term</Label>
                  <Input
                    id="term"
                    {...form.register('term')}
                    placeholder="2 years"
                  />
                  {form.formState.errors.term && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.term.message}</p>
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

export default NDA;
