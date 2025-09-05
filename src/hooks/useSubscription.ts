import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  isTrialExpired: boolean;
  hasValidSubscription: boolean;
  plannerData: any;
  loading: boolean;
  subscriptionStatus: string | null;
  expiresAt: string | null;
}

export function useSubscription(): SubscriptionStatus {
  const { user } = useAuthContext();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isExpired: false,
    isTrialExpired: false,
    hasValidSubscription: false,
    plannerData: null,
    loading: true,
    subscriptionStatus: null,
    expiresAt: null
  });

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      // First check if user is a planner
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('user_id', user.id)
        .single();

      if (profile?.user_role !== 'planner') {
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      // Get planner subscription data
      const { data: plannerData } = await supabase
        .from('planners')
        .select(`
          subscription_status,
          subscription_expires_at,
          free_trial_started_at,
          is_verified,
          *
        `)
        .eq('user_id', user.id)
        .single();

      if (!plannerData) {
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const now = new Date();
      const expiresAt = plannerData.subscription_expires_at 
        ? new Date(plannerData.subscription_expires_at) 
        : null;

      const isExpired = expiresAt ? now > expiresAt : false;
      const isTrialExpired = plannerData.subscription_status === 'trial' && isExpired;
      const isActive = plannerData.subscription_status === 'active';
      const hasValidSubscription = (isActive || (plannerData.subscription_status === 'trial' && !isExpired));

      setStatus({
        isActive,
        isExpired,
        isTrialExpired,
        hasValidSubscription,
        plannerData,
        loading: false,
        subscriptionStatus: plannerData.subscription_status,
        expiresAt: plannerData.subscription_expires_at
      });

    } catch (error) {
      console.error('Error checking subscription status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  return status;
}