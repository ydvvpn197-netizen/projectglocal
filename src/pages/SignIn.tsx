import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Mail, Lock, MapPin, Users, Calendar, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<'user' | 'artist'>('user');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithOAuth, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/feed';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, firstName, lastName, userType);
        if (!error) {
          navigate('/location');
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          const from = location.state?.from?.pathname || '/feed';
          navigate(from, { replace: true });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">L</span>
              </div>
              <span className="text-xl font-bold">Local Hub</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/book-artist')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Book Artists
              </button>
              <button
                onClick={() => navigate('/events')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Events
              </button>
              <button
                onClick={() => navigate('/community')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Community
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Local Social Hub
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with your community, discover local events, and book amazing artists nearby.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/discover')}
              className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border hover:bg-card/80 transition-colors cursor-pointer"
            >
              <MapPin className="h-8 w-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Local Discovery</h3>
                <p className="text-sm text-muted-foreground">Find events & artists nearby</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/community')}
              className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border hover:bg-card/80 transition-colors cursor-pointer"
            >
              <Users className="h-8 w-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">Join local groups & discussions</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border hover:bg-card/80 transition-colors cursor-pointer"
            >
              <Calendar className="h-8 w-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Events</h3>
                <p className="text-sm text-muted-foreground">Create & join local events</p>
              </div>
            </button>
            <button 
              onClick={() => navigate('/book-artist')}
              className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border hover:bg-card/80 transition-colors cursor-pointer"
            >
              <Zap className="h-8 w-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Book Artists</h3>
                <p className="text-sm text-muted-foreground">Hire local talent easily</p>
              </div>
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? "Join the Community" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Create your account to start connecting" 
                : "Sign in to your account to continue"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => signInWithOAuth('google')}
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
                size="lg"
                onClick={() => signInWithOAuth('facebook')}
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

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>I want to join as:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setUserType('user')}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          userType === 'user' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">Community Member</div>
                        <div className="text-sm text-muted-foreground">Join discussions, book artists, attend events</div>
                      </button>
                       <button
                        type="button"
                        onClick={() => setUserType('artist')}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          userType === 'artist' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">Artist</div>
                        <div className="text-sm text-muted-foreground">Showcase skills, receive bookings, earn money</div>
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Loading..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;