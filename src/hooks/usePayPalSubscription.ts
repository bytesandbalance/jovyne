import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PayPalSubscriptionPlan {
  id: string;
  product_id: string;
  name: string;
  description: string;
  billing_cycles: Array<{
    frequency: {
      interval_unit: string;
      interval_count: number;
    };
    tenure_type: string;
    sequence: number;
    total_cycles: number;
    pricing_scheme: {
      fixed_price: {
        value: string;
        currency_code: string;
      };
    };
  }>;
  payment_preferences: {
    auto_bill_outstanding: boolean;
    setup_fee_failure_action: string;
    payment_failure_threshold: number;
  };
}

export function usePayPalSubscription() {
  const [loading, setLoading] = useState(false);

  const createSubscriptionPlan = async (): Promise<PayPalSubscriptionPlan | null> => {
    try {
      setLoading(true);
      
      // This would call your PayPal edge function to create the subscription plan
      const { data, error } = await supabase.functions.invoke('paypal-create-subscription-plan', {
        body: {
          plan_name: 'Jovial Pro',
          plan_description: 'Complete business management for event planners',
          monthly_price: '49.00',
          currency: 'EUR',
          trial_days: 30 // First month free
        }
      });

      if (error) {
        toast({
          title: 'Error creating subscription plan',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create subscription plan',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('paypal-create-subscription', {
        body: {
          plan_id: planId,
          return_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/subscription/cancel`
        }
      });

      if (error) {
        toast({
          title: 'Error creating subscription',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }

      // Redirect to PayPal approval URL
      if (data?.approval_url) {
        window.open(data.approval_url, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create subscription',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('paypal-cancel-subscription', {
        body: { subscription_id: subscriptionId }
      });

      if (error) {
        toast({
          title: 'Error canceling subscription',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Subscription canceled',
        description: 'Your subscription has been successfully canceled'
      });
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSubscriptionPlan,
    createSubscription,
    cancelSubscription
  };
}