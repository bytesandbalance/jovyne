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
    const { plan_id, return_url, cancel_url } = await req.json();
    
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

    // Get planner data
    const { data: planner } = await supabaseClient
      .from('planners')
      .select('id, business_name, email')
      .eq('user_id', user.id)
      .single();

    if (!planner) {
      throw new Error('Planner not found');
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

    // Create subscription
    const subscriptionPayload = {
      plan_id,
      subscriber: {
        name: {
          given_name: planner.business_name.split(' ')[0] || 'Business',
          surname: planner.business_name.split(' ').slice(1).join(' ') || 'Owner'
        },
        email_address: planner.email
      },
      application_context: {
        brand_name: 'Jovial',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url,
        cancel_url
      }
    };

    const subscriptionResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(subscriptionPayload)
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.text();
      throw new Error(`Failed to create subscription: ${error}`);
    }

    const subscription = await subscriptionResponse.json();

    // Store subscription in database (pending approval)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await serviceClient
      .from('planner_subscriptions')
      .insert({
        planner_id: planner.id,
        paypal_subscription_id: subscription.id,
        plan_id: plan_id,
        status: 'approval_pending'
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Return approval URL
    const approvalLink = subscription.links.find((link: any) => link.rel === 'approve');
    
    return new Response(JSON.stringify({ 
      subscription_id: subscription.id,
      approval_url: approvalLink?.href,
      subscription
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