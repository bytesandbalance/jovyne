import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function SubscriptionStatus() {
  const [isPlanner, setIsPlanner] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPlannerStatus();
  }, []);

  const checkPlannerStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('user_id', user.id)
        .single();

      const isPlannerRole = profile?.user_role === 'planner';
      setIsPlanner(isPlannerRole);

      if (isPlannerRole) {
        // For now, we'll assume no subscription until PayPal is connected
        setHasSubscription(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    toast({
      title: "Coming Soon!",
      description: "PayPal subscription integration will be implemented next"
    });
  };

  const handleManageSubscription = () => {
    toast({
      title: "Redirecting to PayPal",
      description: "You'll be redirected to manage your subscription"
    });
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (!isPlanner) {
    return null; // Don't show subscription status for clients
  }

  if (!hasSubscription) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg">No Active Subscription</CardTitle>
          </div>
          <CardDescription>
            Subscribe to Jovial Pro to unlock all planner features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleSubscribe}>
            Upgrade to Jovial Pro - First Month Free!
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-lg">Jovial Pro</CardTitle>
            <Badge variant="default">Active</Badge>
          </div>
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <CardDescription>
          €49/month • Next billing: Coming soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          onClick={handleManageSubscription}
          className="w-full"
        >
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
}