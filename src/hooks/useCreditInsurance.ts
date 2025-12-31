import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface FarmerFinancialProfile {
  id: string;
  farmer_id: string;
  production_years: number;
  production_stability_pct: number;
  average_annual_production_kg: number;
  main_crops: string[];
  productive_area_ha: number;
  total_incentives_received_aoa: number;
  incentives_count: number;
  last_incentive_date: string | null;
  climate_events_count: number;
  climate_losses_aoa: number;
  last_climate_event_date: string | null;
  territorial_risk_level: 'low' | 'medium' | 'high' | 'very_high';
  territorial_risk_factors: Record<string, any>;
  credit_score: number;
  credit_score_factors: Record<string, any>;
  risk_classification: 'low' | 'medium' | 'high';
  is_credit_eligible: boolean;
  is_insurance_eligible: boolean;
  eligibility_notes: string | null;
  last_calculated_at: string | null;
  created_at: string;
  updated_at: string;
  farmer?: {
    id: string;
    name: string;
    registration_number: string;
    farmer_type: string;
    province?: { name: string };
    municipality?: { name: string };
  };
}

export interface CreditSimulation {
  id: string;
  farmer_id: string;
  simulation_date: string;
  scenario_type: 'normal' | 'adverse' | 'optimistic';
  expected_annual_revenue_aoa: number;
  average_production_costs_aoa: number;
  estimated_net_margin_aoa: number;
  margin_percentage: number;
  max_monthly_payment_aoa: number;
  max_credit_amount_aoa: number;
  recommended_credit_amount_aoa: number;
  recommended_term_months: number;
  estimated_interest_rate: number;
  simulation_params: Record<string, any>;
  report_generated: boolean;
  report_url: string | null;
  qr_code_data: string | null;
  verification_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ProductionHistoryCertificate {
  id: string;
  farmer_id: string;
  certificate_number: string;
  period_start_year: number;
  period_end_year: number;
  certified_productions: any[];
  total_production_kg: number;
  average_productivity: number;
  productive_area_ha: number;
  agricultural_practices: string[];
  digital_signature: string | null;
  signed_by: string;
  signed_at: string | null;
  qr_code_data: string | null;
  verification_url: string | null;
  is_valid: boolean;
  validity_expiry: string | null;
  status: 'draft' | 'issued' | 'revoked' | 'expired';
  revocation_reason: string | null;
  issued_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsuranceRiskScore {
  id: string;
  farmer_id: string;
  climate_history_score: number;
  pest_frequency_score: number;
  crop_risk_score: number;
  practices_score: number;
  extreme_events_score: number;
  overall_risk_score: number;
  risk_factors_detail: Record<string, any>;
  insurable_risk_class: 'A' | 'B' | 'C' | 'D' | 'E';
  suggested_coverage_types: string[];
  suggested_premium_multiplier: number;
  suggested_deductible_pct: number;
  coverage_recommendations: Record<string, any>;
  risk_mitigation_suggestions: string[];
  calculated_at: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditDossier {
  id: string;
  farmer_id: string;
  dossier_number: string;
  financial_profile_id: string | null;
  simulation_id: string | null;
  certificate_id: string | null;
  insurance_score_id: string | null;
  credit_score: number | null;
  risk_classification: string | null;
  recommended_credit_aoa: number | null;
  georeferenced_maps: Record<string, any>;
  attached_documents: any[];
  status: 'draft' | 'ready' | 'submitted' | 'approved' | 'rejected' | 'expired';
  submitted_to: string | null;
  submitted_at: string | null;
  submission_response: Record<string, any> | null;
  pdf_url: string | null;
  qr_code_data: string | null;
  verification_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface AlternativeGuarantee {
  id: string;
  farmer_id: string;
  guarantee_type: 'future_production' | 'supply_contract' | 'sigaf_certificate' | 'subsidy_history' | 'equipment' | 'other';
  description: string;
  estimated_value_aoa: number;
  document_reference: string | null;
  document_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_by: string | null;
  verified_at: string | null;
  score_impact_points: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditInsuranceAlert {
  id: string;
  farmer_id: string;
  alert_type: 'credit_eligible' | 'score_improved' | 'insurance_recommended' | 'document_expiring' | 'profile_updated' | 'dossier_ready';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_farmer: boolean;
  target_extensionist: boolean;
  target_institution: string | null;
  send_sms: boolean;
  send_app: boolean;
  send_email: boolean;
  sms_sent_at: string | null;
  app_sent_at: string | null;
  email_sent_at: string | null;
  read_at: string | null;
  acknowledged_at: string | null;
  created_at: string;
  expires_at: string | null;
}

// Hooks for Financial Profiles
export function useFinancialProfiles(filters?: { creditEligible?: boolean; riskClassification?: string }) {
  return useQuery({
    queryKey: ['financial-profiles', filters],
    queryFn: async () => {
      let query = supabase
        .from('farmer_financial_profiles')
        .select(`
          *,
          farmer:farmers(id, name, registration_number, farmer_type, 
            province:provinces(name),
            municipality:municipalities(name)
          )
        `)
        .order('credit_score', { ascending: false });

      if (filters?.creditEligible !== undefined) {
        query = query.eq('is_credit_eligible', filters.creditEligible);
      }
      if (filters?.riskClassification) {
        query = query.eq('risk_classification', filters.riskClassification);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FarmerFinancialProfile[];
    }
  });
}

export function useFinancialProfile(farmerId: string) {
  return useQuery({
    queryKey: ['financial-profile', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_financial_profiles')
        .select(`
          *,
          farmer:farmers(id, name, registration_number, farmer_type,
            province:provinces(name),
            municipality:municipalities(name)
          )
        `)
        .eq('farmer_id', farmerId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as FarmerFinancialProfile | null;
    },
    enabled: !!farmerId
  });
}

export function useCalculateFinancialProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (farmerId: string) => {
      // Fetch farmer data
      const { data: farmer } = await supabase
        .from('farmers')
        .select('*, province:provinces(name), municipality:municipalities(name)')
        .eq('id', farmerId)
        .single();

      // Fetch production history
      const { data: productions } = await supabase
        .from('production_history')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('year', { ascending: false });

      // Fetch climate occurrences for the area
      const { data: climateEvents } = await supabase
        .from('climate_occurrences')
        .select('*')
        .eq('province_id', farmer?.province_id);

      // Calculate metrics
      const productionYears = productions?.length || 0;
      const yields = productions?.map(p => p.yield_per_ha) || [];
      const avgYield = yields.length > 0 ? yields.reduce((a, b) => a + b, 0) / yields.length : 0;
      const variance = yields.length > 1 
        ? Math.sqrt(yields.reduce((sum, y) => sum + Math.pow(y - avgYield, 2), 0) / yields.length)
        : 0;
      const stability = avgYield > 0 ? Math.max(0, 100 - (variance / avgYield * 100)) : 0;

      // Calculate credit score (0-100)
      let creditScore = 50; // Base score
      
      // Production history bonus (up to +20)
      creditScore += Math.min(20, productionYears * 5);
      
      // Stability bonus (up to +15)
      creditScore += Math.min(15, stability * 0.15);
      
      // Area bonus (up to +10)
      const area = farmer?.cultivated_area_ha || 0;
      creditScore += Math.min(10, area * 0.5);
      
      // Climate risk penalty
      const climateCount = climateEvents?.length || 0;
      creditScore -= Math.min(15, climateCount * 3);

      creditScore = Math.max(0, Math.min(100, Math.round(creditScore)));

      // Determine risk classification
      let riskClassification: 'low' | 'medium' | 'high' = 'medium';
      if (creditScore >= 70) riskClassification = 'low';
      else if (creditScore < 40) riskClassification = 'high';

      const profileData = {
        farmer_id: farmerId,
        production_years: productionYears,
        production_stability_pct: Math.round(stability * 100) / 100,
        average_annual_production_kg: productions?.reduce((sum, p) => sum + (p.actual_yield_kg || 0), 0) / Math.max(1, productionYears),
        main_crops: farmer?.main_crops || [],
        productive_area_ha: farmer?.cultivated_area_ha || 0,
        climate_events_count: climateCount,
        territorial_risk_level: climateCount > 5 ? 'high' : climateCount > 2 ? 'medium' : 'low',
        credit_score: creditScore,
        credit_score_factors: {
          production_history: Math.min(20, productionYears * 5),
          stability: Math.min(15, stability * 0.15),
          area: Math.min(10, area * 0.5),
          climate_risk: -Math.min(15, climateCount * 3)
        },
        risk_classification: riskClassification,
        is_credit_eligible: creditScore >= 40 && productionYears >= 2,
        is_insurance_eligible: productionYears >= 1,
        last_calculated_at: new Date().toISOString()
      };

      // Upsert the profile
      const { data: existingProfile } = await supabase
        .from('farmer_financial_profiles')
        .select('id')
        .eq('farmer_id', farmerId)
        .single();

      if (existingProfile) {
        const { data, error } = await supabase
          .from('farmer_financial_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('farmer_financial_profiles')
          .insert(profileData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['financial-profile'] });
    }
  });
}

// Credit Simulations
export function useCreditSimulations(farmerId?: string) {
  return useQuery({
    queryKey: ['credit-simulations', farmerId],
    queryFn: async () => {
      let query = supabase
        .from('credit_simulations')
        .select('*')
        .order('created_at', { ascending: false });

      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CreditSimulation[];
    }
  });
}

export function useCreateCreditSimulation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      farmerId: string;
      scenarioType: 'normal' | 'adverse' | 'optimistic';
      expectedRevenue: number;
      productionCosts: number;
    }) => {
      const { farmerId, scenarioType, expectedRevenue, productionCosts } = params;
      
      // Apply scenario multipliers
      const multiplier = scenarioType === 'optimistic' ? 1.2 : scenarioType === 'adverse' ? 0.7 : 1;
      const adjustedRevenue = expectedRevenue * multiplier;
      
      const netMargin = adjustedRevenue - productionCosts;
      const marginPct = adjustedRevenue > 0 ? (netMargin / adjustedRevenue) * 100 : 0;
      
      // Calculate credit capacity (30% of net margin for monthly payment)
      const maxMonthlyPayment = Math.max(0, netMargin * 0.3 / 12);
      const interestRate = 18; // Annual rate
      const termMonths = 24;
      
      // Calculate max credit using PMT formula inverse
      const monthlyRate = interestRate / 100 / 12;
      const maxCredit = maxMonthlyPayment > 0 
        ? maxMonthlyPayment * (1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate
        : 0;

      const simulationData = {
        farmer_id: farmerId,
        simulation_date: new Date().toISOString().split('T')[0],
        scenario_type: scenarioType,
        expected_annual_revenue_aoa: adjustedRevenue,
        average_production_costs_aoa: productionCosts,
        estimated_net_margin_aoa: netMargin,
        margin_percentage: marginPct,
        max_monthly_payment_aoa: maxMonthlyPayment,
        max_credit_amount_aoa: maxCredit,
        recommended_credit_amount_aoa: maxCredit * 0.8, // Conservative recommendation
        recommended_term_months: termMonths,
        estimated_interest_rate: interestRate,
        simulation_params: { multiplier, baseRevenue: expectedRevenue },
        qr_code_data: `SIM-${Date.now()}`,
        verification_url: `/verificar/simulacao/${Date.now()}`
      };

      const { data, error } = await supabase
        .from('credit_simulations')
        .insert(simulationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-simulations'] });
    }
  });
}

// Production Certificates
export function useProductionCertificates(farmerId?: string) {
  return useQuery({
    queryKey: ['production-certificates', farmerId],
    queryFn: async () => {
      let query = supabase
        .from('production_history_certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductionHistoryCertificate[];
    }
  });
}

export function useGenerateProductionCertificate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (farmerId: string) => {
      // Fetch production history
      const { data: productions } = await supabase
        .from('production_history')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('year', { ascending: false })
        .limit(5);

      if (!productions || productions.length === 0) {
        throw new Error('Nenhum histórico de produção encontrado');
      }

      const { data: farmer } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .single();

      const years = productions.map(p => p.year);
      const totalProduction = productions.reduce((sum, p) => sum + (p.actual_yield_kg || 0), 0);
      const avgProductivity = productions.reduce((sum, p) => sum + (p.yield_per_ha || 0), 0) / productions.length;

      const certNumber = `HPC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      const certData = {
        farmer_id: farmerId,
        certificate_number: certNumber,
        period_start_year: Math.min(...years),
        period_end_year: Math.max(...years),
        certified_productions: productions.map(p => ({
          year: p.year,
          season: p.season,
          crop: p.crop_type,
          area_ha: p.area_planted_ha,
          production_kg: p.actual_yield_kg,
          yield_kg_ha: p.yield_per_ha
        })),
        total_production_kg: totalProduction,
        average_productivity: avgProductivity,
        productive_area_ha: farmer?.cultivated_area_ha || 0,
        agricultural_practices: farmer?.irrigation_type ? [farmer.irrigation_type] : [],
        signed_by: 'SIGAF/MINAGRIP',
        signed_at: new Date().toISOString(),
        qr_code_data: certNumber,
        verification_url: `/verificar/certificado-producao/${certNumber}`,
        is_valid: true,
        validity_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'issued' as const
      };

      const { data, error } = await supabase
        .from('production_history_certificates')
        .insert(certData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-certificates'] });
    }
  });
}

// Insurance Risk Scores
export function useInsuranceRiskScores(farmerId?: string) {
  return useQuery({
    queryKey: ['insurance-risk-scores', farmerId],
    queryFn: async () => {
      let query = supabase
        .from('insurance_risk_scores')
        .select('*')
        .order('created_at', { ascending: false });

      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InsuranceRiskScore[];
    }
  });
}

export function useCalculateInsuranceRisk() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (farmerId: string) => {
      const { data: farmer } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .single();

      const { data: climateEvents } = await supabase
        .from('climate_occurrences')
        .select('*')
        .eq('province_id', farmer?.province_id);

      // Calculate component scores (higher = lower risk)
      const climateScore = Math.max(20, 100 - (climateEvents?.length || 0) * 10);
      const pestScore = 70; // Default medium
      const cropScore = farmer?.main_crops?.includes('milho') ? 60 : 75;
      const practicesScore = farmer?.irrigation_type ? 80 : 50;
      const extremeScore = Math.max(30, 100 - (climateEvents?.filter(e => e.severity === 'critical').length || 0) * 20);

      const overallScore = Math.round((climateScore + pestScore + cropScore + practicesScore + extremeScore) / 5);

      // Determine risk class (A = best, E = worst)
      let riskClass: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
      if (overallScore >= 80) riskClass = 'A';
      else if (overallScore >= 65) riskClass = 'B';
      else if (overallScore >= 50) riskClass = 'C';
      else if (overallScore >= 35) riskClass = 'D';
      else riskClass = 'E';

      const premiumMultiplier = { A: 0.8, B: 1.0, C: 1.2, D: 1.5, E: 2.0 }[riskClass];

      const scoreData = {
        farmer_id: farmerId,
        climate_history_score: climateScore,
        pest_frequency_score: pestScore,
        crop_risk_score: cropScore,
        practices_score: practicesScore,
        extreme_events_score: extremeScore,
        overall_risk_score: overallScore,
        risk_factors_detail: {
          climate_events: climateEvents?.length || 0,
          crops: farmer?.main_crops || [],
          irrigation: farmer?.irrigation_type
        },
        insurable_risk_class: riskClass,
        suggested_coverage_types: ['perda_total', 'perda_parcial', 'eventos_climaticos'],
        suggested_premium_multiplier: premiumMultiplier,
        suggested_deductible_pct: riskClass === 'A' ? 5 : riskClass === 'B' ? 10 : 15,
        coverage_recommendations: {
          recommended_coverage: ['seca', 'inundacao', 'pragas'],
          excluded_risks: riskClass === 'E' ? ['granizo'] : []
        },
        risk_mitigation_suggestions: [
          'Implementar sistema de irrigação',
          'Diversificar culturas',
          'Adoptar práticas de conservação do solo'
        ],
        calculated_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // Upsert
      const { data: existing } = await supabase
        .from('insurance_risk_scores')
        .select('id')
        .eq('farmer_id', farmerId)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('insurance_risk_scores')
          .update(scoreData)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('insurance_risk_scores')
          .insert(scoreData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-risk-scores'] });
    }
  });
}

// Credit Dossiers
export function useCreditDossiers(filters?: { status?: string; farmerId?: string }) {
  return useQuery({
    queryKey: ['credit-dossiers', filters],
    queryFn: async () => {
      let query = supabase
        .from('credit_dossiers')
        .select(`
          *,
          farmer:farmers(id, name, registration_number, farmer_type,
            province:provinces(name),
            municipality:municipalities(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.farmerId) {
        query = query.eq('farmer_id', filters.farmerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateCreditDossier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (farmerId: string) => {
      // Fetch all components
      const { data: profile } = await supabase
        .from('farmer_financial_profiles')
        .select('id, credit_score, risk_classification')
        .eq('farmer_id', farmerId)
        .single();

      const { data: simulation } = await supabase
        .from('credit_simulations')
        .select('id, recommended_credit_amount_aoa')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: certificate } = await supabase
        .from('production_history_certificates')
        .select('id')
        .eq('farmer_id', farmerId)
        .eq('status', 'issued')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: insuranceScore } = await supabase
        .from('insurance_risk_scores')
        .select('id')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const dossierNumber = `DDCA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      const dossierData = {
        farmer_id: farmerId,
        dossier_number: dossierNumber,
        financial_profile_id: profile?.id || null,
        simulation_id: simulation?.id || null,
        certificate_id: certificate?.id || null,
        insurance_score_id: insuranceScore?.id || null,
        credit_score: profile?.credit_score || null,
        risk_classification: profile?.risk_classification || null,
        recommended_credit_aoa: simulation?.recommended_credit_amount_aoa || null,
        status: 'draft' as const,
        qr_code_data: dossierNumber,
        verification_url: `/verificar/dossie/${dossierNumber}`,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('credit_dossiers')
        .insert(dossierData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-dossiers'] });
    }
  });
}

// Alternative Guarantees
export function useAlternativeGuarantees(farmerId?: string) {
  return useQuery({
    queryKey: ['alternative-guarantees', farmerId],
    queryFn: async () => {
      let query = supabase
        .from('alternative_guarantees')
        .select('*')
        .order('created_at', { ascending: false });

      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AlternativeGuarantee[];
    }
  });
}

export function useCreateGuarantee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guarantee: Omit<AlternativeGuarantee, 'id' | 'created_at' | 'updated_at' | 'verified_by' | 'verified_at'>) => {
      const { data, error } = await supabase
        .from('alternative_guarantees')
        .insert(guarantee)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alternative-guarantees'] });
    }
  });
}

// Alerts
export function useCreditInsuranceAlerts(filters?: { farmerId?: string; unread?: boolean }) {
  return useQuery({
    queryKey: ['credit-insurance-alerts', filters],
    queryFn: async () => {
      let query = supabase
        .from('credit_insurance_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.farmerId) {
        query = query.eq('farmer_id', filters.farmerId);
      }
      if (filters?.unread) {
        query = query.is('read_at', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CreditInsuranceAlert[];
    }
  });
}

// Dashboard Stats
export function useCreditInsuranceStats() {
  return useQuery({
    queryKey: ['credit-insurance-stats'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('farmer_financial_profiles')
        .select('credit_score, risk_classification, is_credit_eligible, is_insurance_eligible');

      const { data: dossiers } = await supabase
        .from('credit_dossiers')
        .select('status, recommended_credit_aoa');

      const { data: alerts } = await supabase
        .from('credit_insurance_alerts')
        .select('id, read_at')
        .is('read_at', null);

      const totalProfiles = profiles?.length || 0;
      const eligibleForCredit = profiles?.filter(p => p.is_credit_eligible).length || 0;
      const eligibleForInsurance = profiles?.filter(p => p.is_insurance_eligible).length || 0;
      const avgCreditScore = profiles?.length 
        ? Math.round(profiles.reduce((sum, p) => sum + (p.credit_score || 0), 0) / profiles.length)
        : 0;

      const lowRisk = profiles?.filter(p => p.risk_classification === 'low').length || 0;
      const mediumRisk = profiles?.filter(p => p.risk_classification === 'medium').length || 0;
      const highRisk = profiles?.filter(p => p.risk_classification === 'high').length || 0;

      const totalDossiers = dossiers?.length || 0;
      const submittedDossiers = dossiers?.filter(d => d.status === 'submitted').length || 0;
      const approvedDossiers = dossiers?.filter(d => d.status === 'approved').length || 0;
      const totalCreditRecommended = dossiers?.reduce((sum, d) => sum + (d.recommended_credit_aoa || 0), 0) || 0;

      return {
        totalProfiles,
        eligibleForCredit,
        eligibleForInsurance,
        avgCreditScore,
        riskDistribution: { low: lowRisk, medium: mediumRisk, high: highRisk },
        totalDossiers,
        submittedDossiers,
        approvedDossiers,
        totalCreditRecommended,
        unreadAlerts: alerts?.length || 0
      };
    }
  });
}
