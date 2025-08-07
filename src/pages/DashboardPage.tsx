import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import PlannerDashboard from '@/components/dashboard/PlannerDashboard';
import HelperDashboard from '@/components/dashboard/HelperDashboard';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [plannerProfile, setPlannerProfile] = useState<any>(null);
  const [helperProfile, setHelperProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setProfile(profileData);

      // Check if user is a planner
      const { data: plannerData } = await supabase
        .from('planners')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setPlannerProfile(plannerData);

      // Check if user is a helper
      const { data: helperData } = await supabase
        .from('helpers')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setHelperProfile(helperData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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

  const isPlannerView = plannerProfile && profile?.user_role === 'planner';
  const isHelperView = helperProfile && profile?.user_role === 'helper';
  const isClientView = !isPlannerView && !isHelperView && profile?.user_role === 'client';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-muted-foreground text-lg">
            {isPlannerView ? 'Manage your events and grow your business' : 
             isHelperView ? 'Find opportunities and manage your applications' : 
             'Track your events and bookings'}
          </p>
        </div>

        {isPlannerView && (
          <PlannerDashboard 
            user={user} 
            profile={profile} 
            plannerProfile={plannerProfile} 
            onRefresh={fetchUserData} 
          />
        )}

        {isHelperView && (
          <HelperDashboard 
            user={user} 
            helperData={helperProfile} 
            profile={profile} 
            onRefresh={fetchUserData} 
          />
        )}

        {isClientView && (
          <ClientDashboard 
            user={user} 
            profile={profile} 
            onRefresh={fetchUserData} 
          />
        )}
      </div>
    </div>
  );
}