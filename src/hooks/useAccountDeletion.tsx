import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();

  // Test function to check if edge function is accessible
  const testEdgeFunction = async () => {
    try {
      console.log('Testing edge function accessibility...');
      
      // Try a GET request to test if the function is accessible
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        method: 'GET',
      });

      console.log('Test response:', { data, error });
      
      if (error) {
        console.error('Edge function test failed:', error);
        toast({
          title: "Function Test Failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Edge function test successful:', data);
        toast({
          title: "Function Test Successful",
          description: "Edge function is accessible",
        });
      }
    } catch (error: any) {
      console.error('Test function error:', error);
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      console.log('Starting account deletion process...');
      
      // Call the Supabase Edge Function to delete all user data and auth user
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Account deletion successful');

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Sign out the user after successful deletion
      await signOut();
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      let errorMessage = "Failed to delete account. Please try again.";
      let errorDetails = "";
      
      if (error.message) {
        errorMessage = error.message;
        errorDetails = error.message;
      } else if (error.error) {
        errorMessage = error.error;
        errorDetails = error.error;
      }

      // Log additional error details
      if (error.details) {
        console.error('Error details:', error.details);
        errorDetails += ` | Details: ${JSON.stringify(error.details)}`;
      }

      console.error('Final error message:', errorMessage);
      console.error('Error details:', errorDetails);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    testEdgeFunction,
    isDeleting,
  };
};
