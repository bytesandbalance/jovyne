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
import { HelperProfileModal } from '@/components/helpers/HelperProfileModal';
import { RequestDialog } from '@/components/requests/RequestDialog';

// Component to handle role-based apply button
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
        description: "Please sign in to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    if (userRole !== 'helper') {
      toast({
        title: "Access Denied",
        description: "Only helpers can apply for jobs",
        variant: "destructive"
      });
      return;
    }

    const { data: helperData } = await supabase
      .from('helpers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!helperData) {
      toast({
        title: "Helper Profile Required",
        description: "You need a helper profile to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('helper_applications')
        .select('id')
        .eq('helper_id', helperData.id)
        .eq('helper_request_id', requestId)
        .single();

      if (existingApplication) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this job",
          variant: "destructive"
        });
        return;
      }

      // Create application
      const { error } = await supabase
        .from('helper_applications')
        .insert({
          helper_id: helperData.id,
          helper_request_id: requestId,
          status: 'pending',
          message: 'I would like to help with your event!',
          hourly_rate: 25
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the planner"
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  if (userRole === 'helper') {
    return (
      <Button className="w-full" onClick={handleApply}>
        Apply for Job
      </Button>
    );
  }

  return (
    <Button className="w-full" disabled variant="outline">
      {userRole === 'planner' ? 'Planners cannot apply' : 'Clients cannot apply'}
    </Button>
  );
}

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [requests, setRequests] = useState<HelperRequest[]>([]);
  const [myRequests, setMyRequests] = useState<HelperRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [showHelperProfile, setShowHelperProfile] = useState(false);
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location_city: '',
    hourly_rate: '',
    required_skills: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch helpers with profiles using a simpler query
      const { data: helpersData, error: helpersError } = await supabase
        .from('helpers')
        .select('*')
        .order('average_rating', { ascending: false });

      if (helpersError) {
        console.error('Error fetching helpers:', helpersError);
        setHelpers([]);
      } else if (helpersData) {
        // Fetch profiles separately to avoid join issues
        const helperIds = helpersData.map(h => h.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', helperIds);

        // Combine helpers with their profiles
        const helpersWithProfiles = helpersData.map(helper => ({
          ...helper,
          profiles: profilesData?.find(p => p.user_id === helper.user_id) || null
        }));

        setHelpers(helpersWithProfiles);
      }

      // Fetch all helper requests (only for helpers)
      const { data: requestsData } = await supabase
        .from('helper_requests')
        .select('*')
        .eq('status', 'open')
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

        // If user is a planner, fetch their planner data and requests
        if (profileData?.user_role === 'planner') {
          const { data: plannerData } = await supabase
            .from('planners')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (plannerData) {
            setPlannerData(plannerData);
            const { data: myRequestsData } = await supabase
              .from('helper_requests')
              .select('*')
              .eq('planner_id', plannerData.id)
              .order('created_at', { ascending: false });

            setMyRequests(myRequestsData || []);
            setActiveTab('browse'); // Planners start with browse helpers
          }
        }
        // If user is a helper, default to requests tab
        else if (profileData?.user_role === 'helper') {
          setActiveTab('requests');
        }
        // If user is a client, default to browse helpers
        else if (profileData?.user_role === 'client') {
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
    // Check if user is a planner
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user?.id)
      .single();

    if (profileData?.user_role !== 'planner') {
      toast({
        title: "Access Denied",
        description: "Only planners can create helper requests",
        variant: "destructive"
      });
      return;
    }

    if (!plannerData) {
      toast({
        title: "Error",
        description: "You must be a verified planner to create helper requests",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalHours = calculateTotalHours(newRequest.start_time, newRequest.end_time);
      
      const { error } = await supabase
        .from('helper_requests')
        .insert({
          planner_id: plannerData.id,
          title: newRequest.title,
          description: newRequest.description,
          event_date: newRequest.event_date,
          start_time: newRequest.start_time,
          end_time: newRequest.end_time,
          location_city: newRequest.location_city,
          hourly_rate: parseFloat(newRequest.hourly_rate),
          total_hours: totalHours,
          required_skills: newRequest.required_skills,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Helper request created successfully"
      });

      // Reset form and close dialog
      setNewRequest({
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        end_time: '',
        location_city: '',
        hourly_rate: '',
        required_skills: [],
      });
      setShowNewRequestDialog(false);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create helper request",
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

  const addSkill = (skill: string) => {
    if (skill && !newRequest.required_skills.includes(skill)) {
      setNewRequest(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setNewRequest(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleApplyForJob = async (requestId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    // Check if user is a helper
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profileData?.user_role !== 'helper') {
      toast({
        title: "Access Denied",
        description: "Only helpers can apply for jobs",
        variant: "destructive"
      });
      return;
    }

    const { data: helperData } = await supabase
      .from('helpers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!helperData) {
      toast({
        title: "Helper Profile Required",
        description: "You need a helper profile to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('helper_applications')
        .select('id')
        .eq('helper_id', helperData.id)
        .eq('helper_request_id', requestId)
        .single();

      if (existingApplication) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this job",
          variant: "destructive"
        });
        return;
      }

      // Create application
      const { error } = await supabase
        .from('helper_applications')
        .insert({
          helper_id: helperData.id,
          helper_request_id: requestId,
          status: 'pending',
          message: 'I would like to help with your event!',
          hourly_rate: 25 // Default rate, could be made dynamic
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the planner"
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  const getTabCount = () => {
    if (userRole === 'helper') return 2; // Browse + Helper Requests
    if (userRole === 'planner') return 2; // Browse + My Requests  
    return 1; // Just Browse for clients
  };

  const filteredHelpers = helpers.filter(helper => {
    // Don't show current user in the helpers list
    if (helper.user_id === user?.id) return false;
    
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
          <TabsList className="grid w-full max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${getTabCount()}, 1fr)` }}>
            <TabsTrigger value="browse">Browse Helpers</TabsTrigger>
            {userRole === 'helper' && <TabsTrigger value="requests">Helper Requests</TabsTrigger>}
            {userRole === 'planner' && <TabsTrigger value="my-requests">My Requests</TabsTrigger>}
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
                      
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedHelper(helper);
                          setShowHelperProfile(true);
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
                      
                      <ApplyButton requestId={request.id} />
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
              <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Helper Request</DialogTitle>
                    <DialogDescription>
                      Post a new helper request for your event. Helpers will be able to apply and you can review applications.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Request Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Wedding Photography Assistant Needed"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what you need help with, requirements, and any other details..."
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
                        <Label htmlFor="hourly_rate">Hourly Rate (€)</Label>
                        <Input
                          id="hourly_rate"
                          type="number"
                          placeholder="25.00"
                          value={newRequest.hourly_rate}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, hourly_rate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Required Skills</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newRequest.required_skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={addSkill}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add a skill..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Event Setup">Event Setup</SelectItem>
                          <SelectItem value="Photography">Photography</SelectItem>
                          <SelectItem value="Catering">Catering</SelectItem>
                          <SelectItem value="DJ Services">DJ Services</SelectItem>
                          <SelectItem value="Sound Equipment">Sound Equipment</SelectItem>
                          <SelectItem value="Music Coordination">Music Coordination</SelectItem>
                          <SelectItem value="Decoration">Decoration</SelectItem>
                          <SelectItem value="Floral Arrangements">Floral Arrangements</SelectItem>
                          <SelectItem value="Venue Setup">Venue Setup</SelectItem>
                          <SelectItem value="Bartending">Bartending</SelectItem>
                          <SelectItem value="Cocktail Service">Cocktail Service</SelectItem>
                          <SelectItem value="Event Service">Event Service</SelectItem>
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
                  <Button onClick={() => setShowNewRequestDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Helper Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Helper Profile Modal */}
        {selectedHelper && (
          <HelperProfileModal
            helper={selectedHelper}
            open={showHelperProfile}
            onOpenChange={setShowHelperProfile}
            currentUserId={user?.id}
          />
        )}
      </div>
    </div>
  );
}