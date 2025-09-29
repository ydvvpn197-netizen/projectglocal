import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Shield,
  User,
  Key,
  RefreshCw,
  Home,
  ArrowRight,
  Sparkles,
  Crown,
  Star,
  Heart,
  Zap,
  Target,
  Award,
  Activity,
  BarChart3,
  MessageSquare,
  Calendar,
  Users,
  Globe,
  Building,
  Car,
  Music,
  Camera,
  Mic,
  BookOpen,
  Coffee,
  Phone,
  ExternalLink,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Bell,
  Settings,
  Navigation,
  Compass,
  Flag,
  Hash,
  AtSign,
  DollarSign,
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Activity as ActivityIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  userType?: 'user' | 'artist';
  rememberMe?: boolean;
  agreeToTerms?: boolean;
}

interface AuthError {
  field: string;
  message: string;
}

const ConsolidatedAuth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'user',
    rememberMe: false,
    agreeToTerms: false
  });

  // Check for redirect parameters
  const redirectTo = searchParams.get('redirect') || '/';
  const mode = searchParams.get('mode') || 'signin';

  useEffect(() => {
    if (mode === 'signup') {
      setActiveTab('signup');
    } else if (mode === 'forgot') {
      setActiveTab('forgot');
    } else if (mode === 'reset') {
      setActiveTab('reset');
    }
  }, [mode]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  const validateForm = (): boolean => {
    const newErrors: AuthError[] = [];

    if (!formData.email) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Email is invalid' });
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    } else if (formData.password.length < 6) {
      newErrors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    if (activeTab === 'signup') {
      if (!formData.fullName) {
        newErrors.push({ field: 'fullName', message: 'Full name is required' });
      }
      
      if (!formData.confirmPassword) {
        newErrors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
      }
      
      if (!formData.agreeToTerms) {
        newErrors.push({ field: 'agreeToTerms', message: 'You must agree to the terms and conditions' });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors([]);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrors([{ field: 'general', message: error.message }]);
      } else {
        toast.success('Signed in successfully!');
        navigate(redirectTo);
      }
    } catch (error) {
      setErrors([{ field: 'general', message: 'An unexpected error occurred' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors([]);
    
    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        {
          full_name: formData.fullName,
          user_type: formData.userType
        }
      );
      
      if (error) {
        setErrors([{ field: 'general', message: error.message }]);
      } else {
        setSuccessMessage('Account created successfully! Please check your email to verify your account.');
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          userType: 'user',
          rememberMe: false,
          agreeToTerms: false
        });
      }
    } catch (error) {
      setErrors([{ field: 'general', message: 'An unexpected error occurred' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setErrors([{ field: 'email', message: 'Email is required' }]);
      return;
    }

    setLoading(true);
    setErrors([]);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });
      
      if (error) {
        setErrors([{ field: 'general', message: error.message }]);
      } else {
        setSuccessMessage('Password reset email sent! Please check your email.');
      }
    } catch (error) {
      setErrors([{ field: 'general', message: 'An unexpected error occurred' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors([]);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) {
        setErrors([{ field: 'general', message: error.message }]);
      } else {
        toast.success('Password updated successfully!');
        navigate('/');
      }
    } catch (error) {
      setErrors([{ field: 'general', message: 'An unexpected error occurred' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`
        }
      });
      
      if (error) {
        setErrors([{ field: 'general', message: error.message }]);
      }
    } catch (error) {
      setErrors([{ field: 'general', message: 'An unexpected error occurred' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const getError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  if (loading && !errors.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we process your request</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to TheGlocal
          </h1>
          <p className="text-gray-600 mt-2">
            Join our privacy-first community platform
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="forgot">Forgot</TabsTrigger>
              </TabsList>

              {/* Success Message */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* General Error */}
              {getError('general') && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getError('general')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email Address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={getError('email') ? 'border-red-500' : ''}
                      placeholder="Enter your email"
                    />
                    {getError('email') && (
                      <p className="text-sm text-red-600 mt-1">{getError('email')}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={getError('password') ? 'border-red-500 pr-10' : 'pr-10'}
                        placeholder="Enter your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {getError('password') && (
                      <p className="text-sm text-red-600 mt-1">{getError('password')}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                      onClick={() => setActiveTab('forgot')}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={getError('fullName') ? 'border-red-500' : ''}
                      placeholder="Enter your full name"
                    />
                    {getError('fullName') && (
                      <p className="text-sm text-red-600 mt-1">{getError('fullName')}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={getError('email') ? 'border-red-500' : ''}
                      placeholder="Enter your email"
                    />
                    {getError('email') && (
                      <p className="text-sm text-red-600 mt-1">{getError('email')}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-usertype">Account Type</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Button
                        type="button"
                        variant={formData.userType === 'user' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('userType', 'user')}
                        className="flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Regular User
                      </Button>
                      <Button
                        type="button"
                        variant={formData.userType === 'artist' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('userType', 'artist')}
                        className="flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Artist
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={getError('password') ? 'border-red-500 pr-10' : 'pr-10'}
                        placeholder="Create a password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {getError('password') && (
                      <p className="text-sm text-red-600 mt-1">{getError('password')}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={getError('confirmPassword') ? 'border-red-500 pr-10' : 'pr-10'}
                        placeholder="Confirm your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {getError('confirmPassword') && (
                      <p className="text-sm text-red-600 mt-1">{getError('confirmPassword')}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agree-terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    />
                    <Label htmlFor="agree-terms" className="text-sm">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  {getError('agreeToTerms') && (
                    <p className="text-sm text-red-600">{getError('agreeToTerms')}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </TabsContent>

              {/* Forgot Password Tab */}
              <TabsContent value="forgot" className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                  <p className="text-gray-600 mt-2">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={getError('email') ? 'border-red-500' : ''}
                      placeholder="Enter your email"
                    />
                    {getError('email') && (
                      <p className="text-sm text-red-600 mt-1">{getError('email')}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('signin')}
                    className="text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Sign In
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedAuth;
