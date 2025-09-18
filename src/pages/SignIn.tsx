import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, MapPin, Users, Palette, MessageCircle, Star, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign up form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<'user' | 'artist'>('user');
  const [artistSkills, setArtistSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [hourlyRateMin, setHourlyRateMin] = useState("");
  const [hourlyRateMax, setHourlyRateMax] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState("");
  
  const { user, session, loading: authLoading, signIn, signUp, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect authenticated users away from sign-in page
  useEffect(() => {
    if (!authLoading && user && session) {
      console.log('User is already authenticated, redirecting to feed');
      navigate('/feed', { replace: true });
    }
  }, [user, session, authLoading, navigate]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-green-50 dark:from-orange-950/20 dark:via-background dark:to-green-950/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render sign-in form if user is authenticated
  if (user && session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "त्रुटि / Error",
        description: "कृपया सभी आवश्यक फ़ील्ड भरें / Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      toast({
        title: "त्रुटि / Error",
        description: "कृपया अपना नाम दर्ज करें / Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && userType === 'artist' && artistSkills.length === 0) {
      toast({
        title: "त्रुटि / Error",
        description: "कलाकारों के लिए कम से कम एक कौशल चुनना आवश्यक है / Artists must select at least one skill",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, firstName, lastName, userType);
        if (!error) {
          toast({
            title: "स्वागत है! / Welcome!",
            description: userType === 'artist' 
              ? "आपका खाता बन गया है। अब अपनी कलाकार प्रोफ़ाइल पूरी करें / Account created! Complete your artist profile now"
              : "आपका खाता सफलतापूर्वक बन गया है / Account created successfully",
          });
          
          // Navigate to appropriate page based on user type
          if (userType === 'artist') {
            // For artists, collect additional details
            const artistData = {
              bio,
              artistSkills,
              hourlyRateMin: parseFloat(hourlyRateMin) || 0,
              hourlyRateMax: parseFloat(hourlyRateMax) || 0,
              portfolioUrls: portfolioUrls.split(',').map(url => url.trim()).filter(url => url.length > 0)
            };
            navigate("/artist-onboarding", { state: { artistData } });
          } else {
            navigate("/feed");
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          toast({
            title: "स्वागत वापसी! / Welcome back!",
            description: "सफलतापूर्वक लॉग इन हो गए / Successfully logged in",
          });
          navigate("/feed");
        }
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);
      toast({
        title: "त्रुटि / Error",
        description: "कुछ गलत हुआ है। कृपया पुनः प्रयास करें / Something went wrong. Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (!error) {
        navigate("/feed");
      }
    } catch (error: unknown) {
      console.error("Social auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveLayout showNewsFeed={false}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-green-50 dark:from-orange-950/20 dark:via-background dark:to-green-950/20">
        <div className="flex items-center justify-center p-4 pt-12">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                🙏 Glocal में स्वागत है
              </h1>
              <h2 className="text-3xl font-semibold text-muted-foreground">
                Welcome to Glocal
              </h2>
              <p className="text-xl text-muted-foreground">
                अपने स्थानीय समुदाय से जुड़ें, कार्यक्रम खोजें और अपने क्षेत्र के अद्भुत कलाकारों को खोजें।
              </p>
              <p className="text-lg text-muted-foreground">
                Connect with your local community, discover events, and find amazing artists in your area.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200 dark:border-orange-800">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">स्थानीय खोज / Hyperlocal Discovery</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    अपने पड़ोस में कार्यक्रम, सेवाएं और लोग खोजें
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10 border border-green-200 dark:border-green-800">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">कलाकार बुक करें / Book Local Artists</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    अपने अगले कार्यक्रम के लिए प्रतिभाशाली रचनाकारों से जुड़ें
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">सुरक्षित संवाद / Safe Communication</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    पारस्परिक अनुमोदन के बाद दूसरों के साथ चैट करें
                  </p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground ml-1">भरोसेमंद / Trusted</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">10,000+ समुदाय / Community</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-white">🏛️</span>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  {isSignUp ? "खाता बनाएं / Create Account" : "वापसी का स्वागत / Welcome Back"}
                </CardTitle>
                <CardDescription className="text-center">
                  {isSignUp 
                    ? "आज ही अपने स्थानीय समुदाय में शामिल हों / Join your local community today" 
                    : "जारी रखने के लिए अपने खाते में साइन इन करें / Sign in to your account to continue"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => setIsSignUp(value === "signup")}>
                  <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-orange-100 to-green-100 dark:from-orange-900/20 dark:to-green-900/20">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-md">साइन इन / Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-md">साइन अप / Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-red-50 hover:border-red-200 transition-colors" 
                        onClick={() => handleSocialSignIn('google')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google के साथ जारी रखें / Continue with Google
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => handleSocialSignIn('facebook')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook के साथ जारी रखें / Continue with Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">या ईमेल के साथ जारी रखें / Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">ईमेल / Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="अपना ईमेल दर्ज करें / Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 border-2 focus:border-orange-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">पासवर्ड / Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="अपना पासवर्ड दर्ज करें / Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 border-2 focus:border-orange-400 transition-colors pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg" 
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            साइन इन हो रहे हैं... / Signing In...
                          </div>
                        ) : (
                          "साइन इन करें / Sign In"
                        )}
                      </Button>
                      <div className="text-center">
                        <Link
                          to="/forgot-password"
                          className="text-sm text-muted-foreground hover:text-orange-600 transition-colors"
                        >
                          अपना पासवर्ड भूल गए? / Forgot your password?
                        </Link>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-red-50 hover:border-red-200 transition-colors" 
                        onClick={() => handleSocialSignIn('google')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google के साथ साइन अप करें / Sign up with Google
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => handleSocialSignIn('facebook')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook के साथ साइन अप करें / Sign up with Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">या ईमेल के साथ जारी रखें / Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">ईमेल / Email *</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="अपना ईमेल दर्ज करें / Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 border-2 focus:border-orange-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">पासवर्ड / Password *</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="एक पासवर्ड बनाएं / Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 border-2 focus:border-orange-400 transition-colors pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="text-sm font-medium">पहला नाम / First Name *</Label>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="पहला नाम / First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="h-11 border-2 focus:border-orange-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="text-sm font-medium">अंतिम नाम / Last Name *</Label>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="अंतिम नाम / Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="h-11 border-2 focus:border-orange-400 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">खाता प्रकार / Account Type *</Label>
                        <RadioGroup value={userType} onValueChange={(value: 'user' | 'artist') => setUserType(value)} className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => setUserType('user')}>
                            <RadioGroupItem value="user" id="user" className="border-2" />
                            <div className="flex-1">
                              <Label htmlFor="user" className="cursor-pointer font-medium">🏠 नियमित उपयोगकर्ता / Regular User</Label>
                              <p className="text-xs text-muted-foreground">कार्यक्रम खोजें और कलाकार बुक करें / Find events and book artists</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => setUserType('artist')}>
                            <RadioGroupItem value="artist" id="artist" className="border-2" />
                            <div className="flex-1">
                              <Label htmlFor="artist" className="cursor-pointer font-medium">🎨 कलाकार/रचनाकार / Artist/Creator</Label>
                              <p className="text-xs text-muted-foreground">अपनी सेवाएं प्रदान करें / Offer your services</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                      {userType === 'artist' && (
                        <div className="space-y-4 border-2 border-gradient-to-r from-orange-200 to-green-200 rounded-lg p-4 bg-gradient-to-r from-orange-50/50 to-green-50/50 dark:from-orange-900/10 dark:to-green-900/10">
                          <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-orange-600" />
                            <h4 className="font-semibold text-orange-800 dark:text-orange-200">कलाकार जानकारी / Artist Information</h4>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="artist-skills" className="text-sm font-medium">मुख्य कौशल / Primary Skills *</Label>
                            <Select onValueChange={(value) => setArtistSkills([value])} required>
                              <SelectTrigger className="h-11 border-2 focus:border-orange-400">
                                <SelectValue placeholder="अपना मुख्य कौशल चुनें / Select your primary skill" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="संगीत / Music">🎵 संगीत / Music</SelectItem>
                                <SelectItem value="फोटोग्राफी / Photography">📸 फोटोग्राफी / Photography</SelectItem>
                                <SelectItem value="चित्रकला / Art">🎨 चित्रकला / Art</SelectItem>
                                <SelectItem value="नृत्य / Dance">💃 नृत्य / Dance</SelectItem>
                                <SelectItem value="हास्य / Comedy">😄 हास्य / Comedy</SelectItem>
                                <SelectItem value="डीजे / DJ">🎧 डीजे / DJ</SelectItem>
                                <SelectItem value="खानपान / Catering">🍽️ खानपान / Catering</SelectItem>
                                <SelectItem value="सजावट / Decoration">🎪 सजावट / Decoration</SelectItem>
                                <SelectItem value="अन्य / Other">✨ अन्य / Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-sm font-medium">परिचय / Bio</Label>
                            <Textarea
                              id="bio"
                              placeholder="अपने बारे में और अपने काम के बारे में बताएं... / Tell us about yourself and your work..."
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows={3}
                              className="border-2 focus:border-orange-400 transition-colors resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="hourly-rate-min" className="text-sm font-medium">न्यूनतम घंटे की दर / Min Hourly Rate (₹)</Label>
                              <Input
                                id="hourly-rate-min"
                                type="number"
                                placeholder="500"
                                value={hourlyRateMin}
                                onChange={(e) => setHourlyRateMin(e.target.value)}
                                className="h-11 border-2 focus:border-orange-400 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="hourly-rate-max" className="text-sm font-medium">अधिकतम घंटे की दर / Max Hourly Rate (₹)</Label>
                              <Input
                                id="hourly-rate-max"
                                type="number"
                                placeholder="2000"
                                value={hourlyRateMax}
                                onChange={(e) => setHourlyRateMax(e.target.value)}
                                className="h-11 border-2 focus:border-orange-400 transition-colors"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="portfolio-urls" className="text-sm font-medium">पोर्टफोलियो URLs (अल्पविराम से अलग करें) / Portfolio URLs (comma separated)</Label>
                            <Input
                              id="portfolio-urls"
                              type="text"
                              placeholder="https://example.com, https://portfolio.com"
                              value={portfolioUrls}
                              onChange={(e) => setPortfolioUrls(e.target.value)}
                              className="h-11 border-2 focus:border-orange-400 transition-colors"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/20 p-2 rounded-md">
                            <CheckCircle className="h-4 w-4" />
                            <span>आप बाद में अपनी प्रोफ़ाइल में और विवरण जोड़ सकेंगे / You can add more details to your profile later</span>
                          </div>
                        </div>
                      )}
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg" 
                        disabled={loading || (userType === 'artist' && artistSkills.length === 0)}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            खाता बनाया जा रहा है... / Creating Account...
                          </div>
                        ) : (
                          "खाता बनाएं / Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default SignIn;