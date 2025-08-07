import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, Star, Briefcase, CheckCircle, XCircle, User, Settings } from 'lucide-react';
import EventTaskTracker from './EventTaskTracker';
import ClientContactList from './ClientContactList';
import InvoicingSection from './InvoicingSection';

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
  profile: any;
  onRefresh: () => void;
}

export default function HelperDashboard({ user, helperData, profile, onRefresh }: HelperDashboardProps) {
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-5xl grid-cols-8">
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest application activities</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{application.helper_requests?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {application.helper_requests?.event_date && new Date(application.helper_requests.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </Badge>
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
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirmed Events</CardTitle>
              <CardDescription>Events where your application was approved</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.filter(app => app.status === 'approved').length > 0 ? (
                <div className="space-y-4">
                  {applications.filter(app => app.status === 'approved').map((application) => (
                    <div key={application.id} className="p-4 border rounded-lg">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No confirmed events yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Helper Profile</CardTitle>
              <CardDescription>Your professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="text-muted-foreground">{profile?.full_name}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
                <div>
                  <span className="font-medium">Experience:</span>
                  <p className="text-muted-foreground">{helperData?.experience_years || 0} years</p>
                </div>
                <div>
                  <span className="font-medium">Hourly Rate:</span>
                  <p className="text-muted-foreground">${helperData?.hourly_rate || 'Not set'}</p>
                </div>
              </div>
              {helperData?.bio && (
                <div>
                  <span className="font-medium">Bio:</span>
                  <p className="text-muted-foreground mt-1">{helperData.bio}</p>
                </div>
              )}
              {helperData?.skills && helperData.skills.length > 0 && (
                <div>
                  <span className="font-medium">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {helperData.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Manage your helper tasks and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Task management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Planners</CardTitle>
              <CardDescription>Planners you've worked with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Planner connections will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
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
      </Tabs>
    </div>
  );
}