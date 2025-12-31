import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NationalStats {
  // Farmers
  totalFarmers: number;
  totalCooperatives: number;
  totalFieldSchools: number;
  totalCultivatedArea: number;
  
  // Production
  totalProductionRecords: number;
  totalYieldKg: number;
  
  // Rice
  totalRiceImports: number;
  riceImportValue: number;
  averageRicePrice: number;
  
  // Forestry
  totalForestLicenses: number;
  activeForestLicenses: number;
  totalAuthorizedVolume: number;
  totalHarvestedVolume: number;
  pendingInfractions: number;
  totalReforestedArea: number;
  
  // Occurrences
  totalOccurrences: number;
  criticalOccurrences: number;
  totalAffectedFarmers: number;
  totalEstimatedLoss: number;
  
  // Certificates
  totalCertificates: number;
  issuedCertificates: number;
}

export interface ProvinceStats {
  id: string;
  name: string;
  farmers: number;
  cultivatedArea: number;
  productionKg: number;
  occurrences: number;
  riskScore: number;
  forestLicenses: number;
  reforestedArea: number;
}

export interface CompositeIndices {
  foodSovereigntyIndex: number;
  agroClimaticRiskIndex: number;
  forestPressureIndex: number;
  overallHealthIndex: number;
}

export function useNationalStats() {
  return useQuery({
    queryKey: ['onaf-national-stats'],
    queryFn: async (): Promise<NationalStats> => {
      const [
        farmersRes,
        productionRes,
        riceImportsRes,
        ricePricesRes,
        forestLicensesRes,
        forestInfractionsRes,
        reforestationRes,
        occurrencesRes,
        certificatesRes,
      ] = await Promise.all([
        supabase.from('farmers').select('id, farmer_type, cultivated_area_ha', { count: 'exact' }),
        supabase.from('production_history').select('id, actual_yield_kg'),
        supabase.from('rice_imports').select('id, volume_tonnes, total_value_usd'),
        supabase.from('rice_prices').select('retail_price_aoa').order('recorded_date', { ascending: false }).limit(10),
        supabase.from('forest_licenses').select('id, status, authorized_volume_m3, harvested_volume_m3'),
        supabase.from('forest_infractions').select('id, status'),
        supabase.from('forest_reforestation_programs').select('id, planted_area_ha'),
        supabase.from('climate_occurrences').select('id, severity, affected_farmers_count, estimated_loss_aoa'),
        supabase.from('agricultural_certificates').select('id, status'),
      ]);

      const farmers = farmersRes.data || [];
      const production = productionRes.data || [];
      const riceImports = riceImportsRes.data || [];
      const ricePrices = ricePricesRes.data || [];
      const forestLicenses = forestLicensesRes.data || [];
      const infractions = forestInfractionsRes.data || [];
      const reforestation = reforestationRes.data || [];
      const occurrences = occurrencesRes.data || [];
      const certificates = certificatesRes.data || [];

      return {
        totalFarmers: farmers.length,
        totalCooperatives: farmers.filter(f => f.farmer_type === 'cooperative').length,
        totalFieldSchools: farmers.filter(f => f.farmer_type === 'field_school').length,
        totalCultivatedArea: farmers.reduce((sum, f) => sum + (f.cultivated_area_ha || 0), 0),
        
        totalProductionRecords: production.length,
        totalYieldKg: production.reduce((sum, p) => sum + (p.actual_yield_kg || 0), 0),
        
        totalRiceImports: riceImports.reduce((sum, r) => sum + (r.volume_tonnes || 0), 0),
        riceImportValue: riceImports.reduce((sum, r) => sum + (r.total_value_usd || 0), 0),
        averageRicePrice: ricePrices.length > 0 
          ? ricePrices.reduce((sum, p) => sum + p.retail_price_aoa, 0) / ricePrices.length 
          : 0,
        
        totalForestLicenses: forestLicenses.length,
        activeForestLicenses: forestLicenses.filter(l => l.status === 'active' || l.status === 'approved').length,
        totalAuthorizedVolume: forestLicenses.reduce((sum, l) => sum + (l.authorized_volume_m3 || 0), 0),
        totalHarvestedVolume: forestLicenses.reduce((sum, l) => sum + (l.harvested_volume_m3 || 0), 0),
        pendingInfractions: infractions.filter(i => !['closed', 'archived'].includes(i.status)).length,
        totalReforestedArea: reforestation.reduce((sum, r) => sum + (r.planted_area_ha || 0), 0),
        
        totalOccurrences: occurrences.length,
        criticalOccurrences: occurrences.filter(o => o.severity === 'critical').length,
        totalAffectedFarmers: occurrences.reduce((sum, o) => sum + (o.affected_farmers_count || 0), 0),
        totalEstimatedLoss: occurrences.reduce((sum, o) => sum + (o.estimated_loss_aoa || 0), 0),
        
        totalCertificates: certificates.length,
        issuedCertificates: certificates.filter(c => c.status === 'issued').length,
      };
    },
  });
}

