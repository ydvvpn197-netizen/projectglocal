import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { ArtistSkillsForm, ArtistSkillsData } from "@/components/ArtistSkillsForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ArtistOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<ArtistSkillsData | null>(null);

  // Get artist data from sign-up form if available
  useEffect(() => {
    if (location.state?.artistData) {
      setInitialData(location.state.artistData);
    }
  }, [location.state]);

  const handleSubmit = async (data: ArtistSkillsData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your artist profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update the user's profile with artist information
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'artist',
          bio: data.bio,
          artist_skills: data.artistSkills,
          hourly_rate_min: data.hourlyRateMin > 0 ? data.hourlyRateMin : null,
          hourly_rate_max: data.hourlyRateMax > 0 ? data.hourlyRateMax : null,
          portfolio_urls: data.portfolioUrls.length > 0 ? data.portfolioUrls : null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Ensure an entry exists in artists table for bookings linkage
      const { error: artistUpsertError } = await supabase
        .from('artists')
        .upsert({
          user_id: user.id,
          specialty: data.artistSkills && data.artistSkills.length > 0 ? data.artistSkills : [],
          experience_years: 0,
          portfolio_urls: data.portfolioUrls,
          hourly_rate_min: data.hourlyRateMin > 0 ? data.hourlyRateMin : null,
          hourly_rate_max: data.hourlyRateMax > 0 ? data.hourlyRateMax : null,
          bio: data.bio,
          is_available: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (artistUpsertError) throw artistUpsertError;

      toast({
        title: "Artist Profile Created!",
        description: "Your artist profile has been set up successfully. You can now receive booking requests.",
      });

      // Navigate to the main feed
      navigate('/feed');
    } catch (error) {
      console.error('Error creating artist profile:', error);
      toast({
        title: "Error",
        description: "Failed to create artist profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Complete Your Artist Profile</h1>
          <p className="text-muted-foreground">
            Tell potential clients about your skills and services to start receiving bookings.
          </p>
        </div>

        <ArtistSkillsForm 
          onSubmit={handleSubmit} 
          loading={loading} 
          initialData={initialData}
        />
      </div>
    </MainLayout>
  );
};

export default ArtistOnboarding;