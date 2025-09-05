import { PricingPlans } from "@/components/subscription/PricingPlans";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { useAuth } from "@/hooks/useAuth";
import { usePayPalSubscription } from "@/hooks/usePayPalSubscription";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { createSubscriptionPlan, createSubscription, loading } = usePayPalSubscription();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user?.id)
      .single();
    
    setUserRole(data?.user_role || null);
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign up first to subscribe');
      return;
    }

    try {
      toast.loading('Creating subscription...', { id: 'subscription' });
      
      // First create the subscription plan
      const plan = await createSubscriptionPlan();
      if (!plan) {
        toast.error('Failed to create subscription plan', { id: 'subscription' });
        return;
      }

      // Then create the subscription with the plan ID
      const subscription = await createSubscription(plan.id);
      
      if (subscription?.approval_url) {
        toast.success('Redirecting to PayPal...', { id: 'subscription' });
        window.location.href = subscription.approval_url;
      } else {
        toast.error('Failed to get PayPal approval URL', { id: 'subscription' });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription. Please try again.', { id: 'subscription' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Show subscription status for planners */}
      {userRole === 'planner' && (
        <div className="container mx-auto px-4 pt-8">
          <SubscriptionStatus />
        </div>
      )}
      
      {/* Show pricing plans */}
      <PricingPlans onSubscribe={handleSubscribe} showOnlyPro={true} />
    </div>
  );
}