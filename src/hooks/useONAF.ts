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
  nationalRiceProduction: number;
  
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
  latitude?: number;
  longitude?: number;
}

export interface CompositeIndices {
  foodSovereigntyIndex: number;
  agroClimaticRiskIndex: number;
  forestPressureIndex: number;
  overallHealthIndex: number;
  productionVsImportsRatio: number;
  foodDeficitTonnes: number;
  forestPressureVsReplenishment: number;
}

export interface PredictiveAlert {
  id: string;
  type: 'food_deficit' | 'import_surge' | 'production_low' | 'climate_risk' | 'forest_pressure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  projectedImpact: number;
  timeframe: '30d' | '60d' | '90d';
  affectedProvinces?: string[];
  recommendedActions: string[];
}

export interface ScenarioProjection {
  name: string;
  current: number;
  optimistic: number;
  critical: number;
  unit: string;
}

export interface TimelineEvent {
  date: string;
  type: 'food' | 'climate' | 'economic';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  projectedImpact: string;
  probability: number;
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
        riceProductionRes,
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
        supabase.from('rice_production').select('id, production_tonnes'),
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
      const riceProduction = riceProductionRes.data || [];
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
        nationalRiceProduction: riceProduction.reduce((sum, r) => sum + (r.production_tonnes || 0), 0),
        
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

      // Province coordinates for map
      const provinceCoords: Record<string, { lat: number; lng: number }> = {
        'Bengo': { lat: -8.8383, lng: 13.7378 },
        'Benguela': { lat: -12.5763, lng: 13.4055 },
        'Bié': { lat: -12.3733, lng: 17.6633 },
        'Cabinda': { lat: -5.5500, lng: 12.2000 },
        'Cuando Cubango': { lat: -16.0000, lng: 18.5000 },
        'Cuanza Norte': { lat: -9.1500, lng: 15.1167 },
        'Cuanza Sul': { lat: -10.8667, lng: 15.0333 },
        'Cunene': { lat: -16.8833, lng: 15.8833 },
        'Huambo': { lat: -12.7761, lng: 15.7392 },
        'Huíla': { lat: -14.9167, lng: 13.5000 },
        'Luanda': { lat: -8.8383, lng: 13.2344 },
        'Lunda Norte': { lat: -8.4167, lng: 19.1833 },
        'Lunda Sul': { lat: -10.5333, lng: 20.4000 },
        'Malanje': { lat: -9.5402, lng: 16.3411 },
        'Moxico': { lat: -13.4167, lng: 21.4333 },
        'Namibe': { lat: -15.1961, lng: 12.1522 },
        'Uíge': { lat: -7.6167, lng: 15.0500 },
        'Zaire': { lat: -6.2667, lng: 14.2333 },
      };

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

        const coords = provinceCoords[province.name] || { lat: -12.0, lng: 18.0 };

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
          latitude: coords.lat,
          longitude: coords.lng,
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
      productionVsImportsRatio: 0,
      foodDeficitTonnes: 0,
      forestPressureVsReplenishment: 0,
    };
  }

  // Food Sovereignty Index (0-100)
  const productionTonnes = (stats.totalYieldKg / 1000) + stats.nationalRiceProduction;
  const totalConsumption = productionTonnes + stats.totalRiceImports;
  const importRatio = totalConsumption > 0 
    ? Math.min(productionTonnes / totalConsumption, 1) 
    : 1;
  const certificationRatio = stats.totalCertificates > 0 
    ? stats.issuedCertificates / stats.totalCertificates 
    : 0;
  const foodSovereigntyIndex = Math.round((importRatio * 70 + certificationRatio * 30));

  // Production vs Imports ratio
  const productionVsImportsRatio = stats.totalRiceImports > 0 
    ? Math.round((productionTonnes / stats.totalRiceImports) * 100) 
    : 100;

  // Food Deficit (estimated)
  const estimatedDemand = stats.totalFarmers * 0.5; // 500kg per farmer family estimated
  const foodDeficitTonnes = Math.max(0, (estimatedDemand + stats.totalRiceImports) - productionTonnes);

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

  // Forest Pressure vs Replenishment
  const forestPressureVsReplenishment = stats.totalReforestedArea > 0 && stats.totalHarvestedVolume > 0
    ? Math.round((stats.totalReforestedArea / (stats.totalHarvestedVolume / 100)) * 100)
    : 0;

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
    productionVsImportsRatio,
    foodDeficitTonnes,
    forestPressureVsReplenishment,
  };
}

