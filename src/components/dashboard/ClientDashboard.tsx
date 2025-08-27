import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, Star, Briefcase, CheckCircle, XCircle, User, Users } from 'lucide-react';
import PlannerApplications from './PlannerApplications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ClientHelperRequest {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_city: string;
  hourly_rate: number;
  total_hours: number;
  status: string;
  required_skills: string[];
  created_at: string;
}

interface ClientPlannerRequest {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_city: string;
  budget: number;
  total_hours: number;
  status: string;
  required_services: string[];
  created_at: string;
}

interface ClientDashboardProps {
  user: any;
  clientData: any;
}

export default function ClientDashboard({ user, clientData }: ClientDashboardProps) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [helperRequests, setHelperRequests] = useState<ClientHelperRequest[]>([]);
  const [plannerRequests, setPlannerRequests] = useState<ClientPlannerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: clientData?.full_name || '',
    email: clientData?.email || '',
    phone: clientData?.phone || '',
    address: clientData?.address || '',
    notes: clientData?.notes || '',
  });

  useEffect(() => {
    if (clientData) {
      fetchClientData();
      setEditForm({
        full_name: clientData.full_name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        notes: clientData.notes || '',
      });
    }
  }, [clientData]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!clientData?.user_id) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, phone, avatar_url')
        .eq('user_id', clientData.user_id)
        .maybeSingle();
      setUserProfile(data || null);
    };
    loadProfile();
  }, [clientData?.user_id]);

  const fetchClientData = async () => {
    try {
      // Fetch client's helper requests
      const { data: helperRequestsData, error: helperRequestsError } = await supabase
        .from('helper_requests')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (helperRequestsError) throw helperRequestsError;
      setHelperRequests(helperRequestsData || []);

      // Fetch client's planner requests
      const { data: plannerRequestsData, error: plannerRequestsError } = await supabase
        .from('planner_requests')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (plannerRequestsError) throw plannerRequestsError;
      setPlannerRequests(plannerRequestsData || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          full_name: editForm.full_name || null,
          email: editForm.email || null,
          phone: editForm.phone || null,
          address: editForm.address || null,
          notes: editForm.notes || null,
        })
        .eq('id', clientData.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your client profile has been saved.',
      });
      setEditOpen(false);
    } catch (e: any) {
      console.error('Error updating client profile:', e);
      toast({
        title: 'Update failed',
        description: e.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-center gap-1 w-full max-w-4xl mx-auto p-1 h-auto sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="helper-requests">Helper Requests</TabsTrigger>
          <TabsTrigger value="planner-requests">Planner Requests</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Helper Requests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{helperRequests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planner Requests</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plannerRequests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {helperRequests.filter(req => req.status === 'open').length + 
                   plannerRequests.filter(req => req.status === 'open').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{(plannerRequests.reduce((sum, req) => sum + (req.budget || 0), 0) +
                     helperRequests.reduce((sum, req) => sum + (req.hourly_rate * req.total_hours || 0), 0)).toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events with active requests</CardDescription>
            </CardHeader>
            <CardContent>
              {[...helperRequests, ...plannerRequests].filter(req => req.status === 'open').length > 0 ? (
                <div className="space-y-4">
                  {[...helperRequests, ...plannerRequests]
                    .filter(req => req.status === 'open')
                    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                    .map((request, index) => (
                      <div key={`${request.id}-${index}`} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold">{request.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(request.event_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{request.start_time} - {request.end_time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{request.location_city}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>
                                  {'budget' in request ? `€${request.budget}` : `€${request.hourly_rate}/hr`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="default" className="capitalize w-fit">
                            {'budget' in request ? 'Planner Request' : 'Helper Request'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events with active requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.full_name || 'Client avatar'} />
                  <AvatarFallback>{(userProfile?.full_name || clientData?.full_name || 'C').split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {userProfile?.full_name || clientData?.full_name || 'Client'}
                    <Badge variant="secondary">Client</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {clientData?.email || userProfile?.email}
                    {clientData?.phone ? ` • ${clientData.phone}` : ''}
                  </CardDescription>
                  {clientData?.address && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{clientData.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={() => setEditOpen(true)}>Edit Profile</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {clientData?.notes && (
                <section>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-muted-foreground">{clientData.notes}</p>
                </section>
              )}
            </CardContent>
          </Card>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Client Profile</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes..."
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="helper-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Helper Requests</CardTitle>
              <CardDescription>Requests for event helpers</CardDescription>
            </CardHeader>
            <CardContent>
              {helperRequests.length > 0 ? (
                <div className="space-y-4">
                  {helperRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(request.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{request.start_time} - {request.end_time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{request.location_city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>€{request.hourly_rate}/hr · {request.total_hours}h</span>
                            </div>
                          </div>
                          {request.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {request.required_skills.map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant={getStatusColor(request.status)} className="capitalize w-fit">
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No helper requests yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planner-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planner Requests</CardTitle>
              <CardDescription>Requests for event planners</CardDescription>
            </CardHeader>
            <CardContent>
              {plannerRequests.length > 0 ? (
                <div className="space-y-4">
                  {plannerRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(request.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{request.start_time} - {request.end_time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{request.location_city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>Budget: €{request.budget}</span>
                            </div>
                          </div>
                          {request.required_services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {request.required_services.map(service => (
                                <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant={getStatusColor(request.status)} className="capitalize w-fit">
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No planner requests yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Invoices from helpers and planners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Invoice management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}