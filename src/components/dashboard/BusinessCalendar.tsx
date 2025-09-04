import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Calendar, Clock, MapPin, User, CheckCircle, Edit, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  description?: string;
  location?: string;
  is_available: boolean;
  vendor_id?: string;
  created_at: string;
  updated_at: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface BusinessCalendarProps {
  plannerProfile: any;
}

export default function BusinessCalendar({ plannerProfile }: BusinessCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [filterType, setFilterType] = useState('all');
  const [newEvent, setNewEvent] = useState({
    title: '',
    event_type: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    description: '',
    location: '',
    is_available: 'true',
    vendor_id: ''
  });

  const eventTypes = [
    { value: 'availability_block', label: 'Availability Block', color: 'bg-green-100 text-green-800' },
    { value: 'vendor_meeting', label: 'Vendor Meeting', color: 'bg-blue-100 text-blue-800' },
    { value: 'client_consultation', label: 'Client Consultation', color: 'bg-orange-100 text-orange-800' },
    { value: 'wedding_planning', label: 'Wedding Planning', color: 'bg-pink-100 text-pink-800' },
    { value: 'birthday_party', label: 'Birthday Party Planning', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'corporate_function', label: 'Corporate Function', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'anniversary_celebration', label: 'Anniversary Celebration', color: 'bg-rose-100 text-rose-800' },
    { value: 'graduation_party', label: 'Graduation Party', color: 'bg-teal-100 text-teal-800' },
    { value: 'marketing_activity', label: 'Marketing Activity', color: 'bg-purple-100 text-purple-800' },
    { value: 'venue_visit', label: 'Venue Visit', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'event_execution', label: 'Event Execution', color: 'bg-red-100 text-red-800' },
    { value: 'personal', label: 'Personal', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (plannerProfile) {
      fetchEvents();
      fetchVendors();
    }
  }, [plannerProfile]);

  useEffect(() => {
    let filtered = events;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.event_type === filterType);
    }
    
    setFilteredEvents(filtered);
  }, [events, filterType]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('planner_calendar')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('planner_vendors')
        .select('id, name')
        .eq('planner_id', plannerProfile.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newEvent.title.trim() || !newEvent.event_type || !newEvent.start_date || !newEvent.start_time) {
      toast({
        title: "Validation Error",
        description: "Title, type, start date, and start time are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const startDateTime = new Date(`${newEvent.start_date}T${newEvent.start_time}`);
      const endDateTime = newEvent.end_date && newEvent.end_time 
        ? new Date(`${newEvent.end_date}T${newEvent.end_time}`)
        : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour later

      const eventData = {
        title: newEvent.title,
        event_type: newEvent.event_type,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        description: newEvent.description || null,
        location: newEvent.location || null,
        is_available: newEvent.is_available === 'true',
        vendor_id: newEvent.vendor_id || null,
        planner_id: plannerProfile.id
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('planner_calendar')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast({ title: "Event updated successfully!" });
      } else {
        const { error } = await supabase
          .from('planner_calendar')
          .insert([eventData]);
        
        if (error) throw error;
        toast({ title: "Event created successfully!" });
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      setNewEvent({
        title: '', event_type: '', start_date: '', start_time: '', end_date: '',
        end_time: '', description: '', location: '', is_available: 'true', vendor_id: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('planner_calendar')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
      toast({ title: "Event deleted successfully!" });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);
    
    setNewEvent({
      title: event.title,
      event_type: event.event_type,
      start_date: format(startDate, 'yyyy-MM-dd'),
      start_time: format(startDate, 'HH:mm'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      end_time: format(endDate, 'HH:mm'),
      description: event.description || '',
      location: event.location || '',
      is_available: event.is_available.toString(),
      vendor_id: event.vendor_id || ''
    });
    setIsDialogOpen(true);
  };

  const getEventTypeColor = (eventType: string) => {
    return eventTypes.find(t => t.value === eventType)?.color || 'bg-gray-100 text-gray-800';
  };

  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return null;
    return vendors.find(v => v.id === vendorId)?.name;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_datetime), date)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Calendar</h2>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: 'calendar' | 'list') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="calendar">Calendar View</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingEvent(null);
                setNewEvent({
                  title: '', event_type: '', start_date: '', start_time: '', end_date: '',
                  end_time: '', description: '', location: '', is_available: 'true', vendor_id: ''
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Calendar Event'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update event details' : 'Schedule a new event on your calendar'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Title *</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-type">Event Type *</Label>
                    <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, event_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newEvent.event_type === 'vendor_meeting' && (
                    <div>
                      <Label htmlFor="vendor">Vendor</Label>
                      <Select value={newEvent.vendor_id} onValueChange={(value) => setNewEvent(prev => ({ ...prev, vendor_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No vendor</SelectItem>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                  />
                </div>

                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description"
                    rows={3}
                  />
                </div>

                {newEvent.event_type === 'availability_block' && (
                  <div>
                    <Label htmlFor="is-available">Availability Status</Label>
                    <Select value={newEvent.is_available} onValueChange={(value) => setNewEvent(prev => ({ ...prev, is_available: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available Slots</p>
                <p className="text-2xl font-bold">{events.filter(e => e.event_type === 'availability_block' && e.is_available).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vendor Meetings</p>
                <p className="text-2xl font-bold">{events.filter(e => e.event_type === 'vendor_meeting').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => {
                    const eventDate = new Date(e.start_datetime);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return eventDate >= now && eventDate <= weekFromNow;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar/List View */}
      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map(day => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div key={day.toString()} className={`min-h-[80px] p-1 border rounded ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="text-xs font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div 
                          key={event.id} 
                          className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.event_type)}`}
                          title={event.title}
                        >
                          {format(new Date(event.start_datetime), 'HH:mm')} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your scheduled events and availability</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events found</p>
                <p className="text-sm text-muted-foreground">Add events to manage your schedule</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const vendorName = getVendorName(event.vendor_id);
                  return (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{event.title}</h3>
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {eventTypes.find(t => t.value === event.event_type)?.label}
                            </Badge>
                            {event.event_type === 'availability_block' && (
                              <Badge variant={event.is_available ? "default" : "secondary"}>
                                {event.is_available ? "Available" : "Unavailable"}
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {format(new Date(event.start_datetime), 'MMM d, yyyy HH:mm')} - {format(new Date(event.end_datetime), 'HH:mm')}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {vendorName && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{vendorName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this event?')) {
                                deleteEvent(event.id);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}