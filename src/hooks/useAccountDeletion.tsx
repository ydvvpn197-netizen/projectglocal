import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const deleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // Call the Supabase Edge Function to delete the account
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw error;
      }

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
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }

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
    isDeleting,
  };
};
