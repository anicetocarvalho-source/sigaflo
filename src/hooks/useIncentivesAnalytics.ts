import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IncentivesFinancialKPIs {
  totalInvested: number;
  productiveReturnPerKz: number;
  programsWithPositiveImpact: number;
  totalPrograms: number;
  positiveImpactPercentage: number;
  costPerBeneficiary: number;
  totalBeneficiaries: number;
}

export interface ProgramImpactComparison {
  programId: string;
  programName: string;
  productionBefore: number;
  productionAfter: number;
  productionChange: number;
  priceBefore: number;
  priceAfter: number;
  priceChange: number;
  invested: number;
  returnRatio: number;
}

export interface ProvinceSubsidyDistribution {
  provinceId: string;
  provinceName: string;
  totalAllocated: number;
  totalDisbursed: number;
  beneficiaries: number;
  productionImpact: number;
  programs: number;
}

export interface ProgramRanking {
  id: string;
  code: string;
  name: string;
  sector: string;
  invested: number;
  beneficiaries: number;
  productionIncrease: number;
  returnRatio: number;
  effectivenessScore: number;
}

export interface IncentiveSmartAlert {
  id: string;
  type: 'low_impact' | 'production_deviation' | 'expired_no_evaluation' | 'budget_exceeded' | 'target_missed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  programId?: string;
  programName?: string;
  date: Date;
  metadata?: Record<string, any>;
}

// Financial KPIs Hook
export function useIncentivesFinancialKPIs() {
  return useQuery({
    queryKey: ['incentives-financial-kpis'],
    queryFn: async (): Promise<IncentivesFinancialKPIs> => {
      // Fetch programs
      const { data: programs } = await supabase
        .from('incentive_programs')
        .select('id, budget_aoa, disbursed_aoa, actual_beneficiaries, status');

      // Fetch impacts
      const { data: impacts } = await supabase
        .from('incentive_impacts')
        .select('production_before_kg, production_after_kg, production_change_pct');

      const totalInvested = (programs || []).reduce((sum, p) => sum + (p.disbursed_aoa || 0), 0);
      const totalBeneficiaries = (programs || []).reduce((sum, p) => sum + (p.actual_beneficiaries || 0), 0);

      // Calculate production increase value (estimated)
      const totalProductionIncrease = (impacts || []).reduce((sum, i) => {
        const increase = (i.production_after_kg || 0) - (i.production_before_kg || 0);
        return sum + Math.max(0, increase);
      }, 0);

      // Estimated value per kg (average market price)
      const estimatedValuePerKg = 150; // AOA
      const totalProductionValue = totalProductionIncrease * estimatedValuePerKg;

      const productiveReturnPerKz = totalInvested > 0 
        ? totalProductionValue / totalInvested 
        : 0;

      // Count programs with positive impact
      const programsWithPositiveImpact = (impacts || []).filter(
        i => (i.production_change_pct || 0) > 0
      ).length;

      const totalPrograms = (programs || []).filter(p => p.status !== 'draft').length;
      const positiveImpactPercentage = totalPrograms > 0 
        ? (programsWithPositiveImpact / totalPrograms) * 100 
        : 0;

      const costPerBeneficiary = totalBeneficiaries > 0 
        ? totalInvested / totalBeneficiaries 
        : 0;

      return {
        totalInvested,
        productiveReturnPerKz: Math.round(productiveReturnPerKz * 100) / 100,
        programsWithPositiveImpact,
        totalPrograms,
        positiveImpactPercentage: Math.round(positiveImpactPercentage),
        costPerBeneficiary: Math.round(costPerBeneficiary),
        totalBeneficiaries
      };
    }
  });
}

