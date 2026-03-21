import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClimateRiskKPIs {
  riskIndexByCrop: Array<{
    crop: string;
    riskIndex: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    eventsCount: number;
  }>;
  productiveAreaAtRisk: number;
  activeExtremeEvents: number;
  estimatedEconomicLoss: number;
  totalFarmersAtRisk: number;
  avgRiskIndex: number;
}

export interface ClimateRiskMapData {
  type: 'drought' | 'flood' | 'fire' | 'pest';
  provinces: Array<{
    provinceId: string;
    provinceName: string;
    eventCount: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedArea: number;
    latitude?: number;
    longitude?: number;
  }>;
}

export interface EventFrequencyData {
  year: number;
  drought: number;
  flood: number;
  fire: number;
  pest: number;
  total: number;
}

export interface ClimateProductionImpact {
  period: string;
  eventsCount: number;
  productionKg: number;
  productionChange: number;
  correlationStrength: number;
}

export interface ClimateScenarioSimulation {
  scenario: string;
  description: string;
  probability: number;
  affectedAreaHa: number;
  economicLoss: number;
  farmersAffected: number;
  mitigationCost: number;
  compensationNeeded: number;
}

export interface ClimateSmartAlert {
  id: string;
  type: 'critical_zone' | 'activate_mitigation' | 'compensation_base' | 'trend_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  provinceName?: string;
  cropAffected?: string;
  actionRequired?: string;
  date: Date;
  metadata?: Record<string, any>;
}

// Climate Risk KPIs Hook
export function useClimateRiskKPIs(filters?: { cropType?: string; provinceId?: string }) {
  return useQuery({
    queryKey: ['climate-risk-kpis', filters],
    queryFn: async (): Promise<ClimateRiskKPIs> => {
      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select('occurrence_type, severity, affected_area_ha, affected_farmers_count, estimated_loss_aoa, status');

      const { data: production } = await supabase
        .from('production_history')
        .select('crop_type, area_planted_ha');

      // Calculate risk index by crop
      const cropRiskFactors: Record<string, { events: number; area: number }> = {};
      
      // Get unique crops from production
      (production || []).forEach(p => {
        if (!cropRiskFactors[p.crop_type]) {
          cropRiskFactors[p.crop_type] = { events: 0, area: 0 };
        }
        cropRiskFactors[p.crop_type].area += p.area_planted_ha || 0;
      });

      // Simulated risk based on crop vulnerability
      const cropVulnerability: Record<string, number> = {
        'Milho': 75,
        'Arroz': 85,
        'Feijão': 60,
        'Mandioca': 35,
        'Banana': 55,
        'Café': 45,
        'Soja': 65,
        'Batata': 50,
      };

      const riskIndexByCrop = Object.entries(cropRiskFactors).map(([crop, data]) => {
        const baseRisk = cropVulnerability[crop] || 50;
        const areaFactor = Math.min(data.area / 1000, 1) * 20;
        const riskIndex = Math.min(100, baseRisk + areaFactor);
        
        return {
          crop,
          riskIndex: Math.round(riskIndex),
          riskLevel: riskIndex >= 75 ? 'critical' as const : 
                     riskIndex >= 50 ? 'high' as const : 
                     riskIndex >= 25 ? 'medium' as const : 'low' as const,
          eventsCount: Math.round(riskIndex / 10)
        };
      }).sort((a, b) => b.riskIndex - a.riskIndex);

      const activeEvents = (occurrences || []).filter(o => 
        o.status === 'reported' || o.status === 'investigating' || o.status === 'confirmed'
      );

      const extremeEvents = activeEvents.filter(o => 
        o.severity === 'critico' || o.severity === 'alto'
      );

      const productiveAreaAtRisk = (occurrences || []).reduce(
        (sum, o) => sum + (o.affected_area_ha || 0), 0
      );

      const estimatedEconomicLoss = (occurrences || []).reduce(
        (sum, o) => sum + (o.estimated_loss_aoa || 0), 0
      );

      const totalFarmersAtRisk = (occurrences || []).reduce(
        (sum, o) => sum + (o.affected_farmers_count || 0), 0
      );

      const avgRiskIndex = riskIndexByCrop.length > 0
        ? Math.round(riskIndexByCrop.reduce((sum, c) => sum + c.riskIndex, 0) / riskIndexByCrop.length)
        : 0;

      return {
        riskIndexByCrop,
        productiveAreaAtRisk,
        activeExtremeEvents: extremeEvents.length,
        estimatedEconomicLoss,
        totalFarmersAtRisk,
        avgRiskIndex
      };
    }
  });
}

