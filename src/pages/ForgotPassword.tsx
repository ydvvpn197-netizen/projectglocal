import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { UniformHeader } from "@/components/UniformHeader";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await requestPasswordReset(email);
      if (!error) {
        setEmailSent(true);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <UniformHeader showAuthButtons={false} showLocationButton={false} />

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
              </div>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailSent ? (
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center">
                    <Link
                      to="/signin"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Check Your Email</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate("/signin")}
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmailSent(false);
                        setEmail("");
                      }}
                      className="w-full"
                    >
                      Send Another Email
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
