import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Info
} from 'lucide-react';
import { legalAssistantService, DocumentType, LegalDraft } from '@/services/legalAssistantService';
import { toast } from 'sonner';

// Form validation schemas for different document types
const rentalAgreementSchema = z.object({
  document_type: z.literal('rental_agreement'),
  title: z.string().min(1, 'Title is required'),
  landlord_name: z.string().min(1, 'Landlord name is required'),
  tenant_name: z.string().min(1, 'Tenant name is required'),
  property_address: z.string().min(1, 'Property address is required'),
  rent_amount: z.string().min(1, 'Rent amount is required'),
  lease_term: z.string().min(1, 'Lease term is required'),
  additional_terms: z.string().optional(),
});

const employmentContractSchema = z.object({
  document_type: z.literal('employment_contract'),
  title: z.string().min(1, 'Title is required'),
  employer_name: z.string().min(1, 'Employer name is required'),
  employee_name: z.string().min(1, 'Employee name is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.string().min(1, 'Salary is required'),
  start_date: z.string().min(1, 'Start date is required'),
  additional_terms: z.string().optional(),
});

const ndaSchema = z.object({
  document_type: z.literal('nda'),
  title: z.string().min(1, 'Title is required'),
  disclosing_party: z.string().min(1, 'Disclosing party is required'),
  receiving_party: z.string().min(1, 'Receiving party is required'),
  confidential_information: z.string().min(1, 'Confidential information description is required'),
  term: z.string().min(1, 'Term is required'),
  additional_terms: z.string().optional(),
});

const serviceAgreementSchema = z.object({
  document_type: z.literal('service_agreement'),
  title: z.string().min(1, 'Title is required'),
  service_provider: z.string().min(1, 'Service provider is required'),
  client: z.string().min(1, 'Client is required'),
  services: z.string().min(1, 'Services description is required'),
  payment_terms: z.string().min(1, 'Payment terms are required'),
  additional_terms: z.string().optional(),
});

const formSchema = z.discriminatedUnion('document_type', [
  rentalAgreementSchema,
  employmentContractSchema,
  ndaSchema,
  serviceAgreementSchema,
]);

type FormData = z.infer<typeof formSchema>;

interface LegalDocumentFormProps {
  onDraftCreated?: (draft: LegalDraft) => void;
  initialData?: Partial<LegalDraft>;
}

export const LegalDocumentForm: React.FC<LegalDocumentFormProps> = ({ 
  onDraftCreated,
  initialData 
}) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  // Fetch document types
  const { data: documentTypes = [] } = useQuery({
    queryKey: ['legal-document-types'],
    queryFn: () => legalAssistantService.getDocumentTypes(),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      document_type: 'rental_agreement' as const,
      title: '',
      additional_terms: '',
      ...initialData,
    },
  });

  // Create draft mutation
  const createDraftMutation = useMutation({
    mutationFn: (data: FormData) => {
      const content = generateDocumentContent(data);
      return legalAssistantService.createDraft({
        title: data.title,
        content,
        document_type: data.document_type,
        status: 'draft',
      });
    },
    onSuccess: (draft) => {
      toast.success('Document draft created successfully');
      onDraftCreated?.(draft);
    },
    onError: (error) => {
      console.error('Error creating draft:', error);
      toast.error('Failed to create document draft');
    },
  });

  // Generate document mutation
  const generateDocumentMutation = useMutation({
    mutationFn: (draftId: string) => legalAssistantService.generateDocument(draftId),
    onSuccess: ({ pdfUrl, docxUrl }) => {
      toast.success('Document generated successfully');
      // In a real app, you would trigger downloads here
      console.log('PDF URL:', pdfUrl);
      console.log('DOCX URL:', docxUrl);
    },
    onError: (error) => {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
    },
  });

  const generateDocumentContent = (data: FormData): string => {
    let content = `# ${data.title}\n\n`;
    content += `**Generated on:** ${new Date().toLocaleDateString()}\n\n`;

    switch (data.document_type) {
      case 'rental_agreement':
        content += `## RENTAL AGREEMENT\n\n`;
        content += `**Landlord:** ${data.landlord_name}\n`;
        content += `**Tenant:** ${data.tenant_name}\n`;
        content += `**Property Address:** ${data.property_address}\n`;
        content += `**Monthly Rent:** ${data.rent_amount}\n`;
        content += `**Lease Term:** ${data.lease_term}\n\n`;
        content += `### TERMS AND CONDITIONS\n\n`;
        content += `1. **Rent Payment:** Tenant agrees to pay ${data.rent_amount} monthly on or before the first day of each month.\n`;
        content += `2. **Property Use:** Tenant shall use the property solely for residential purposes.\n`;
        content += `3. **Maintenance:** Landlord is responsible for major repairs; tenant for minor maintenance.\n`;
        content += `4. **Utilities:** [To be specified based on agreement]\n`;
        content += `5. **Security Deposit:** [Amount to be specified]\n\n`;
        break;

      case 'employment_contract':
        content += `## EMPLOYMENT CONTRACT\n\n`;
        content += `**Employer:** ${data.employer_name}\n`;
        content += `**Employee:** ${data.employee_name}\n`;
        content += `**Position:** ${data.position}\n`;
        content += `**Salary:** ${data.salary}\n`;
        content += `**Start Date:** ${data.start_date}\n\n`;
        content += `### TERMS OF EMPLOYMENT\n\n`;
        content += `1. **Position and Duties:** Employee shall serve as ${data.position}.\n`;
        content += `2. **Compensation:** Employee shall receive ${data.salary} as compensation.\n`;
        content += `3. **Work Schedule:** [To be specified]\n`;
        content += `4. **Benefits:** [To be specified]\n`;
        content += `5. **Termination:** Either party may terminate with [notice period] notice.\n\n`;
        break;

      case 'nda':
        content += `## NON-DISCLOSURE AGREEMENT\n\n`;
        content += `**Disclosing Party:** ${data.disclosing_party}\n`;
        content += `**Receiving Party:** ${data.receiving_party}\n`;
        content += `**Term:** ${data.term}\n\n`;
        content += `### CONFIDENTIAL INFORMATION\n\n`;
        content += `${data.confidential_information}\n\n`;
        content += `### OBLIGATIONS\n\n`;
        content += `1. **Confidentiality:** Receiving party shall maintain strict confidentiality.\n`;
        content += `2. **Use Restrictions:** Information may only be used for [specified purpose].\n`;
        content += `3. **Return of Materials:** All confidential materials must be returned upon termination.\n`;
        content += `4. **Duration:** This agreement remains in effect for ${data.term}.\n\n`;
        break;

      case 'service_agreement':
        content += `## SERVICE AGREEMENT\n\n`;
        content += `**Service Provider:** ${data.service_provider}\n`;
        content += `**Client:** ${data.client}\n`;
        content += `**Services:** ${data.services}\n`;
        content += `**Payment Terms:** ${data.payment_terms}\n\n`;
        content += `### SERVICE TERMS\n\n`;
        content += `1. **Services:** Provider shall deliver the following services: ${data.services}\n`;
        content += `2. **Payment:** Client agrees to pay according to: ${data.payment_terms}\n`;
        content += `3. **Timeline:** [To be specified]\n`;
        content += `4. **Quality Standards:** [To be specified]\n`;
        content += `5. **Termination:** Either party may terminate with [notice period] notice.\n\n`;
        break;
    }

    if (data.additional_terms) {
      content += `### ADDITIONAL TERMS\n\n${data.additional_terms}\n\n`;
    }

    content += `### DISCLAIMER\n\n`;
    content += `This document is generated by an AI assistant and is not a substitute for professional legal advice. `;
    content += `Please consult with a qualified attorney to review and customize this document for your specific needs.\n\n`;
    content += `**Generated on:** ${new Date().toLocaleDateString()}\n`;
    content += `**Document Type:** ${data.document_type.replace('_', ' ').toUpperCase()}\n`;

    return content;
  };

  const handleDocumentTypeChange = (type: string) => {
    setSelectedDocumentType(type);
    form.reset({
      document_type: type as any,
      title: '',
      additional_terms: '',
    });
  };

  const handlePreview = () => {
    const data = form.getValues();
    if (form.formState.isValid) {
      const content = generateDocumentContent(data);
      setGeneratedContent(content);
      setPreviewMode(true);
    } else {
      form.trigger();
    }
  };

  const handleSubmit = (data: FormData) => {
    createDraftMutation.mutate(data);
  };

  const renderFormFields = () => {
    const documentType = form.watch('document_type');

    switch (documentType) {
      case 'rental_agreement':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="landlord_name">Landlord Name</Label>
                <Input
                  id="landlord_name"
                  {...form.register('landlord_name')}
                  placeholder="Enter landlord's full name"
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
                  placeholder="Enter tenant's full name"
                />
                {form.formState.errors.tenant_name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.tenant_name.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="property_address">Property Address</Label>
              <Input
                id="property_address"
                {...form.register('property_address')}
                placeholder="Enter complete property address"
              />
              {form.formState.errors.property_address && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.property_address.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rent_amount">Monthly Rent</Label>
                <Input
                  id="rent_amount"
                  {...form.register('rent_amount')}
                  placeholder="e.g., $1,500"
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
                  placeholder="e.g., 12 months"
                />
                {form.formState.errors.lease_term && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.lease_term.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'employment_contract':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employer_name">Employer Name</Label>
                <Input
                  id="employer_name"
                  {...form.register('employer_name')}
                  placeholder="Enter employer's name"
                />
                {form.formState.errors.employer_name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.employer_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="employee_name">Employee Name</Label>
                <Input
                  id="employee_name"
                  {...form.register('employee_name')}
                  placeholder="Enter employee's name"
                />
                {form.formState.errors.employee_name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.employee_name.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  {...form.register('position')}
                  placeholder="Enter job position"
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.position.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  {...form.register('salary')}
                  placeholder="e.g., $50,000 annually"
                />
                {form.formState.errors.salary && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.salary.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                {...form.register('start_date')}
                placeholder="e.g., January 1, 2024"
              />
              {form.formState.errors.start_date && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.start_date.message}</p>
              )}
            </div>
          </div>
        );

      case 'nda':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="disclosing_party">Disclosing Party</Label>
                <Input
                  id="disclosing_party"
                  {...form.register('disclosing_party')}
                  placeholder="Enter disclosing party name"
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
                  placeholder="Enter receiving party name"
                />
                {form.formState.errors.receiving_party && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.receiving_party.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="confidential_information">Confidential Information</Label>
              <Textarea
                id="confidential_information"
                {...form.register('confidential_information')}
                placeholder="Describe the confidential information to be protected"
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
                placeholder="e.g., 2 years"
              />
              {form.formState.errors.term && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.term.message}</p>
              )}
            </div>
          </div>
        );

      case 'service_agreement':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_provider">Service Provider</Label>
                <Input
                  id="service_provider"
                  {...form.register('service_provider')}
                  placeholder="Enter service provider name"
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
                  placeholder="Enter client name"
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
                placeholder="Describe the services to be provided"
                rows={3}
              />
              {form.formState.errors.services && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.services.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                {...form.register('payment_terms')}
                placeholder="e.g., $100/hour, net 30 days"
              />
              {form.formState.errors.payment_terms && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.payment_terms.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (previewMode) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Preview</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(false)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => {
                  const data = form.getValues();
                  handleSubmit(data);
                  setPreviewMode(false);
                }}
                disabled={createDraftMutation.isPending}
              >
                {createDraftMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Draft
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
              {generatedContent}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Create Legal Document
        </CardTitle>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool generates legal document drafts. Please review with a qualified attorney before use.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Document Type Selection */}
          <div>
            <Label>Document Type</Label>
            <Select
              value={selectedDocumentType}
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Title */}
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Enter document title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Dynamic Form Fields */}
          {selectedDocumentType && (
            <>
              <Separator />
              {renderFormFields()}
            </>
          )}

          {/* Additional Terms */}
          <div>
            <Label htmlFor="additional_terms">Additional Terms (Optional)</Label>
            <Textarea
              id="additional_terms"
              {...form.register('additional_terms')}
              placeholder="Add any additional terms or conditions..."
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!selectedDocumentType}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              type="submit"
              disabled={createDraftMutation.isPending || !selectedDocumentType}
            >
              {createDraftMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Create Draft
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
