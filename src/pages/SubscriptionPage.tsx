import { PricingPlans } from "@/components/subscription/PricingPlans";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

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

  const handleSubscribe = () => {
    // This will be implemented with PayPal integration
    console.log('Starting PayPal subscription flow...');
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