import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, XCircle, Clock, DollarSign, Calendar, MapPin, Star } from 'lucide-react';

interface PlannerApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  proposed_fee: number;
  applied_at: string;
  planner_id: string;
  planner_request_id: string;
  planners: {
    id: string;
    business_name: string;
    description: string;
    years_experience: number;
    base_price: number;
    location_city: string;
    average_rating: number;
    total_reviews: number;
    services: string[];
    profiles: {
      full_name: string;
      avatar_url: string;
      email: string;
      phone: string;
    } | null;
  } | null;
  planner_requests: {
    title: string;
    event_date: string;
    location_city: string;
    budget: number;
  } | null;
}

interface PlannerApplicationsProps {
  clientData: any;
}

export default function PlannerApplications({ clientData }: PlannerApplicationsProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<PlannerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<PlannerApplication | null>(null);

  useEffect(() => {
    if (clientData) {
      fetchApplications();
    }
  }, [clientData]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('planner_applications')
        .select(`
          *,
          planners!inner (
            id,
            user_id,
            business_name,
            description,
            years_experience,
            base_price,
            location_city,
            average_rating,
            total_reviews,
            services
          ),
          planner_requests!inner (
            title,
            event_date,
            location_city,
            budget,
            client_id
          )
        `)
        .eq('planner_requests.client_id', clientData.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      // Fetch planner profiles separately
      const userIds = (data || [])
        .map((a: any) => a.planners?.user_id)
        .filter((id: string | undefined): id is string => !!id);

      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .rpc('get_public_profiles', { user_ids: Array.from(new Set(userIds)) });
        if (profilesData) {
          profilesMap = profilesData.reduce((acc: Record<string, any>, p: any) => {
            acc[p.user_id] = p;
            return acc;
          }, {});
        }
      }

      const enriched = (data || []).map((a: any) => (
        a.planners?.user_id
          ? {
              ...a,
              planners: {
                ...a.planners,
                profiles: profilesMap[a.planners.user_id] || null,
              },
            }
          : a
      ));

      setApplications(enriched as any);

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
        .from('planner_applications')
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
        description: (error as any)?.message ? `Failed to ${status} application: ${(error as any).message}` : `Failed to ${status} application`,
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
          <CardTitle>Planner Applications</CardTitle>
          <CardDescription>Manage applications for your planner requests</CardDescription>
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={application.planners?.profiles?.avatar_url} />
                        <AvatarFallback>
                          {application.planners?.profiles?.full_name?.charAt(0) || application.planners?.business_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{application.planners?.business_name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          Applied for: {application.planner_requests?.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{application.planners?.average_rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="whitespace-nowrap">{application.planners?.years_experience} years exp</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="whitespace-nowrap">${application.proposed_fee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start sm:justify-end">
                      <Badge 
                        variant={getStatusColor(application.status)}
                        className="flex items-center gap-1 text-xs px-2 py-1 flex-shrink-0"
                      >
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
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
                Review and respond to this planner application
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Planner Info */}
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedApplication.planners?.profiles?.avatar_url} />
                  <AvatarFallback>
                    {selectedApplication.planners?.profiles?.full_name?.charAt(0) || selectedApplication.planners?.business_name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {selectedApplication.planners?.business_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedApplication.planners?.profiles?.full_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedApplication.planners?.average_rating?.toFixed(1) || '0.0'}</span>
                      <span>({selectedApplication.planners?.total_reviews} reviews)</span>
                    </div>
                    <span>{selectedApplication.planners?.years_experience} years experience</span>
                  </div>
                  {selectedApplication.planners?.description && (
                    <p className="mt-2 text-sm">{selectedApplication.planners.description}</p>
                  )}
                </div>
              </div>

              {/* Services */}
              {selectedApplication.planners?.services && selectedApplication.planners.services.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.planners.services.map((service) => (
                      <Badge key={service} variant="outline">{service}</Badge>
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
                    <span>Proposed Fee: ${selectedApplication.proposed_fee}</span>
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
                <h4 className="font-medium">Event Details</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Event:</strong> {selectedApplication.planner_requests?.title}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApplication.planner_requests?.event_date && new Date(selectedApplication.planner_requests.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApplication.planner_requests?.location_city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>${selectedApplication.planner_requests?.budget} (your budget)</span>
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