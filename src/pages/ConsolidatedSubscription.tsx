import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Crown, 
  Star, 
  Calendar, 
  CreditCard, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowLeft,
  Check,
  Users,
  Palette,
  MessageSquare,
  Headphones,
  Zap,
  Shield,
  Target,
  Award,
  Sparkles,
  BarChart3,
  Activity,
  TrendingUp,
  Heart,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  Globe,
  Building,
  Car,
  Music,
  Camera,
  Mic,
  BookOpen,
  Coffee,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Home,
  Navigation,
  Compass,
  Flag,
  Hash,
  AtSign,
  DollarSign,
  Wallet,
  PiggyBank,
  TrendingDown,
  Activity as ActivityIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProPermissions } from '@/hooks/useProPermissions';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { subscriptionService, UserSubscription, SubscriptionPlan, SubscriptionStatus as SubscriptionStatusType } from '@/services/subscriptionService';
import { toast } from 'sonner';

interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  included: boolean;
  proOnly?: boolean;
}

interface BillingInfo {
  cardLast4: string;
  cardBrand: string;
  nextBillingDate: string;
  billingAddress: string;
}

const ConsolidatedSubscription: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isPro, loading: permissionsLoading } = useProPermissions();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<UserSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusType | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  
  const sessionId = searchParams.get('session_id');
  const isSuccessPage = searchParams.get('success') === 'true';
  const isCancelPage = searchParams.get('cancel') === 'true';

  // Features for different subscription tiers
  const features: SubscriptionFeature[] = [
    {
      id: 'unlimited-posts',
      name: 'Unlimited Posts',
      description: 'Create unlimited posts and content',
      icon: <MessageSquare className="w-5 h-5" />,
      included: true,
      proOnly: false
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights and performance metrics',
      icon: <BarChart3 className="w-5 h-5" />,
      included: true,
      proOnly: true
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      description: '24/7 priority customer support',
      icon: <Headphones className="w-5 h-5" />,
      included: true,
      proOnly: true
    },
    {
      id: 'custom-branding',
      name: 'Custom Branding',
      description: 'Personalize your profile with custom themes',
      icon: <Palette className="w-5 h-5" />,
      included: true,
      proOnly: true
    },
    {
      id: 'advanced-scheduling',
      name: 'Advanced Scheduling',
      description: 'Smart scheduling and calendar integration',
      icon: <Calendar className="w-5 h-5" />,
      included: true,
      proOnly: true
    },
    {
      id: 'team-collaboration',
      name: 'Team Collaboration',
      description: 'Invite team members and manage permissions',
      icon: <Users className="w-5 h-5" />,
      included: true,
      proOnly: true
    }
  ];

  // Fetch subscription data
  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch subscription history
      const history = await subscriptionService.getUserSubscriptionHistory(user.id);
      setSubscriptionHistory(history);
      
      // Fetch available plans
      const availablePlans = await subscriptionService.getAvailablePlans();
      setPlans(availablePlans);
      
      // Fetch current subscription status
      const status = await subscriptionService.getUserSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
      
      // Mock billing info
      setBillingInfo({
        cardLast4: '4242',
        cardBrand: 'Visa',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        billingAddress: '123 Main St, City, State 12345'
      });
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle subscription verification for success page
  useEffect(() => {
    const verifySubscription = async () => {
      if (!user?.id || !sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const status = await subscriptionService.getUserSubscriptionStatus(user.id);
        setSubscriptionStatus(status);
        
        toast.success('Subscription activated successfully!');
      } catch (error) {
        console.error('Error verifying subscription:', error);
        toast.error('Failed to verify subscription');
      } finally {
        setLoading(false);
      }
    };

    if (isSuccessPage && sessionId) {
      verifySubscription();
    } else {
      fetchSubscriptionData();
    }
  }, [user?.id, sessionId, isSuccessPage, fetchSubscriptionData]);

  // Handle subscription actions
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setProcessing(planId);
    try {
      const checkoutUrl = await subscriptionService.createCheckoutSession(user.id, planId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id || !subscriptionStatus) return;

    setProcessing('cancel');
    try {
      await subscriptionService.cancelSubscription(user.id);
      toast.success('Subscription cancelled successfully');
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setProcessing(null);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user?.id || !subscriptionStatus) return;

    setProcessing('reactivate');
    try {
      await subscriptionService.reactivateSubscription(user.id);
      toast.success('Subscription reactivated successfully');
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!user?.id) return;

    try {
      const portalUrl = await subscriptionService.createCustomerPortalSession(user.id);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open billing portal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Subscription...</h2>
          <p className="text-gray-600">Getting your subscription information</p>
        </div>
      </div>
    );
  }

  // Success page
  if (isSuccessPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Subscription Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Welcome to Pro! You now have access to all premium features.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cancel page
  if (isCancelPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Subscription Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your subscription process was cancelled. You can try again anytime.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                View Plans
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-600" />
                Subscription Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your subscription and unlock premium features
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {subscriptionStatus.plan_name || 'Pro Plan'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {subscriptionStatus.status === 'active' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <Badge 
                        variant={subscriptionStatus.status === 'active' ? 'default' : 'secondary'}
                        className={subscriptionStatus.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {subscriptionStatus.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {subscriptionStatus.status}
                      </Badge>
                    </div>
                    
                    {subscriptionStatus.status === 'active' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Next Billing Date</p>
                          <p className="font-medium">
                            {billingInfo?.nextBillingDate ? 
                              new Date(billingInfo.nextBillingDate).toLocaleDateString() : 
                              'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium">
                            {billingInfo?.cardBrand} •••• {billingInfo?.cardLast4}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium">
                            ${subscriptionStatus.amount || '29.99'}/month
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                    <p className="text-gray-600 mb-4">Upgrade to Pro to unlock premium features.</p>
                    <Button onClick={() => setActiveTab('plans')}>
                      <Crown className="w-4 h-4 mr-2" />
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Pro Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="text-purple-600 mt-0.5">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.name}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">Select the plan that best fits your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Free Plan */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Free</CardTitle>
                  <div className="text-3xl font-bold">$0<span className="text-lg font-normal">/month</span></div>
                  <CardDescription>Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Basic features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Community access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Standard support</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <div className="text-3xl font-bold">$29<span className="text-lg font-normal">/month</span></div>
                  <CardDescription>For professionals and businesses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Everything in Free</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Custom branding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Team collaboration</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => handleSubscribe('pro')}
                    disabled={processing === 'pro'}
                  >
                    {processing === 'pro' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        {subscriptionStatus?.status === 'active' ? 'Current Plan' : 'Upgrade to Pro'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <div className="text-3xl font-bold">$99<span className="text-lg font-normal">/month</span></div>
                  <CardDescription>For large organizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Unlimited team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Custom integrations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Advanced security</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleSubscribe('enterprise')}
                    disabled={processing === 'enterprise'}
                  >
                    {processing === 'enterprise' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4 mr-2" />
                        Contact Sales
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {billingInfo ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{billingInfo.cardBrand} •••• {billingInfo.cardLast4}</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
                          <Edit className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Billing Address</p>
                        <p className="font-medium">{billingInfo.billingAddress}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No payment method on file</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscriptionHistory.slice(0, 3).map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{subscription.plan_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(subscription.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${subscription.amount}</p>
                          <Badge variant="secondary" className="text-xs">
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {subscriptionHistory.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No billing history available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Actions */}
            {subscriptionStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Subscription Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleUpdatePaymentMethod}
                      className="flex-1"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Update Payment Method
                    </Button>
                    {subscriptionStatus.status === 'active' ? (
                      <Button 
                        variant="destructive" 
                        onClick={handleCancelSubscription}
                        disabled={processing === 'cancel'}
                        className="flex-1"
                      >
                        {processing === 'cancel' ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Cancel Subscription
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleReactivateSubscription}
                        disabled={processing === 'reactivate'}
                        className="flex-1"
                      >
                        {processing === 'reactivate' ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Reactivating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reactivate Subscription
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Subscription History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionHistory.length > 0 ? (
                    subscriptionHistory.map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Crown className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{subscription.plan_name}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(subscription.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${subscription.amount}</p>
                          <Badge 
                            variant={subscription.status === 'active' ? 'default' : 'secondary'}
                            className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
                      <p className="text-gray-600">Your subscription history will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsolidatedSubscription;
