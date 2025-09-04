import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Star, Users, Calendar, Building2, User } from 'lucide-react';
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
  email: string;
}

type OnboardingStep = 'checking' | 'connect-existing' | 'create-new';

export function PlannerOnboardingFlow() {
  const { user } = useAuthContext();
  const [step, setStep] = useState<OnboardingStep>('checking');
  const [existingProfile, setExistingProfile] = useState<PlannerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state for new planner creation
  const [newPlannerForm, setNewPlannerForm] = useState({
    business_name: '',
    description: '',
    location_city: '',
    location_state: '',
    services: [] as string[],
    specialties: [] as string[],
    years_experience: '',
    base_price: ''
  });

  useEffect(() => {
    checkForExistingProfile();
  }, []);

  const checkForExistingProfile = async () => {
    try {
      if (!user?.email) return;

      console.log('Checking for existing planner profile with email:', user.email);
      
      // Check if there's any planner profile with this email
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
          email,
          user_id
        `)
        .eq('email', user.email)
        .maybeSingle();

      if (error) {
        console.error('Error checking for existing profile:', error);
        throw error;
      }

      console.log('Found existing profile:', data);

      if (data && !data.user_id) {
        // Profile exists but not linked - show connection screen
        setExistingProfile(data);
        setStep('connect-existing');
      } else if (data && data.user_id) {
        // Profile already linked - shouldn't happen but handle gracefully
        toast({
          title: "Profile already connected",
          description: "Your profile is already set up. Redirecting to dashboard..."
        });
        window.location.reload();
      } else {
        // No profile found - show creation form
        setStep('create-new');
      }
    } catch (error) {
      console.error('Error checking for existing profile:', error);
      toast({
        title: "Error checking profile",
        description: "Could not check for existing profile. Please try again.",
        variant: "destructive"
      });
      setStep('create-new'); // Fallback to creation flow
    }
  };

  const connectExistingProfile = async () => {
    if (!user || !existingProfile) return;
    
    setLoading(true);
    try {
      // Link the planner profile to current user
      const { error: plannerError } = await supabase
        .from('planners')
        .update({ user_id: user.id })
        .eq('id', existingProfile.id);

      if (plannerError) throw plannerError;

      // Profile is already created by handle_new_user trigger
      // Just update the user_role in the existing profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_role: 'planner' })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile connected successfully! 🎉",
        description: `You are now connected to ${existingProfile.business_name}. Welcome to Jovial!`
      });

      // Reload to refresh app state
      window.location.reload();
    } catch (error) {
      console.error('Error connecting profile:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewPlannerProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create new planner profile
      const { data: newPlanner, error: plannerError } = await supabase
        .from('planners')
        .insert({
          user_id: user.id,
          email: user.email!,
          business_name: newPlannerForm.business_name,
          description: newPlannerForm.description,
          location_city: newPlannerForm.location_city,
          location_state: newPlannerForm.location_state,
          services: newPlannerForm.services,
          specialties: newPlannerForm.specialties,
          years_experience: newPlannerForm.years_experience ? parseInt(newPlannerForm.years_experience) : 0,
          base_price: newPlannerForm.base_price ? parseFloat(newPlannerForm.base_price) : null,
          is_verified: true,
          average_rating: 0,
          total_reviews: 0
        })
        .select()
        .single();

      if (plannerError) throw plannerError;

      // Profile is already created by handle_new_user trigger
      // Just update the user_role in the existing profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_role: 'planner' })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile created successfully! 🎉",
        description: "Your planner profile has been created. Welcome to Jovial!"
      });

      // Reload to refresh app state
      window.location.reload();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Creation failed",
        description: "Could not create your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    setNewPlannerForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setNewPlannerForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  if (step === 'checking') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Setting up your planner profile...</p>
        </div>
      </div>
    );
  }

  if (step === 'connect-existing' && existingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Connect Your Business Profile</h1>
            <p className="text-muted-foreground">
              We found an existing business profile that matches your email. Connect to it to access your 
              existing profile, reviews, and booking history.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{existingProfile.business_name}</CardTitle>
                {existingProfile.total_reviews > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{existingProfile.average_rating}</span>
                    <span className="text-sm text-muted-foreground">({existingProfile.total_reviews})</span>
                  </div>
                )}
              </div>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {existingProfile.location_city}, {existingProfile.location_state}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{existingProfile.description}</p>
              
              {existingProfile.services?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {existingProfile.services.map((service, index) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {existingProfile.specialties?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {existingProfile.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">{specialty}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {existingProfile.years_experience} years experience
                </div>
                {existingProfile.total_reviews > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {existingProfile.total_reviews} reviews
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button onClick={connectExistingProfile} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect to This Profile'}
            </Button>
            <Button variant="outline" onClick={() => setStep('create-new')}>
              Create New Profile Instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'create-new') {
    const availableServices = [
      'Wedding Planning', 'Corporate Events', 'Birthday Parties', 'Baby Showers',
      'Anniversary Celebrations', 'Holiday Parties', 'Graduation Parties', 'Retirement Parties'
    ];

    const availableSpecialties = [
      'Luxury Events', 'Budget-Friendly Events', 'Outdoor Events', 'Indoor Events',
      'Multicultural Events', 'Religious Ceremonies', 'Destination Events', 'Intimate Gatherings'
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <User className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Create Your Planner Profile</h1>
            <p className="text-muted-foreground">
              Set up your business profile to start connecting with clients and showcase your services.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Tell us about your event planning business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={newPlannerForm.business_name}
                    onChange={(e) => setNewPlannerForm(prev => ({ ...prev, business_name: e.target.value }))}
                    placeholder="Your Event Planning Business"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={newPlannerForm.years_experience}
                    onChange={(e) => setNewPlannerForm(prev => ({ ...prev, years_experience: e.target.value }))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={newPlannerForm.description}
                  onChange={(e) => setNewPlannerForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your event planning services and approach..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_city">City *</Label>
                  <Input
                    id="location_city"
                    value={newPlannerForm.location_city}
                    onChange={(e) => setNewPlannerForm(prev => ({ ...prev, location_city: e.target.value }))}
                    placeholder="Your City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_state">State *</Label>
                  <Input
                    id="location_state"
                    value={newPlannerForm.location_state}
                    onChange={(e) => setNewPlannerForm(prev => ({ ...prev, location_state: e.target.value }))}
                    placeholder="Your State"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price (Optional)</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={newPlannerForm.base_price}
                  onChange={(e) => setNewPlannerForm(prev => ({ ...prev, base_price: e.target.value }))}
                  placeholder="Starting price for your services"
                />
              </div>

              <div className="space-y-3">
                <Label>Services Offered</Label>
                <div className="flex flex-wrap gap-2">
                  {availableServices.map((service) => (
                    <Badge
                      key={service}
                      variant={newPlannerForm.services.includes(service) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleServiceToggle(service)}
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSpecialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={newPlannerForm.specialties.includes(specialty) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleSpecialtyToggle(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={createNewPlannerProfile} 
                  disabled={loading || !newPlannerForm.business_name || !newPlannerForm.location_city || !newPlannerForm.location_state}
                  className="flex-1"
                >
                  {loading ? 'Creating Profile...' : 'Create My Profile'}
                </Button>
                {existingProfile && (
                  <Button variant="outline" onClick={() => setStep('connect-existing')}>
                    Go Back
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}