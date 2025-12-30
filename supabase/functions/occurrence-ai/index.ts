import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Best practices database by occurrence type
const bestPractices: Record<string, string[]> = {
  drought: [
    "Implementar sistemas de irrigação por gotejamento para conservar água",
    "Aplicar cobertura morta (mulching) para reduzir evaporação",
    "Plantar variedades resistentes à seca",
    "Criar cisternas para captação de água da chuva",
    "Reduzir densidade de plantio para diminuir competição por água"
  ],
  flood: [
    "Melhorar sistemas de drenagem nas áreas afetadas",
    "Plantar culturas tolerantes a alagamento temporário",
    "Construir canteiros elevados para proteção de culturas sensíveis",
    "Implementar barreiras de contenção de erosão",
    "Monitorar previsões meteorológicas e agir preventivamente"
  ],
  pest: [
    "Implementar rotação de culturas para quebrar ciclo de pragas",
    "Utilizar controle biológico com predadores naturais",
    "Aplicar armadilhas e iscas para monitoramento",
    "Remover e destruir plantas infectadas",
    "Usar variedades resistentes quando disponíveis"
  ],
  disease: [
    "Praticar rotação de culturas mínima de 2-3 anos",
    "Eliminar restos de cultura infectados",
    "Usar sementes certificadas e tratadas",
    "Garantir espaçamento adequado para ventilação",
    "Aplicar fungicidas preventivos quando recomendado"
  ],
  frost: [
    "Cobrir culturas sensíveis com materiais de proteção",
    "Usar irrigação por aspersão para proteção térmica",
    "Plantar culturas de cobertura para proteção do solo",
    "Escolher locais de plantio menos propensos à geada",
    "Atrasar plantio de culturas sensíveis após risco de geada"
  ],
  hail: [
    "Instalar redes anti-granizo em culturas de alto valor",
    "Contratar seguro agrícola para proteção financeira",
    "Diversificar culturas para reduzir risco total",
    "Construir estruturas de proteção para viveiros",
    "Avaliar danos imediatamente para ação corretiva"
  ],
  fire: [
    "Criar aceiros preventivos ao redor das áreas cultivadas",
    "Manter equipamentos de combate a incêndio disponíveis",
    "Treinar trabalhadores em procedimentos de emergência",
    "Evitar queimadas não controladas",
    "Remover material combustível das proximidades"
  ],
  other: [
    "Documentar detalhadamente a ocorrência",
    "Contactar assistência técnica especializada",
    "Registar fotografias e evidências",
    "Isolar área afetada se necessário",
    "Comunicar às autoridades competentes"
  ]
};

