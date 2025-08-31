import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, User, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';

interface HelperApplicationsProps {
  requesterId: string;
  requesterType: 'planner' | 'client';
}

interface HelperApplication {
  id: string;
  helper_request_id: string;
  helper_id: string;
  hourly_rate: number;
  estimated_hours: number;
  status: string;
  cover_letter: string;
  created_at: string;
  helpers: {
    user_id: string;
    bio: string;
    skills: string[];
    experience_years: number;
    average_rating: number;
    total_jobs: number;
  };
  helper_requests: {
    title: string;
    description: string;
    event_date: string;
    location_city: string;
  };
}

export default function HelperApplications({ requesterId, requesterType }: HelperApplicationsProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<HelperApplication[]>([]);
  const [helperProfiles, setHelperProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [requesterId, requesterType]);

  const fetchApplications = async () => {
    try {
      // First get helper requests for this requester
      let requestsQuery = supabase
        .from('helper_requests')
        .select('id');

      if (requesterType === 'planner') {
        requestsQuery = requestsQuery.eq('planner_id', requesterId);
      } else {
        requestsQuery = requestsQuery.eq('client_id', requesterId);
      }

      const { data: requestsData, error: requestsError } = await requestsQuery;
      if (requestsError) throw requestsError;

      if (!requestsData || requestsData.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const requestIds = requestsData.map(r => r.id);

      // Get applications for these requests
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('helper_applications')
        .select('*')
        .in('helper_request_id', requestIds)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      if (!applicationsData || applicationsData.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get helper data
      const helperIds = applicationsData.map(app => app.helper_id);
      const { data: helpersData, error: helpersError } = await supabase
        .from('helpers')
        .select('*')
        .in('id', helperIds);

      if (helpersError) throw helpersError;

      // Get request data
      const { data: requestsFullData, error: requestsFullError } = await supabase
        .from('helper_requests')
        .select('*')
        .in('id', requestIds);

      if (requestsFullError) throw requestsFullError;

      // Combine the data
      const enrichedApplications = applicationsData.map(app => ({
        ...app,
        helpers: helpersData?.find(h => h.id === app.helper_id) || null,
        helper_requests: requestsFullData?.find(r => r.id === app.helper_request_id) || null
      }));

      setApplications(enrichedApplications as any);

      // Fetch helper profiles
      if (helpersData && helpersData.length > 0) {
        const helperUserIds = helpersData.map(h => h.user_id);
        const { data: profilesData } = await supabase
          .rpc('get_public_profiles', { user_ids: helperUserIds });

        const profilesMap: Record<string, any> = {};
        profilesData?.forEach(profile => {
          profilesMap[profile.user_id] = profile;
        });
        setHelperProfiles(profilesMap);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('helper_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Application approved!" : "Application rejected",
        description: status === 'approved' 
          ? "The helper has been notified and an invoice will be created."
          : "The helper has been notified of the decision."
      });

      // Refresh applications
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Helper Applications</CardTitle>
        <CardDescription>Review applications from helpers for your requests</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => {
              const helperProfile = helperProfiles[application.helpers.user_id];
              
              return (
                <div key={application.id} className="border rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Helper Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={helperProfile?.avatar_url} />
                          <AvatarFallback>
                            {helperProfile?.full_name?.charAt(0) || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{helperProfile?.full_name}</h3>
                            <Badge variant={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{application.helpers.experience_years} years experience</span>
                            <span>⭐ {application.helpers.average_rating} ({application.helpers.total_jobs} jobs)</span>
                          </div>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Applied for: {application.helper_requests.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(application.helper_requests.event_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{application.helper_requests.location_city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>€{application.hourly_rate}/hr</span>
                          </div>
                        </div>
                      </div>

                      {/* Helper Skills */}
                      {application.helpers.skills && application.helpers.skills.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {application.helpers.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cover Letter */}
                      {application.cover_letter && (
                        <div className="mb-4">
                          <span className="text-sm font-medium">Cover Letter:</span>
                          <p className="text-sm text-muted-foreground mt-1 bg-muted/30 p-3 rounded">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {/* Helper Bio */}
                      {application.helpers.bio && (
                        <div className="mb-4">
                          <span className="text-sm font-medium">About:</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {application.helpers.bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:w-48 flex lg:flex-col gap-2">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No applications received yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}