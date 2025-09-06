import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Eye, 
  EyeOff,
  Crown,
  UserCog,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';
import { adminSetup, AdminSetupData } from '@/utils/adminSetup';
import { useNavigate } from 'react-router-dom';

const AdminSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasAdmins, setHasAdmins] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [setupData, setSetupData] = useState<AdminSetupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'super_admin'
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  const checkAdminStatus = useCallback(async () => {
    try {
      const hasAdmins = await adminSetup.hasAdminUsers();
      setHasAdmins(hasAdmins);
      
      if (hasAdmins) {
        // Redirect to admin login if admins already exist
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }, [navigate]);

  const handleInputChange = (field: keyof AdminSetupData, value: string) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompleteSetup = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!setupData.email || !setupData.password || !setupData.firstName || !setupData.lastName) {
        setError('Please fill in all required fields');
        return;
      }

      if (setupData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      const result = await adminSetup.completeSetup(setupData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin');
        }, 3000);
      } else {
        setError(result.error || 'Setup failed');
      }
    } catch (error) {
      setError('An unexpected error occurred during setup');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Welcome', description: 'Admin system setup' },
    { number: 2, title: 'Admin Details', description: 'Create first admin user' },
    { number: 3, title: 'Review & Complete', description: 'Finalize setup' }
  ];

  if (hasAdmins) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Admin System Ready</CardTitle>
            <CardDescription>
              The admin system has already been set up. Redirecting to admin login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-600">Setup Complete!</CardTitle>
            <CardDescription>
              Your admin system has been successfully configured. Redirecting to admin dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin System Setup</h1>
          <p className="text-white/80">Configure your platform's administration system</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepItem.number 
                    ? 'bg-white text-slate-900 border-white' 
                    : 'border-white/30 text-white/50'
                }`}>
                  {step > stepItem.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepItem.number}</span>
                  )}
                </div>
                <div className="ml-3 text-left">
                  <div className={`text-sm font-medium ${
                    step >= stepItem.number ? 'text-white' : 'text-white/50'
                  }`}>
                    {stepItem.title}
                  </div>
                  <div className={`text-xs ${
                    step >= stepItem.number ? 'text-white/80' : 'text-white/30'
                  }`}>
                    {stepItem.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    step > stepItem.number ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && 'Welcome to Admin Setup'}
              {step === 2 && 'Create Admin Account'}
              {step === 3 && 'Review & Complete'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Let\'s set up your platform\'s administration system'}
              {step === 2 && 'Create the first administrator account'}
              {step === 3 && 'Review your settings and complete the setup'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    <Shield className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Admin System Features</h3>
                  <p className="text-gray-600 mb-6">
                    Your admin system will include comprehensive user management, content moderation, 
                    analytics, and system configuration capabilities.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium">User Management</div>
                      <div className="text-sm text-gray-600">Manage users, roles, and permissions</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium">Content Moderation</div>
                      <div className="text-sm text-gray-600">Monitor and moderate platform content</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-medium">Analytics Dashboard</div>
                      <div className="text-sm text-gray-600">Comprehensive platform insights</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Settings className="h-6 w-6 text-orange-600" />
                    <div>
                      <div className="font-medium">System Settings</div>
                      <div className="text-sm text-gray-600">Configure platform settings</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={setupData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={setupData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={setupData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="admin@glocal.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={setupData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter a strong password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="role">Admin Role</Label>
                  <Select value={setupData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center space-x-2">
                          <Crown className="h-4 w-4" />
                          <span>Super Administrator</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <UserCog className="h-4 w-4" />
                          <span>Administrator</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Super Administrator has full system access, Administrator has most permissions
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Complete Setup</h3>
                  <p className="text-gray-600">
                    Review your admin account details below and complete the setup.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{setupData.firstName} {setupData.lastName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{setupData.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Role:</span>
                    <Badge variant={setupData.role === 'super_admin' ? 'default' : 'secondary'}>
                      {setupData.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                    </Badge>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">Important Notes</div>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• This will create the first admin account with full system access</li>
                        <li>• Default admin roles and system settings will be initialized</li>
                        <li>• You can create additional admin users after setup is complete</li>
                        <li>• All admin actions are logged for security and audit purposes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteSetup}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;
