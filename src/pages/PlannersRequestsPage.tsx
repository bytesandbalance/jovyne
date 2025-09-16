import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Star, Clock, DollarSign, Filter, Users, Calendar, Plus } from 'lucide-react';
import { PlannerProfileModal } from '@/components/planners/PlannerProfileModal';

// Component to handle role-based apply button for planner requests
function ApplyButton({ requestId }: { requestId: string }) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('user_role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setUserRole(data?.user_role || null));
    }
  }, [user]);

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for planner jobs",
        variant: "destructive"
      });
      return;
    }

    if (userRole !== 'planner') {
      toast({
        title: "Access Denied",
        description: "Only planners can apply for these requests",
        variant: "destructive"
      });
      return;
    }

    const { data: plannerData } = await supabase
      .from('planners')
      .select('id, base_price')
      .eq('user_id', user.id)
      .single();

    if (!plannerData) {
      toast({
        title: "Planner Profile Required",
        description: "You need a planner profile to apply for requests",
        variant: "destructive"
      });
      return;
    }

    try {
      // Application functionality is currently disabled
      toast({
        title: "Feature Coming Soon",
        description: "Planner applications will be available in the new workflow",
        variant: "default"
      });
      return;
    } catch (error) {
      console.error('Error applying for request:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  if (userRole === 'planner') {
    return (
      <Button className="w-full" onClick={handleApply}>
        Apply for Request
      </Button>
    );
  }

  return (
    <Button className="w-full" disabled variant="outline">
      {userRole === 'helper' ? 'Helpers cannot apply' : 'Only planners can apply'}
    </Button>
  );
}

