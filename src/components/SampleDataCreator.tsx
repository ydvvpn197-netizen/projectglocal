import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SampleDataCreator = () => {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const createSampleAccounts = async () => {
    setLoading(true);
    
    try {
      // Sample artist account
      const { error: artistSignUpError } = await signUp(
        'sarah.musician@example.com',
        'password123',
        'Sarah',
        'Johnson',
        'artist'
      );

      if (!artistSignUpError) {
        // Create a complete artist profile - wait for account creation to propagate
        setTimeout(async () => {
          try {
            await supabase
              .from('profiles')
              .update({
                user_type: 'artist',
                bio: 'Professional musician with 10+ years of experience. Specializing in acoustic performances, weddings, and corporate events.',
                artist_skills: ['Musician', 'Singer', 'Guitarist'],
                hourly_rate_min: 150,
                hourly_rate_max: 300,
                portfolio_urls: ['https://example.com/portfolio']
              })
              .eq('display_name', 'Sarah Johnson');
          } catch (err) {
            console.error('Error updating artist profile:', err);
          }
        }, 2000);
      }

      // Sample regular user account  
      await signUp(
        'client.user@example.com',
        'password123',
        'Jane',
        'Smith',
        'user'
      );

      // Create additional sample artists with direct database inserts
      await createAdditionalArtists();

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

  const createAdditionalArtists = async () => {
    // Simply update existing user profiles to be artists
    const sampleArtists = [
      {
        search_name: 'Vipin Kumar',
        update_data: {
          user_type: 'artist',
          bio: 'Creative wedding and event photographer capturing your special moments with artistic flair.',
          artist_skills: ['Photographer', 'Photo Editor'],
          hourly_rate_min: 200,
          hourly_rate_max: 500,
          location_city: 'Los Angeles',
          location_state: 'CA',
          is_verified: true
        }
      },
      {
        search_name: 'Priyank Sahgal',
        update_data: {
          user_type: 'artist',
          bio: 'Professional dancer and choreographer specializing in Latin dance performances.',
          artist_skills: ['Dancer', 'Choreographer'],
          hourly_rate_min: 100,
          hourly_rate_max: 250,
          location_city: 'Miami',
          location_state: 'FL',
          is_verified: false
        }
      },
      {
        search_name: 'tranceverseai',
        update_data: {
          user_type: 'artist',
          bio: 'Experienced DJ with extensive music library. Perfect for parties, weddings, and corporate events.',
          artist_skills: ['DJ', 'Music Producer'],
          hourly_rate_min: 120,
          hourly_rate_max: 300,
          location_city: 'New York',
          location_state: 'NY',
          is_verified: true
        }
      }
    ];

    for (const artist of sampleArtists) {
      try {
        await supabase
          .from('profiles')
          .update(artist.update_data)
          .eq('display_name', artist.search_name);
      } catch (error) {
        console.error('Error updating artist profile:', error);
      }
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