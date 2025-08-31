import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, User, Users, CheckCircle, XCircle } from 'lucide-react';

interface HelperRequestsNewProps {
  helperId: string;
}

interface HelperApplication {
  id: string;
  status: string;
  hourly_rate: number;
  estimated_hours: number;
  cover_letter: string;
  created_at: string;
  helper_requests: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location_city: string;
    hourly_rate: number;
    total_hours: number;
    planner_id?: string;
    client_id?: string;
    planners?: { business_name: string; user_id: string };
    clients?: { full_name: string; user_id: string };
  } | null;
}

export default function HelperRequestsNew({ helperId }: HelperRequestsNewProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<HelperApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [helperId]);

  const fetchApplications = async () => {
    try {
      // Fetch applications for this helper
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('helper_applications')
        .select(`
          *,
          helper_requests!inner(
            id,
            title,
            description,
            event_date,
            start_time,
            end_time,
            location_city,
            hourly_rate,
            total_hours,
            planner_id,
            client_id,
            planners(business_name, user_id),
            clients(full_name, user_id)
          )
        `)
        .eq('helper_id', helperId)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications((applicationsData || []) as any);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (applicationId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('helper_applications')
        .update({ status: action })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: action === 'approved' ? "Request approved!" : "Request declined",
        description: action === 'approved' ? 
          "Invoice has been auto-created and requester notified" : 
          "Requester has been notified"
      });

      // Refresh applications
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
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
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Helper Requests</CardTitle>
        <CardDescription>Requests sent to you by planners and clients</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="p-4 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {application.helper_requests?.planner_id ? (
                        <User className="w-5 h-5 text-purple-500" />
                      ) : (
                        <Users className="w-5 h-5 text-blue-500" />
                      )}
                      <h4 className="font-semibold">{application.helper_requests?.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {application.helper_requests?.description}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      From: {application.helper_requests?.planner_id ? 
                        application.helper_requests.planners?.business_name : 
                        application.helper_requests?.clients?.full_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{application.helper_requests?.event_date && new Date(application.helper_requests.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{application.helper_requests?.start_time} - {application.helper_requests?.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{application.helper_requests?.location_city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>€{application.hourly_rate}/hr</span>
                      </div>
                    </div>
                    {application.cover_letter && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        <strong>Cover Letter:</strong> {application.cover_letter}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusColor(application.status)} className="capitalize flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      {application.status}
                    </Badge>
                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestAction(application.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(application.id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
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
            <p className="text-muted-foreground">No requests received yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}