interface Planner {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  services: string[];
  category: string[];
  years_experience: number;
  base_price: number;
  location_city: string;
  location_state: string;
  average_rating: number;
  total_reviews: number;
  portfolio_images: string[];
  website_url: string;
  instagram_handle: string;
  is_verified: boolean;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

interface PlannerRequest {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_city: string;
  budget: number;
  total_hours: number;
  required_services: string[];
  status: string;
  created_at: string;
}

export default function PlannersRequestsPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [requests, setRequests] = useState<PlannerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PlannerRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedPlanner, setSelectedPlanner] = useState<Planner | null>(null);
  const [showPlannerProfile, setShowPlannerProfile] = useState(false);
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location_city: '',
    budget: '',
    required_services: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all planners (verified and unverified)
      const { data: plannersData, error: plannersError } = await supabase
        .from('planners')
        .select('*')
        .eq('is_verified', true)
        .order('average_rating', { ascending: false });

      if (plannersError) {
        console.error('Error fetching planners:', plannersError);
        setPlanners([]);
      } else if (plannersData) {
        // Fetch profiles separately to avoid join issues
        const plannerIds = plannersData.map(p => p.user_id);
        const { data: profilesData } = await supabase
          .rpc('get_public_profiles', { user_ids: plannerIds });

        // Combine planners with their profiles
        const plannersWithProfiles = plannersData.map(planner => ({
          ...planner,
          profiles: profilesData?.find(p => p.user_id === planner.user_id) || null
        }));

        setPlanners(plannersWithProfiles);
      }

      // Fetch all planner requests (only for planners)
      const { data: requestsData } = await supabase
        .from('planner_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setRequests(requestsData || []);

      // Check user role and fetch appropriate data
      if (user) {
        // Get user profile to check role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('user_id', user.id)
          .single();

        setUserRole(profileData?.user_role || null);

        // If user is a client, fetch their client data and requests
        if (profileData?.user_role === 'client') {
          const { data: clientData } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (clientData) {
            setClientData(clientData);
            const { data: myRequestsData } = await supabase
              .from('planner_requests')
              .select('*')
              .eq('client_id', clientData.id)
              .order('created_at', { ascending: false });

            setMyRequests(myRequestsData || []);
            setActiveTab('browse'); // Clients start with browse planners
          }
        }
        // If user is a planner, default to requests tab
        else if (profileData?.user_role === 'planner') {
          setActiveTab('requests');
        }
        // If user is a helper, default to browse planners
        else if (profileData?.user_role === 'helper') {
          setActiveTab('browse');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewRequest = async () => {
    // Check if user is a client
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user?.id)
      .single();

    if (profileData?.user_role !== 'client') {
      toast({
        title: "Access Denied",
        description: "Only clients can create planner requests",
        variant: "destructive"
      });
      return;
    }

    if (!clientData) {
      toast({
        title: "Error",
        description: "You must be a registered client to create planner requests",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalHours = calculateTotalHours(newRequest.start_time, newRequest.end_time);
      
      const { error } = await supabase
        .from('planner_requests')
        .insert({
          client_id: clientData.id,
          title: newRequest.title,
          description: newRequest.description,
          event_date: newRequest.event_date,
          start_time: newRequest.start_time,
          end_time: newRequest.end_time,
          location_city: newRequest.location_city,
          budget: parseFloat(newRequest.budget),
          total_hours: totalHours,
          required_services: newRequest.required_services,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Planner request created successfully"
      });

      // Reset form and close dialog
      setNewRequest({
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        end_time: '',
        location_city: '',
        budget: '',
        required_services: [],
      });
      setShowNewRequestDialog(false);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create planner request",
        variant: "destructive"
      });
    }
  };

  const calculateTotalHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end < start) {
      // If end time is before start time, assume it's the next day
      end.setDate(end.getDate() + 1);
    }
    
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const addService = (service: string) => {
    if (service && !newRequest.required_services.includes(service)) {
      setNewRequest(prev => ({
        ...prev,
        required_services: [...prev.required_services, service]
      }));
    }
  };

  const removeService = (serviceToRemove: string) => {
    setNewRequest(prev => ({
      ...prev,
      required_services: prev.required_services.filter(service => service !== serviceToRemove)
    }));
  };

  const getTabCount = () => {
    if (userRole === 'planner') return 2; // Browse + Planner Requests
    if (userRole === 'client') return 2; // Browse + My Requests  
    return 1; // Just Browse for helpers/guests
  };

  const filteredPlanners = planners.filter(planner => {
    // Don't show current user in the planners list
    if (planner.user_id === user?.id) return false;
    
    const matchesSearch = planner.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         planner.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         planner.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationFilter || 
                           planner.location_city?.toLowerCase().includes(locationFilter.toLowerCase());
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
          <p className="text-muted-foreground">Loading planners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Event Planners</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find professional event planners for your special occasions or discover planning opportunities
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${getTabCount()}, 1fr)` }}>
            <TabsTrigger value="browse">Browse Planners</TabsTrigger>
            {userRole === 'planner' && <TabsTrigger value="requests">Planner Requests</TabsTrigger>}
            {userRole === 'client' && <TabsTrigger value="my-requests">My Requests</TabsTrigger>}
          </TabsList>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search planners or services..."
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
            {filteredPlanners.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlanners.map((planner) => (
                  <Card key={planner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={planner.profiles?.avatar_url} />
                          <AvatarFallback>
                            {planner.profiles?.full_name?.charAt(0) || planner.business_name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{planner.business_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{planner.profiles?.full_name}</p>
                          {planner.total_reviews > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{planner.average_rating.toFixed(1)}</span>
                              <span>({planner.total_reviews} reviews)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {planner.description && (
                        <p className="text-sm text-muted-foreground">{planner.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {planner.services.slice(0, 3).map((service) => (
                          <Badge key={service} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                        {planner.services.length > 3 && (
                          <Badge variant="outline">+{planner.services.length - 3} more</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{planner.years_experience} years exp</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>From €{planner.base_price}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{planner.location_city}, {planner.location_state}</span>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedPlanner(planner);
                          setShowPlannerProfile(true);
                        }}
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
                          <span className="text-sm">Budget: €{request.budget}</span>
                        </div>
                      </div>
                      
                      {request.required_services.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium">Required Services:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {request.required_services.map((service) => (
                              <Badge key={service} variant="outline">{service}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <ApplyButton requestId={request.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No planner requests found</h3>
                  <p className="text-muted-foreground">Check back later for new opportunities</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Planner Requests</h2>
              <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Planner Request</DialogTitle>
                    <DialogDescription>
                      Post a new planner request for your event. Professional planners will be able to apply and you can review applications.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Request Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Wedding Planner Needed for Romantic Garden Wedding"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your event vision, requirements, and any other details..."
                        value={newRequest.description}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="event_date">Event Date</Label>
                        <Input
                          id="event_date"
                          type="date"
                          value={newRequest.event_date}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, event_date: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Select value={newRequest.location_city} onValueChange={(value) => setNewRequest(prev => ({ ...prev, location_city: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Köln">Köln</SelectItem>
                            <SelectItem value="Bonn">Bonn</SelectItem>
                            <SelectItem value="Düsseldorf">Düsseldorf</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={newRequest.start_time}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={newRequest.end_time}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="budget">Budget (€)</Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="1500.00"
                          value={newRequest.budget}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, budget: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Required Services</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newRequest.required_services.map((service) => (
                          <Badge key={service} variant="secondary" className="cursor-pointer" onClick={() => removeService(service)}>
                            {service} ×
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={addService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add a service..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Event Planning">Full Event Planning</SelectItem>
                          <SelectItem value="Day-of Coordination">Day-of Coordination</SelectItem>
                          <SelectItem value="Venue Selection">Venue Selection</SelectItem>
                          <SelectItem value="Vendor Management">Vendor Management</SelectItem>
                          <SelectItem value="Budget Management">Budget Management</SelectItem>
                          <SelectItem value="Timeline Creation">Timeline Creation</SelectItem>
                          <SelectItem value="Theme & Design">Theme & Design</SelectItem>
                          <SelectItem value="Invitation Design">Invitation Design</SelectItem>
                          <SelectItem value="Guest Management">Guest Management</SelectItem>
                          <SelectItem value="Catering Coordination">Catering Coordination</SelectItem>
                          <SelectItem value="Entertainment Booking">Entertainment Booking</SelectItem>
                          <SelectItem value="Photography Coordination">Photography Coordination</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createNewRequest} disabled={!newRequest.title || !newRequest.description}>
                      Create Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                          <span className="text-sm font-medium">Budget:</span>
                          <p className="text-sm text-muted-foreground">€{request.budget}</p>
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
                  <h3 className="text-lg font-semibold mb-2">No planner requests yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first planner request to get started</p>
                  <Button onClick={() => setShowNewRequestDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Planner Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Planner Profile Modal */}
        {selectedPlanner && (
          <PlannerProfileModal
            planner={selectedPlanner}
            open={showPlannerProfile}
            onOpenChange={setShowPlannerProfile}
            currentUserId={user?.id}
            userRole={userRole || undefined}
            currentUserIsVerified={userRole === 'planner' ? 
              planners.find(p => p.user_id === user?.id)?.is_verified : 
              undefined
            }
          />
        )}
      </div>
    </div>
  );
}