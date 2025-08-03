import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Search, MapPin, Star, Clock, DollarSign, Filter, Users, Calendar, Plus } from 'lucide-react';

interface Helper {
  id: string;
  user_id: string;
  bio: string;
  skills: string[];
  experience_years: number;
  hourly_rate: number;
  availability_cities: string[];
  average_rating: number;
  total_jobs: number;
  portfolio_images: string[];
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

interface HelperRequest {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_city: string;
  hourly_rate: number;
  total_hours: number;
  required_skills: string[];
  status: string;
  created_at: string;
}

export default function HelpersPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('browse');
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [requests, setRequests] = useState<HelperRequest[]>([]);
  const [myRequests, setMyRequests] = useState<HelperRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch helpers with profiles
      const { data: helpersData } = await supabase
        .from('helpers')
        .select(`
          *,
          profiles!helpers_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('average_rating', { ascending: false });

      setHelpers((helpersData as any) || []);

      // Fetch all helper requests
      const { data: requestsData } = await supabase
        .from('helper_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      setRequests(requestsData || []);

      // Fetch user's requests if they're a planner
      if (user) {
        const { data: plannerData } = await supabase
          .from('planners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (plannerData) {
          const { data: myRequestsData } = await supabase
            .from('helper_requests')
            .select('*')
            .eq('planner_id', plannerData.id)
            .order('created_at', { ascending: false });

          setMyRequests(myRequestsData || []);
          setActiveTab('my-requests');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHelpers = helpers.filter(helper => {
    const matchesSearch = helper.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         helper.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationFilter || 
                           helper.availability_cities.some(city => 
                             city.toLowerCase().includes(locationFilter.toLowerCase())
                           );
    return matchesSearch && matchesLocation;
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || 
                           request.location_city.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading helpers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Party Helpers</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find skilled helpers for your events or discover opportunities to assist with amazing parties
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="browse">Browse Helpers</TabsTrigger>
            <TabsTrigger value="requests">Helper Requests</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          </TabsList>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search helpers or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <TabsContent value="browse" className="space-y-6">
            {filteredHelpers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHelpers.map((helper) => (
                  <Card key={helper.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={helper.profiles?.avatar_url} />
                          <AvatarFallback>
                            {helper.profiles?.full_name?.charAt(0) || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{helper.profiles?.full_name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{helper.average_rating.toFixed(1)}</span>
                            <span>({helper.total_jobs} jobs)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {helper.bio && (
                        <p className="text-sm text-muted-foreground">{helper.bio}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {helper.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {helper.skills.length > 3 && (
                          <Badge variant="outline">+{helper.skills.length - 3} more</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{helper.experience_years} years exp</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${helper.hourly_rate}/hr</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{helper.availability_cities.slice(0, 2).join(', ')}</span>
                        {helper.availability_cities.length > 2 && (
                          <span>+{helper.availability_cities.length - 2} more</span>
                        )}
                      </div>
                      
                      <Button className="w-full">
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
                  <h3 className="text-lg font-semibold mb-2">No helpers found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or location filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription className="mt-2">{request.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{request.status}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(request.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.start_time} - {request.end_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.location_city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">${request.hourly_rate}/hr</span>
                        </div>
                      </div>
                      
                      {request.required_skills.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium">Required Skills:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {request.required_skills.map((skill) => (
                              <Badge key={skill} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button>Apply for This Job</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No helper requests found</h3>
                  <p className="text-muted-foreground">Check back later for new opportunities</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Helper Requests</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
            
            {myRequests.length > 0 ? (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription className="mt-2">{request.description}</CardDescription>
                        </div>
                        <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-medium">Date:</span>
                          <p className="text-sm text-muted-foreground">{new Date(request.event_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Time:</span>
                          <p className="text-sm text-muted-foreground">{request.start_time} - {request.end_time}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Location:</span>
                          <p className="text-sm text-muted-foreground">{request.location_city}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Rate:</span>
                          <p className="text-sm text-muted-foreground">${request.hourly_rate}/hr</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No helper requests yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first helper request to get started</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Helper Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}