// Risk Map Data Hook
export function useClimateRiskMapData(eventType?: string) {
  return useQuery({
    queryKey: ['climate-risk-map', eventType],
    queryFn: async (): Promise<ClimateRiskMapData[]> => {
      const { data: provinces } = await supabase
        .from('provinces')
        .select('id, name');

      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select('province_id, occurrence_type, severity, affected_area_ha, latitude, longitude');

      const eventTypes: Array<'drought' | 'flood' | 'fire' | 'pest'> = ['drought', 'flood', 'fire', 'pest'];
      
      const eventTypeMapping: Record<string, 'drought' | 'flood' | 'fire' | 'pest'> = {
        'seca': 'drought',
        'inundacao': 'flood',
        'incendio': 'fire',
        'pragas': 'pest',
        'doenca': 'pest'
      };

      const result = eventTypes.map(type => {
        const typeOccurrences = (occurrences || []).filter(o => 
          eventTypeMapping[o.occurrence_type] === type
        );

        const provinceData = (provinces || []).map(province => {
          const provinceOccurrences = typeOccurrences.filter(o => o.province_id === province.id);
          const totalArea = provinceOccurrences.reduce((sum, o) => sum + (o.affected_area_ha || 0), 0);
          const highSeverityCount = provinceOccurrences.filter(o => 
            o.severity === 'critico' || o.severity === 'alto'
          ).length;

          let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (highSeverityCount > 2) severity = 'critical';
          else if (highSeverityCount > 0 || provinceOccurrences.length > 3) severity = 'high';
          else if (provinceOccurrences.length > 1) severity = 'medium';

          const lastOccurrence = provinceOccurrences[0];

          return {
            provinceId: province.id,
            provinceName: province.name,
            eventCount: provinceOccurrences.length,
            severity,
            affectedArea: totalArea,
            latitude: lastOccurrence?.latitude || undefined,
            longitude: lastOccurrence?.longitude || undefined
          };
        }).filter(p => p.eventCount > 0);

        return {
          type,
          provinces: provinceData
        };
      });

      // Check if we have any data, if not return test data
      const hasData = result.some(r => r.provinces.length > 0);
      
      if (!hasData) {
        // Return test data for demonstration
        const testProvinces = [
          { name: 'Luanda', id: 'luanda' },
          { name: 'Benguela', id: 'benguela' },
          { name: 'Huambo', id: 'huambo' },
          { name: 'Huíla', id: 'huila' },
          { name: 'Cuanza Sul', id: 'cuanza-sul' },
          { name: 'Malanje', id: 'malanje' },
          { name: 'Uíge', id: 'uige' },
          { name: 'Bié', id: 'bie' },
          { name: 'Moxico', id: 'moxico' },
          { name: 'Cuando Cubango', id: 'cuando-cubango' },
        ];

        return [
          {
            type: 'drought' as const,
            provinces: [
              { provinceId: 'huila', provinceName: 'Huíla', eventCount: 5, severity: 'critical' as const, affectedArea: 15200 },
              { provinceId: 'cuando-cubango', provinceName: 'Cuando Cubango', eventCount: 4, severity: 'critical' as const, affectedArea: 12800 },
              { provinceId: 'benguela', provinceName: 'Benguela', eventCount: 3, severity: 'high' as const, affectedArea: 8500 },
              { provinceId: 'huambo', provinceName: 'Huambo', eventCount: 2, severity: 'medium' as const, affectedArea: 4200 },
              { provinceId: 'bie', provinceName: 'Bié', eventCount: 2, severity: 'medium' as const, affectedArea: 3800 },
            ]
          },
          {
            type: 'flood' as const,
            provinces: [
              { provinceId: 'luanda', provinceName: 'Luanda', eventCount: 4, severity: 'high' as const, affectedArea: 6200 },
              { provinceId: 'cuanza-sul', provinceName: 'Cuanza Sul', eventCount: 3, severity: 'high' as const, affectedArea: 5400 },
              { provinceId: 'malanje', provinceName: 'Malanje', eventCount: 3, severity: 'medium' as const, affectedArea: 4100 },
              { provinceId: 'uige', provinceName: 'Uíge', eventCount: 2, severity: 'medium' as const, affectedArea: 2800 },
            ]
          },
          {
            type: 'fire' as const,
            provinces: [
              { provinceId: 'moxico', provinceName: 'Moxico', eventCount: 3, severity: 'critical' as const, affectedArea: 9500 },
              { provinceId: 'cuando-cubango', provinceName: 'Cuando Cubango', eventCount: 2, severity: 'high' as const, affectedArea: 5800 },
              { provinceId: 'bie', provinceName: 'Bié', eventCount: 2, severity: 'medium' as const, affectedArea: 3200 },
            ]
          },
          {
            type: 'pest' as const,
            provinces: [
              { provinceId: 'huambo', provinceName: 'Huambo', eventCount: 4, severity: 'high' as const, affectedArea: 7600 },
              { provinceId: 'benguela', provinceName: 'Benguela', eventCount: 3, severity: 'high' as const, affectedArea: 5200 },
              { provinceId: 'huila', provinceName: 'Huíla', eventCount: 2, severity: 'medium' as const, affectedArea: 3400 },
              { provinceId: 'cuanza-sul', provinceName: 'Cuanza Sul', eventCount: 2, severity: 'medium' as const, affectedArea: 2900 },
              { provinceId: 'malanje', provinceName: 'Malanje', eventCount: 1, severity: 'low' as const, affectedArea: 1200 },
            ]
          }
        ];
      }

      return result;
    }
  });
}

