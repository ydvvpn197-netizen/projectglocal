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
   - Emergency repairs: Tenant may make emergency repairs and deduct from rent

8. SECURITY DEPOSIT
   - Amount: $${Math.round(parseFloat(data.rent_amount) * 1.5)}
   - Returned within 30 days of lease termination
   - Deductions may be made for damages beyond normal wear and tear

9. PETS AND SMOKING
   - Pets: Not allowed unless specified in writing
   - Smoking: Not allowed on the premises

10. INSURANCE
    - Tenant is responsible for personal property insurance
    - Landlord maintains property insurance

This agreement is governed by the laws of the state where the property is located.

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

  const onSubmit = (data: FormData) => {
    generateDocument(data);
  };

  const downloadDocument = (format: 'pdf' | 'docx') => {
    // Simulate download
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `rental-agreement.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`${format.toUpperCase()} downloaded successfully!`);
  };

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rental Agreement</h1>
              <p className="text-gray-600">Create a comprehensive rental agreement for residential properties</p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Important:</strong> This is a template for general use. Please review with a legal professional 
              to ensure it meets your specific needs and complies with local laws.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Agreement Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Agreement Title</Label>
                      <Controller
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Rental Agreement" />
                        )}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="landlord_name">Landlord Name</Label>
                        <Controller
                          name="landlord_name"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Enter landlord's full name" />
                          )}
                        />
                        {form.formState.errors.landlord_name && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.landlord_name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="tenant_name">Tenant Name</Label>
                        <Controller
                          name="tenant_name"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Enter tenant's full name" />
                          )}
                        />
                        {form.formState.errors.tenant_name && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.tenant_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="property_address">Property Address</Label>
                      <Controller
                        name="property_address"
                        control={form.control}
                        render={({ field }) => (
                          <Textarea {...field} placeholder="Enter complete property address" rows={3} />
                        )}
                      />
                      {form.formState.errors.property_address && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.property_address.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rent_amount">Monthly Rent ($)</Label>
                        <Controller
                          name="rent_amount"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} type="number" placeholder="0.00" />
                          )}
                        />
                        {form.formState.errors.rent_amount && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.rent_amount.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="lease_term">Lease Term</Label>
                        <Controller
                          name="lease_term"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} placeholder="e.g., 12 months" />
                          )}
                        />
                        {form.formState.errors.lease_term && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.lease_term.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additional_terms">Additional Terms (Optional)</Label>
                      <Controller
                        name="additional_terms"
                        control={form.control}
                        render={({ field }) => (
                          <Textarea {...field} placeholder="Any additional terms or conditions..." rows={4} />
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
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
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Document Preview
                  </CardTitle>
                  {previewMode && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadDocument('pdf')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadDocument('docx')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        DOCX
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {previewMode ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                      {generatedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Fill out the form and click "Generate Document" to see a preview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Document Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Comprehensive rental terms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Security deposit calculation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Payment and utility terms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Maintenance responsibilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Pet and smoking policies</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Review with legal professional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    <span>Export to PDF or DOCX</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default RentalAgreement;