// Severity classification based on keywords and context
function classifySeverity(type: string, description: string, affectedArea?: number, affectedFarmers?: number): {
  severity: string;
  confidence: number;
  reasoning: string;
} {
  const desc = description.toLowerCase();
  
  // Critical indicators
  const criticalKeywords = ['total', 'completa', 'devastador', 'emergência', 'urgente', 'mortalidade', 'perda total'];
  const highKeywords = ['grave', 'severo', 'significativo', 'grande', 'extenso', 'preocupante'];
  const mediumKeywords = ['moderado', 'parcial', 'alguns', 'localizado'];
  const lowKeywords = ['leve', 'menor', 'pequeno', 'início', 'preventivo'];

  let severity = 'medium';
  let confidence = 0.7;
  let reasoning = 'Classificação baseada em análise de palavras-chave e contexto.';

  // Check keywords
  if (criticalKeywords.some(k => desc.includes(k))) {
    severity = 'critical';
    confidence = 0.85;
    reasoning = 'Detectadas palavras indicando situação crítica ou perda total.';
  } else if (highKeywords.some(k => desc.includes(k))) {
    severity = 'high';
    confidence = 0.8;
    reasoning = 'Detectadas palavras indicando situação grave ou severa.';
  } else if (lowKeywords.some(k => desc.includes(k))) {
    severity = 'low';
    confidence = 0.75;
    reasoning = 'Detectadas palavras indicando situação leve ou inicial.';
  } else if (mediumKeywords.some(k => desc.includes(k))) {
    severity = 'medium';
    confidence = 0.75;
    reasoning = 'Detectadas palavras indicando situação moderada.';
  }

  // Adjust based on affected area
  if (affectedArea) {
    if (affectedArea > 1000) {
      if (severity !== 'critical') {
        severity = 'critical';
        reasoning += ' Área afetada muito extensa (>1000 ha).';
      }
      confidence = Math.min(confidence + 0.1, 0.95);
    } else if (affectedArea > 100) {
      if (severity === 'low') {
        severity = 'medium';
        reasoning += ' Área afetada considerável (>100 ha).';
      }
    }
  }

  // Adjust based on affected farmers
  if (affectedFarmers) {
    if (affectedFarmers > 100) {
      if (severity !== 'critical') {
        severity = severity === 'low' ? 'high' : 'critical';
        reasoning += ' Grande número de agricultores afetados (>100).';
      }
      confidence = Math.min(confidence + 0.05, 0.95);
    } else if (affectedFarmers > 20) {
      if (severity === 'low') {
        severity = 'medium';
        reasoning += ' Número significativo de agricultores afetados (>20).';
      }
    }
  }

  // Occurrence type specific adjustments
  if (type === 'fire' || type === 'flood') {
    if (severity === 'low') {
      severity = 'medium';
      reasoning += ' Tipo de ocorrência com potencial de escalada rápida.';
    }
  }

  return { severity, confidence, reasoning };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...data } = await req.json();

    console.log(`Processing action: ${action}`, data);

    switch (action) {
      case 'classify': {
        // Classify severity and get best practices
        const { occurrence_type, description, affected_area_ha, affected_farmers_count } = data;
        
        const classification = classifySeverity(
          occurrence_type,
          description || '',
          affected_area_ha,
          affected_farmers_count
        );
        
        const practices = bestPractices[occurrence_type] || bestPractices['other'];

        return new Response(JSON.stringify({
          success: true,
          classification: {
            severity: classification.severity,
            confidence: classification.confidence,
            reasoning: classification.reasoning
          },
          best_practices: practices
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'simulate_sms_inbound': {
        // Simulate receiving SMS report
        const { phone, message } = data;
        
        console.log(`Simulated SMS received from ${phone}: ${message}`);
        
        // Parse SMS to extract occurrence info
        const msgLower = message.toLowerCase();
        let occurrence_type = 'other';
        if (msgLower.includes('seca') || msgLower.includes('falta agua')) occurrence_type = 'drought';
        else if (msgLower.includes('cheia') || msgLower.includes('inundação')) occurrence_type = 'flood';
        else if (msgLower.includes('praga') || msgLower.includes('inseto')) occurrence_type = 'pest';
        else if (msgLower.includes('doença') || msgLower.includes('fungo')) occurrence_type = 'disease';
        else if (msgLower.includes('geada') || msgLower.includes('frio')) occurrence_type = 'frost';
        else if (msgLower.includes('granizo')) occurrence_type = 'hail';
        else if (msgLower.includes('fogo') || msgLower.includes('incêndio')) occurrence_type = 'fire';

        const classification = classifySeverity(occurrence_type, message, undefined, undefined);
        const practices = bestPractices[occurrence_type] || bestPractices['other'];

        // Create the occurrence
        const { data: occurrence, error } = await supabase
          .from('climate_occurrences')
          .insert({
            occurrence_type,
            severity: classification.severity,
            title: `Reporte SMS: ${occurrence_type}`,
            description: message,
            source: 'sms',
            source_phone: phone,
            status: 'reported',
            ai_classification: classification,
            best_practices: practices.slice(0, 3)
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          occurrence,
          message: 'SMS recebido e ocorrência registada com sucesso'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'send_alert': {
        // Simulate sending SMS alert
        const { occurrence_id, phones, message } = data;
        
        console.log(`Simulating SMS alert to ${phones.length} recipients`);
        
        const alerts = phones.map((phone: string) => ({
          occurrence_id,
          alert_type: 'sms',
          recipient_phone: phone,
          message,
          status: 'sent',
          sent_at: new Date().toISOString()
        }));

        const { data: sentAlerts, error } = await supabase
          .from('occurrence_alerts')
          .insert(alerts)
          .select();

        if (error) throw error;

        // Simulate delivery after a short delay
        setTimeout(async () => {
          const alertIds = sentAlerts.map((a: any) => a.id);
          await supabase
            .from('occurrence_alerts')
            .update({ 
              status: 'delivered',
              delivered_at: new Date().toISOString()
            })
            .in('id', alertIds);
          console.log(`Simulated delivery of ${alertIds.length} SMS alerts`);
        }, 2000);

        return new Response(JSON.stringify({
          success: true,
          alerts_sent: sentAlerts.length,
          message: `Alertas SMS simulados enviados para ${phones.length} destinatários`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'create_survey': {
        // Create and simulate sending survey
        const { survey_type, target_phones, province_id, occurrence_id } = data;
        
        const surveyQuestions: Record<string, any[]> = {
          impact_assessment: [
            { id: 1, question: 'Qual a área afectada em hectares?', type: 'numeric' },
            { id: 2, question: 'Quantos agricultores foram afectados?', type: 'numeric' },
            { id: 3, question: 'Qual o nível de danos? 1-Leve, 2-Moderado, 3-Grave, 4-Total', type: 'choice' },
          ],
          damage_report: [
            { id: 1, question: 'Qual a percentagem de perdas nas culturas?', type: 'numeric' },
            { id: 2, question: 'Há necessidade de assistência urgente? 1-Sim, 2-Não', type: 'choice' },
            { id: 3, question: 'Descreva brevemente os danos', type: 'text' },
          ],
          recovery_status: [
            { id: 1, question: 'A recuperação já começou? 1-Sim, 2-Não', type: 'choice' },
            { id: 2, question: 'Qual a percentagem de recuperação?', type: 'numeric' },
            { id: 3, question: 'Quais os recursos necessários?', type: 'text' },
          ],
          needs_assessment: [
            { id: 1, question: 'Precisa de sementes? 1-Sim, 2-Não', type: 'choice' },
            { id: 2, question: 'Precisa de ferramentas? 1-Sim, 2-Não', type: 'choice' },
            { id: 3, question: 'Precisa de assistência técnica? 1-Sim, 2-Não', type: 'choice' },
          ]
        };

        const questions = surveyQuestions[survey_type] || surveyQuestions.impact_assessment;

        const surveys = target_phones.map((phone: string) => ({
          occurrence_id,
          survey_type,
          target_phone: phone,
          province_id,
          questions,
          status: 'sent',
          sent_at: new Date().toISOString()
        }));

        const { data: createdSurveys, error } = await supabase
          .from('occurrence_surveys')
          .insert(surveys)
          .select();

        if (error) throw error;

        console.log(`Created ${createdSurveys.length} surveys for ${survey_type}`);

        return new Response(JSON.stringify({
          success: true,
          surveys_created: createdSurveys.length,
          message: `Inquéritos ${survey_type} criados e enviados para ${target_phones.length} destinatários`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'simulate_survey_response': {
        // Simulate a farmer responding to survey via SMS/IVR
        const { survey_id, responses } = data;

        const { data: survey, error } = await supabase
          .from('occurrence_surveys')
          .update({
            responses,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', survey_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          survey,
          message: 'Resposta ao inquérito registada com sucesso'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Unknown action'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: unknown) {
    console.error('Error in occurrence-ai function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