// Event Frequency Hook
export function useEventFrequencyData() {
  return useQuery({
    queryKey: ['climate-event-frequency'],
    queryFn: async (): Promise<EventFrequencyData[]> => {
      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select('report_date, occurrence_type');

      const eventTypeMapping: Record<string, 'drought' | 'flood' | 'fire' | 'pest'> = {
        'seca': 'drought',
        'inundacao': 'flood',
        'incendio': 'fire',
        'pragas': 'pest',
        'doenca': 'pest'
      };

      const yearlyData: Record<number, EventFrequencyData> = {};

      (occurrences || []).forEach(o => {
        const year = new Date(o.report_date).getFullYear();
        if (!yearlyData[year]) {
          yearlyData[year] = { year, drought: 0, flood: 0, fire: 0, pest: 0, total: 0 };
        }
        const type = eventTypeMapping[o.occurrence_type] || 'pest';
        yearlyData[year][type]++;
        yearlyData[year].total++;
      });

      // Only include years with real data - no simulated data

      return Object.values(yearlyData).sort((a, b) => a.year - b.year);
    }
  });
}

// Climate Production Impact Hook
export function useClimateProductionImpact() {
  return useQuery({
    queryKey: ['climate-production-impact'],
    queryFn: async (): Promise<ClimateProductionImpact[]> => {
      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select('report_date, severity');

      const { data: production } = await supabase
        .from('production_history')
        .select('harvest_date, actual_yield_kg');

      // Group by quarter
      const quarterlyData: Record<string, { events: number; production: number; severitySum: number }> = {};

      (occurrences || []).forEach(o => {
        const date = new Date(o.report_date);
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        const key = `${date.getFullYear()}-Q${quarter}`;
        
        if (!quarterlyData[key]) {
          quarterlyData[key] = { events: 0, production: 0, severitySum: 0 };
        }
        quarterlyData[key].events++;
        quarterlyData[key].severitySum += o.severity === 'critico' ? 4 : 
                                          o.severity === 'alto' ? 3 : 
                                          o.severity === 'medio' ? 2 : 1;
      });

      (production || []).forEach(p => {
        if (p.harvest_date) {
          const date = new Date(p.harvest_date);
          const quarter = Math.ceil((date.getMonth() + 1) / 3);
          const key = `${date.getFullYear()}-Q${quarter}`;
          
          if (!quarterlyData[key]) {
            quarterlyData[key] = { events: 0, production: 0, severitySum: 0 };
          }
          quarterlyData[key].production += p.actual_yield_kg || 0;
        }
      });

      const sortedEntries = Object.entries(quarterlyData).sort((a, b) => a[0].localeCompare(b[0]));
      
      return sortedEntries.map(([period, data], index) => {
        const prevProduction = index > 0 ? sortedEntries[index - 1][1].production : data.production;
        const productionChange = prevProduction > 0 
          ? ((data.production - prevProduction) / prevProduction) * 100 
          : 0;

        // Negative correlation: more events = lower production
        const correlationStrength = data.events > 0 && data.production > 0
          ? Math.min(100, data.events * 15)
          : 0;

        return {
          period,
          eventsCount: data.events,
          productionKg: data.production,
          productionChange: Math.round(productionChange),
          correlationStrength
        };
      });
    }
  });
}

