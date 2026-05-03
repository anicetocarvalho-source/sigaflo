// Edge function: generate-cards-batch
// Cria registos de farmer_cards em lote (status=gerado), com progresso, contagem
// de sucessos/falhas e logs detalhados por agricultor.
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

    const body = await req.json().catch(() => ({}));
    const farmerIds: string[] = Array.isArray(body?.farmer_ids) ? body.farmer_ids : [];
    if (!farmerIds.length) return json({ error: "farmer_ids vazio" }, 400);

    const { data: job, error: jobErr } = await supabase
      .from("card_export_jobs")
      .insert({
        requested_by: userId,
        status: "processing",
        total: farmerIds.length,
        farmer_ids: farmerIds,
        options: body.options ?? {},
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (jobErr) throw jobErr;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const log = async (level: "info" | "warning" | "error", message: string, farmer_id?: string, metadata: Record<string, unknown> = {}) => {
      try {
        await adminClient.from("card_export_job_logs").insert({
          job_id: job.id, level, message, farmer_id: farmer_id ?? null, metadata,
        });
      } catch (_) { /* swallow */ }
    };

    // @ts-expect-error EdgeRuntime is global in Supabase
    EdgeRuntime.waitUntil((async () => {
      let processed = 0, succeeded = 0, failed = 0;
      const chunkSize = 100;
      const reportProgress = async () => {
        await adminClient.from("card_export_jobs")
          .update({ processed, succeeded, failed }).eq("id", job.id);
      };

      await log("info", `Início do lote: ${farmerIds.length} agricultores, ${Math.ceil(farmerIds.length / chunkSize)} chunks de ${chunkSize}.`);

      try {
        for (let i = 0; i < farmerIds.length; i += chunkSize) {
          const chunk = farmerIds.slice(i, i + chunkSize);
          const chunkIdx = Math.floor(i / chunkSize) + 1;

          const { data: farmers, error: fErr } = await adminClient
            .from("farmers")
            .select("id, name, registration_number, farmer_type, province_id, municipality_id, photo_url, main_crops, cultivated_area_ha, bi_nif, provinces(name), municipalities(name)")
            .in("id", chunk);
          if (fErr) {
            failed += chunk.length;
            await log("error", `Chunk ${chunkIdx}: falha ao carregar agricultores — ${fErr.message}`);
            processed += chunk.length;
            await reportProgress();
            continue;
          }

          const { data: existing } = await adminClient
            .from("farmer_cards").select("farmer_id")
            .in("farmer_id", chunk).neq("card_status", "revogado");
          const has = new Set((existing ?? []).map((c: any) => c.farmer_id));

          let chunkInsertCount = 0;
          for (const f of (farmers ?? []) as any[]) {
            if (has.has(f.id)) {
              await log("warning", `Já tem cartão activo — ignorado.`, f.id, { name: f.name });
              failed++;
              continue;
            }
            const { error: insErr } = await adminClient.from("farmer_cards").insert({
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
            });
            if (insErr) {
              failed++;
              await log("error", `Falha ao criar cartão: ${insErr.message}`, f.id, { name: f.name });
            } else {
              succeeded++;
              chunkInsertCount++;
            }
          }

          // Agricultores pedidos mas não retornados pela query (ids inválidos)
          const returnedIds = new Set((farmers ?? []).map((f: any) => f.id));
          const missing = chunk.filter((id) => !returnedIds.has(id));
          for (const id of missing) {
            failed++;
            await log("error", `Agricultor não encontrado na BD.`, id);
          }

          processed += chunk.length;
          await log("info", `Chunk ${chunkIdx}: ${chunkInsertCount} criados, ${chunk.length - chunkInsertCount} ignorados.`);
          await reportProgress();
        }

        await adminClient.from("card_export_jobs").update({
          status: failed > 0 && succeeded === 0 ? "error" : "done",
          processed, succeeded, failed,
          finished_at: new Date().toISOString(),
        }).eq("id", job.id);
        await log("info", `Lote concluído. ${succeeded} sucesso(s), ${failed} falha(s).`);
      } catch (err: any) {
        await adminClient.from("card_export_jobs").update({
          status: "error",
          error_message: String(err?.message ?? err),
          processed, succeeded, failed,
          finished_at: new Date().toISOString(),
        }).eq("id", job.id);
        await log("error", `Erro fatal: ${String(err?.message ?? err)}`);
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
