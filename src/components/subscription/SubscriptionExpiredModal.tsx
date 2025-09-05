import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionExpiredModalProps {
  isOpen: boolean;
  isTrialExpired: boolean;
  onClose?: () => void;
}

export function SubscriptionExpiredModal({ isOpen, isTrialExpired, onClose }: SubscriptionExpiredModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {isTrialExpired ? (
              <Clock className="w-6 h-6 text-orange-600" />
            ) : (
              <Crown className="w-6 h-6 text-red-600" />
            )}
            <AlertDialogTitle>
              {isTrialExpired ? 'Free Trial Expired' : 'Subscription Required'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {isTrialExpired 
              ? 'Your free trial has expired. To continue accessing all planner features, please subscribe to Jovial Pro.'
              : 'You need an active subscription to access planner features. Subscribe to Jovial Pro to continue.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard?tab=subscription')}
            className="w-full sm:w-auto"
          >
            View Subscription
          </Button>
          <Button 
            onClick={handleUpgrade}
            className="w-full sm:w-auto"
          >
            Subscribe to Jovial Pro
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}