export function useProvinceStats() {
  return useQuery({
    queryKey: ['onaf-province-stats'],
    queryFn: async (): Promise<ProvinceStats[]> => {
      const { data: provinces } = await supabase.from('provinces').select('id, name');
      if (!provinces) return [];

      const stats: ProvinceStats[] = [];

      for (const province of provinces) {
        const [farmersRes, productionRes, occurrencesRes, riskRes, forestRes, reforestRes] = await Promise.all([
          supabase.from('farmers').select('id, cultivated_area_ha').eq('province_id', province.id),
          supabase.from('production_history').select('actual_yield_kg, farmer_id').then(async res => {
            if (!res.data) return { data: [] };
            const farmerIds = (await supabase.from('farmers').select('id').eq('province_id', province.id)).data?.map(f => f.id) || [];
            return { data: res.data.filter(p => farmerIds.includes(p.farmer_id)) };
          }),
          supabase.from('climate_occurrences').select('id').eq('province_id', province.id),
          supabase.from('province_risk_metrics').select('risk_score').eq('province_id', province.id).order('year', { ascending: false }).order('month', { ascending: false }).limit(1),
          supabase.from('forest_licenses').select('id').eq('province_id', province.id),
          supabase.from('forest_reforestation_programs').select('planted_area_ha').eq('province_id', province.id),
        ]);

        const farmers = farmersRes.data || [];
        const production = productionRes.data || [];
        const occurrences = occurrencesRes.data || [];
        const riskMetrics = riskRes.data || [];
        const forestLicenses = forestRes.data || [];
        const reforestation = reforestRes.data || [];

        stats.push({
          id: province.id,
          name: province.name,
          farmers: farmers.length,
          cultivatedArea: farmers.reduce((sum, f) => sum + (f.cultivated_area_ha || 0), 0),
          productionKg: production.reduce((sum, p) => sum + (p.actual_yield_kg || 0), 0),
          occurrences: occurrences.length,
          riskScore: riskMetrics[0]?.risk_score || 0,
          forestLicenses: forestLicenses.length,
          reforestedArea: reforestation.reduce((sum, r) => sum + (r.planted_area_ha || 0), 0),
        });
      }

      return stats.sort((a, b) => b.farmers - a.farmers);
    },
  });
}

