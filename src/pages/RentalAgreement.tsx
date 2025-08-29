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

const rentalAgreementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  landlord_name: z.string().min(1, 'Landlord name is required'),
  tenant_name: z.string().min(1, 'Tenant name is required'),
  property_address: z.string().min(1, 'Property address is required'),
  rent_amount: z.string().min(1, 'Rent amount is required'),
  lease_term: z.string().min(1, 'Lease term is required'),
  additional_terms: z.string().optional(),
});

type FormData = z.infer<typeof rentalAgreementSchema>;

export const RentalAgreement: React.FC = () => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(rentalAgreementSchema),
    defaultValues: {
      title: 'Rental Agreement',
      landlord_name: '',
      tenant_name: '',
      property_address: '',
      rent_amount: '',
      lease_term: '',
      additional_terms: '',
    },
  });

  const generateDocument = async (data: FormData) => {
    setIsGenerating(true);
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = `
RENTAL AGREEMENT

This Rental Agreement (the "Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between:

LANDLORD: ${data.landlord_name}
TENANT: ${data.tenant_name}

PROPERTY ADDRESS: ${data.property_address}

1. RENTAL TERMS
   - Monthly Rent: $${data.rent_amount}
   - Lease Term: ${data.lease_term}
   - Security Deposit: $${Math.round(parseFloat(data.rent_amount) * 1.5)}

2. PROPERTY USE
   The Tenant shall use the Property solely for residential purposes and shall not use the Property for any commercial or illegal purposes.

3. PAYMENT TERMS
   - Rent is due on the 1st day of each month
   - Late fees apply after the 5th day of the month
   - Payment methods: Check, bank transfer, or online payment

4. UTILITIES AND SERVICES
   - Tenant is responsible for: Electricity, gas, water, internet
   - Landlord is responsible for: Property maintenance, repairs

5. ADDITIONAL TERMS
   ${data.additional_terms || 'No additional terms specified.'}

6. TERMINATION
   - Either party may terminate this agreement with 30 days written notice
   - Early termination may result in penalties as outlined in state law

7. MAINTENANCE AND REPAIRS
   - Tenant shall maintain the Property in good condition
   - Landlord shall make necessary repairs within reasonable time

8. INSURANCE
   - Tenant is encouraged to obtain renter's insurance
   - Landlord maintains property insurance

This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements.

LANDLORD SIGNATURE: _________________ DATE: _______________
TENANT SIGNATURE: _________________ DATE: _______________
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
          <h1 className="text-2xl font-bold">Rental Agreement</h1>
          <p className="text-muted-foreground">Create a standard residential lease agreement</p>
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
                  placeholder="Rental Agreement"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="landlord_name">Landlord Name</Label>
                  <Input
                    id="landlord_name"
                    {...form.register('landlord_name')}
                    placeholder="John Doe"
                  />
                  {form.formState.errors.landlord_name && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.landlord_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tenant_name">Tenant Name</Label>
                  <Input
                    id="tenant_name"
                    {...form.register('tenant_name')}
                    placeholder="Jane Smith"
                  />
                  {form.formState.errors.tenant_name && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.tenant_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="property_address">Property Address</Label>
                <Textarea
                  id="property_address"
                  {...form.register('property_address')}
                  placeholder="123 Main St, City, State 12345"
                  rows={2}
                />
                {form.formState.errors.property_address && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.property_address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent_amount">Monthly Rent Amount</Label>
                  <Input
                    id="rent_amount"
                    {...form.register('rent_amount')}
                    placeholder="1500"
                    type="number"
                  />
                  {form.formState.errors.rent_amount && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.rent_amount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lease_term">Lease Term</Label>
                  <Input
                    id="lease_term"
                    {...form.register('lease_term')}
                    placeholder="12 months"
                  />
                  {form.formState.errors.lease_term && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.lease_term.message}</p>
                  )}
                </div>
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
  );
};

export default RentalAgreement;
