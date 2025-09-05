import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

export function SubscriptionStatus() {
  const { 
    hasValidSubscription, 
    isTrialExpired, 
    loading, 
    plannerData, 
    subscriptionStatus,
    expiresAt 
  } = useSubscription();

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

  if (!plannerData) {
    return null; // Don't show subscription status for non-planners
  }

  // Show trial expired message
  if (isTrialExpired) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            <CardTitle className="text-lg">Free Trial Expired</CardTitle>
          </div>
          <CardDescription>
            Your free trial has expired. Subscribe to Jovial Pro to continue using planner features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleSubscribe}>
            Subscribe to Jovial Pro - €49/month
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show no subscription message
  if (!hasValidSubscription) {
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

  // Show active subscription
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-lg">
              {subscriptionStatus === 'trial' ? 'Free Trial' : 'Jovial Pro'}
            </CardTitle>
            <Badge variant="default">
              {subscriptionStatus === 'trial' ? 'Trial' : 'Active'}
            </Badge>
          </div>
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <CardDescription>
          {subscriptionStatus === 'trial' 
            ? `Trial expires: ${expiresAt ? formatDate(expiresAt) : 'Unknown'}`
            : `€49/month • Next billing: ${expiresAt ? formatDate(expiresAt) : 'Coming soon'}`
          }
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