import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Search, Filter, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PlannerProfileModal } from '@/components/planners/PlannerProfileModal';
import { cityMatches } from '@/lib/cityMapping';

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
  const { user } = useAuthContext();
  const [searchLocation, setSearchLocation] = useState('');
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanner, setSelectedPlanner] = useState<Planner | null>(null);
  const [showPlannerProfile, setShowPlannerProfile] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get location from URL params if present
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setSearchLocation(locationParam);
    }
    fetchPlanners();
  }, [searchParams]);

  const fetchPlanners = async () => {
    setLoading(true);
    try {
      // Fetch planners data
      const { data: plannersData, error } = await supabase
        .from('planners')
        .select('*')
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
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', plannerUserIds);

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
    // Don't show current user in the planners list
    if (planner.user_id === user?.id) return false;
    
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={planner.avatar_url} />
                      <AvatarFallback className="text-lg bg-white/20 text-white">
                        {planner.full_name ? getInitials(planner.full_name) : planner.business_name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-primary shadow-sm">
                      ${planner.base_price || 0}+
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
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{planner.average_rating || 0}</span>
                    </div>
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
                  
                  <Button 
                    className="w-full hover-bounce"
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
                Try adjusting your search criteria or check back later for new planners
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
          />
        )}
      </div>
    </div>
  );
}