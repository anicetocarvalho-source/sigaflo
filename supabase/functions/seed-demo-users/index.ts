import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AppModule =
  | 'farmers' | 'forestry' | 'coffee' | 'rice' | 'pos' | 'mechanization'
  | 'credit_insurance' | 'incentives' | 'climate_risk' | 'ipn' | 'data_lab' | 'occurrences';

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: string;
  module?: AppModule; // undefined => acesso total (existing global accounts)
}

const PASSWORD = 'demo123456';

// Contas globais existentes (mantidas para compatibilidade)
const GLOBAL_USERS: DemoUser[] = [
  { email: 'admin.nacional@demo.sigaflo.ao',     password: PASSWORD, full_name: 'Administrador Nacional (Demo)',     role: 'admin_national' },
  { email: 'admin.provincial@demo.sigaflo.ao',   password: PASSWORD, full_name: 'Administrador Provincial (Demo)',   role: 'admin_provincial' },
  { email: 'admin.municipal@demo.sigaflo.ao',    password: PASSWORD, full_name: 'Administrador Municipal (Demo)',    role: 'admin_municipal' },
  { email: 'tecnico.nacional@demo.sigaflo.ao',   password: PASSWORD, full_name: 'Técnico Nacional (Demo)',           role: 'technician_national' },
  { email: 'tecnico.provincial@demo.sigaflo.ao', password: PASSWORD, full_name: 'Técnico Provincial (Demo)',         role: 'technician_provincial' },
  { email: 'tecnico.municipal@demo.sigaflo.ao',  password: PASSWORD, full_name: 'Técnico Municipal (Demo)',          role: 'technician_municipal' },
  { email: 'entidade@demo.sigaflo.ao',           password: PASSWORD, full_name: 'Entidade Privada (Demo)',           role: 'private_entity' },
  { email: 'visualizador@demo.sigaflo.ao',       password: PASSWORD, full_name: 'Visualizador (Demo)',               role: 'viewer' },
];

// 12 módulos × 2 níveis (nacional + provincial)
const MODULES: { key: AppModule; label: string; slug: string }[] = [
  { key: 'farmers',          label: 'Cadastro de Produtores',     slug: 'cadastro' },
  { key: 'forestry',         label: 'Gestão Florestal',           slug: 'florestal' },
  { key: 'coffee',           label: 'Cadeia do Café',             slug: 'cafe' },
  { key: 'rice',             label: 'Produção de Arroz',          slug: 'arroz' },
  { key: 'pos',              label: 'Vendas & POS',               slug: 'pos' },
  { key: 'mechanization',    label: 'Mecanização Agrícola',       slug: 'mecanizacao' },
  { key: 'credit_insurance', label: 'Crédito & Seguros',          slug: 'credito' },
  { key: 'incentives',       label: 'Gestão de Incentivos',       slug: 'incentivos' },
  { key: 'climate_risk',     label: 'Risco Climático',            slug: 'risco-climatico' },
  { key: 'ipn',              label: 'Identidade Produtiva (IPN)', slug: 'ipn' },
  { key: 'data_lab',         label: 'Laboratório de Dados',       slug: 'datalab' },
  { key: 'occurrences',      label: 'Ocorrências Fitossanitárias', slug: 'ocorrencias' },
];

const MODULE_USERS: DemoUser[] = MODULES.flatMap((m) => [
  {
    email: `${m.slug}.nacional@demo.sigaflo.ao`,
    password: PASSWORD,
    full_name: `${m.label} — Técnico Nacional (Demo)`,
    role: 'technician_national',
    module: m.key,
  },
  {
    email: `${m.slug}.provincial@demo.sigaflo.ao`,
    password: PASSWORD,
    full_name: `${m.label} — Técnico Provincial (Demo)`,
    role: 'technician_provincial',
    module: m.key,
  },
]);

const ALL_USERS: DemoUser[] = [...GLOBAL_USERS, ...MODULE_USERS];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Bootstrap mode: se ainda faltar qualquer conta demo, permite seeding aberto (idempotente).
    const { data: listed } = await supabaseAdmin.auth.admin.listUsers();
    const existingEmails = new Set((listed?.users ?? []).map(u => u.email));
    const missingDemo = ALL_USERS.some(u => !existingEmails.has(u.email));
    const isBootstrap = missingDemo;

    if (!isBootstrap) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || authHeader === `Bearer ${anonKey}`) {
        return new Response(
          JSON.stringify({ success: false, error: 'Autenticação necessária' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: { user }, error: authError } = await authClient.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Sessão inválida' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: roleData } = await supabaseAdmin
        .from('user_roles').select('id')
        .eq('user_id', user.id).eq('role', 'admin_national').maybeSingle();
      if (!roleData) {
        return new Response(
          JSON.stringify({ success: false, error: 'Apenas administradores nacionais podem executar esta operação' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const results: { email: string; status: string; error?: string }[] = [];
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();

    for (const u of ALL_USERS) {
      try {
        const existingUser = existingUsers?.users?.find(x => x.email === u.email);
        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
          results.push({ email: u.email, status: 'exists' });
        } else {
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { full_name: u.full_name },
          });
          if (createError) {
            results.push({ email: u.email, status: 'error', error: createError.message });
            continue;
          }
          userId = newUser.user.id;
          results.push({ email: u.email, status: 'created' });
        }

        // Profile
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles').select('id').eq('id', userId).maybeSingle();
        if (!existingProfile) {
          await supabaseAdmin.from('profiles').insert({
            id: userId, email: u.email, full_name: u.full_name, is_active: true,
          });
        }

        // Role
        const { data: existingRole } = await supabaseAdmin
          .from('user_roles').select('id').eq('user_id', userId).eq('role', u.role).maybeSingle();
        if (!existingRole) {
          await supabaseAdmin.from('user_roles').insert({ user_id: userId, role: u.role });
        }

        // Module permissions
        if (u.module) {
          // Garante que tem APENAS este módulo
          await supabaseAdmin.from('module_permissions').delete().eq('user_id', userId);
          await supabaseAdmin.from('module_permissions').insert({
            user_id: userId, module: u.module,
          });
        }
      } catch (err) {
        results.push({ email: u.email, status: 'error', error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
