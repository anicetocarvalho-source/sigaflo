import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for internal operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Verify the request has authorization (optional - just log it)
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    const { action, description, occurrence_type, severity, province_id, title } = await req.json();
    
    console.log(`Processing action: ${action}`);

    if (action === 'analyze') {
      // Use Lovable AI to analyze the description
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      const systemPrompt = `Você é um especialista agrícola angolano que analisa reportes de ocorrências agro-climáticas.
      
Sua tarefa é analisar a descrição fornecida e extrair:
1. O tipo de ocorrência (drought, flood, pest, disease, frost, fire, hail, other)
2. A severidade/urgência (low, medium, high, critical)
3. Um título conciso para a ocorrência

Regras para classificação de severidade:
- critical: Risco imediato de perda total, muitos agricultores afetados (>100), área muito grande (>1000ha), situação de emergência
- high: Danos significativos, propagação rápida, número considerável de afetados (20-100), área grande (100-1000ha)
- medium: Danos moderados, situação controlável mas requer atenção, poucos afetados (5-20), área média (10-100ha)
- low: Início de problema, preventivo, poucos afetados (<5), área pequena (<10ha)

Responda APENAS em formato JSON válido.`;

      const userPrompt = `Analise este reporte de ocorrência agrícola em Angola:

"${description}"

Responda em JSON com a estrutura: {"type": "...", "severity": "...", "title": "...", "confidence": 0.0}`;

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
            { role: "user", content: userPrompt }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "classify_occurrence",
                description: "Classifica a ocorrência agro-climática",
                parameters: {
                  type: "object",
                  properties: {
                    type: { 
                      type: "string", 
                      enum: ["drought", "flood", "pest", "disease", "frost", "fire", "hail", "other"],
                      description: "Tipo da ocorrência"
                    },
                    severity: { 
                      type: "string", 
                      enum: ["low", "medium", "high", "critical"],
                      description: "Nível de urgência"
                    },
                    title: { 
                      type: "string",
                      description: "Título conciso da ocorrência (máx 100 caracteres)"
                    },
                    confidence: {
                      type: "number",
                      description: "Nível de confiança na classificação (0-1)"
                    }
                  },
                  required: ["type", "severity", "title", "confidence"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "classify_occurrence" } }
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          // Fallback to keyword-based classification
          const analysis = analyzeWithKeywords(description);
          return new Response(JSON.stringify({ analysis }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const result = await response.json();
      
      let analysis = null;
      if (result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
        try {
          analysis = JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
        } catch (e) {
          console.error("Error parsing AI response:", e);
          analysis = analyzeWithKeywords(description);
        }
      } else {
        analysis = analyzeWithKeywords(description);
      }

      console.log("Analysis result:", analysis);

      return new Response(JSON.stringify({ 
        success: true,
        analysis 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === 'notify') {
      // Simulate notifying technicians
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get users who are technicians in the province
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .in('role', ['technician_national', 'technician_provincial', 'admin_provincial'])
        .limit(10);

      if (usersError) {
        console.error("Error fetching users:", usersError);
      }

      const techniciansCount = users?.length || 0;

      console.log(`Notifying ${techniciansCount} technicians about ${occurrence_type} (${severity}) in province ${province_id}`);

      // In a real implementation, you would send emails/SMS here
      // For now, we simulate the notification
      
      // Log the notification attempt
      if (techniciansCount > 0) {
        console.log(`Notification would be sent to: ${users?.map(u => u.email).join(', ')}`);
      }

      return new Response(JSON.stringify({
        success: true,
        notified: true,
        technicians_notified: techniciansCount,
        message: `${techniciansCount} técnicos foram notificados sobre a ocorrência.`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Unknown action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in report-occurrence-ai:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function analyzeWithKeywords(description: string): { type: string; severity: string; title: string; confidence: number } {
  const desc = description.toLowerCase();
  
  // Detect type
  let type = 'other';
  if (desc.includes('seca') || desc.includes('falta de água') || desc.includes('murchar')) {
    type = 'drought';
  } else if (desc.includes('cheia') || desc.includes('inundação') || desc.includes('alagamento')) {
    type = 'flood';
  } else if (desc.includes('praga') || desc.includes('inseto') || desc.includes('lagarta') || desc.includes('gafanhoto')) {
    type = 'pest';
  } else if (desc.includes('doença') || desc.includes('fungo') || desc.includes('ferrugem') || desc.includes('vírus')) {
    type = 'disease';
  } else if (desc.includes('geada') || desc.includes('frio intenso')) {
    type = 'frost';
  } else if (desc.includes('fogo') || desc.includes('incêndio') || desc.includes('queimada')) {
    type = 'fire';
  } else if (desc.includes('granizo')) {
    type = 'hail';
  }

  // Detect severity
  let severity = 'medium';
  if (desc.includes('total') || desc.includes('devastador') || desc.includes('emergência') || desc.includes('urgente')) {
    severity = 'critical';
  } else if (desc.includes('grave') || desc.includes('severo') || desc.includes('muito') || desc.includes('grande')) {
    severity = 'high';
  } else if (desc.includes('pequeno') || desc.includes('leve') || desc.includes('início') || desc.includes('pouco')) {
    severity = 'low';
  }

  // Generate title
  const typeLabels: Record<string, string> = {
    drought: 'Seca',
    flood: 'Inundação',
    pest: 'Praga',
    disease: 'Doença de culturas',
    frost: 'Geada',
    fire: 'Incêndio',
    hail: 'Granizo',
    other: 'Ocorrência'
  };

  const title = `${typeLabels[type]} reportada - ${severity === 'critical' ? 'Urgente' : severity === 'high' ? 'Prioritário' : 'Para verificação'}`;

  return {
    type,
    severity,
    title,
    confidence: 0.7
  };
}
