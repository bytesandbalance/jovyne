import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Star, DollarSign, Settings, Plus, Clock, MapPin, BarChart3, Briefcase } from 'lucide-react';
import EventTaskTracker from './EventTaskTracker';
import ClientContactList from './ClientContactList';
import InvoicingSection from './InvoicingSection';
import HelperApplications from './HelperApplications';

interface PlannerDashboardProps {
  user: any;
  profile: any;
  plannerProfile: any;
  onRefresh: () => void;
}

export default function PlannerDashboard({ user, profile, plannerProfile, onRefresh }: PlannerDashboardProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
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
  const [plannerForm, setPlannerForm] = useState({
    business_name: plannerProfile?.business_name || '',
    description: plannerProfile?.description || '',
    location_city: plannerProfile?.location_city || '',
    location_state: plannerProfile?.location_state || '',
    base_price: plannerProfile?.base_price?.toString() || '',
    years_experience: plannerProfile?.years_experience?.toString() || ''
  });

  useEffect(() => {
    fetchEvents();
  }, [plannerProfile]);

  const fetchEvents = async () => {
    if (!plannerProfile) return;
    
    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_client_id_fkey (full_name, email),
          helpers (
            user_id,
            profiles (full_name)
          )
        `)
        .eq('planner_id', plannerProfile.id)
        .order('event_date', { ascending: true });

      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
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
        description: "Your new event has been added."
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
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error creating event",
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
      onRefresh();
    } catch (error) {
      console.error('Error updating planner profile:', error);
      toast({
        title: "Error updating planner profile",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-5xl grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
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
                        {event.profiles && (
                          <p className="text-sm text-muted-foreground">
                            Client: {event.profiles.full_name}
                          </p>
                        )}
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
                        <span className="font-medium">Client:</span>
                        <p className="text-muted-foreground">{event.profiles?.full_name || 'N/A'}</p>
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
                <p className="text-muted-foreground mb-4">Start managing your first event</p>
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
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <EventTaskTracker plannerProfile={plannerProfile} />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientContactList plannerProfile={plannerProfile} />
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <HelperApplications plannerData={plannerProfile} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Event Calendar</h2>
            <Button onClick={() => setIsEventDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Event
            </Button>
          </div>

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
                {events.map((event) => (
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
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-6">
          <InvoicingSection plannerProfile={plannerProfile} />
        </TabsContent>
      </Tabs>

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
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event_date" className="text-right">Date</Label>
              <Input
                id="event_date"
                type="date"
                value={eventForm.event_date}
                onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event_time" className="text-right">Time</Label>
              <Input
                id="event_time"
                type="time"
                value={eventForm.event_time}
                onChange={(e) => setEventForm({...eventForm, event_time: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="venue_name" className="text-right">Venue</Label>
              <Input
                id="venue_name"
                value={eventForm.venue_name}
                onChange={(e) => setEventForm({...eventForm, venue_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guest_count" className="text-right">Guests</Label>
              <Input
                id="guest_count"
                type="number"
                value={eventForm.guest_count}
                onChange={(e) => setEventForm({...eventForm, guest_count: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">Budget</Label>
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

      {/* Edit Planner Profile Dialog */}
      <Dialog open={isPlannerDialogOpen} onOpenChange={setIsPlannerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Planner Profile</DialogTitle>
            <DialogDescription>Update your business information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="business_name" className="text-right">Business</Label>
              <Input
                id="business_name"
                value={plannerForm.business_name}
                onChange={(e) => setPlannerForm({...plannerForm, business_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={plannerForm.description}
                onChange={(e) => setPlannerForm({...plannerForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location_city" className="text-right">City</Label>
              <Input
                id="location_city"
                value={plannerForm.location_city}
                onChange={(e) => setPlannerForm({...plannerForm, location_city: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location_state" className="text-right">State</Label>
              <Input
                id="location_state"
                value={plannerForm.location_state}
                onChange={(e) => setPlannerForm({...plannerForm, location_state: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="base_price" className="text-right">Base Price</Label>
              <Input
                id="base_price"
                type="number"
                value={plannerForm.base_price}
                onChange={(e) => setPlannerForm({...plannerForm, base_price: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="years_experience" className="text-right">Experience</Label>
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