export function useCompositeIndices(stats: NationalStats | undefined): CompositeIndices {
  if (!stats) {
    return {
      foodSovereigntyIndex: 0,
      agroClimaticRiskIndex: 0,
      forestPressureIndex: 0,
      overallHealthIndex: 0,
    };
  }

  // Food Sovereignty Index (0-100)
  // Based on: local production vs imports, certified production, farmer coverage
  const productionTonnes = stats.totalYieldKg / 1000;
  const importRatio = stats.totalRiceImports > 0 
    ? Math.min(productionTonnes / stats.totalRiceImports, 1) 
    : 1;
  const certificationRatio = stats.totalCertificates > 0 
    ? stats.issuedCertificates / stats.totalCertificates 
    : 0;
  const foodSovereigntyIndex = Math.round((importRatio * 60 + certificationRatio * 40));

  // Agro-Climatic Risk Index (0-100, higher = more risk)
  const occurrenceRatio = stats.totalFarmers > 0 
    ? (stats.totalAffectedFarmers / stats.totalFarmers) * 100 
    : 0;
  const criticalRatio = stats.totalOccurrences > 0 
    ? (stats.criticalOccurrences / stats.totalOccurrences) * 100 
    : 0;
  const agroClimaticRiskIndex = Math.min(100, Math.round(occurrenceRatio * 0.6 + criticalRatio * 0.4));

  // Forest Pressure Index (0-100, higher = more pressure)
  const harvestRatio = stats.totalAuthorizedVolume > 0 
    ? (stats.totalHarvestedVolume / stats.totalAuthorizedVolume) * 100 
    : 0;
  const infractionPressure = stats.totalForestLicenses > 0 
    ? (stats.pendingInfractions / stats.totalForestLicenses) * 50 
    : 0;
  const reforestationOffset = stats.totalReforestedArea > 0 ? 20 : 0;
  const forestPressureIndex = Math.min(100, Math.max(0, Math.round(harvestRatio * 0.5 + infractionPressure - reforestationOffset)));

  // Overall Health Index (0-100)
  const overallHealthIndex = Math.round(
    (foodSovereigntyIndex * 0.4) + 
    ((100 - agroClimaticRiskIndex) * 0.3) + 
    ((100 - forestPressureIndex) * 0.3)
  );

  return {
    foodSovereigntyIndex,
    agroClimaticRiskIndex,
    forestPressureIndex,
    overallHealthIndex,
  };
}

export interface ScenarioResult {
  name: string;
  currentValue: number;
  projectedValue: number;
  impact: number;
  impactType: 'positive' | 'negative' | 'neutral';
  description: string;
}

