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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
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
  ArrowLeft,
  Shield,
  Lock,
  Globe,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Building,
  User,
  UserCheck,
  Clock,
  Target,
  Award,
  Star,
  Heart,
  Zap,
  Activity,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  Home,
  Navigation,
  Compass,
  Flag,
  Hash,
  AtSign,
  ExternalLink,
  BookOpen,
  Music,
  Camera,
  Mic,
  Coffee,
  Car,
  Leaf,
  Mountain,
  Globe as GlobeIcon,
  UserPlus,
  Crown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity as ActivityIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Base schema for all legal documents
const baseLegalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  expirationDate: z.string().optional(),
  parties: z.array(z.object({
    name: z.string().min(1, 'Party name is required'),
    email: z.string().email('Valid email is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone number is required'),
    role: z.string().min(1, 'Role is required')
  })).min(2, 'At least 2 parties are required'),
  terms: z.string().min(50, 'Terms must be at least 50 characters'),
  signatures: z.array(z.object({
    partyName: z.string(),
    signature: z.string(),
    date: z.string()
  })).optional()
});

// Employment Contract specific schema
const employmentContractSchema = baseLegalSchema.extend({
  position: z.string().min(1, 'Position is required'),
  salary: z.string().min(1, 'Salary is required'),
  startDate: z.string().min(1, 'Start date is required'),
  workSchedule: z.string().min(1, 'Work schedule is required'),
  benefits: z.string().optional(),
  terminationNotice: z.string().min(1, 'Termination notice is required'),
  confidentiality: z.boolean(),
  nonCompete: z.boolean(),
  intellectualProperty: z.boolean()
});

// NDA specific schema
const ndaSchema = baseLegalSchema.extend({
  confidentialInfo: z.string().min(20, 'Confidential information description is required'),
  disclosurePurpose: z.string().min(10, 'Disclosure purpose is required'),
  duration: z.string().min(1, 'Duration is required'),
  returnOfMaterials: z.boolean(),
  injunctiveRelief: z.boolean(),
  governingLaw: z.string().min(1, 'Governing law is required')
});

// Rental Agreement specific schema
const rentalAgreementSchema = baseLegalSchema.extend({
  propertyAddress: z.string().min(1, 'Property address is required'),
  rentAmount: z.string().min(1, 'Rent amount is required'),
  securityDeposit: z.string().min(1, 'Security deposit is required'),
  leaseTerm: z.string().min(1, 'Lease term is required'),
  utilities: z.string().optional(),
  petsAllowed: z.boolean(),
  smokingAllowed: z.boolean(),
  maintenanceResponsibility: z.string().min(10, 'Maintenance responsibility is required')
});

// Service Agreement specific schema
const serviceAgreementSchema = baseLegalSchema.extend({
  serviceDescription: z.string().min(20, 'Service description is required'),
  serviceFee: z.string().min(1, 'Service fee is required'),
  paymentTerms: z.string().min(10, 'Payment terms are required'),
  deliverables: z.string().min(10, 'Deliverables are required'),
  timeline: z.string().min(1, 'Timeline is required'),
  warranty: z.string().optional(),
  liability: z.string().min(10, 'Liability terms are required'),
  termination: z.string().min(10, 'Termination terms are required')
});

type EmploymentContractForm = z.infer<typeof employmentContractSchema>;
type NDAForm = z.infer<typeof ndaSchema>;
type RentalAgreementForm = z.infer<typeof rentalAgreementSchema>;
type ServiceAgreementForm = z.infer<typeof serviceAgreementSchema>;