// Impact Comparison Data Hook
export function useImpactComparisonData() {
  return useQuery({
    queryKey: ['incentives-impact-comparison'],
    queryFn: async (): Promise<ProgramImpactComparison[]> => {
      const { data: programs } = await supabase
        .from('incentive_programs')
        .select('id, code, name, disbursed_aoa')
        .neq('status', 'draft');

      const { data: impacts } = await supabase
        .from('incentive_impacts')
        .select(`
          allocation_id,
          production_before_kg,
          production_after_kg,
          production_change_pct,
          income_before_aoa,
          income_after_aoa
        `);

      const { data: allocations } = await supabase
        .from('incentive_allocations')
        .select('id, program_id, amount_aoa');

      // Group impacts by program
      const programImpacts = new Map<string, {
        productionBefore: number;
        productionAfter: number;
        priceBefore: number;
        priceAfter: number;
        count: number;
      }>();

      (impacts || []).forEach(impact => {
        const allocation = (allocations || []).find(a => a.id === impact.allocation_id);
        if (!allocation) return;

        const programId = allocation.program_id;
        const current = programImpacts.get(programId) || {
          productionBefore: 0,
          productionAfter: 0,
          priceBefore: 0,
          priceAfter: 0,
          count: 0
        };

        programImpacts.set(programId, {
          productionBefore: current.productionBefore + (impact.production_before_kg || 0),
          productionAfter: current.productionAfter + (impact.production_after_kg || 0),
          priceBefore: current.priceBefore + (impact.income_before_aoa || 0),
          priceAfter: current.priceAfter + (impact.income_after_aoa || 0),
          count: current.count + 1
        });
      });

      return (programs || []).map(program => {
        const impact = programImpacts.get(program.id) || {
          productionBefore: 0,
          productionAfter: 0,
          priceBefore: 0,
          priceAfter: 0,
          count: 0
        };

        const productionChange = impact.productionBefore > 0
          ? ((impact.productionAfter - impact.productionBefore) / impact.productionBefore) * 100
          : 0;

        const priceChange = impact.priceBefore > 0
          ? ((impact.priceAfter - impact.priceBefore) / impact.priceBefore) * 100
          : 0;

        const invested = program.disbursed_aoa || 0;
        const productionValue = (impact.productionAfter - impact.productionBefore) * 150; // Estimated value
        const returnRatio = invested > 0 ? productionValue / invested : 0;

        return {
          programId: program.id,
          programName: program.name,
          productionBefore: impact.productionBefore,
          productionAfter: impact.productionAfter,
          productionChange: Math.round(productionChange * 10) / 10,
          priceBefore: impact.priceBefore,
          priceAfter: impact.priceAfter,
          priceChange: Math.round(priceChange * 10) / 10,
          invested,
          returnRatio: Math.round(returnRatio * 100) / 100
        };
      });
    }
  });
}