// Scenario Simulations Hook
export function useClimateScenarioSimulations() {
  return useQuery({
    queryKey: ['climate-scenario-simulations'],
    queryFn: async (): Promise<ClimateScenarioSimulation[]> => {
      const { data: stats } = await supabase
        .from('climate_occurrences')
        .select('affected_area_ha, affected_farmers_count, estimated_loss_aoa');

      const baseArea = (stats || []).reduce((sum, s) => sum + (s.affected_area_ha || 0), 0) || 10000;
      const baseFarmers = (stats || []).reduce((sum, s) => sum + (s.affected_farmers_count || 0), 0) || 500;
      const baseLoss = (stats || []).reduce((sum, s) => sum + (s.estimated_loss_aoa || 0), 0) || 50000000;

      return [
        {
          scenario: 'Seca Severa',
          description: 'Período prolongado sem chuva (>3 meses) afectando culturas de sequeiro',
          probability: 0.25,
          affectedAreaHa: Math.round(baseArea * 1.8),
          economicLoss: Math.round(baseLoss * 2.2),
          farmersAffected: Math.round(baseFarmers * 1.5),
          mitigationCost: Math.round(baseLoss * 0.15),
          compensationNeeded: Math.round(baseLoss * 1.2)
        },
        {
          scenario: 'Cheias Moderadas',
          description: 'Inundações em zonas ribeirinhas durante época das chuvas',
          probability: 0.35,
          affectedAreaHa: Math.round(baseArea * 1.2),
          economicLoss: Math.round(baseLoss * 1.4),
          farmersAffected: Math.round(baseFarmers * 0.8),
          mitigationCost: Math.round(baseLoss * 0.1),
          compensationNeeded: Math.round(baseLoss * 0.7)
        },
        {
          scenario: 'Pragas Generalizadas',
          description: 'Infestação de pragas afectando múltiplas culturas',
          probability: 0.20,
          affectedAreaHa: Math.round(baseArea * 1.5),
          economicLoss: Math.round(baseLoss * 1.6),
          farmersAffected: Math.round(baseFarmers * 1.2),
          mitigationCost: Math.round(baseLoss * 0.2),
          compensationNeeded: Math.round(baseLoss * 0.9)
        },
        {
          scenario: 'Cenário Combinado',
          description: 'Múltiplos eventos climáticos em sequência',
          probability: 0.10,
          affectedAreaHa: Math.round(baseArea * 2.5),
          economicLoss: Math.round(baseLoss * 3.5),
          farmersAffected: Math.round(baseFarmers * 2),
          mitigationCost: Math.round(baseLoss * 0.35),
          compensationNeeded: Math.round(baseLoss * 2)
        },
        {
          scenario: 'Cenário Optimista',
          description: 'Condições climáticas favoráveis com eventos mínimos',
          probability: 0.10,
          affectedAreaHa: Math.round(baseArea * 0.3),
          economicLoss: Math.round(baseLoss * 0.2),
          farmersAffected: Math.round(baseFarmers * 0.2),
          mitigationCost: Math.round(baseLoss * 0.02),
          compensationNeeded: Math.round(baseLoss * 0.1)
        }
      ];
    }
  });
}

