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
    const { subscription_id } = await req.json();
    
    if (!subscription_id) {
      throw new Error('Subscription ID is required');
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user');
    }

    // Verify user owns this subscription
    const { data: subscription } = await supabaseClient
      .from('planner_subscriptions')
      .select(`
        *,
        planners!inner(user_id)
      `)
      .eq('paypal_subscription_id', subscription_id)
      .eq('planners.user_id', user.id)
      .single();

    if (!subscription) {
      throw new Error('Subscription not found or access denied');
    }

    // Get PayPal access token
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const isProduction = Deno.env.get('PAYPAL_ENVIRONMENT') === 'production';
    
    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    const paypalBaseUrl = isProduction 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const { access_token } = await tokenResponse.json();

    // Cancel subscription in PayPal
    const cancelResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscription_id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        reason: 'User requested cancellation'
      })
    });

    if (!cancelResponse.ok) {
      const error = await cancelResponse.text();
      throw new Error(`Failed to cancel subscription: ${error}`);
    }

    // Update subscription status in database
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await serviceClient
      .from('planner_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscription_id);

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Update planner subscription status
    await serviceClient
      .from('planners')
      .update({
        subscription_status: 'cancelled'
      })
      .eq('id', subscription.planner_id);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Subscription cancelled successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});