// Province Subsidy Distribution Hook
export function useProvinceSubsidyDistribution() {
  return useQuery({
    queryKey: ['incentives-province-distribution'],
    queryFn: async (): Promise<ProvinceSubsidyDistribution[]> => {
      const { data: provinces } = await supabase
        .from('provinces')
        .select('id, name');

      const { data: programs } = await supabase
        .from('incentive_programs')
        .select('id, target_provinces, allocated_aoa, disbursed_aoa, actual_beneficiaries');

      const { data: impacts } = await supabase
        .from('incentive_impacts')
        .select('production_change_pct');

      // Aggregate by province (using target_provinces from programs)
      const provinceMap = new Map<string, ProvinceSubsidyDistribution>();

      (provinces || []).forEach(province => {
        provinceMap.set(province.id, {
          provinceId: province.id,
          provinceName: province.name,
          totalAllocated: 0,
          totalDisbursed: 0,
          beneficiaries: 0,
          productionImpact: 0,
          programs: 0
        });
      });

      (programs || []).forEach(program => {
        const targetProvinces = program.target_provinces || [];
        const allocatedPerProvince = (program.allocated_aoa || 0) / Math.max(1, targetProvinces.length);
        const disbursedPerProvince = (program.disbursed_aoa || 0) / Math.max(1, targetProvinces.length);
        const beneficiariesPerProvince = Math.ceil((program.actual_beneficiaries || 0) / Math.max(1, targetProvinces.length));

        targetProvinces.forEach((provinceId: string) => {
          const current = provinceMap.get(provinceId);
          if (current) {
            provinceMap.set(provinceId, {
              ...current,
              totalAllocated: current.totalAllocated + allocatedPerProvince,
              totalDisbursed: current.totalDisbursed + disbursedPerProvince,
              beneficiaries: current.beneficiaries + beneficiariesPerProvince,
              programs: current.programs + 1
            });
          }
        });
      });

      // Add estimated production impact
      const avgProductionChange = (impacts || []).reduce(
        (sum, i) => sum + (i.production_change_pct || 0), 0
      ) / Math.max(1, (impacts || []).length);

      return Array.from(provinceMap.values())
        .map(p => ({
          ...p,
          productionImpact: Math.round(avgProductionChange * (p.beneficiaries > 0 ? 1 : 0))
        }))
        .filter(p => p.totalAllocated > 0 || p.beneficiaries > 0)
        .sort((a, b) => b.totalDisbursed - a.totalDisbursed);
    }
  });
}

// Program Rankings Hook
export function useProgramRankings() {
  return useQuery({
    queryKey: ['incentives-program-rankings'],
    queryFn: async (): Promise<{ mostEffective: ProgramRanking[]; leastEffective: ProgramRanking[] }> => {
      const { data: programs } = await supabase
        .from('incentive_programs')
        .select('id, code, name, sector, budget_aoa, disbursed_aoa, actual_beneficiaries')
        .neq('status', 'draft');

      const { data: impacts } = await supabase
        .from('incentive_impacts')
        .select('allocation_id, production_change_pct');

      const { data: allocations } = await supabase
        .from('incentive_allocations')
        .select('id, program_id');

      // Calculate effectiveness per program
      const rankings: ProgramRanking[] = (programs || []).map(program => {
        const programAllocations = (allocations || []).filter(a => a.program_id === program.id);
        const programImpacts = (impacts || []).filter(i => 
          programAllocations.some(a => a.id === i.allocation_id)
        );

        const avgProductionIncrease = programImpacts.length > 0
          ? programImpacts.reduce((sum, i) => sum + (i.production_change_pct || 0), 0) / programImpacts.length
          : 0;

        const invested = program.disbursed_aoa || 0;
        const returnRatio = invested > 0 && avgProductionIncrease > 0
          ? avgProductionIncrease / (invested / 1000000) // per million Kz
          : 0;

        // Effectiveness score: combination of return ratio, beneficiaries, and production increase
        const effectivenessScore = (
          (avgProductionIncrease * 0.4) +
          (Math.min(100, (program.actual_beneficiaries || 0) / 10) * 0.3) +
          (Math.min(100, returnRatio * 10) * 0.3)
        );

        return {
          id: program.id,
          code: program.code,
          name: program.name,
          sector: program.sector,
          invested,
          beneficiaries: program.actual_beneficiaries || 0,
          productionIncrease: Math.round(avgProductionIncrease * 10) / 10,
          returnRatio: Math.round(returnRatio * 100) / 100,
          effectivenessScore: Math.round(effectivenessScore)
        };
      });

      const sorted = [...rankings].sort((a, b) => b.effectivenessScore - a.effectivenessScore);

      return {
        mostEffective: sorted.slice(0, 5),
        leastEffective: sorted.slice(-5).reverse()
      };
    }
  });
}

