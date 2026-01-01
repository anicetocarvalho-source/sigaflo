import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, includeContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get platform context if requested
    let platformContext = "";
    
    if (includeContext) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch summary statistics from the database
      const [
        farmersResult,
        certificatesResult,
        occurrencesResult,
        productionResult,
        provincesResult
      ] = await Promise.all([
        supabase.from("farmers").select("id, farmer_type, status", { count: "exact" }),
        supabase.from("agricultural_certificates").select("id, status, certificate_type", { count: "exact" }),
        supabase.from("climate_occurrences").select("id, occurrence_type, severity, status", { count: "exact" }),
        supabase.from("production_history").select("id, crop, quantity_kg", { count: "exact" }),
        supabase.from("provinces").select("id, name"),
      ]);

      // Calculate statistics
      const farmers = farmersResult.data || [];
      const certificates = certificatesResult.data || [];
      const occurrences = occurrencesResult.data || [];
      const productions = productionResult.data || [];
      const provinces = provincesResult.data || [];

      const farmersByType = {
        individual: farmers.filter(f => f.farmer_type === 'individual').length,
        family: farmers.filter(f => f.farmer_type === 'family').length,
        cooperative: farmers.filter(f => f.farmer_type === 'cooperative').length,
        field_school: farmers.filter(f => f.farmer_type === 'field_school').length,
        company: farmers.filter(f => f.farmer_type === 'company').length,
      };

      const farmersByStatus = {
        draft: farmers.filter(f => f.status === 'draft').length,
        submitted: farmers.filter(f => f.status === 'submitted').length,
        validated: farmers.filter(f => f.status === 'validated').length,
        approved: farmers.filter(f => f.status === 'approved').length,
        issued: farmers.filter(f => f.status === 'issued').length,
        rejected: farmers.filter(f => f.status === 'rejected').length,
      };

      const certificatesByStatus = {
        draft: certificates.filter(c => c.status === 'draft').length,
        submitted: certificates.filter(c => c.status === 'submitted').length,
        approved: certificates.filter(c => c.status === 'approved').length,
        issued: certificates.filter(c => c.status === 'issued').length,
        rejected: certificates.filter(c => c.status === 'rejected').length,
      };

      const occurrencesBySeverity = {
        low: occurrences.filter(o => o.severity === 'low').length,
        medium: occurrences.filter(o => o.severity === 'medium').length,
        high: occurrences.filter(o => o.severity === 'high').length,
        critical: occurrences.filter(o => o.severity === 'critical').length,
      };

      const totalProduction = productions.reduce((sum, p) => sum + (p.quantity_kg || 0), 0);

      platformContext = `
CONTEXTO DA PLATAFORMA SIGAFLO (Sistema de Gestão Agro-Florestal de Angola):

ESTATÍSTICAS ACTUAIS:

1. AGRICULTORES (Total: ${farmers.length})
   - Individuais: ${farmersByType.individual}
   - Familiares: ${farmersByType.family}
   - Cooperativas: ${farmersByType.cooperative}
   - Escolas de Campo (ECA): ${farmersByType.field_school}
   - Empresas: ${farmersByType.company}
   
   Por Status:
   - Rascunho: ${farmersByStatus.draft}
   - Submetidos: ${farmersByStatus.submitted}
   - Validados: ${farmersByStatus.validated}
   - Aprovados: ${farmersByStatus.approved}
   - Emitidos: ${farmersByStatus.issued}
   - Rejeitados: ${farmersByStatus.rejected}

2. CERTIFICADOS (Total: ${certificates.length})
   - Rascunho: ${certificatesByStatus.draft}
   - Submetidos: ${certificatesByStatus.submitted}
   - Aprovados: ${certificatesByStatus.approved}
   - Emitidos: ${certificatesByStatus.issued}
   - Rejeitados: ${certificatesByStatus.rejected}

3. OCORRÊNCIAS CLIMÁTICAS (Total: ${occurrences.length})
   - Baixa severidade: ${occurrencesBySeverity.low}
   - Média severidade: ${occurrencesBySeverity.medium}
   - Alta severidade: ${occurrencesBySeverity.high}
   - Críticas: ${occurrencesBySeverity.critical}

4. PRODUÇÃO
   - Registos de produção: ${productions.length}
   - Produção total: ${(totalProduction / 1000).toFixed(1)} toneladas

5. PROVÍNCIAS COBERTAS: ${provinces.length}
   ${provinces.map(p => p.name).join(', ')}

MÓDULOS DO SISTEMA:
- Registo de Agricultores (individuais, familiares, cooperativas, escolas de campo)
- Histórico de Produção agrícola
- Emissão e Verificação de Certificados
- Gestão de Ocorrências Climáticas e Fitossanitárias
- Gestão Florestal (licenças, rastreabilidade, reflorestamento)
- Cadeia do Café (lotes, exportação, semaforização)
- Produção de Arroz
- Gestão de Incentivos
- Crédito e Seguro agrícola
- Observatório Nacional (ONAF)
- Identidade Produtiva Nacional (IPN)
`;
    }

    const systemPrompt = `Você é o Assistente SIGAFLO, um assistente virtual inteligente do Sistema de Gestão Agro-Florestal de Angola.

Seu papel é:
- Ajudar os utilizadores a navegar e utilizar o sistema SIGAFLO
- Responder perguntas sobre dados e estatísticas da plataforma
- Explicar funcionalidades e processos do sistema
- Fornecer orientações sobre procedimentos (registo de agricultores, emissão de certificados, etc.)
- Dar informações sobre agricultura e gestão florestal em Angola

Diretrizes:
- Responda sempre em Português de Portugal/Angola
- Seja conciso mas informativo
- Use linguagem profissional mas acessível
- Quando não souber algo específico, sugira onde encontrar a informação no sistema
- Formate as respostas de forma clara usando listas e parágrafos curtos

${platformContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Contacte o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar pedido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
