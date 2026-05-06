// AGT mock payment integration for forestry licenses/permits
// SIGAFLO — calcula surcharge 10% RL e regista TRX
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      reference_type,
      reference_id,
      operator_id,
      base_amount_aoa,
      province_id,
      simulate_failure = false,
    } = body || {};

    if (!reference_type || typeof base_amount_aoa !== 'number' || base_amount_aoa <= 0) {
      return new Response(JSON.stringify({ error: 'invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mock AGT: 95% sucesso
    const success = !simulate_failure && Math.random() > 0.05;
    const agt_reference = `AGT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const surcharge = Math.round(base_amount_aoa * 0.10 * 100) / 100;
    const insertPayload: Record<string, unknown> = {
      reference_type,
      operator_id: operator_id ?? null,
      province_id: province_id ?? null,
      base_amount_aoa,
      surcharge_rl_aoa: surcharge,
      status: success ? 'pago' : 'falhado',
      agt_reference: success ? agt_reference : null,
      agt_response: { mock: true, success, ts: new Date().toISOString() },
      paid_at: success ? new Date().toISOString() : null,
      created_by: user.id,
    };
    if (reference_type === 'license' && reference_id) insertPayload.license_id = reference_id;
    if (reference_type === 'permit' && reference_id) insertPayload.permit_id = reference_id;

    const { data, error } = await supabase
      .from('forest_payment_transactions')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    // Marca licença como paga ao aprovar pagamento
    if (success && reference_type === 'license' && reference_id) {
      await supabase
        .from('forest_licenses')
        .update({ fee_paid: true, payment_date: new Date().toISOString().slice(0, 10), payment_reference: agt_reference })
        .eq('id', reference_id);
    }

    return new Response(JSON.stringify({ success, transaction: data }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? 'internal' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
