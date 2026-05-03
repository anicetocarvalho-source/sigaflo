// Edge function: generate-cards-batch
// Cria registos de farmer_cards em lote (status=gerado) e devolve job_id.
// Para volumes grandes (>500), processa em background sem bloquear o request.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return json({ error: "unauthorized" }, 401);

    const body = await req.json();
    const farmerIds: string[] = Array.isArray(body?.farmer_ids) ? body.farmer_ids : [];
    if (!farmerIds.length) return json({ error: "farmer_ids vazio" }, 400);

    // Cria job
    const { data: job, error: jobErr } = await supabase
      .from("card_export_jobs")
      .insert({
        requested_by: userId,
        status: "processing",
        total: farmerIds.length,
        farmer_ids: farmerIds,
        options: body.options ?? {},
      })
      .select()
      .single();
    if (jobErr) throw jobErr;

    // Processamento em background
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // @ts-expect-error EdgeRuntime is global in Supabase
    EdgeRuntime.waitUntil((async () => {
      let processed = 0;
      const chunkSize = 100;
      try {
        for (let i = 0; i < farmerIds.length; i += chunkSize) {
          const chunk = farmerIds.slice(i, i + chunkSize);
          const { data: farmers } = await adminClient
            .from("farmers")
            .select("id, name, registration_number, farmer_type, province_id, municipality_id, photo_url, main_crops, cultivated_area_ha, bi_nif, provinces(name), municipalities(name)")
            .in("id", chunk);

          // Cria cartões só para os que não têm activo
          const { data: existing } = await adminClient
            .from("farmer_cards")
            .select("farmer_id")
            .in("farmer_id", chunk)
            .neq("card_status", "revogado");
          const has = new Set((existing ?? []).map((c: any) => c.farmer_id));

          const rows = (farmers ?? []).filter((f: any) => !has.has(f.id)).map((f: any) => ({
            farmer_id: f.id,
            card_status: "gerado",
            issued_by: userId,
            snapshot: {
              name: f.name,
              registration_number: f.registration_number,
              farmer_type: f.farmer_type,
              province: f.provinces?.name,
              municipality: f.municipalities?.name,
              main_crops: f.main_crops,
              cultivated_area_ha: f.cultivated_area_ha,
              photo_url: f.photo_url,
              bi_nif: f.bi_nif,
              issued_at: new Date().toISOString(),
            },
          }));

          if (rows.length) await adminClient.from("farmer_cards").insert(rows);
          processed += chunk.length;
          await adminClient.from("card_export_jobs").update({ processed }).eq("id", job.id);
        }
        await adminClient.from("card_export_jobs").update({ status: "done", processed }).eq("id", job.id);
      } catch (err) {
        await adminClient.from("card_export_jobs").update({
          status: "error", error_message: String(err?.message ?? err),
        }).eq("id", job.id);
      }
    })());

    return json({ job_id: job.id, status: "processing", total: farmerIds.length }, 202);
  } catch (err: any) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
