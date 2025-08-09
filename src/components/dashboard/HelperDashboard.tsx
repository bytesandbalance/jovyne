import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, Star, Briefcase, CheckCircle, XCircle, User } from 'lucide-react';

interface HelperApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  hourly_rate: number;
  message: string;
  helper_requests: {
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location_city: string;
    hourly_rate: number;
    total_hours: number;
    status: string;
  } | null;
}

interface HelperJob {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_city: string;
  hourly_rate: number;
  total_hours: number;
  required_skills: string[];
  status: string;
  created_at: string;
}

interface HelperDashboardProps {
  user: any;
  helperData: any;
}

export default function HelperDashboard({ user, helperData }: HelperDashboardProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<HelperApplication[]>([]);
  const [availableJobs, setAvailableJobs] = useState<HelperJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (helperData) {
      fetchHelperData();
    }
  }, [helperData]);

  const fetchHelperData = async () => {
    try {
      // Fetch helper's applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('helper_applications')
        .select(`
          *,
          helper_requests (
            title,
            description,
            event_date,
            start_time,
            end_time,
            location_city,
            hourly_rate,
            total_hours,
            status
          )
        `)
        .eq('helper_id', helperData.id)
        .order('applied_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications((applicationsData as any) || []);

      // Fetch available jobs (excluding ones already applied to)
      const appliedRequestIds = applicationsData?.map(app => app.helper_request_id) || [];
      
      let jobsQuery = supabase
        .from('helper_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (appliedRequestIds.length > 0) {
        jobsQuery = jobsQuery.not('id', 'in', `(${appliedRequestIds.join(',')})`);
      }

      const { data: jobsData, error: jobsError } = await jobsQuery;

      if (jobsError) throw jobsError;
      setAvailableJobs((jobsData as any) || []);
    } catch (error) {
      console.error('Error fetching helper data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForJob = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('helper_applications')
        .insert({
          helper_id: helperData.id,
          helper_request_id: requestId,
          status: 'pending',
          message: 'I would like to help with your event!',
          hourly_rate: helperData.hourly_rate || 25
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the planner"
      });

      fetchHelperData();
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
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
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-full gap-2 md:max-w-3xl mx-auto md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'approved').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{helperData?.average_rating?.toFixed(1) || '0.0'}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Approved events and collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.filter(a => a.status === 'approved').length > 0 ? (
                <div className="space-y-4">
                  {applications
                    .filter(a => a.status === 'approved')
                    .map((a) => (
                      <div key={a.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{a.helper_requests?.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {a.helper_requests?.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{a.helper_requests?.event_date && new Date(a.helper_requests.event_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{a.helper_requests?.start_time} - {a.helper_requests?.end_time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{a.helper_requests?.location_city}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>${a.hourly_rate}/hr · {(a.helper_requests?.total_hours || 0)}h</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="default" className="capitalize">Approved</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No approved events yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your helper profile and availability.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">Coming soon.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Track assigned tasks for confirmed events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">Coming soon.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>View clients you're collaborating with via events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">Coming soon.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track the status of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{application.helper_requests?.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {application.helper_requests?.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
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
                              <span>${application.hourly_rate}/hr</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Applied: {new Date(application.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(application.status)}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Jobs</CardTitle>
              <CardDescription>Browse and apply for new helper opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {availableJobs.length > 0 ? (
                <div className="space-y-4">
                  {availableJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{job.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(job.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.start_time} - {job.end_time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location_city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${job.hourly_rate}/hr</span>
                            </div>
                          </div>
                          {job.required_skills.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium">Required Skills:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {job.required_skills.map((skill) => (
                                  <Badge key={skill} variant="outline">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button onClick={() => handleApplyForJob(job.id)}>
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No available jobs at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Upcoming approved jobs</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.filter(a => a.status === 'approved' && a.helper_requests?.event_date).length > 0 ? (
                <div className="space-y-3">
                  {applications
                    .filter(a => a.status === 'approved' && a.helper_requests?.event_date)
                    .sort((a, b) => new Date(a.helper_requests!.event_date).getTime() - new Date(b.helper_requests!.event_date).getTime())
                    .map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{new Date(a.helper_requests!.event_date).toLocaleDateString()}</span>
                          <span className="text-muted-foreground text-sm">{a.helper_requests?.title}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {a.helper_requests?.start_time} - {a.helper_requests?.end_time} · {a.helper_requests?.location_city}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming approved jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoicing</CardTitle>
              <CardDescription>Approved jobs and estimated earnings</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.filter(a => a.status === 'approved').length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded bg-muted/40">
                    <span className="font-medium">Total Estimated Earnings</span>
                    <span className="text-lg font-bold">
                      ${applications.filter(a => a.status === 'approved').reduce((sum, a) => sum + (a.hourly_rate || 0) * (a.helper_requests?.total_hours || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {applications.filter(a => a.status === 'approved').map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{a.helper_requests?.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {a.helper_requests?.location_city} · {a.helper_requests?.event_date && new Date(a.helper_requests.event_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${((a.hourly_rate || 0) * (a.helper_requests?.total_hours || 0)).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{a.helper_requests?.total_hours || 0}h × ${a.hourly_rate}/h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No approved jobs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
