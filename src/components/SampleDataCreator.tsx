import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const SampleDataCreator = () => {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const createSampleAccounts = async () => {
    setLoading(true);
    
    try {
      // Sample artist account
      await signUp(
        'sarah.musician@example.com',
        'password123',
        'Sarah',
        'Johnson',
        'artist'
      );

      // Sample regular user account  
      await signUp(
        'client.user@example.com',
        'password123',
        'Jane',
        'Smith',
        'user'
      );

      toast({
        title: "Sample accounts created!",
        description: "You can now test with sarah.musician@example.com or client.user@example.com (password: password123)",
      });
    } catch (error) {
      console.error('Error creating sample accounts:', error);
      toast({
        title: "Error",
        description: "Failed to create sample accounts. Some may already exist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Test Accounts</CardTitle>
        <CardDescription>Create sample accounts for testing</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createSampleAccounts} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating..." : "Create Sample Accounts"}
        </Button>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Artist: sarah.musician@example.com</li>
            <li>Client: client.user@example.com</li>
            <li>Password for both: password123</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};