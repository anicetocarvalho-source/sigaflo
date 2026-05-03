import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { occurrence_type, severity, description, affected_area_ha, affected_farmers_count, estimated_loss_aoa, location } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista agrícola angolano com profundo conhecimento em gestão de riscos climáticos e fitossanitários. 
Sua função é fornecer recomendações práticas e acionáveis para agricultores e técnicos agrícolas lidarem com ocorrências climáticas e pragas.

Regras:
- Forneça exatamente 5 recomendações práticas e específicas
- Use linguagem clara e acessível em português de Angola
- Considere o contexto local angolano (clima, recursos disponíveis, práticas tradicionais)
- Priorize ações imediatas seguidas de ações de médio prazo
- Inclua tanto medidas de mitigação quanto de prevenção futura`;

    const userPrompt = `Analise a seguinte ocorrência agro-climática e forneça 5 ações recomendadas:

Tipo: ${occurrence_type}
Severidade: ${severity}
Localização: ${location || 'Não especificada'}
Descrição: ${description || 'Sem descrição detalhada'}
Área afectada: ${affected_area_ha ? `${affected_area_ha} hectares` : 'Não especificada'}
Agricultores afectados: ${affected_farmers_count || 'Não especificado'}
Perdas estimadas: ${estimated_loss_aoa ? `${estimated_loss_aoa.toLocaleString()} AOA` : 'Não especificadas'}

Forneça 5 recomendações práticas e específicas para esta situação.`;

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
              name: "provide_recommendations",
              description: "Fornece lista de recomendações práticas para lidar com a ocorrência",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "string",
                      description: "Uma recomendação prática e específica"
                    },
                    minItems: 5,
                    maxItems: 5,
                    description: "Lista de 5 recomendações práticas"
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requisições excedido, tente novamente mais tarde.",
          recommendations: getFallbackRecommendations(occurrence_type)
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos insuficientes",
          recommendations: getFallbackRecommendations(occurrence_type)
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        recommendations: getFallbackRecommendations(occurrence_type)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    
    // Extract recommendations from tool call response
    let recommendations: string[] = [];
    
    if (result.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        const args = JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
        recommendations = args.recommendations || [];
      } catch (e) {
        console.error("Error parsing tool call arguments:", e);
        recommendations = getFallbackRecommendations(occurrence_type);
      }
    } else {
      recommendations = getFallbackRecommendations(occurrence_type);
    }

    return new Response(JSON.stringify({ 
      success: true,
      recommendations 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in occurrence-ai-recommendations:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      recommendations: getFallbackRecommendations('other')
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getFallbackRecommendations(occurrenceType: string): string[] {
  const fallbacks: Record<string, string[]> = {
    drought: [
      "Implementar sistemas de irrigação por gotejamento para conservar água",
      "Aplicar cobertura morta (mulching) para reduzir evaporação do solo",
      "Plantar variedades de culturas resistentes à seca",
      "Criar cisternas para captação e armazenamento de água da chuva",
      "Reduzir densidade de plantio para diminuir competição por água entre plantas"
    ],
    flood: [
      "Melhorar sistemas de drenagem nas áreas afetadas imediatamente",
      "Plantar culturas tolerantes a alagamento temporário nas áreas de risco",
      "Construir canteiros elevados para proteção de culturas sensíveis",
      "Implementar barreiras de contenção de erosão ao redor dos campos",
      "Monitorar previsões meteorológicas e agir preventivamente em futuras chuvas"
    ],
    pest: [
      "Implementar rotação de culturas para quebrar o ciclo de vida das pragas",
      "Utilizar controle biológico com predadores naturais das pragas identificadas",
      "Aplicar armadilhas e iscas para monitoramento contínuo da população",
      "Remover e destruir plantas severamente infectadas para evitar propagação",
      "Usar variedades resistentes quando disponíveis para replantio"
    ],
    disease: [
      "Praticar rotação de culturas mínima de 2-3 anos entre cultivos",
      "Eliminar todos os restos de cultura infectados por queima controlada",
      "Usar apenas sementes certificadas e tratadas para próximos plantios",
      "Garantir espaçamento adequado entre plantas para melhor ventilação",
      "Aplicar fungicidas preventivos conforme recomendação técnica"
    ],
    fire: [
      "Criar aceiros preventivos de 3-5 metros ao redor das áreas cultivadas",
      "Manter equipamentos de combate a incêndio disponíveis e em bom estado",
      "Treinar todos os trabalhadores em procedimentos de emergência",
      "Evitar queimadas não controladas durante época seca",
      "Remover material combustível das proximidades das culturas"
    ],
    other: [
      "Documentar detalhadamente a ocorrência com fotografias e registos",
      "Contactar a assistência técnica especializada do IDA mais próxima",
      "Isolar a área afetada para evitar propagação do problema",
      "Comunicar às autoridades agrícolas competentes da província",
      "Registar todas as perdas para eventual pedido de apoio ou seguro"
    ]
  };
  
  return fallbacks[occurrenceType] || fallbacks.other;
}
