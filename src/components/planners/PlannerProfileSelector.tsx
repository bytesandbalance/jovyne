import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PlannerProfile {
  id: string;
  business_name: string;
  description: string;
  location_city: string;
  location_state: string;
  services: string[];
  specialties: string[];
  years_experience: number;
  average_rating: number;
  total_reviews: number;
}

export function PlannerProfileSelector() {
  const { user } = useAuthContext();
  const [availableProfiles, setAvailableProfiles] = useState<PlannerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchAvailableProfiles();
  }, []);

  const fetchAvailableProfiles = async () => {
    try {
      // Get current user's email from profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      
      // Only fetch planner profiles that match the user's email
      const { data, error } = await supabase
        .from('planners')
        .select(`
          id,
          business_name,
          description,
          location_city,
          location_state,
          services,
          specialties,
          years_experience,
          average_rating,
          total_reviews,
          email
        `)
        .is('user_id', null)
        .eq('email', userProfile.email)
        .order('business_name');

      if (error) throw error;
      setAvailableProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error loading profiles",
        description: "Could not load available business profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const linkProfile = async (plannerId: string, businessName: string) => {
    if (!user) return;
    
    setLinking(true);
    try {
      // Link the planner profile to current user
      const { error: plannerError } = await supabase
        .from('planners')
        .update({ user_id: user.id })
        .eq('id', plannerId);

      if (plannerError) throw plannerError;

      toast({
        title: "Profile linked successfully! 🎉",
        description: `You are now connected to ${businessName}. Welcome to Jovyne!`
      });

      // Reload the page to refresh the app state
      window.location.reload();
    } catch (error) {
      console.error('Error linking profile:', error);
      toast({
        title: "Linking failed",
        description: "Could not link your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading available profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Select Your Business Profile</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We found several event planning businesses. Please select the one that represents your business 
            to connect your account and access your existing profile, reviews, and booking history.
          </p>
        </div>

        {availableProfiles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No available business profiles found. If you're a new planner, your profile will be created automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {availableProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{profile.business_name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{profile.average_rating}</span>
                      <span className="text-sm text-muted-foreground">({profile.total_reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location_city}, {profile.location_state}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {profile.description}
                  </CardDescription>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{profile.years_experience} years exp.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{profile.total_reviews} reviews</span>
                    </div>
                  </div>

                  {profile.services && profile.services.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-1">
                        {profile.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {profile.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.specialties && profile.specialties.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {profile.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {profile.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => linkProfile(profile.id, profile.business_name)}
                    disabled={linking}
                    className="w-full mt-4"
                  >
                    {linking ? "Linking..." : "Connect to This Profile"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Don't see your business? Contact support and we'll help you get set up.
          </p>
        </div>
      </div>
    </div>
  );
}