export function calculateScenario(
  type: 'import_reduction' | 'climate_impact' | 'investment',
  params: Record<string, number>,
  stats: NationalStats
): ScenarioResult[] {
  const results: ScenarioResult[] = [];

  switch (type) {
    case 'import_reduction': {
      const reductionPercent = params.reduction || 20;
      const targetYears = params.years || 5;
      
      const currentImports = stats.totalRiceImports;
      const projectedImports = currentImports * (1 - reductionPercent / 100);
      const requiredProduction = currentImports * (reductionPercent / 100) * 1000; // Convert to kg
      
      results.push({
        name: 'Importações de Arroz',
        currentValue: currentImports,
        projectedValue: projectedImports,
        impact: -reductionPercent,
        impactType: 'positive',
        description: `Redução de ${reductionPercent}% nas importações em ${targetYears} anos`,
      });
      
      results.push({
        name: 'Produção Nacional Necessária',
        currentValue: stats.totalYieldKg / 1000,
        projectedValue: (stats.totalYieldKg / 1000) + (requiredProduction / 1000),
        impact: requiredProduction / 1000,
        impactType: 'neutral',
        description: `Aumento necessário de ${(requiredProduction / 1000).toLocaleString()} toneladas`,
      });
      
      const savingsUSD = (stats.riceImportValue / stats.totalRiceImports) * (currentImports - projectedImports);
      results.push({
        name: 'Poupança em Divisas (USD)',
        currentValue: 0,
        projectedValue: savingsUSD,
        impact: savingsUSD,
        impactType: 'positive',
        description: `Poupança estimada de $${savingsUSD.toLocaleString()}`,
      });
      break;
    }
    
    case 'climate_impact': {
      const severityIncrease = params.severity || 30;
      const affectedAreaIncrease = params.area || 25;
      
      const projectedOccurrences = Math.round(stats.totalOccurrences * (1 + severityIncrease / 100));
      const projectedLoss = stats.totalEstimatedLoss * (1 + affectedAreaIncrease / 100);
      const projectedAffected = Math.round(stats.totalAffectedFarmers * (1 + affectedAreaIncrease / 100));
      
      results.push({
        name: 'Ocorrências Climáticas',
        currentValue: stats.totalOccurrences,
        projectedValue: projectedOccurrences,
        impact: severityIncrease,
        impactType: 'negative',
        description: `Aumento de ${severityIncrease}% nas ocorrências`,
      });
      
      results.push({
        name: 'Agricultores Afectados',
        currentValue: stats.totalAffectedFarmers,
        projectedValue: projectedAffected,
        impact: projectedAffected - stats.totalAffectedFarmers,
        impactType: 'negative',
        description: `+${(projectedAffected - stats.totalAffectedFarmers).toLocaleString()} agricultores em risco`,
      });
      
      results.push({
        name: 'Perdas Estimadas (AOA)',
        currentValue: stats.totalEstimatedLoss,
        projectedValue: projectedLoss,
        impact: projectedLoss - stats.totalEstimatedLoss,
        impactType: 'negative',
        description: `Aumento de ${affectedAreaIncrease}% nas perdas económicas`,
      });
      break;
    }
    
    case 'investment': {
      const investmentAOA = params.investment || 1000000000;
      const focusArea = params.focus || 1; // 1=agriculture, 2=forestry, 3=infrastructure
      
      // ROI estimates based on focus area
      const roiMultipliers = { 1: 2.5, 2: 3.0, 3: 2.0 };
      const roi = roiMultipliers[focusArea as 1 | 2 | 3] || 2.5;
      
      const projectedReturn = investmentAOA * roi;
      const jobsCreated = Math.round(investmentAOA / 500000); // 1 job per 500k AOA
      const farmersSupported = Math.round(investmentAOA / 100000); // Support per 100k AOA
      
      results.push({
        name: 'Retorno Esperado (AOA)',
        currentValue: investmentAOA,
        projectedValue: projectedReturn,
        impact: ((roi - 1) * 100),
        impactType: 'positive',
        description: `ROI de ${((roi - 1) * 100).toFixed(0)}% em 3 anos`,
      });
      
      results.push({
        name: 'Empregos Criados',
        currentValue: 0,
        projectedValue: jobsCreated,
        impact: jobsCreated,
        impactType: 'positive',
        description: `Estimativa de ${jobsCreated.toLocaleString()} novos empregos`,
      });
      
      results.push({
        name: 'Agricultores Beneficiados',
        currentValue: 0,
        projectedValue: farmersSupported,
        impact: farmersSupported,
        impactType: 'positive',
        description: `${farmersSupported.toLocaleString()} agricultores apoiados directamente`,
      });
      break;
    }
  }

  return results;
}

export function calculateCostOfInaction(stats: NationalStats): {
  annualCost: number;
  fiveYearCost: number;
  breakdown: { category: string; cost: number; description: string }[];
} {
  const breakdown = [
    {
      category: 'Importações Evitáveis',
      cost: stats.riceImportValue * 0.3, // 30% could be replaced
      description: 'Custo de importar o que poderia ser produzido localmente',
    },
    {
      category: 'Perdas Climáticas',
      cost: stats.totalEstimatedLoss,
      description: 'Perdas anuais por eventos climáticos',
    },
    {
      category: 'Infrações Florestais',
      cost: stats.pendingInfractions * 500000, // Average fine per infraction
      description: 'Custo das infrações e degradação florestal',
    },
    {
      category: 'Produtividade Perdida',
      cost: stats.totalCultivatedArea * 50000, // Potential gain per ha
      description: 'Ganho potencial com assistência técnica adequada',
    },
  ];

  const annualCost = breakdown.reduce((sum, item) => sum + item.cost, 0);
  const fiveYearCost = annualCost * 5 * 1.1; // 10% compound effect

  return { annualCost, fiveYearCost, breakdown };
}
