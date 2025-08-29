import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, User, Users, CheckCircle, XCircle, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ClientRequest {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_city: string;
  status: string;
  created_at: string;
  type: 'helper' | 'planner';
  // Helper-specific fields
  hourly_rate?: number;
  total_hours?: number;
  required_skills?: string[];
  // Planner-specific fields
  budget?: number;
  required_services?: string[];
}

interface ClientInvoice {
  id: string;
  job_title: string;
  amount: number;
  status: string;
  sent_at: string;
  paid_at: string;
  type: 'helper' | 'planner';
  helper_name?: string;
  planner_name?: string;
}

interface ClientEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  status: string;
  planner_id?: string;
  helper_ids?: string[];
}

interface ClientDashboardProps {
  user: any;
  clientData: any;
}

export default function ClientDashboardRestructured({ user, clientData }: ClientDashboardProps) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [events, setEvents] = useState<ClientEvent[]>([]);
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

      // Fetch client's planner requests
      const { data: plannerRequestsData, error: plannerRequestsError } = await supabase
        .from('planner_requests')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (plannerRequestsError) throw plannerRequestsError;

      // Combine requests with type indicator
      const allRequests: ClientRequest[] = [
        ...(helperRequestsData || []).map(req => ({ ...req, type: 'helper' as const })),
        ...(plannerRequestsData || []).map(req => ({ ...req, type: 'planner' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRequests(allRequests);

      // Fetch invoices from both helper_invoices and planner_invoices
      const { data: helperInvoicesData } = await supabase
        .from('helper_invoices')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      const { data: plannerInvoicesData } = await supabase
        .from('planner_invoices')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      // Combine invoices with type indicator
      const allInvoices: ClientInvoice[] = [
        ...(helperInvoicesData || []).map(inv => ({ ...inv, type: 'helper' as const })),
        ...(plannerInvoicesData || []).map(inv => ({ ...inv, type: 'planner' as const }))
      ].sort((a, b) => new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime());

      setInvoices(allInvoices);

      // Fetch events where client is involved
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('client_id', clientData.user_id)
        .order('event_date', { ascending: true });

      setEvents(eventsData || []);

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

  const handleMarkInvoicePaid = async (invoiceId: string, type: 'helper' | 'planner') => {
    try {
      const table = type === 'helper' ? 'helper_invoices' : 'planner_invoices';
      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'paid_planner',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice marked as paid"
      });

      fetchClientData(); // Refresh data
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid",
        variant: "destructive"
      });
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
      case 'pending':
        return 'default';
      case 'approved':
      case 'accepted':
        return 'default';
      case 'declined':
      case 'rejected':
        return 'destructive';
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
      case 'rejected':
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

  const openRequests = requests.filter(req => req.status === 'open' || req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved' || req.status === 'accepted');
  const unpaidInvoices = invoices.filter(inv => inv.status === 'awaiting_payment');

  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-center gap-1 w-full max-w-3xl mx-auto p-1 h-auto sm:grid sm:grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openRequests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Events</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedRequests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices to Pay</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unpaidInvoices.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your requests and events</CardDescription>
            </CardHeader>
            <CardContent>
              {openRequests.slice(0, 3).length > 0 ? (
                <div className="space-y-4">
                  {openRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {request.type === 'helper' ? (
                          <Users className="w-8 h-8 text-blue-500" />
                        ) : (
                          <User className="w-8 h-8 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.type === 'helper' ? 'Helper Request' : 'Planner Request'} • {request.location_city}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(request.status)} className="capitalize">
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
              <CardDescription>Events that have been approved and are in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{event.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.event_date).toLocaleDateString()}</span>
                            </div>
                            {event.event_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{event.event_time}</span>
                              </div>
                            )}
                            {event.venue_name && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{event.venue_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No events yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Events will appear here when your requests are approved
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Requests</CardTitle>
              <CardDescription>Your requests to planners and helpers</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {request.type === 'helper' ? (
                              <Users className="w-5 h-5 text-blue-500" />
                            ) : (
                              <User className="w-5 h-5 text-purple-500" />
                            )}
                            <h4 className="font-semibold">{request.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
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
                                {request.type === 'planner' ? 
                                  `€${request.budget}` : 
                                  `€${request.hourly_rate}/hr`}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="mr-2 capitalize">
                              {request.type} Request
                            </Badge>
                            {request.type === 'helper' && request.required_skills && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {request.required_skills.map((skill: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {request.type === 'planner' && request.required_services && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {request.required_services.map((service: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusColor(request.status)} className="capitalize">
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No requests yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use Find Planners or Find Helpers to send your first request
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Invoices from planners and helpers</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {invoice.type === 'helper' ? (
                              <Users className="w-5 h-5 text-blue-500" />
                            ) : (
                              <User className="w-5 h-5 text-purple-500" />
                            )}
                            <h4 className="font-semibold">{invoice.job_title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            From: {invoice.type === 'helper' ? invoice.helper_name : invoice.planner_name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>€{invoice.amount}</span>
                            </div>
                            {invoice.sent_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Sent: {new Date(invoice.sent_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusColor(invoice.status)} className="capitalize">
                            {invoice.status.replace('_', ' ')}
                          </Badge>
                          {invoice.status === 'awaiting_payment' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkInvoicePaid(invoice.id, invoice.type)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No invoices yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Invoices will appear here when work is completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
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
      </Tabs>
    </div>
  );
}