import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhookPayload = await req.json();
    console.log('PayPal webhook received:', webhookPayload.event_type);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const eventType = webhookPayload.event_type;
    const resource = webhookPayload.resource;

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Subscription was activated after approval
        await supabaseClient
          .from('planner_subscriptions')
          .update({
            status: 'active',
            activated_at: new Date().toISOString(),
            next_billing_date: resource.billing_info?.next_billing_time
          })
          .eq('paypal_subscription_id', resource.id);

        // Update planner subscription status
        const { data: subscription } = await supabaseClient
          .from('planner_subscriptions')
          .select('planner_id')
          .eq('paypal_subscription_id', resource.id)
          .single();

        if (subscription) {
          await supabaseClient
            .from('planners')
            .update({
              subscription_status: 'active',
              subscription_expires_at: resource.billing_info?.next_billing_time
            })
            .eq('id', subscription.planner_id);
        }
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // Subscription was cancelled
        await supabaseClient
          .from('planner_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('paypal_subscription_id', resource.id);

        const { data: cancelledSub } = await supabaseClient
          .from('planner_subscriptions')
          .select('planner_id')
          .eq('paypal_subscription_id', resource.id)
          .single();

        if (cancelledSub) {
          await supabaseClient
            .from('planners')
            .update({
              subscription_status: 'cancelled'
            })
            .eq('id', cancelledSub.planner_id);
        }
        break;

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        // Payment failed
        await supabaseClient
          .from('planner_subscriptions')
          .update({
            status: 'payment_failed',
            last_payment_failed_at: new Date().toISOString()
          })
          .eq('paypal_subscription_id', resource.id);
        break;

      case 'BILLING.SUBSCRIPTION.RENEWED':
        // Subscription renewed successfully
        await supabaseClient
          .from('planner_subscriptions')
          .update({
            status: 'active',
            last_payment_date: new Date().toISOString(),
            next_billing_date: resource.billing_info?.next_billing_time
          })
          .eq('paypal_subscription_id', resource.id);

        const { data: renewedSub } = await supabaseClient
          .from('planner_subscriptions')
          .select('planner_id')
          .eq('paypal_subscription_id', resource.id)
          .single();

        if (renewedSub) {
          await supabaseClient
            .from('planners')
            .update({
              subscription_expires_at: resource.billing_info?.next_billing_time
            })
            .eq('id', renewedSub.planner_id);
        }
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});