import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { UniformHeader } from "@/components/UniformHeader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
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
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, firstName, lastName, userType);
        if (!error) {
          if (userType === 'artist') {
            // Navigate to artist onboarding for additional details
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
          navigate("/feed");
        }
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <UniformHeader showAuthButtons={false} showLocationButton={false} />

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                Welcome to Local Social Hub
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect with your local community, discover events, and find amazing artists in your area.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">📍</span>
                </div>
                <div>
                  <h3 className="font-semibold">Hyperlocal Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Find events, services, and people right in your neighborhood
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">🎨</span>
                </div>
                <div>
                  <h3 className="font-semibold">Book Local Artists</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with talented creators for your next event
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold">Safe Communication</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with others after mutual approval
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-center">
                  {isSignUp 
                    ? "Join your local community today" 
                    : "Sign in to your account to continue"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => setIsSignUp(value === "signup")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleSocialSignIn('google')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleSocialSignIn('facebook')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                      </Button>
                      <div className="text-center">
                        <Link
                          to="/forgot-password"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleSocialSignIn('google')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleSocialSignIn('facebook')}
                        disabled={loading}
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <RadioGroup value={userType} onValueChange={(value: 'user' | 'artist') => setUserType(value)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="user" id="user" />
                            <Label htmlFor="user">Regular User</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="artist" id="artist" />
                            <Label htmlFor="artist">Artist/Creator</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {userType === 'artist' && (
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                          <h4 className="font-medium">Artist Information</h4>
                          <div className="space-y-2">
                            <Label htmlFor="artist-skills">Primary Skills</Label>
                            <Select onValueChange={(value) => setArtistSkills([value])}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary skill" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Music">Music</SelectItem>
                                <SelectItem value="Photography">Photography</SelectItem>
                                <SelectItem value="Art">Art</SelectItem>
                                <SelectItem value="Dance">Dance</SelectItem>
                                <SelectItem value="Comedy">Comedy</SelectItem>
                                <SelectItem value="DJ">DJ</SelectItem>
                                <SelectItem value="Catering">Catering</SelectItem>
                                <SelectItem value="Decoration">Decoration</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              placeholder="Tell us about yourself and your work..."
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="hourly-rate-min">Min Hourly Rate ($)</Label>
                              <Input
                                id="hourly-rate-min"
                                type="number"
                                placeholder="50"
                                value={hourlyRateMin}
                                onChange={(e) => setHourlyRateMin(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="hourly-rate-max">Max Hourly Rate ($)</Label>
                              <Input
                                id="hourly-rate-max"
                                type="number"
                                placeholder="200"
                                value={hourlyRateMax}
                                onChange={(e) => setHourlyRateMax(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="portfolio-urls">Portfolio URLs (comma separated)</Label>
                            <Input
                              id="portfolio-urls"
                              type="text"
                              placeholder="https://example.com, https://portfolio.com"
                              value={portfolioUrls}
                              onChange={(e) => setPortfolioUrls(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
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
  );
};

export default SignIn;
