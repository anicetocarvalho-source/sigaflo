import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEMO_USERS = [
  {
    email: 'admin.nacional@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Administrador Nacional (Demo)',
    role: 'admin_national',
  },
  {
    email: 'admin.provincial@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Administrador Provincial (Demo)',
    role: 'admin_provincial',
  },
  {
    email: 'admin.municipal@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Administrador Municipal (Demo)',
    role: 'admin_municipal',
  },
  {
    email: 'tecnico.nacional@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Técnico Nacional (Demo)',
    role: 'technician_national',
  },
  {
    email: 'tecnico.provincial@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Técnico Provincial (Demo)',
    role: 'technician_provincial',
  },
  {
    email: 'tecnico.municipal@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Técnico Municipal (Demo)',
    role: 'technician_municipal',
  },
  {
    email: 'entidade@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Entidade Privada (Demo)',
    role: 'private_entity',
  },
  {
    email: 'visualizador@demo.sigaflo.ao',
    password: 'demo123456',
    full_name: 'Visualizador (Demo)',
    role: 'viewer',
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: { email: string; status: string; error?: string }[] = [];

    for (const user of DEMO_USERS) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === user.email);

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
          results.push({ email: user.email, status: 'exists' });
        } else {
          // Create new user
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              full_name: user.full_name,
            },
          });

          if (createError) {
            results.push({ email: user.email, status: 'error', error: createError.message });
            continue;
          }

          userId = newUser.user.id;
          results.push({ email: user.email, status: 'created' });
        }

        // Ensure profile exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (!existingProfile) {
          await supabaseAdmin.from('profiles').insert({
            id: userId,
            email: user.email,
            full_name: user.full_name,
            is_active: true,
          });
        }

        // Ensure role exists
        const { data: existingRole } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .eq('role', user.role)
          .single();

        if (!existingRole) {
          await supabaseAdmin.from('user_roles').insert({
            user_id: userId,
            role: user.role,
          });
        }

      } catch (err) {
        results.push({ email: user.email, status: 'error', error: String(err) });
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