export function usePredictiveAlerts(stats: NationalStats | undefined, indices: CompositeIndices): PredictiveAlert[] {
  if (!stats) return [];

  const alerts: PredictiveAlert[] = [];

  // Food deficit alert
  if (indices.foodDeficitTonnes > 10000) {
    alerts.push({
      id: 'food-deficit-critical',
      type: 'food_deficit',
      severity: indices.foodDeficitTonnes > 50000 ? 'critical' : 'high',
      title: 'Défice alimentar crítico projectado',
      description: `Défice estimado de ${indices.foodDeficitTonnes.toLocaleString()} toneladas para os próximos 90 dias`,
      projectedImpact: indices.foodDeficitTonnes * 500, // Cost per tonne
      timeframe: '90d',
      recommendedActions: [
        'Acelerar importações estratégicas',
        'Activar reservas de emergência',
        'Coordenar com doadores internacionais',
      ],
    });
  }

  // Import surge alert
  if (indices.productionVsImportsRatio < 50) {
    alerts.push({
      id: 'import-surge',
      type: 'import_surge',
      severity: indices.productionVsImportsRatio < 30 ? 'critical' : 'high',
      title: 'Importações acima do padrão histórico',
      description: `Produção nacional representa apenas ${indices.productionVsImportsRatio}% das importações`,
      projectedImpact: stats.riceImportValue,
      timeframe: '30d',
      recommendedActions: [
        'Avaliar viabilidade de substituição de importações',
        'Negociar acordos preferenciais',
        'Incentivar produção local',
      ],
    });
  }

  // Production low alert
  if (indices.foodSovereigntyIndex < 40) {
    alerts.push({
      id: 'production-low',
      type: 'production_low',
      severity: indices.foodSovereigntyIndex < 25 ? 'critical' : 'high',
      title: 'Produção abaixo do limiar estratégico',
      description: `Índice de soberania alimentar em ${indices.foodSovereigntyIndex}%`,
      projectedImpact: stats.totalEstimatedLoss,
      timeframe: '60d',
      recommendedActions: [
        'Expandir áreas de cultivo',
        'Distribuir sementes melhoradas',
        'Intensificar assistência técnica',
      ],
    });
  }

  // Climate risk alert
  if (indices.agroClimaticRiskIndex > 50) {
    alerts.push({
      id: 'climate-risk',
      type: 'climate_risk',
      severity: indices.agroClimaticRiskIndex > 70 ? 'critical' : 'high',
      title: 'Risco climático elevado',
      description: `${stats.criticalOccurrences} ocorrências críticas activas afectando ${stats.totalAffectedFarmers} agricultores`,
      projectedImpact: stats.totalEstimatedLoss,
      timeframe: '30d',
      recommendedActions: [
        'Activar plano de contingência climática',
        'Mobilizar equipas de resposta rápida',
        'Preparar ajuda de emergência',
      ],
    });
  }

  // Forest pressure alert
  if (indices.forestPressureIndex > 60) {
    alerts.push({
      id: 'forest-pressure',
      type: 'forest_pressure',
      severity: indices.forestPressureIndex > 80 ? 'critical' : 'high',
      title: 'Pressão florestal excessiva',
      description: `${stats.pendingInfractions} infracções pendentes, taxa de reflorestamento insuficiente`,
      projectedImpact: stats.pendingInfractions * 500000,
      timeframe: '60d',
      recommendedActions: [
        'Intensificar fiscalização',
        'Acelerar programas de reflorestamento',
        'Suspender novas licenças em zonas críticas',
      ],
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function useScenarioProjections(stats: NationalStats | undefined): ScenarioProjection[] {
  if (!stats) return [];

  const productionTonnes = (stats.totalYieldKg / 1000) + stats.nationalRiceProduction;

  return [
    {
      name: 'Produção Nacional',
      current: productionTonnes,
      optimistic: productionTonnes * 1.35,
      critical: productionTonnes * 0.65,
      unit: 'toneladas',
    },
    {
      name: 'Importações',
      current: stats.totalRiceImports,
      optimistic: stats.totalRiceImports * 0.7,
      critical: stats.totalRiceImports * 1.5,
      unit: 'toneladas',
    },
    {
      name: 'Custo Importações',
      current: stats.riceImportValue,
      optimistic: stats.riceImportValue * 0.6,
      critical: stats.riceImportValue * 1.8,
      unit: 'USD',
    },
    {
      name: 'Agricultores Afectados',
      current: stats.totalAffectedFarmers,
      optimistic: Math.round(stats.totalAffectedFarmers * 0.4),
      critical: Math.round(stats.totalAffectedFarmers * 2.2),
      unit: 'agricultores',
    },
    {
      name: 'Área Reflorestada',
      current: stats.totalReforestedArea,
      optimistic: stats.totalReforestedArea * 2.5,
      critical: stats.totalReforestedArea * 0.5,
      unit: 'hectares',
    },
  ];
}

export function useTimelineProjections(stats: NationalStats | undefined): TimelineEvent[] {
  if (!stats) return [];

  const today = new Date();
  const events: TimelineEvent[] = [];

  // 30-day projections
  const date30 = new Date(today);
  date30.setDate(date30.getDate() + 30);

  if (stats.criticalOccurrences > 3) {
    events.push({
      date: date30.toISOString(),
      type: 'climate',
      severity: 'high',
      title: 'Pico de risco climático esperado',
      projectedImpact: `${Math.round(stats.totalAffectedFarmers * 1.3)} agricultores potencialmente afectados`,
      probability: 0.72,
    });
  }

  // 60-day projections
  const date60 = new Date(today);
  date60.setDate(date60.getDate() + 60);

  if (stats.totalRiceImports > stats.totalYieldKg / 1000) {
    events.push({
      date: date60.toISOString(),
      type: 'food',
      severity: 'critical',
      title: 'Défice alimentar projectado',
      projectedImpact: `${Math.round(stats.totalRiceImports * 0.3)} toneladas de défice`,
      probability: 0.65,
    });
  }

  events.push({
    date: date60.toISOString(),
    type: 'economic',
    severity: 'medium',
    title: 'Pressão sobre divisas',
    projectedImpact: `$${Math.round(stats.riceImportValue * 0.15).toLocaleString()} em importações adicionais`,
    probability: 0.58,
  });

  // 90-day projections
  const date90 = new Date(today);
  date90.setDate(date90.getDate() + 90);

  events.push({
    date: date90.toISOString(),
    type: 'food',
    severity: stats.totalAffectedFarmers > 1000 ? 'high' : 'medium',
    title: 'Projecção de colheita',
    projectedImpact: `Produção estimada: ${Math.round((stats.totalYieldKg / 1000) * 0.9).toLocaleString()} toneladas`,
    probability: 0.80,
  });

  if (stats.pendingInfractions > 10) {
    events.push({
      date: date90.toISOString(),
      type: 'climate',
      severity: 'high',
      title: 'Degradação florestal acumulada',
      projectedImpact: `${stats.pendingInfractions * 50} hectares em risco`,
      probability: 0.68,
    });
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
      const requiredProduction = currentImports * (reductionPercent / 100) * 1000;
      
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
      
      const savingsUSD = stats.totalRiceImports > 0 
        ? (stats.riceImportValue / stats.totalRiceImports) * (currentImports - projectedImports)
        : 0;
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
      const focusArea = params.focus || 1;
      
      const roiMultipliers = { 1: 2.5, 2: 3.0, 3: 2.0 };
      const roi = roiMultipliers[focusArea as 1 | 2 | 3] || 2.5;
      
      const projectedReturn = investmentAOA * roi;
      const jobsCreated = Math.round(investmentAOA / 500000);
      const farmersSupported = Math.round(investmentAOA / 100000);
      
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
  costUSD: number;
  breakdown: { category: string; cost: number; description: string }[];
} {
  const exchangeRate = 830; // AOA to USD

  const breakdown = [
    {
      category: 'Importações Evitáveis',
      cost: stats.riceImportValue * exchangeRate * 0.3,
      description: 'Custo de importar o que poderia ser produzido localmente',
    },
    {
      category: 'Perdas Climáticas',
      cost: stats.totalEstimatedLoss,
      description: 'Perdas anuais por eventos climáticos',
    },
    {
      category: 'Infrações Florestais',
      cost: stats.pendingInfractions * 500000,
      description: 'Custo das infrações e degradação florestal',
    },
    {
      category: 'Produtividade Perdida',
      cost: stats.totalCultivatedArea * 50000,
      description: 'Ganho potencial com assistência técnica adequada',
    },
  ];

  const annualCost = breakdown.reduce((sum, item) => sum + item.cost, 0);
  const fiveYearCost = annualCost * 5 * 1.1;
  const costUSD = annualCost / exchangeRate;

  return { annualCost, fiveYearCost, costUSD, breakdown };
}
