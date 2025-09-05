import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get subscription details from URL params
    const subscriptionId = searchParams.get('subscription_id');
    const token = searchParams.get('token');

    if (subscriptionId && token) {
      // Handle successful subscription
      handleSuccessfulSubscription(subscriptionId, token);
    } else {
      setLoading(false);
      toast({
        title: "Invalid subscription",
        description: "Missing subscription details",
        variant: "destructive"
      });
    }
  }, [searchParams]);

  const handleSuccessfulSubscription = async (subscriptionId: string, token: string) => {
    try {
      // Here you would verify the subscription with PayPal
      // and update the database
      console.log('Processing subscription:', subscriptionId, token);
      
      toast({
        title: "Subscription Activated! 🎉",
        description: "Welcome to Jovial Pro! Your first month is free."
      });
    } catch (error) {
      toast({
        title: "Error processing subscription",
        description: "Please contact support if the issue persists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            Welcome to Jovial Pro!
          </CardTitle>
          <CardDescription className="text-center">
            Your subscription has been activated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              🎉 Your first month is completely free
            </p>
            <p className="text-sm text-muted-foreground">
              After that, you'll be charged €49/month
            </p>
            <p className="text-sm text-muted-foreground">
              You now have access to all premium planner features!
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/subscription')}
            >
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}