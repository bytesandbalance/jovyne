import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, User, Users } from 'lucide-react';

interface HelperRequestsProps {
  helperId: string;
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
  status: string;
  required_skills: string[];
  created_at: string;
  planner_id?: string;
  client_id?: string;
  planners?: { business_name: string; user_id: string };
  clients?: { full_name: string; user_id: string };
}

export default function HelperRequests({ helperId }: HelperRequestsProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<HelperRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [helperId]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('helper_requests')
        .select(`
          *,
          planners(business_name, user_id),
          clients(full_name, user_id)
        `)
        .eq('helper_id', helperId)
        .in('status', ['pending', 'approved', 'declined'] as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'declined') => {
    try {
      const { error } = await supabase
        .from('helper_requests')
        .update({ 
          status: action as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'approved' ? "Request approved!" : "Request declined",
        description: action === 'approved' 
          ? "An invoice draft has been created in your Invoicing tab" 
          : "The requester has been notified"
      });

      // Refresh requests to show updated status
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Requests</CardTitle>
        <CardDescription>Requests sent to you by planners</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {request.planner_id ? (
                        <User className="w-5 h-5 text-purple-500" />
                      ) : (
                        <Users className="w-5 h-5 text-blue-500" />
                      )}
                      <h4 className="font-semibold">{request.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {request.description}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      From: {request.planner_id ? request.planners?.business_name : request.clients?.full_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-2">
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
                        <span>€{request.hourly_rate}/hr</span>
                      </div>
                    </div>
                    {request.required_skills && request.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {request.required_skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : 
                              request.status === 'declined' ? 'destructive' : 'secondary'} 
                      className="capitalize"
                    >
                      {request.status}
                    </Badge>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestAction(request.id, 'declined')}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'approved')}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No requests sent to you yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}