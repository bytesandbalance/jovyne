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
import { Calendar, Plus, Settings, Clock, MapPin, Users } from 'lucide-react';

interface ClientDashboardProps {
  user: any;
  profile: any;
  onRefresh: () => void;
}

export default function ClientDashboard({ user, profile, onRefresh }: ClientDashboardProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
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
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  });

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          planners (
            business_name,
            user_id,
            profiles (full_name)
          )
        `)
        .eq('client_id', user?.id)
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
        client_id: user?.id
      };

      const { error } = await supabase
        .from('events')
        .insert(eventData);

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
      onRefresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
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

  const approvedEvents = events.filter(event => event.planner_id);
  const pendingEvents = events.filter(event => !event.planner_id);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Events</h2>
            <Button onClick={() => setIsEventDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <CardTitle className="text-sm font-medium">Approved Events</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedEvents.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingEvents.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
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
                      <Badge variant={event.planner_id ? 'default' : 'secondary'}>
                        {event.planner_id ? 'Assigned' : 'Open'}
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
                    {event.planner_id && event.planners && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <span className="font-medium">Assigned Planner: </span>
                        <span className="text-muted-foreground">
                          {event.planners.business_name} ({event.planners.profiles?.full_name})
                        </span>
                      </div>
                    )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="text-muted-foreground">{profile?.full_name}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <p className="text-muted-foreground">Client</p>
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
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Calendar
              </CardTitle>
              <CardDescription>Your upcoming events</CardDescription>
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
                    <Badge variant={event.planner_id ? 'default' : 'secondary'}>
                      {event.planner_id ? 'Assigned' : 'Open'}
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

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">Name</Label>
              <Input
                id="full_name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
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
    </div>
  );
}