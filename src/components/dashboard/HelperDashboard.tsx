import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, Star, Briefcase, CheckCircle, XCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import HelperTasks from '@/components/helpers/HelperTasks';
import HelperInvoices from '@/components/helpers/HelperInvoices';

interface HelperApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  hourly_rate: number;
  cover_letter: string;
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
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [applications, setApplications] = useState<HelperApplication[]>([]);
  const [availableJobs, setAvailableJobs] = useState<HelperJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [helperProfile, setHelperProfile] = useState<any>(helperData);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: helperData?.bio || '',
    hourly_rate: helperData?.hourly_rate ? String(helperData.hourly_rate) : '',
    experience_years: helperData?.experience_years ? String(helperData.experience_years) : '',
    skills: (helperData?.skills || []).join(', '),
    cities: (helperData?.availability_cities || []).join(', '),
    portfolio: (helperData?.portfolio_images || []).join(', '),
  });

  useEffect(() => {
    if (helperData) {
      fetchHelperData();
      setHelperProfile(helperData);
      setEditForm({
        bio: helperData.bio || '',
        hourly_rate: helperData.hourly_rate ? String(helperData.hourly_rate) : '',
        experience_years: helperData.experience_years ? String(helperData.experience_years) : '',
        skills: (helperData.skills || []).join(', '),
        cities: (helperData.availability_cities || []).join(', '),
        portfolio: (helperData.portfolio_images || []).join(', '),
      });
    }
  }, [helperData]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!helperData?.user_id) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, phone, avatar_url')
        .eq('user_id', helperData.user_id)
        .maybeSingle();
      setUserProfile(data || null);
    };
    loadProfile();
  }, [helperData?.user_id]);

  const fetchHelperData = async () => {
    try {
      // Fetch helper applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('helper_applications')
        .select('*')
        .eq('helper_id', helperData.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Fetch request details for applications
      if (applicationsData && applicationsData.length > 0) {
        const requestIds = applicationsData.map(app => app.helper_request_id);
        const { data: requestsData } = await supabase
          .from('helper_requests')
          .select('*')
          .in('id', requestIds);

        const enrichedApplications = applicationsData.map(app => ({
          ...app,
          helper_requests: requestsData?.find(r => r.id === app.helper_request_id) || null
        }));

        setApplications(enrichedApplications as any);
      } else {
        setApplications([]);
      }

      // Fetch available jobs from helper_requests
      let jobsQuery = supabase
        .from('helper_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
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
      // Check if already applied
      const { data: existingApp } = await supabase
        .from('helper_applications')
        .select('id')
        .eq('helper_request_id', requestId)
        .eq('helper_id', helperData.id)
        .single();

      if (existingApp) {
        toast({
          title: "Already applied",
          description: "You have already applied for this job",
          variant: "default"
        });
        return;
      }

      const request = availableJobs.find(r => r.id === requestId);
      if (!request) return;

      // Create helper application
      const { error } = await supabase
        .from('helper_applications')
        .insert({
          helper_request_id: requestId,
          helper_id: helperData.id,
          hourly_rate: helperProfile.hourly_rate || request.hourly_rate,
          estimated_hours: request.total_hours,
          status: 'pending',
          cover_letter: `I would like to apply for your job "${request.title}" on ${new Date(request.event_date).toLocaleDateString()}. I am available and can help with the required tasks.`
        });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the requester"
      });

      // Refresh data
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

  const handleSaveProfile = async () => {
    try {
      const payload: any = {
        bio: editForm.bio || null,
        hourly_rate: editForm.hourly_rate ? parseFloat(editForm.hourly_rate) : null,
        experience_years: editForm.experience_years ? parseInt(editForm.experience_years) : null,
        skills: editForm.skills ? editForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        availability_cities: editForm.cities ? editForm.cities.split(',').map(s => s.trim()).filter(Boolean) : [],
        portfolio_images: editForm.portfolio ? editForm.portfolio.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const { error } = await supabase
        .from('helpers')
        .update(payload)
        .eq('id', helperData.id);

      if (error) throw error;

      setHelperProfile((prev: any) => ({ ...prev, ...payload }));
      toast({
        title: 'Profile updated',
        description: 'Your helper profile has been saved.',
      });
      setEditOpen(false);
    } catch (e: any) {
      console.error('Error updating helper profile:', e);
      toast({
        title: 'Update failed',
        description: e.message || 'Please try again.',
        variant: 'destructive',
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
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-center gap-1 w-full max-w-4xl mx-auto p-1 h-auto sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          
          <TabsTrigger value="requests">Available Requests</TabsTrigger>
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
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold">{a.helper_requests?.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {a.helper_requests?.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-muted-foreground">
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
                          <Badge variant="default" className="capitalize w-fit">Approved</Badge>
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
            <CardHeader className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.full_name || 'Helper avatar'} />
                  <AvatarFallback>{(userProfile?.full_name || 'H').split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {userProfile?.full_name || 'Helper'}
                    <Badge variant="secondary">Helper</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {userProfile?.email}{userProfile?.phone ? ` • ${userProfile.phone}` : ''}
                  </CardDescription>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{helperProfile?.average_rating?.toFixed ? helperProfile.average_rating.toFixed(1) : (helperProfile?.average_rating || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{helperProfile?.experience_years || 0} years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${helperProfile?.hourly_rate || 0}/hr</span>
                    </div>
                    {helperProfile?.availability_cities?.length ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{helperProfile.availability_cities.join(', ')}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button onClick={() => setEditOpen(true)}>Edit Profile</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {helperProfile?.bio ? (
                <section>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{helperProfile.bio}</p>
                </section>
              ) : null}

              {helperProfile?.skills?.length ? (
                <section>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {helperProfile.skills.map((s: string, i: number) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </section>
              ) : null}

              {helperProfile?.portfolio_images?.length ? (
                <section>
                  <h4 className="font-semibold mb-2">Portfolio</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {helperProfile.portfolio_images.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`Portfolio image ${i + 1}`} loading="lazy" className="w-full h-24 object-cover rounded-md" />
                    ))}
                  </div>
                </section>
              ) : null}
            </CardContent>
          </Card>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Helper Profile</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hourly_rate">Hourly rate ($/hr)</Label>
                  <Input id="hourly_rate" type="number" inputMode="decimal" value={editForm.hourly_rate} onChange={(e) => setEditForm(f => ({ ...f, hourly_rate: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="experience_years">Experience (years)</Label>
                  <Input id="experience_years" type="number" inputMode="numeric" value={editForm.experience_years} onChange={(e) => setEditForm(f => ({ ...f, experience_years: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" rows={4} value={editForm.bio} onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input id="skills" value={editForm.skills} onChange={(e) => setEditForm(f => ({ ...f, skills: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cities">Service areas (comma separated)</Label>
                  <Input id="cities" value={editForm.cities} onChange={(e) => setEditForm(f => ({ ...f, cities: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="portfolio">Portfolio image URLs (comma separated)</Label>
                  <Input id="portfolio" value={editForm.portfolio} onChange={(e) => setEditForm(f => ({ ...f, portfolio: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <HelperTasks helperId={helperData.id} />
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
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold">{application.helper_requests?.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {application.helper_requests?.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm text-muted-foreground">
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
                            Applied: {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                          <Badge variant={getStatusColor(application.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
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

          {/* Actual invoices and actions */}
          <HelperInvoices helperId={helperData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
