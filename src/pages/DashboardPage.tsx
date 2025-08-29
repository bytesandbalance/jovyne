import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, Star, DollarSign, Settings, Plus, UserCheck, BarChart3, CreditCard, Clock, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EventTaskTracker from '@/components/dashboard/EventTaskTracker';
import ClientContactList from '@/components/dashboard/ClientContactList';
import InvoicingSection from '@/components/dashboard/InvoicingSection';
import PlannerPendingPayments from '@/components/dashboard/PlannerPendingPayments';
import HelperDashboardFixed from '@/components/dashboard/HelperDashboardFixed';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [profile, setProfile] = useState<any>(null);
  const [plannerProfile, setPlannerProfile] = useState<any>(null);
  const [helperProfile, setHelperProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [plannerRequests, setPlannerRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPlannerDialogOpen, setIsPlannerDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue_name: '',
    venue_address: '',
    guest_count: '',
    budget: ''
  });
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: ''
  });
  const [plannerForm, setPlannerForm] = useState({
    business_name: '',
    description: '',
    location_city: '',
    location_state: '',
    base_price: '',
    years_experience: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setProfile(profileData);
      setProfileForm({
        full_name: profileData?.full_name || '',
        phone: profileData?.phone || ''
      });

      // Check if user is a planner
      const { data: plannerData } = await supabase
        .from('planners')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setPlannerProfile(plannerData);
      setPlannerForm({
        business_name: plannerData?.business_name || '',
        description: plannerData?.description || '',
        location_city: plannerData?.location_city || '',
        location_state: plannerData?.location_state || '',
        base_price: plannerData?.base_price?.toString() || '',
        years_experience: plannerData?.years_experience?.toString() || ''
      });

      // Check if user is a helper
      const { data: helperData } = await supabase
        .from('helpers')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setHelperProfile(helperData);

      // Fetch events based on user role
      let eventsQuery = supabase.from('events').select('*');
      
      if (plannerData) {
        eventsQuery = eventsQuery.eq('planner_id', plannerData.id);
      } else {
        eventsQuery = eventsQuery.eq('client_id', user?.id);
      }

      const { data: eventsData } = await eventsQuery;
      setEvents(eventsData || []);

      // Fetch planner requests if user is a planner
      if (plannerData) {
        const { data: requestsData } = await supabase
          .from('planner_requests')
          .select(`
            *,
            clients!planner_requests_client_id_fkey (
              user_id,
              full_name,
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false });
        
        setPlannerRequests(requestsData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...eventForm,
        guest_count: eventForm.guest_count ? parseInt(eventForm.guest_count) : null,
        budget: eventForm.budget ? parseFloat(eventForm.budget) : null,
        planner_id: plannerProfile?.id,
        client_id: user?.id
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) throw error;

      toast({
        title: "Event created successfully!",
        description: "Your new event has been added to your dashboard."
      });

      setIsEventDialogOpen(false);
      setEventForm({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        venue_name: '',
        venue_address: '',
        guest_count: '',
        budget: ''
      });
      fetchUserData();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error creating event",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved."
      });

      setIsProfileDialogOpen(false);
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePlannerProfile = async () => {
    try {
      const { error } = await supabase
        .from('planners')
        .update({
          business_name: plannerForm.business_name,
          description: plannerForm.description,
          location_city: plannerForm.location_city,
          location_state: plannerForm.location_state,
          base_price: plannerForm.base_price ? parseFloat(plannerForm.base_price) : null,
          years_experience: plannerForm.years_experience ? parseInt(plannerForm.years_experience) : null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Planner profile updated successfully!",
        description: "Your business information has been saved."
      });

      setIsPlannerDialogOpen(false);
      fetchUserData();
    } catch (error) {
      console.error('Error updating planner profile:', error);
      toast({
        title: "Error updating planner profile",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('planner_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      // Send notification message to client
      const request = plannerRequests.find(r => r.id === requestId);
      if (request?.clients?.user_id) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: user?.id,
            recipient_id: request.clients.user_id,
            subject: action === 'approved' ? 'Request Approved' : 'Request Declined',
            message: action === 'approved' 
              ? `Your planner request "${request.title}" has been approved! We'll be in touch soon to discuss next steps.`
              : `Your planner request "${request.title}" was declined. Thank you for considering us.`
          });

        if (messageError) {
          console.error('Error sending notification:', messageError);
        }
      }

      toast({
        title: action === 'approved' ? "Request approved!" : "Request declined",
        description: action === 'approved' 
          ? "The client has been notified of your acceptance." 
          : "The client has been notified."
      });

      fetchUserData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error updating request",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isPlannerView = plannerProfile && profile?.user_role === 'planner';
  const isHelperView = helperProfile && profile?.user_role === 'helper';

  // Show dedicated helper dashboard if user is a helper
  if (isHelperView) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || 'Helper'}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your applications and find new opportunities
            </p>
          </div>
          <HelperDashboardFixed user={user} helperData={helperProfile} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-muted-foreground text-lg">
            {isPlannerView ? 'Manage your events and grow your business' : 
             isHelperView ? 'Find opportunities and manage your applications' : 
             'Track your events and bookings'}
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className={`${isPlannerView ? 'flex flex-wrap justify-center gap-1 w-full max-w-4xl mx-auto p-1 h-auto sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7' : isHelperView ? 'grid w-full max-w-md grid-cols-2' : 'grid w-full max-w-md grid-cols-3'}`}>
            {!isHelperView && <TabsTrigger value="overview">Overview</TabsTrigger>}
            {!isHelperView && <TabsTrigger value="events">Events</TabsTrigger>}
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isPlannerView && (
              <>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
              </>
            )}
            {isHelperView && <TabsTrigger value="helper-dashboard">Dashboard</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                </CardContent>
              </Card>

              {isPlannerView && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{plannerProfile?.average_rating || '0.0'}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{plannerProfile?.total_reviews || '0'}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Base Price</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${plannerProfile?.base_price || '0'}</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Your latest event activities</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No events yet</p>
                    <Button className="mt-4" onClick={() => setIsEventDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Events</h2>
              <Button onClick={() => setIsEventDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
            
            {events.length > 0 ? (
              <div className="grid gap-6">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription>{event.description}</CardDescription>
                        </div>
                        <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span>
                          <p className="text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Guests:</span>
                          <p className="text-muted-foreground">{event.guest_count || 'TBD'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Budget:</span>
                          <p className="text-muted-foreground">${event.budget || 'TBD'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Venue:</span>
                          <p className="text-muted-foreground">{event.venue_name || 'TBD'}</p>
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
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-4">Start planning your first event</p>
                  <Button onClick={() => setIsEventDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="break-words">
                    <span className="font-medium">Name:</span>
                    <p className="text-muted-foreground break-words">{profile?.full_name}</p>
                  </div>
                  <div className="break-words">
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground break-words">{profile?.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>
                    <p className="text-muted-foreground capitalize">{profile?.user_role}</p>
                  </div>
                  <div>
                    <span className="font-medium">Member since:</span>
                    <p className="text-muted-foreground">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {isPlannerView && (
              <Card>
                <CardHeader>
                  <CardTitle>Planner Profile</CardTitle>
                  <CardDescription>Your business information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Business Name:</span>
                      <p className="text-muted-foreground">{plannerProfile?.business_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>
                      <p className="text-muted-foreground">{plannerProfile?.years_experience} years</p>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-muted-foreground">
                        {plannerProfile?.location_city}, {plannerProfile?.location_state}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Verified:</span>
                      <p className="text-muted-foreground">
                        {plannerProfile?.is_verified ? 'Yes' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  {plannerProfile?.description && (
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground mt-1">{plannerProfile.description}</p>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setIsPlannerDialogOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Planner Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isPlannerView && (
            <>
              {/* Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Planner Requests</h2>
                  <Badge variant="secondary" className="text-sm">
                    {plannerRequests.filter(r => r.status === 'pending').length} pending
                  </Badge>
                </div>
                
                {plannerRequests.length > 0 ? (
                  <div className="grid gap-6">
                    {plannerRequests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{request.title}</CardTitle>
                              <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(request.event_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {request.location_city}
                                </span>
                                {request.budget && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    ${request.budget.toLocaleString()}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                request.status === 'approved' ? 'default' : 
                                request.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {request.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {request.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                {request.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Client:</span>
                                <div className="text-muted-foreground mt-1">
                                  <p>{request.clients?.full_name}</p>
                                  {request.clients?.email && (
                                    <p className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {request.clients.email}
                                    </p>
                                  )}
                                  {request.clients?.phone && (
                                    <p className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {request.clients.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium">Request Details:</span>
                                <div className="text-muted-foreground mt-1 space-y-1">
                                  <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                                  {request.start_time && (
                                    <p>Start Time: {request.start_time}</p>
                                  )}
                                  {request.end_time && (
                                    <p>End Time: {request.end_time}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {request.required_services && request.required_services.length > 0 && (
                              <div>
                                <span className="font-medium text-sm">Required Services:</span>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {request.required_services.map((service, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {request.status === 'pending' && (
                              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                                <Button 
                                  onClick={() => handleRequestAction(request.id, 'approved')}
                                  className="flex-1 sm:flex-none"
                                  size="sm"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve Request
                                </Button>
                                <Button 
                                  onClick={() => handleRequestAction(request.id, 'rejected')}
                                  variant="outline"
                                  className="flex-1 sm:flex-none"
                                  size="sm"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Decline Request
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Planner requests will appear here when clients submit them
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Task Tracker Tab */}
              <TabsContent value="tasks" className="space-y-6">
                <EventTaskTracker plannerProfile={plannerProfile} />
              </TabsContent>

              {/* Client Contacts Tab */}
              <TabsContent value="clients" className="space-y-6">
                <ClientContactList plannerProfile={plannerProfile} />
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Event Calendar</h2>
                  <Button onClick={() => setIsEventDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Event
                  </Button>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Upcoming Events
                      </CardTitle>
                      <CardDescription>Your event schedule overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {events.slice(0, 5).map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{event.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {new Date(event.event_date).toLocaleDateString()}
                                  {event.event_time && ` at ${event.event_time}`}
                                </p>
                                {event.venue_name && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {event.venue_name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                              {event.status}
                            </Badge>
                          </div>
                        ))}
                        {events.length === 0 && (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No events scheduled</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Invoicing Tab */}
              <TabsContent value="invoicing" className="space-y-6">
<div className="space-y-6">
  <PlannerPendingPayments plannerProfile={plannerProfile} />
  <InvoicingSection plannerProfile={plannerProfile} />
</div>
              </TabsContent>
            </>
          )}

          {isHelperView && (
            <TabsContent value="helper-dashboard" className="space-y-6">
              <HelperDashboardFixed user={user} helperData={helperProfile} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* New Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to your calendar. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event_date" className="text-right">
                Date
              </Label>
              <Input
                id="event_date"
                type="date"
                value={eventForm.event_date}
                onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event_time" className="text-right">
                Time
              </Label>
              <Input
                id="event_time"
                type="time"
                value={eventForm.event_time}
                onChange={(e) => setEventForm({...eventForm, event_time: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="venue_name" className="text-right">
                Venue
              </Label>
              <Input
                id="venue_name"
                value={eventForm.venue_name}
                onChange={(e) => setEventForm({...eventForm, venue_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guest_count" className="text-right">
                Guests
              </Label>
              <Input
                id="guest_count"
                type="number"
                value={eventForm.guest_count}
                onChange={(e) => setEventForm({...eventForm, guest_count: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={eventForm.budget}
                onChange={(e) => setEventForm({...eventForm, budget: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Name
              </Label>
              <Input
                id="full_name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Planner Profile Dialog */}
      <Dialog open={isPlannerDialogOpen} onOpenChange={setIsPlannerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Planner Profile</DialogTitle>
            <DialogDescription>
              Update your business information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="business_name" className="text-right">
                Business
              </Label>
              <Input
                id="business_name"
                value={plannerForm.business_name}
                onChange={(e) => setPlannerForm({...plannerForm, business_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planner_description" className="text-right">
                Description
              </Label>
              <Textarea
                id="planner_description"
                value={plannerForm.description}
                onChange={(e) => setPlannerForm({...plannerForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location_city" className="text-right">
                City
              </Label>
              <Input
                id="location_city"
                value={plannerForm.location_city}
                onChange={(e) => setPlannerForm({...plannerForm, location_city: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location_state" className="text-right">
                State
              </Label>
              <Input
                id="location_state"
                value={plannerForm.location_state}
                onChange={(e) => setPlannerForm({...plannerForm, location_state: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="base_price" className="text-right">
                Base Price
              </Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={plannerForm.base_price}
                onChange={(e) => setPlannerForm({...plannerForm, base_price: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="years_experience" className="text-right">
                Experience
              </Label>
              <Input
                id="years_experience"
                type="number"
                value={plannerForm.years_experience}
                onChange={(e) => setPlannerForm({...plannerForm, years_experience: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdatePlannerProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}