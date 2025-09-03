import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, CheckCircle, XCircle, User } from 'lucide-react';

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
  status: 'pending' | 'approved' | 'rejected';
  required_services: string[];
  created_at: string;
  planner_id: string | null;
  clients: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

interface PlannerRequestsSectionProps {
  plannerProfile: any;
}

export default function PlannerRequestsSection({ plannerProfile }: PlannerRequestsSectionProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PlannerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    console.log('PlannerRequestsSection useEffect - plannerProfile:', plannerProfile);
    if (plannerProfile?.id) {
      console.log('Calling fetchRequests with planner ID:', plannerProfile.id);
      fetchRequests();
    } else {
      console.log('No planner profile ID available');
    }
  }, [plannerProfile?.id]);

  const fetchRequests = async () => {
    try {
      console.log('fetchRequests called for planner ID:', plannerProfile.id);
      
      // First get the requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('planner_requests')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Then get client info separately using the public function
      const requestsWithClients = [];
      for (const request of requestsData || []) {
        const { data: clientData, error: clientError } = await supabase
          .rpc('get_public_profiles', { user_ids: [] })
          .single();
        
        // For now, just add the request without client details to avoid RLS issues
        // The client name will be fetched when the request is approved
        requestsWithClients.push({
          ...request,
          clients: {
            id: request.client_id,
            user_id: '',
            full_name: 'Client', // Placeholder since we can't access client details until approved
            email: '',
            phone: ''
          }
        });
      }

      console.log('Query result - data:', requestsWithClients, 'error:', null);
      setRequests(requestsWithClients);
    } catch (error) {
      console.error('Error fetching planner requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      setProcessingRequest(requestId);
      
      // When approving, assign the planner to the request
      const updateData = action === 'approved' 
        ? { status: action, planner_id: plannerProfile.id }
        : { status: action };
      
      const { error } = await supabase
        .from('planner_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: action, planner_id: action === 'approved' ? plannerProfile.id : request.planner_id }
            : request
        )
      );

      toast({
        title: action === 'approved' ? "Request approved!" : "Request declined",
        description: action === 'approved' 
          ? "The client has been notified and an invoice has been created." 
          : "The client has been notified of your decision."
      });

      // Refresh data after action
      setTimeout(() => {
        fetchRequests();
      }, 1000);
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Requests</CardTitle>
        <CardDescription>Requests sent directly to you by clients</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">{request.title}</h4>
                      <Badge variant={getStatusColor(request.status)} className="capitalize">
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
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
                        <span>€{request.budget}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{request.clients.full_name}</span>
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
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleRequestAction(request.id, 'approved')}
                      disabled={processingRequest === request.id}
                      size="sm"
                    >
                      {processingRequest === request.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRequestAction(request.id, 'rejected')}
                      disabled={processingRequest === request.id}
                      size="sm"
                    >
                      {processingRequest === request.id ? "Processing..." : "Decline"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No requests yet</p>
            <p className="text-sm text-muted-foreground">Client requests will appear here when they send them directly to you</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