const ConsolidatedLegal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employment');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');

  // Employment Contract Form
  const employmentForm = useForm<EmploymentContractForm>({
    resolver: zodResolver(employmentContractSchema),
    defaultValues: {
      title: '',
      description: '',
      effectiveDate: '',
      expirationDate: '',
      parties: [
        { name: '', email: '', address: '', phone: '', role: 'Employer' },
        { name: '', email: '', address: '', phone: '', role: 'Employee' }
      ],
      terms: '',
      position: '',
      salary: '',
      startDate: '',
      workSchedule: '',
      benefits: '',
      terminationNotice: '',
      confidentiality: false,
      nonCompete: false,
      intellectualProperty: false
    }
  });

  // NDA Form
  const ndaForm = useForm<NDAForm>({
    resolver: zodResolver(ndaSchema),
    defaultValues: {
      title: '',
      description: '',
      effectiveDate: '',
      expirationDate: '',
      parties: [
        { name: '', email: '', address: '', phone: '', role: 'Disclosing Party' },
        { name: '', email: '', address: '', phone: '', role: 'Receiving Party' }
      ],
      terms: '',
      confidentialInfo: '',
      disclosurePurpose: '',
      duration: '',
      returnOfMaterials: false,
      injunctiveRelief: false,
      governingLaw: ''
    }
  });

  // Rental Agreement Form
  const rentalForm = useForm<RentalAgreementForm>({
    resolver: zodResolver(rentalAgreementSchema),
    defaultValues: {
      title: '',
      description: '',
      effectiveDate: '',
      expirationDate: '',
      parties: [
        { name: '', email: '', address: '', phone: '', role: 'Landlord' },
        { name: '', email: '', address: '', phone: '', role: 'Tenant' }
      ],
      terms: '',
      propertyAddress: '',
      rentAmount: '',
      securityDeposit: '',
      leaseTerm: '',
      utilities: '',
      petsAllowed: false,
      smokingAllowed: false,
      maintenanceResponsibility: ''
    }
  });

  // Service Agreement Form
  const serviceForm = useForm<ServiceAgreementForm>({
    resolver: zodResolver(serviceAgreementSchema),
    defaultValues: {
      title: '',
      description: '',
      effectiveDate: '',
      expirationDate: '',
      parties: [
        { name: '', email: '', address: '', phone: '', role: 'Service Provider' },
        { name: '', email: '', address: '', phone: '', role: 'Client' }
      ],
      terms: '',
      serviceDescription: '',
      serviceFee: '',
      paymentTerms: '',
      deliverables: '',
      timeline: '',
      warranty: '',
      liability: '',
      termination: ''
    }
  });

  const getCurrentForm = () => {
    switch (activeTab) {
      case 'employment':
        return employmentForm;
      case 'nda':
        return ndaForm;
      case 'rental':
        return rentalForm;
      case 'service':
        return serviceForm;
      default:
        return employmentForm;
    }
  };

  const getCurrentSchema = () => {
    switch (activeTab) {
      case 'employment':
        return employmentContractSchema;
      case 'nda':
        return ndaSchema;
      case 'rental':
        return rentalAgreementSchema;
      case 'service':
        return serviceAgreementSchema;
      default:
        return employmentContractSchema;
    }
  };

  const handleGenerateDocument = async (data: any) => {
    setLoading(true);
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const document = generateDocumentContent(data, activeTab);
      setGeneratedDocument(document);
      setPreviewMode(true);
      
      toast.success('Document generated successfully!');
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentContent = (data: any, type: string) => {
    const template = getDocumentTemplate(type);
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  };

  const getDocumentTemplate = (type: string) => {
    const templates = {
      employment: `
# EMPLOYMENT CONTRACT

**Title:** {{title}}
**Effective Date:** {{effectiveDate}}
**Position:** {{position}}

## PARTIES
{{#each parties}}
- **{{role}}:** {{name}}
  - Email: {{email}}
  - Address: {{address}}
  - Phone: {{phone}}
{{/each}}

## TERMS OF EMPLOYMENT
- **Salary:** {{salary}}
- **Start Date:** {{startDate}}
- **Work Schedule:** {{workSchedule}}
- **Benefits:** {{benefits}}
- **Termination Notice:** {{terminationNotice}}

## CONFIDENTIALITY AND INTELLECTUAL PROPERTY
- Confidentiality Agreement: {{confidentiality}}
- Non-Compete Clause: {{nonCompete}}
- Intellectual Property: {{intellectualProperty}}

## TERMS AND CONDITIONS
{{terms}}

**Generated on:** ${new Date().toLocaleDateString()}
      `,
      nda: `
# NON-DISCLOSURE AGREEMENT

**Title:** {{title}}
**Effective Date:** {{effectiveDate}}

## PARTIES
{{#each parties}}
- **{{role}}:** {{name}}
  - Email: {{email}}
  - Address: {{address}}
  - Phone: {{phone}}
{{/each}}

## CONFIDENTIAL INFORMATION
{{confidentialInfo}}

## DISCLOSURE PURPOSE
{{disclosurePurpose}}

## DURATION
{{duration}}

## ADDITIONAL TERMS
- Return of Materials: {{returnOfMaterials}}
- Injunctive Relief: {{injunctiveRelief}}
- Governing Law: {{governingLaw}}

## TERMS AND CONDITIONS
{{terms}}

**Generated on:** ${new Date().toLocaleDateString()}
      `,
      rental: `
# RENTAL AGREEMENT

**Title:** {{title}}
**Effective Date:** {{effectiveDate}}

## PARTIES
{{#each parties}}
- **{{role}}:** {{name}}
  - Email: {{email}}
  - Address: {{address}}
  - Phone: {{phone}}
{{/each}}

## PROPERTY DETAILS
- **Address:** {{propertyAddress}}
- **Rent Amount:** ${{rentAmount}}
- **Security Deposit:** ${{securityDeposit}}
- **Lease Term:** {{leaseTerm}}
- **Utilities:** {{utilities}}

## PROPERTY RULES
- Pets Allowed: {{petsAllowed}}
- Smoking Allowed: {{smokingAllowed}}
- Maintenance Responsibility: {{maintenanceResponsibility}}

## TERMS AND CONDITIONS
{{terms}}

**Generated on:** ${new Date().toLocaleDateString()}
      `,
      service: `
# SERVICE AGREEMENT

**Title:** {{title}}
**Effective Date:** {{effectiveDate}}

## PARTIES
{{#each parties}}
- **{{role}}:** {{name}}
  - Email: {{email}}
  - Address: {{address}}
  - Phone: {{phone}}
{{/each}}

## SERVICE DETAILS
- **Service Description:** {{serviceDescription}}
- **Service Fee:** ${{serviceFee}}
- **Payment Terms:** {{paymentTerms}}
- **Deliverables:** {{deliverables}}
- **Timeline:** {{timeline}}
- **Warranty:** {{warranty}}

## LIABILITY AND TERMINATION
- **Liability:** {{liability}}
- **Termination:** {{termination}}

## TERMS AND CONDITIONS
{{terms}}

**Generated on:** ${new Date().toLocaleDateString()}
      `
    };
    
    return templates[type as keyof typeof templates] || templates.employment;
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedDocument], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTab}-agreement-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'employment':
        return <User className="w-5 h-5" />;
      case 'nda':
        return <Shield className="w-5 h-5" />;
      case 'rental':
        return <Building className="w-5 h-5" />;
      case 'service':
        return <Target className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'employment':
        return 'Employment Contract';
      case 'nda':
        return 'Non-Disclosure Agreement';
      case 'rental':
        return 'Rental Agreement';
      case 'service':
        return 'Service Agreement';
      default:
        return 'Legal Document';
    }
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                Legal Document Generator
              </h1>
              <p className="text-gray-600 mt-2">
                Create professional legal documents with our guided templates
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="employment" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employment
                </TabsTrigger>
                <TabsTrigger value="nda" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  NDA
                </TabsTrigger>
                <TabsTrigger value="rental" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Rental
                </TabsTrigger>
                <TabsTrigger value="service" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Service
                </TabsTrigger>
              </TabsList>

              {/* Employment Contract Tab */}
              <TabsContent value="employment" className="space-y-6">
                <form onSubmit={employmentForm.handleSubmit(handleGenerateDocument)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="emp-title">Contract Title *</Label>
                      <Input
                        id="emp-title"
                        {...employmentForm.register('title')}
                        placeholder="e.g., Software Engineer Employment Contract"
                      />
                      {employmentForm.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {employmentForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emp-position">Position *</Label>
                      <Input
                        id="emp-position"
                        {...employmentForm.register('position')}
                        placeholder="e.g., Software Engineer"
                      />
                      {employmentForm.formState.errors.position && (
                        <p className="text-sm text-red-600 mt-1">
                          {employmentForm.formState.errors.position.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="emp-salary">Salary *</Label>
                      <Input
                        id="emp-salary"
                        {...employmentForm.register('salary')}
                        placeholder="e.g., $75,000 annually"
                      />
                      {employmentForm.formState.errors.salary && (
                        <p className="text-sm text-red-600 mt-1">
                          {employmentForm.formState.errors.salary.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emp-start-date">Start Date *</Label>
                      <Input
                        id="emp-start-date"
                        type="date"
                        {...employmentForm.register('startDate')}
                      />
                      {employmentForm.formState.errors.startDate && (
                        <p className="text-sm text-red-600 mt-1">
                          {employmentForm.formState.errors.startDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emp-description">Description *</Label>
                    <Textarea
                      id="emp-description"
                      {...employmentForm.register('description')}
                      placeholder="Brief description of the employment contract..."
                      rows={3}
                    />
                    {employmentForm.formState.errors.description && (
                      <p className="text-sm text-red-600 mt-1">
                        {employmentForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emp-terms">Terms and Conditions *</Label>
                    <Textarea
                      id="emp-terms"
                      {...employmentForm.register('terms')}
                      placeholder="Detailed terms and conditions..."
                      rows={6}
                    />
                    {employmentForm.formState.errors.terms && (
                      <p className="text-sm text-red-600 mt-1">
                        {employmentForm.formState.errors.terms.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="confidentiality"
                        {...employmentForm.register('confidentiality')}
                      />
                      <Label htmlFor="confidentiality">Confidentiality Agreement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="non-compete"
                        {...employmentForm.register('nonCompete')}
                      />
                      <Label htmlFor="non-compete">Non-Compete Clause</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ip"
                        {...employmentForm.register('intellectualProperty')}
                      />
                      <Label htmlFor="ip">Intellectual Property</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Contract
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* NDA Tab */}
              <TabsContent value="nda" className="space-y-6">
                <form onSubmit={ndaForm.handleSubmit(handleGenerateDocument)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="nda-title">Agreement Title *</Label>
                      <Input
                        id="nda-title"
                        {...ndaForm.register('title')}
                        placeholder="e.g., Confidentiality Agreement"
                      />
                      {ndaForm.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {ndaForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="nda-duration">Duration *</Label>
                      <Input
                        id="nda-duration"
                        {...ndaForm.register('duration')}
                        placeholder="e.g., 2 years"
                      />
                      {ndaForm.formState.errors.duration && (
                        <p className="text-sm text-red-600 mt-1">
                          {ndaForm.formState.errors.duration.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nda-confidential">Confidential Information *</Label>
                    <Textarea
                      id="nda-confidential"
                      {...ndaForm.register('confidentialInfo')}
                      placeholder="Describe the confidential information..."
                      rows={3}
                    />
                    {ndaForm.formState.errors.confidentialInfo && (
                      <p className="text-sm text-red-600 mt-1">
                        {ndaForm.formState.errors.confidentialInfo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nda-purpose">Disclosure Purpose *</Label>
                    <Textarea
                      id="nda-purpose"
                      {...ndaForm.register('disclosurePurpose')}
                      placeholder="Purpose of disclosing confidential information..."
                      rows={3}
                    />
                    {ndaForm.formState.errors.disclosurePurpose && (
                      <p className="text-sm text-red-600 mt-1">
                        {ndaForm.formState.errors.disclosurePurpose.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="return-materials"
                        {...ndaForm.register('returnOfMaterials')}
                      />
                      <Label htmlFor="return-materials">Return of Materials</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="injunctive-relief"
                        {...ndaForm.register('injunctiveRelief')}
                      />
                      <Label htmlFor="injunctive-relief">Injunctive Relief</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Generate NDA
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Rental Agreement Tab */}
              <TabsContent value="rental" className="space-y-6">
                <form onSubmit={rentalForm.handleSubmit(handleGenerateDocument)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="rental-title">Agreement Title *</Label>
                      <Input
                        id="rental-title"
                        {...rentalForm.register('title')}
                        placeholder="e.g., Residential Lease Agreement"
                      />
                      {rentalForm.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {rentalForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="rental-address">Property Address *</Label>
                      <Input
                        id="rental-address"
                        {...rentalForm.register('propertyAddress')}
                        placeholder="123 Main St, City, State 12345"
                      />
                      {rentalForm.formState.errors.propertyAddress && (
                        <p className="text-sm text-red-600 mt-1">
                          {rentalForm.formState.errors.propertyAddress.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="rental-amount">Rent Amount *</Label>
                      <Input
                        id="rental-amount"
                        {...rentalForm.register('rentAmount')}
                        placeholder="1500"
                      />
                      {rentalForm.formState.errors.rentAmount && (
                        <p className="text-sm text-red-600 mt-1">
                          {rentalForm.formState.errors.rentAmount.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="rental-deposit">Security Deposit *</Label>
                      <Input
                        id="rental-deposit"
                        {...rentalForm.register('securityDeposit')}
                        placeholder="1500"
                      />
                      {rentalForm.formState.errors.securityDeposit && (
                        <p className="text-sm text-red-600 mt-1">
                          {rentalForm.formState.errors.securityDeposit.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="rental-term">Lease Term *</Label>
                      <Input
                        id="rental-term"
                        {...rentalForm.register('leaseTerm')}
                        placeholder="12 months"
                      />
                      {rentalForm.formState.errors.leaseTerm && (
                        <p className="text-sm text-red-600 mt-1">
                          {rentalForm.formState.errors.leaseTerm.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pets-allowed"
                        {...rentalForm.register('petsAllowed')}
                      />
                      <Label htmlFor="pets-allowed">Pets Allowed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smoking-allowed"
                        {...rentalForm.register('smokingAllowed')}
                      />
                      <Label htmlFor="smoking-allowed">Smoking Allowed</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Building className="w-4 h-4 mr-2" />
                          Generate Agreement
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Service Agreement Tab */}
              <TabsContent value="service" className="space-y-6">
                <form onSubmit={serviceForm.handleSubmit(handleGenerateDocument)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="service-title">Agreement Title *</Label>
                      <Input
                        id="service-title"
                        {...serviceForm.register('title')}
                        placeholder="e.g., Web Development Service Agreement"
                      />
                      {serviceForm.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {serviceForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="service-fee">Service Fee *</Label>
                      <Input
                        id="service-fee"
                        {...serviceForm.register('serviceFee')}
                        placeholder="5000"
                      />
                      {serviceForm.formState.errors.serviceFee && (
                        <p className="text-sm text-red-600 mt-1">
                          {serviceForm.formState.errors.serviceFee.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="service-description">Service Description *</Label>
                    <Textarea
                      id="service-description"
                      {...serviceForm.register('serviceDescription')}
                      placeholder="Detailed description of the services to be provided..."
                      rows={3}
                    />
                    {serviceForm.formState.errors.serviceDescription && (
                      <p className="text-sm text-red-600 mt-1">
                        {serviceForm.formState.errors.serviceDescription.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="service-timeline">Timeline *</Label>
                      <Input
                        id="service-timeline"
                        {...serviceForm.register('timeline')}
                        placeholder="e.g., 3 months"
                      />
                      {serviceForm.formState.errors.timeline && (
                        <p className="text-sm text-red-600 mt-1">
                          {serviceForm.formState.errors.timeline.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="service-payment">Payment Terms *</Label>
                      <Input
                        id="service-payment"
                        {...serviceForm.register('paymentTerms')}
                        placeholder="e.g., 50% upfront, 50% on completion"
                      />
                      {serviceForm.formState.errors.paymentTerms && (
                        <p className="text-sm text-red-600 mt-1">
                          {serviceForm.formState.errors.paymentTerms.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Generate Agreement
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview Modal */}
        {previewMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getDocumentIcon(activeTab)}
                  {getDocumentTitle(activeTab)} Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewMode(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedDocument}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedLegal;
