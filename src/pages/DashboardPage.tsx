import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { PlannerOnboardingFlow } from '@/components/planners/PlannerOnboardingFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, Star, DollarSign, Settings, Plus, UserCheck, BarChart3, CreditCard, Clock, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClientContactList from '@/components/dashboard/ClientContactList';
import InvoicingSection from '@/components/dashboard/InvoicingSection';
import ClientInvoiceSection from '@/components/dashboard/ClientInvoiceSection';
import PlannerApplications from '@/components/dashboard/PlannerApplications';
import ClientRequestsSection from '@/components/dashboard/ClientRequestsSection';
import PlannerRequestsSection from '@/components/dashboard/PlannerRequestsSection';
import TaskManagement from '@/components/dashboard/TaskManagement';
import VendorDirectory from '@/components/dashboard/VendorDirectory';
import EventTemplates from '@/components/dashboard/EventTemplates';
import BusinessCalendar from '@/components/dashboard/BusinessCalendar';
import InventoryManagement from '@/components/dashboard/InventoryManagement';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';

const DashboardPage = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  // Safe default tab calculation that doesn't cause initialization errors
  const urlTab = searchParams.get('tab');
  const defaultTab = urlTab || 'profile'; // Default to profile for all users initially
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPlannerDialogOpen, setIsPlannerDialogOpen] = useState(false);

  // State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [plannerProfile, setPlannerProfile] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: ''
  });
  const [plannerForm, setPlannerForm] = useState({
    business_name: '',
    description: '',
    location_city: '',
    location_state: '',
    base_price: '',
    years_experience: ''
  });

  // Derived states
  const isPlannerView = userProfile?.user_role === 'planner';
  const isClientView = userProfile?.user_role === 'client';

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      console.log('=== DASHBOARD DEBUG ===');
      console.log('Current logged in user ID:', user.id);
      console.log('User email:', user.email);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors when no profile exists

      if (profileError) throw profileError;
      
      if (!profileData) {
        // No profile exists, create one from user metadata
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            user_role: user.user_metadata?.user_role || 'client'
          })
          .select()
          .single();
          
        if (createError) throw createError;
        setUserProfile(newProfile);
      } else {
        setUserProfile(profileData);
      }

      // Initialize form with current data
      setProfileForm({
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        phone: profileData?.phone || ''
      });

      if (profileData?.user_role === 'planner') {
        console.log('Fetching planner for user_id:', user?.id);
        const { data: plannerData, error: plannerError } = await supabase
          .from('planners')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();
        
        console.log('Planner query result - data:', plannerData, 'error:', plannerError);
        console.log('Expected planner user_id: db7cde5f-003f-484f-8c8d-e2ba9e513fa8');
        console.log('Expected planner id: 76ead27a-91b0-4a41-9de0-90e6d5d9ca49');
        setPlannerProfile(plannerData);

        // Initialize planner form
        if (plannerData) {
          setPlannerForm({
            business_name: plannerData.business_name || '',
            description: plannerData.description || '',
            location_city: plannerData.location_city || '',
            location_state: plannerData.location_state || '',
            base_price: plannerData.base_price?.toString() || '',
            years_experience: plannerData.years_experience?.toString() || ''
          });
        }
      }

      // Fetch client profile for clients
      if (profileData?.user_role === 'client') {
        let { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle(); // Use maybeSingle here too
        
        // If no client profile exists, create one
        if (!clientData) {
          const { data: newClientData, error: createClientError } = await supabase
            .from('clients')
            .insert({
              user_id: user.id,
              full_name: profileData?.full_name || user.user_metadata?.full_name || user.email,
              email: profileData?.email || user.email
            })
            .select()
            .single();
          
          if (!createClientError) {
            clientData = newClientData;
          }
        }
        
        setClientProfile(clientData);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved."
      });

      setIsProfileDialogOpen(false);
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePlannerProfile = async () => {
    try {
      const { error } = await supabase
        .from('planners')
        .update({
          business_name: plannerForm.business_name,
          description: plannerForm.description,
          location_city: plannerForm.location_city,
          location_state: plannerForm.location_state,
          base_price: plannerForm.base_price ? parseFloat(plannerForm.base_price) : null,
          years_experience: plannerForm.years_experience ? parseInt(plannerForm.years_experience) : null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated successfully!",
        description: "Your planner profile has been saved."
      });

      setIsPlannerDialogOpen(false);
      fetchUserData();
    } catch (error) {
      console.error('Error updating planner profile:', error);
      toast({
        title: "Error updating planner profile",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding flow if user is a planner but no planner profile is linked
  if (userProfile?.user_role === 'planner' && !plannerProfile) {
    return <PlannerOnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Welcome, {userProfile?.full_name || user?.email}!
          </h1>
          <p className="text-muted-foreground text-lg">
            {isPlannerView ? 'Manage your events and grow your business' : 
             'Track your events and bookings'}
          </p>
        </div>

        {/* Show Client Dashboard directly without outer tabs to avoid nesting */}
        {isClientView && clientProfile ? (
          <ClientDashboard user={user} clientData={clientProfile} />
        ) : (
          /* Show Planner Dashboard with tabs */
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="bg-transparent p-0 h-auto gap-2 flex flex-wrap justify-center w-full">
              <TabsTrigger value="profile" className="px-4 py-2">Profile</TabsTrigger>
              <TabsTrigger value="subscription" className="px-4 py-2">Subscription</TabsTrigger>
              <TabsTrigger value="requests" className="px-4 py-2">Requests</TabsTrigger>
              <TabsTrigger value="clients" className="px-4 py-2">Clients</TabsTrigger>
              <TabsTrigger value="invoicing" className="px-4 py-2">Invoicing</TabsTrigger>
              <TabsTrigger value="tasks" className="px-4 py-2">Tasks</TabsTrigger>
              <TabsTrigger value="vendors" className="px-4 py-2">Vendors</TabsTrigger>
              <TabsTrigger value="templates" className="px-4 py-2">Templates</TabsTrigger>
              <TabsTrigger value="calendar" className="px-4 py-2">Calendar</TabsTrigger>
              <TabsTrigger value="inventory" className="px-4 py-2">Inventory</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-muted-foreground">{userProfile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-muted-foreground">{userProfile?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-muted-foreground">{userProfile?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Type</Label>
                      <Badge variant="secondary" className="capitalize">
                        {userProfile?.user_role}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => setIsProfileDialogOpen(true)}>
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => setIsPlannerDialogOpen(true)}>
                      Edit Business Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Business Profile for Planners */}
              {plannerProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Business Profile
                    </CardTitle>
                    <CardDescription>Your planner business information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Business Name</Label>
                        <p className="text-muted-foreground">{plannerProfile.business_name || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-muted-foreground">
                          {plannerProfile.location_city && plannerProfile.location_state
                            ? `${plannerProfile.location_city}, ${plannerProfile.location_state}`
                            : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Years of Experience</Label>
                        <p className="text-muted-foreground">{plannerProfile.years_experience || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Base Price</Label>
                        <p className="text-muted-foreground">
                          {plannerProfile.base_price ? `$${plannerProfile.base_price}` : 'Not set'}
                        </p>
                      </div>
                      {plannerProfile.total_reviews > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Rating</Label>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-muted-foreground">
                              {plannerProfile.average_rating || '0.0'} ({plannerProfile.total_reviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Verification Status</Label>
                        <Badge variant={plannerProfile.is_verified ? "default" : "secondary"}>
                          {plannerProfile.is_verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    
                    {plannerProfile.description && (
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-muted-foreground">{plannerProfile.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Subscription Tab for Planners */}
            <TabsContent value="subscription" className="space-y-6">
              <SubscriptionStatus />
            </TabsContent>

            {/* Requests Tab for Planners */}
            <TabsContent value="requests" className="space-y-6">
              {plannerProfile ? (
                <PlannerRequestsSection plannerProfile={plannerProfile} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading planner profile...</p>
                </div>
              )}
            </TabsContent>

            {/* Client Contacts Tab */}
            <TabsContent value="clients" className="space-y-6">
              <ClientContactList plannerProfile={plannerProfile} />
            </TabsContent>

            {/* Invoicing Tab */}
            <TabsContent value="invoicing" className="space-y-6">
              <InvoicingSection plannerProfile={plannerProfile} />
            </TabsContent>

            {/* Organizational Features for Planners */}
            <TabsContent value="tasks" className="space-y-6">
              <TaskManagement plannerProfile={plannerProfile} />
            </TabsContent>
            <TabsContent value="vendors" className="space-y-6">
              <VendorDirectory plannerProfile={plannerProfile} />
            </TabsContent>
            <TabsContent value="templates" className="space-y-6">
              <EventTemplates plannerProfile={plannerProfile} />
            </TabsContent>
            <TabsContent value="calendar" className="space-y-6">
              <BusinessCalendar plannerProfile={plannerProfile} />
            </TabsContent>
            <TabsContent value="inventory" className="space-y-6">
              <InventoryManagement plannerProfile={plannerProfile} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Planner Profile Dialog */}
      <Dialog open={isPlannerDialogOpen} onOpenChange={setIsPlannerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Business Profile</DialogTitle>
            <DialogDescription>
              Update your planner business information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="business_name" className="text-right">
                Business Name
              </Label>
              <Input
                id="business_name"
                value={plannerForm.business_name}
                onChange={(e) => setPlannerForm({...plannerForm, business_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={plannerForm.description}
                onChange={(e) => setPlannerForm({...plannerForm, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location_city" className="text-right">
                City
              </Label>
              <Input
                id="location_city"
                value={plannerForm.location_city}
                onChange={(e) => setPlannerForm({...plannerForm, location_city: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location_state" className="text-right">
                State
              </Label>
              <Input
                id="location_state"
                value={plannerForm.location_state}
                onChange={(e) => setPlannerForm({...plannerForm, location_state: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="base_price" className="text-right">
                Base Price
              </Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={plannerForm.base_price}
                onChange={(e) => setPlannerForm({...plannerForm, base_price: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="years_experience" className="text-right">
                Experience (years)
              </Label>
              <Input
                id="years_experience"
                type="number"
                value={plannerForm.years_experience}
                onChange={(e) => setPlannerForm({...plannerForm, years_experience: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdatePlannerProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;