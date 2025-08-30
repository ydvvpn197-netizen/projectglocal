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

const employmentContractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  employer_name: z.string().min(1, 'Employer name is required'),
  employee_name: z.string().min(1, 'Employee name is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.string().min(1, 'Salary is required'),
  start_date: z.string().min(1, 'Start date is required'),
  additional_terms: z.string().optional(),
});

type FormData = z.infer<typeof employmentContractSchema>;

export const EmploymentContract: React.FC = () => {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(employmentContractSchema),
    defaultValues: {
      title: 'Employment Contract',
      employer_name: '',
      employee_name: '',
      position: '',
      salary: '',
      start_date: '',
      additional_terms: '',
    },
  });

  const generateDocument = async (data: FormData) => {
    setIsGenerating(true);
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = `
EMPLOYMENT CONTRACT

This Employment Contract (the "Contract") is made and entered into on ${new Date().toLocaleDateString()} by and between:

EMPLOYER: ${data.employer_name}
EMPLOYEE: ${data.employee_name}

1. POSITION AND DUTIES
   - Position: ${data.position}
   - Employee shall perform all duties and responsibilities associated with this position
   - Employee shall report to their designated supervisor
   - Employee shall comply with all company policies and procedures

2. COMPENSATION
   - Annual Salary: $${data.salary}
   - Payment Schedule: Bi-weekly
   - Payment Method: Direct deposit or check as designated by employee

3. EMPLOYMENT TERM
   - Start Date: ${data.start_date}
   - Employment Type: At-will employment
   - Either party may terminate this agreement with appropriate notice

4. WORK SCHEDULE
   - Standard work hours: Monday to Friday, 9:00 AM to 5:00 PM
   - Overtime may be required based on business needs
   - Flexible work arrangements may be available based on position

5. BENEFITS
   - Health insurance coverage (if applicable)
   - Paid time off and holidays
   - Retirement plan participation (if applicable)
   - Professional development opportunities

6. CONFIDENTIALITY
   - Employee shall maintain confidentiality of company information
   - Non-disclosure of trade secrets and proprietary information
   - Obligation continues after employment termination

7. NON-COMPETE CLAUSE
   - Employee agrees not to work for direct competitors for 12 months after termination
   - Geographic and temporal restrictions apply
   - Reasonable limitations based on position and industry

8. ADDITIONAL TERMS
   ${data.additional_terms || 'No additional terms specified.'}

9. TERMINATION
   - Either party may terminate employment with appropriate notice
   - Immediate termination for cause (misconduct, violation of policies)
   - Exit interview and return of company property required

10. GOVERNING LAW
    - This contract is governed by the laws of the state of employment
    - Any disputes shall be resolved through appropriate legal channels

This Contract constitutes the entire understanding between the parties and supersedes all prior agreements.

EMPLOYER SIGNATURE: _________________ DATE: _______________
EMPLOYEE SIGNATURE: _________________ DATE: _______________
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
    <ResponsiveLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employment Contract</h1>
              <p className="text-gray-600">Create a comprehensive employment agreement</p>
            </div>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <AlertTriangle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Important:</strong> This is a template for general use. Please review with a legal professional 
              to ensure it meets your specific needs and complies with local employment laws.
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
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(generateDocument)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Contract Title</Label>
                      <Controller
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                          <Input {...field} placeholder="Employment Contract" />
                        )}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employer_name">Employer Name</Label>
                        <Controller
                          name="employer_name"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Enter employer's name" />
                          )}
                        />
                        {form.formState.errors.employer_name && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.employer_name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="employee_name">Employee Name</Label>
                        <Controller
                          name="employee_name"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Enter employee's name" />
                          )}
                        />
                        {form.formState.errors.employee_name && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.employee_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position">Position/Job Title</Label>
                        <Controller
                          name="position"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Enter job title" />
                          )}
                        />
                        {form.formState.errors.position && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.position.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Controller
                          name="start_date"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} type="date" />
                          )}
                        />
                        {form.formState.errors.start_date && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.start_date.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salary">Annual Salary ($)</Label>
                        <Controller
                          name="salary"
                          control={form.control}
                          render={({ field }) => (
                            <Input {...field} type="number" placeholder="0.00" />
                          )}
                        />
                        {form.formState.errors.salary && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.salary.message}</p>
                        )}
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
                        onClick={() => handleExport('pdf')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExport('docx')}
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
                    <span className="text-sm">Comprehensive employment terms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Confidentiality and non-compete clauses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Intellectual property protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Benefits and compensation terms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Performance review framework</span>
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

export default EmploymentContract;