// Smart Alerts Hook
export function useIncentivesSmartAlerts() {
  return useQuery({
    queryKey: ['incentives-smart-alerts'],
    queryFn: async (): Promise<IncentiveSmartAlert[]> => {
      const { data: programs } = await supabase
        .from('incentive_programs')
        .select('id, code, name, end_date, budget_aoa, disbursed_aoa, target_beneficiaries, actual_beneficiaries, status');

      const { data: impacts } = await supabase
        .from('incentive_impacts')
        .select('allocation_id, production_change_pct');

      const { data: allocations } = await supabase
        .from('incentive_allocations')
        .select('id, program_id, status');

      const alerts: IncentiveSmartAlert[] = [];
      const now = new Date();

      (programs || []).forEach(program => {
        // Check for low impact programs
        const programAllocations = (allocations || []).filter(a => a.program_id === program.id);
        const programImpacts = (impacts || []).filter(i => 
          programAllocations.some(a => a.id === i.allocation_id)
        );

        if (programImpacts.length > 0) {
          const avgImpact = programImpacts.reduce((sum, i) => sum + (i.production_change_pct || 0), 0) / programImpacts.length;
          
          if (avgImpact < 5) {
            alerts.push({
              id: `low-impact-${program.id}`,
              type: 'low_impact',
              severity: avgImpact < 0 ? 'critical' : 'high',
              title: 'Programa com baixo impacto',
              description: `${program.name} apresenta impacto médio de apenas ${avgImpact.toFixed(1)}% na produção`,
              programId: program.id,
              programName: program.name,
              date: now,
              metadata: { avgImpact }
            });
          }

          // Check for production deviation
          const impactVariance = programImpacts.reduce((sum, i) => 
            sum + Math.pow((i.production_change_pct || 0) - avgImpact, 2), 0
          ) / programImpacts.length;
          
          if (impactVariance > 400) { // High variance
            alerts.push({
              id: `deviation-${program.id}`,
              type: 'production_deviation',
              severity: 'medium',
              title: 'Desvio de padrão produtivo',
              description: `${program.name} apresenta alta variância nos resultados de produção`,
              programId: program.id,
              programName: program.name,
              date: now,
              metadata: { variance: impactVariance }
            });
          }
        }

        // Check for expired programs without evaluation
        if (program.end_date && new Date(program.end_date) < now && program.status === 'active') {
          const hasEvaluation = programImpacts.length > 0;
          if (!hasEvaluation) {
            alerts.push({
              id: `expired-${program.id}`,
              type: 'expired_no_evaluation',
              severity: 'high',
              title: 'Incentivo expirado sem avaliação',
              description: `${program.name} terminou sem registo de avaliação de impacto`,
              programId: program.id,
              programName: program.name,
              date: now
            });
          }
        }

        // Check for budget exceeded
        if (program.disbursed_aoa && program.budget_aoa && program.disbursed_aoa > program.budget_aoa) {
          alerts.push({
            id: `budget-${program.id}`,
            type: 'budget_exceeded',
            severity: 'critical',
            title: 'Orçamento excedido',
            description: `${program.name} ultrapassou o orçamento em ${((program.disbursed_aoa / program.budget_aoa - 1) * 100).toFixed(0)}%`,
            programId: program.id,
            programName: program.name,
            date: now,
            metadata: { 
              budget: program.budget_aoa, 
              disbursed: program.disbursed_aoa 
            }
          });
        }

        // Check for target missed
        if (program.target_beneficiaries && program.actual_beneficiaries) {
          const achievementRate = (program.actual_beneficiaries / program.target_beneficiaries) * 100;
          if (achievementRate < 50 && program.status === 'completed') {
            alerts.push({
              id: `target-${program.id}`,
              type: 'target_missed',
              severity: 'high',
              title: 'Meta de beneficiários não atingida',
              description: `${program.name} atingiu apenas ${achievementRate.toFixed(0)}% dos beneficiários previstos`,
              programId: program.id,
              programName: program.name,
              date: now,
              metadata: { 
                target: program.target_beneficiaries, 
                actual: program.actual_beneficiaries 
              }
            });
          }
        }
      });

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    }
  });
}
