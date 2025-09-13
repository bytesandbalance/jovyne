import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Search, Filter, Users, CheckCircle, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PlannerProfileModal } from '@/components/planners/PlannerProfileModal';
import { cityMatches } from '@/lib/cityMapping';
import ClientRequestDialog from '@/components/requests/ClientRequestDialog';
import { useToast } from '@/hooks/use-toast';

interface Planner {
  id: string;
  business_name: string;
  description: string;
  location_city: string;
  location_state: string;
  average_rating: number;
  base_price: number;
  years_experience: number;
  specialties: string[];
  services: string[];
  portfolio_images: string[];
  is_verified: boolean;
  total_reviews: number;
  website_url: string;
  instagram_handle: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
}

export default function PlannersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState('');
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanner, setSelectedPlanner] = useState<Planner | null>(null);
  const [showPlannerProfile, setShowPlannerProfile] = useState(false);
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [currentUserPlannerData, setCurrentUserPlannerData] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  useEffect(() => {
    // Redirect to auth if not signed in
    if (!user && !authLoading) {
      navigate('/auth');
      return;
    }
    
    // Get location from URL params if present
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setSearchLocation(locationParam);
    }
    fetchPlanners();
    fetchUserData();
  }, [searchParams, user, authLoading]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching user data for user ID:', user.id);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('User profile:', profile);
      console.log('Profile error:', profileError);
      setUserProfile(profile);

      // If user is a client, fetch their planner requests
      if (profile?.user_role === 'client') {
        console.log('User is a client, fetching client record...');
        
        let finalClientData = null;
        
        const { data: clientRecord, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        console.log('Client record:', clientRecord);
        console.log('Client error:', clientError);
        
        if (!clientRecord) {
          console.log('No client record found, creating one...');
          
          // Create client record if it doesn't exist
          const { data: newClientRecord, error: createError } = await supabase
            .from('clients')
            .insert({
              user_id: user.id,
              full_name: profile?.full_name || '',
              email: profile?.email || ''
            })
            .select()
            .single();
          
          console.log('New client record:', newClientRecord);
          console.log('Create error:', createError);
          
          if (createError) {
            console.error('Error creating client record:', createError);
          } else {
            finalClientData = newClientRecord;
            setClientData(newClientRecord);
          }
        } else {
          finalClientData = clientRecord;
          setClientData(clientRecord);
        }
      }

      // If user is a planner, fetch their planner data
      if (profile?.user_role === 'planner') {
        console.log('User is a planner, fetching planner record...');
        
        const { data: plannerRecord, error: plannerError } = await supabase
          .from('planners')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        console.log('Planner record:', plannerRecord);
        console.log('Planner error:', plannerError);
        setCurrentUserPlannerData(plannerRecord);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPlanners = async () => {
    setLoading(true);
    try {
      // Fetch planners data (exclude mock planner)
      const { data: plannersData, error } = await supabase
        .from('planners')
        .select('*')
        .eq('is_verified', true)
        .neq('business_name', 'comeback')
        .order('average_rating', { ascending: false });

      if (error) {
        console.error('Error fetching planners:', error);
        setPlanners([]);
        return;
      }

      if (plannersData && plannersData.length > 0) {
        // Fetch profiles for planners
        const plannerUserIds = plannersData.map(p => p.user_id);
        const { data: profilesData } = await supabase
          .rpc('get_public_profiles', { user_ids: plannerUserIds });

        // Combine planners with their profiles
        const plannersWithProfiles = plannersData.map(planner => ({
          ...planner,
          full_name: profilesData?.find(p => p.user_id === planner.user_id)?.full_name || '',
          avatar_url: profilesData?.find(p => p.user_id === planner.user_id)?.avatar_url || ''
        }));

        setPlanners(plannersWithProfiles as Planner[]);
      } else {
        setPlanners([]);
      }
    } catch (error) {
      console.error('Error fetching planners:', error);
      setPlanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (planner: Planner) => {
    setSelectedPlanner(planner);
    setShowPlannerProfile(true);
  };

  const filteredPlanners = planners.filter(planner => {
    return searchLocation === '' || 
      cityMatches(planner.location_city || '', searchLocation) ||
      cityMatches(planner.location_state || '', searchLocation) ||
      planner.business_name?.toLowerCase().includes(searchLocation.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Party Planners</h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing party planners in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter city, state, or business name..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPlanners.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPlanners.map((planner) => (
              <Card 
                key={planner.id} 
                className="overflow-hidden hover:shadow-party transition-party hover-bounce"
              >
                <div className="aspect-video relative overflow-hidden bg-gradient-party">
                  {planner.portfolio_images && planner.portfolio_images.length > 0 ? (
                    <>
                      <img 
                        src={planner.portfolio_images[0]} 
                        alt={`${planner.business_name} portfolio`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={planner.avatar_url} />
                        <AvatarFallback className="text-lg bg-white/20 text-white">
                          {planner.full_name ? getInitials(planner.full_name) : planner.business_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                      <AvatarImage src={planner.avatar_url} />
                      <AvatarFallback className="text-sm bg-white/90 text-primary">
                        {planner.full_name ? getInitials(planner.full_name) : planner.business_name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-primary shadow-sm">
                      ${planner.base_price || 0}+
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{planner.business_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{planner.full_name}</p>
                      {(planner.location_city || planner.location_state) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {[planner.location_city, planner.location_state].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                    {planner.total_reviews > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{planner.average_rating || 0}</span>
                      </div>
                    )}
                  </div>
                  <CardDescription>{planner.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {planner.specialties && planner.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {planner.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                      {planner.specialties.length > 3 && (
                        <Badge variant="outline">
                          +{planner.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {userProfile?.user_role === 'client' && planner.is_verified && (
                    <Button 
                      className="w-full hover-bounce mb-2"
                      onClick={() => {
                        console.log('Send Request clicked. Client data:', clientData);
                        if (!clientData) {
                          console.error('No client data available');
                          toast({
                            title: "Client profile not found",
                            description: "Please refresh the page and try again.",
                            variant: "destructive"
                          });
                          return;
                        }
                        setSelectedPlanner(planner);
                        setShowRequestDialog(true);
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Send Request
                    </Button>
                  )}
                  
                  {userProfile?.user_role === 'client' && !planner.is_verified && (
                    <Button 
                      className="w-full mb-2"
                      disabled
                      variant="outline"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Verification Required
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewProfile(planner)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No planners found</h3>
              <p className="text-muted-foreground">
                {searchLocation 
                  ? `Try adjusting your search for "${searchLocation}"`
                  : 'Check back later as more planners join our platform'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Planner Profile Modal */}
        {selectedPlanner && (
          <PlannerProfileModal
            planner={selectedPlanner}
            open={showPlannerProfile}
            onOpenChange={setShowPlannerProfile}
            currentUserId={user?.id}
            userRole={userProfile?.user_role}
            currentUserIsVerified={currentUserPlannerData?.is_verified}
          />
        )}

        {/* Client Request Dialog */}
        <ClientRequestDialog
          isOpen={showRequestDialog}
          onClose={() => setShowRequestDialog(false)}
          recipientId={selectedPlanner?.id || ""}
          recipientType="planner"
          recipientName={selectedPlanner?.business_name || ""}
          clientData={clientData}
        />
      </div>
    </div>
  );
}