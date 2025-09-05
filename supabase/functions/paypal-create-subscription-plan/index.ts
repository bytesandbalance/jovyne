import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalPlanRequest {
  plan_name: string;
  plan_description: string;
  monthly_price: string;
  currency: string;
  trial_days?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan_name, plan_description, monthly_price, currency, trial_days = 0 }: PayPalPlanRequest = await req.json();

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

    // First create a product
    const productPayload = {
      name: plan_name,
      description: plan_description,
      type: 'SERVICE',
      category: 'SOFTWARE'
    };

    const productResponse = await fetch(`${paypalBaseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(productPayload)
    });

    if (!productResponse.ok) {
      const error = await productResponse.text();
      throw new Error(`Failed to create product: ${error}`);
    }

    const product = await productResponse.json();

    // Create billing cycles
    const billing_cycles = [];

    // Add trial period if specified
    if (trial_days > 0) {
      billing_cycles.push({
        frequency: {
          interval_unit: 'DAY',
          interval_count: trial_days
        },
        tenure_type: 'TRIAL',
        sequence: 1,
        total_cycles: 1,
        pricing_scheme: {
          fixed_price: {
            value: '0',
            currency_code: currency
          }
        }
      });
    }

    // Add regular billing cycle
    billing_cycles.push({
      frequency: {
        interval_unit: 'MONTH',
        interval_count: 1
      },
      tenure_type: 'REGULAR',
      sequence: trial_days > 0 ? 2 : 1,
      total_cycles: 0, // 0 means infinite
      pricing_scheme: {
        fixed_price: {
          value: monthly_price,
          currency_code: currency
        }
      }
    });

    // Create subscription plan
    const planPayload = {
      product_id: product.id,
      name: plan_name,
      description: plan_description,
      billing_cycles,
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    };

    const planResponse = await fetch(`${paypalBaseUrl}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(planPayload)
    });

    if (!planResponse.ok) {
      const error = await planResponse.text();
      throw new Error(`Failed to create plan: ${error}`);
    }

    const plan = await planResponse.json();

    // Store plan in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabaseClient
      .from('subscription_plans')
      .upsert({
        paypal_plan_id: plan.id,
        name: plan_name,
        description: plan_description,
        price: parseFloat(monthly_price),
        currency: currency,
        billing_cycle: 'monthly',
        trial_days: trial_days,
        is_active: true
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(JSON.stringify(plan), {
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