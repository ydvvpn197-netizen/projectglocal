import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Home, 
  User, 
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  Shield,
  Lock,
  Globe,
  Users,
  Bell,
  Settings,
  Target,
  Award,
  Star,
  Heart,
  Zap,
  Activity,
  BarChart3,
  MessageSquare,
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
  Building,
  Leaf,
  Mountain,
  Globe as GlobeIcon,
  UserPlus,
  Crown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity as ActivityIcon,
  ArrowLeft,
  RefreshCw,
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
  Eye,
  EyeOff,
  Phone,
  Mail,
  FileText,
  Headphones,
  Palette,
  Calendar as CalendarIcon,
  MapPin,
  Clock as ClockIcon,
  Tag,
  Edit3,
  MessageCircle,
  Users as UsersIcon,
  Building as BuildingIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Activity as ActivityIcon2,
  BarChart3 as BarChart3Icon,
  MessageSquare as MessageSquareIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  ExternalLink as ExternalLinkIcon,
  BookOpen as BookOpenIcon,
  Music as MusicIcon,
  Camera as CameraIcon,
  Mic as MicIcon,
  Coffee as CoffeeIcon,
  Car as CarIcon,
  Building as BuildingIcon2,
  Leaf as LeafIcon,
  Mountain as MountainIcon,
  Globe as GlobeIcon2,
  UserPlus as UserPlusIcon,
  Crown as CrownIcon,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon3,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentSession {
  sessionId: string;
  verified: boolean;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  paymentMethod: string;
  createdAt: string;
  description?: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  description: string;
  createdAt: string;
  paymentMethod: string;
}

const ConsolidatedPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('success');
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<PaymentSession | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const isSuccess = searchParams.get('success') === 'true';
  const isCancel = searchParams.get('cancel') === 'true';

  useEffect(() => {
    if (isSuccess) {
      setActiveTab('success');
      verifyPayment();
    } else if (isCancel) {
      setActiveTab('cancel');
      setLoading(false);
    } else {
      setActiveTab('history');
      fetchPaymentHistory();
    }
  }, [isSuccess, isCancel, sessionId, verifyPayment, fetchPaymentHistory]);

  const verifyPayment = useCallback(async () => {
    if (!sessionId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSessionData: PaymentSession = {
        sessionId,
        verified: true,
        amount: 29.99,
        currency: 'USD',
        status: 'succeeded',
        paymentMethod: 'card_4242',
        createdAt: new Date().toISOString(),
        description: 'Pro Subscription - Monthly'
      };
      
      setSessionData(mockSessionData);
      
      toast.success('Payment verified successfully!');
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Failed to verify payment');
      toast.error('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Simulate fetching payment history
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockHistory: PaymentHistory[] = [
        {
          id: '1',
          amount: 29.99,
          currency: 'USD',
          status: 'succeeded',
          description: 'Pro Subscription - Monthly',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card_4242'
        },
        {
          id: '2',
          amount: 29.99,
          currency: 'USD',
          status: 'succeeded',
          description: 'Pro Subscription - Monthly',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card_4242'
        },
        {
          id: '3',
          amount: 99.99,
          currency: 'USD',
          status: 'failed',
          description: 'Enterprise Plan - Monthly',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'card_4242'
        }
      ];
      
      setPaymentHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleRetryPayment = () => {
    navigate('/pricing');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment...</h2>
            <p className="text-gray-600">Please wait while we verify your payment</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  Payment Center
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your payments and subscription
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
              <TabsTrigger value="success" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Success
              </TabsTrigger>
              <TabsTrigger value="cancel" className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Cancel
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Success Tab */}
            <TabsContent value="success" className="space-y-6">
              {sessionData ? (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-900">
                      Payment Successful!
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Your payment has been processed successfully
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Amount:</span>
                        <span className="text-lg font-bold">${sessionData.amount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Description:</span>
                        <span>{sessionData.description}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payment Method:</span>
                        <span>•••• {sessionData.paymentMethod.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Date:</span>
                        <span>{new Date(sessionData.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <Badge className={getStatusColor(sessionData.status)}>
                          {getStatusIcon(sessionData.status)}
                          <span className="ml-1 capitalize">{sessionData.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => navigate('/subscription')}
                        className="flex-1"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/')}
                        className="flex-1"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Payment Processing
                    </CardTitle>
                    <CardDescription>
                      Your payment is being processed. You will receive a confirmation email shortly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button onClick={() => navigate('/')}>
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Cancel Tab */}
            <TabsContent value="cancel" className="space-y-6">
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-red-900">
                    Payment Cancelled
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    Your payment process was cancelled. No charges have been made.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      If you intended to complete the payment, you can try again anytime.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleRetryPayment}
                      className="flex-1"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleGoHome}
                      className="flex-1"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleGoBack}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Go Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    View all your past payments and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                      </AlertDescription>
                    </Alert>
                  ) : paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{payment.description}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.createdAt).toLocaleDateString()} • 
                                {payment.paymentMethod}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${payment.amount}</p>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1 capitalize">{payment.status}</span>
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment History</h3>
                      <p className="text-gray-600 mb-4">You haven't made any payments yet.</p>
                      <Button onClick={() => navigate('/pricing')}>
                        <Crown className="w-4 h-4 mr-2" />
                        View Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Visa •••• 4242</h3>
                          <p className="text-sm text-gray-600">Expires 12/25</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Default
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedPayment;
