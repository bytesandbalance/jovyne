import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PlannerProfileModal } from '@/components/planners/PlannerProfileModal';
import ClientRequestDialog from '@/components/requests/ClientRequestDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Search, 
  Filter,
  ArrowRight,
  PartyPopper,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';

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

export default function HomePage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredPlanners, setFeaturedPlanners] = useState<Planner[]>([]);
  const [selectedPlanner, setSelectedPlanner] = useState<Planner | null>(null);
  const [showPlannerProfile, setShowPlannerProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  useEffect(() => {
    fetchFeaturedPlanners();
    fetchUserData();
  }, [user]);

  const fetchFeaturedPlanners = async () => {
    try {
      // Fetch 3 most recent planners (exclude mock planner)
      const { data: plannersData, error } = await supabase
        .from('planners')
        .select('*')
        .neq('business_name', 'comeback')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching planners:', error);
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

        setFeaturedPlanners(plannersWithProfiles as Planner[]);
      }
    } catch (error) {
      console.error('Error fetching featured planners:', error);
    }
  };

  const handleViewProfile = (planner: Planner) => {
    setSelectedPlanner(planner);
    setShowPlannerProfile(true);
  };

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUserProfile(profile);

      // If user is a client, fetch their client data
      if (profile?.user_role === 'client') {
        let finalClientData = null;
        
        const { data: clientRecord, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!clientRecord) {
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
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 gradient-party">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
              <PartyPopper className="w-5 h-5" />
              <span className="text-sm font-medium">Welcome to Jovial</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Perfect
              <br />
              <span className="relative">
                Party Planners
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300" />
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Discover amazing party planners near you and plan unforgettable events 
              with professional planning services
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-party">
                <div className="flex-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground ml-4" />
                   <Input
                    placeholder="Enter your city..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-lg text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {user ? (
                  <Link to={`/planners${searchLocation ? `?location=${encodeURIComponent(searchLocation)}` : ''}`} className="w-full sm:w-auto">
                    <Button size="lg" className="rounded-xl hover-bounce w-full sm:w-auto">
                      <Search className="w-5 h-5 mr-2" />
                      Find Planners
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth?mode=signin" className="w-full sm:w-auto">
                    <Button size="lg" className="rounded-xl hover-bounce w-full sm:w-auto">
                      <Search className="w-5 h-5 mr-2" />
                      Find Planners
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {!user && (
                <Link to="/auth?mode=signup">
                  <Button size="lg" variant="secondary" className="hover-bounce">
                    Join the Platform
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Planners */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Party Planners</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover top-rated party planners who will make your celebration extraordinary
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredPlanners.map((planner) => (
              <Card key={planner.id} className="overflow-hidden hover:shadow-party transition-party hover-bounce">
                <div className="aspect-video relative overflow-hidden bg-gradient-party">
                  {planner.portfolio_images && planner.portfolio_images.length > 0 ? (
                    <img 
                      src={planner.portfolio_images[0]} 
                      alt={`${planner.business_name} portfolio`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-party">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={planner.avatar_url} />
                        <AvatarFallback className="text-lg bg-white/20 text-white">
                          {planner.full_name ? getInitials(planner.full_name) : planner.business_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-primary shadow-sm">
                      €{planner.base_price || 0}+
                    </Badge>
                  </div>
                  {planner.is_verified && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-primary shadow-sm">
                        ✓ Verified
                      </Badge>
                    </div>
                  )}
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
                        <span className="text-sm text-muted-foreground">({planner.total_reviews || 0})</span>
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
                        if (!clientData) {
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
                    className="w-full hover-bounce"
                    onClick={() => handleViewProfile(planner)}
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            {user ? (
              <Link to="/planners">
                <Button size="lg" variant="outline" className="hover-bounce">
                  <Search className="w-5 h-5 mr-2" />
                  Browse All Planners
                </Button>
              </Link>
            ) : (
              <Link to="/auth?mode=signin">
                <Button size="lg" variant="outline" className="hover-bounce">
                  <Search className="w-5 h-5 mr-2" />
                  Browse All Planners
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How Jovial Works</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to your perfect party
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-party flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Discover</h3>
              <p className="text-muted-foreground">
                Browse party planners in your area, view their portfolios, and read reviews
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-sunset flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Plan</h3>
              <p className="text-muted-foreground">
                Connect with planners, share your vision, and collaborate on every detail
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-celebration flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Celebrate</h3>
              <p className="text-muted-foreground">
                Enjoy your perfectly planned event while we handle all the details
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="py-16 px-4 gradient-ocean">
          <div className="container mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Planning?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of happy customers who found their perfect party planner
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup&role=client">
                <Button size="lg" variant="secondary" className="hover-bounce">
                  <Users className="w-5 h-5 mr-2" />
                  Join as Client
                </Button>
              </Link>
              <Link to="/auth?mode=signup&role=planner">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover-bounce">
                  <Calendar className="w-5 h-5 mr-2" />
                  Become a Planner
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Planner Profile Modal */}
      {selectedPlanner && (
        <PlannerProfileModal
          planner={selectedPlanner}
          open={showPlannerProfile}
          onOpenChange={setShowPlannerProfile}
          currentUserId={user?.id}
          userRole={userProfile?.user_role}
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
  );
}