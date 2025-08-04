import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, XCircle, Clock, DollarSign, Calendar, MapPin, Star } from 'lucide-react';

interface Application {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  hourly_rate: number;
  applied_at: string;
  helper_id: string;
  helper_request_id: string;
  helpers: {
    id: string;
    bio: string;
    skills: string[];
    experience_years: number;
    average_rating: number;
    total_jobs: number;
    profiles: {
      full_name: string;
      avatar_url: string;
      email: string;
      phone: string;
    } | null;
  } | null;
  helper_requests: {
    title: string;
    event_date: string;
    location_city: string;
    hourly_rate: number;
  } | null;
}

interface HelperApplicationsProps {
  plannerData: any;
}

export default function HelperApplications({ plannerData }: HelperApplicationsProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (plannerData) {
      fetchApplications();
    }
  }, [plannerData]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('helper_applications')
        .select(`
          *,
          helpers!inner (
            id,
            bio,
            skills,
            experience_years,
            average_rating,
            total_jobs,
            profiles!inner (
              full_name,
              avatar_url,
              email,
              phone
            )
          ),
          helper_requests!inner (
            title,
            event_date,
            location_city,
            hourly_rate,
            planner_id
          )
        `)
        .eq('helper_requests.planner_id', plannerData.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications((data as any) || []);
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

  const handleApplicationResponse = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('helper_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Application ${status} successfully`
      });

      fetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} application`,
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
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Helper Applications</CardTitle>
          <CardDescription>Manage applications for your helper requests</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={application.helpers?.profiles?.avatar_url} />
                        <AvatarFallback>
                          {application.helpers?.profiles?.full_name?.charAt(0) || 'H'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{application.helpers?.profiles?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Applied for: {application.helper_requests?.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{application.helpers?.average_rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span>{application.helpers?.experience_years} years exp</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${application.hourly_rate}/hr</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No applications yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review and respond to this helper application
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Helper Info */}
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedApplication.helpers?.profiles?.avatar_url} />
                  <AvatarFallback>
                    {selectedApplication.helpers?.profiles?.full_name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {selectedApplication.helpers?.profiles?.full_name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedApplication.helpers?.average_rating?.toFixed(1) || '0.0'}</span>
                      <span>({selectedApplication.helpers?.total_jobs} jobs)</span>
                    </div>
                    <span>{selectedApplication.helpers?.experience_years} years experience</span>
                  </div>
                  {selectedApplication.helpers?.bio && (
                    <p className="mt-2 text-sm">{selectedApplication.helpers.bio}</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selectedApplication.helpers?.skills && selectedApplication.helpers.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.helpers.skills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Details */}
              <div className="space-y-4">
                <h4 className="font-medium">Application Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>Proposed Rate: ${selectedApplication.hourly_rate}/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Applied: {new Date(selectedApplication.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {selectedApplication.message && (
                  <div>
                    <span className="font-medium">Message:</span>
                    <p className="mt-1 text-sm text-muted-foreground bg-muted p-3 rounded">
                      {selectedApplication.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div className="space-y-2">
                <h4 className="font-medium">Job Details</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Event:</strong> {selectedApplication.helper_requests?.title}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApplication.helper_requests?.event_date && new Date(selectedApplication.helper_requests.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApplication.helper_requests?.location_city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>${selectedApplication.helper_requests?.hourly_rate}/hr (your rate)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleApplicationResponse(selectedApplication.id, 'approved')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Application
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleApplicationResponse(selectedApplication.id, 'rejected')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline Application
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}