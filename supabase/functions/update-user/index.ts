import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeEmail, normalizePhoneAO } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateUserRequest {
  user_id: string;
  full_name?: string;
  phone?: string;
  position?: string;
  department?: string;
  province_id?: string | null;
  municipality_id?: string | null;
  is_active?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify permissions
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user: currentUser }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if current user is an admin
    const { data: adminCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .in('role', ['admin_national', 'admin_provincial', 'admin_municipal']);

    if (!adminCheck || adminCheck.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Permission denied. Only admins can update user profiles.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: UpdateUserRequest = await req.json();

    // Validate required fields
    if (!body.user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updating user profile:', body.user_id);

    const fieldErrors: Record<string, string> = {};

    // Build update object with only provided fields (validate when present)
    const updateData: Record<string, any> = {};
    if (body.full_name !== undefined) {
      const n = String(body.full_name).trim();
      if (n.length < 2) fieldErrors.full_name = 'Nome demasiado curto.';
      else if (/\d/.test(n)) fieldErrors.full_name = 'O nome não deve conter dígitos.';
      else updateData.full_name = n;
    }
    if (body.phone !== undefined) {
      if (body.phone === null || String(body.phone).trim() === '') {
        updateData.phone = null;
      } else {
        const norm = normalizePhoneAO(String(body.phone));
        if (!norm) fieldErrors.phone = 'Insira um número móvel angolano válido com 9 dígitos.';
        else updateData.phone = norm;
      }
    }
    if (body.position !== undefined) updateData.position = body.position;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.province_id !== undefined) updateData.province_id = body.province_id || null;
    if (body.municipality_id !== undefined) updateData.municipality_id = body.municipality_id || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    if (Object.keys(fieldErrors).length > 0) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos.', fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', body.user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile updated successfully:', updatedProfile);

    return new Response(
      JSON.stringify({ success: true, profile: updatedProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-user function:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