// Smart Alerts Hook
export function useClimateSmartAlerts() {
  return useQuery({
    queryKey: ['climate-smart-alerts'],
    queryFn: async (): Promise<ClimateSmartAlert[]> => {
      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select(`
          id, 
          title,
          occurrence_type, 
          severity, 
          status,
          affected_area_ha,
          estimated_loss_aoa,
          province:provinces(name)
        `)
        .in('status', ['reported', 'investigating', 'confirmed'])
        .order('report_date', { ascending: false })
        .limit(20);

      const alerts: ClimateSmartAlert[] = [];
      const now = new Date();

      (occurrences || []).forEach(o => {
        const provinceName = (o.province as any)?.name || 'Desconhecida';
        
        // Critical zone alert
        if (o.severity === 'critico' || o.severity === 'alto') {
          alerts.push({
            id: `critical-${o.id}`,
            type: 'critical_zone',
            severity: o.severity === 'critico' ? 'critical' : 'high',
            title: 'Zona crítica detectada',
            description: `${o.title} em ${provinceName} - ${(o.affected_area_ha || 0).toLocaleString()} ha afectados`,
            provinceName,
            actionRequired: 'Verificação imediata necessária',
            date: now,
            metadata: { occurrenceId: o.id }
          });
        }

        // Mitigation activation alert
        if ((o.affected_area_ha || 0) > 1000) {
          alerts.push({
            id: `mitigation-${o.id}`,
            type: 'activate_mitigation',
            severity: 'high',
            title: 'Activar plano de mitigação',
            description: `Área afectada em ${provinceName} excede limiar crítico de 1.000 ha`,
            provinceName,
            actionRequired: 'Coordenar com Protecção Civil',
            date: now,
            metadata: { area: o.affected_area_ha }
          });
        }

        // Compensation/insurance base alert
        if ((o.estimated_loss_aoa || 0) > 10000000) {
          alerts.push({
            id: `compensation-${o.id}`,
            type: 'compensation_base',
            severity: 'medium',
            title: 'Base para compensação/seguro',
            description: `Perdas estimadas de ${((o.estimated_loss_aoa || 0) / 1000000).toFixed(1)}M Kz em ${provinceName}`,
            provinceName,
            actionRequired: 'Preparar documentação para seguradoras',
            date: now,
            metadata: { loss: o.estimated_loss_aoa }
          });
        }
      });

      // Add trend warning if multiple events
      const criticalCount = (occurrences || []).filter(o => 
        o.severity === 'critico' || o.severity === 'alto'
      ).length;

      if (criticalCount >= 3) {
        alerts.push({
          id: 'trend-warning',
          type: 'trend_warning',
          severity: 'critical',
          title: 'Tendência de risco elevada',
          description: `${criticalCount} eventos críticos activos - padrão anormal detectado`,
          actionRequired: 'Reunião de coordenação urgente recomendada',
          date: now,
          metadata: { count: criticalCount }
        });
      }

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    }
  });
}
