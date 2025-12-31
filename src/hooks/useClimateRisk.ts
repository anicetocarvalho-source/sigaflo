import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClimateEvent {
  id: string;
  title: string;
  occurrence_type: string;
  severity: string;
  report_date: string;
  province_name: string;
  municipality_name: string;
  affected_area_ha: number | null;
  affected_farmers_count: number | null;
  estimated_loss_aoa: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface CropRiskProfile {
  crop: string;
  total_area_ha: number;
  total_production_kg: number;
  events_count: number;
  total_loss_aoa: number;
  avg_loss_per_event: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProvinceRiskProfile {
  province_id: string;
  province_name: string;
  events_count: number;
  total_affected_area_ha: number;
  total_loss_aoa: number;
  farmers_affected: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  dominant_event_type: string;
}

export interface ClimateProductionCorrelation {
  year: number;
  month: number;
  events_count: number;
  production_kg: number;
  avg_severity: number;
}

export interface LossSimulation {
  scenario: string;
  probability: number;
  affected_area_ha: number;
  affected_farmers: number;
  estimated_loss_aoa: number;
  crops_affected: string[];
}

export interface InsuranceEvidence {
  id: string;
  farmer_name: string;
  farmer_id: string;
  event_date: string;
  event_type: string;
  severity: string;
  affected_area_ha: number;
  crop_type: string;
  estimated_loss_aoa: number;
  production_before_kg: number | null;
  production_after_kg: number | null;
  evidence_status: 'pending' | 'validated' | 'submitted' | 'approved' | 'rejected';
}

export interface ClimateRiskStats {
  total_events: number;
  events_this_year: number;
  total_loss_aoa: number;
  total_affected_area_ha: number;
  total_affected_farmers: number;
  high_risk_provinces: number;
  pending_compensations: number;
  avg_monthly_events: number;
}

function calculateRiskScore(eventsCount: number, totalLoss: number, affectedArea: number): number {
  const eventWeight = Math.min(eventsCount * 10, 40);
  const lossWeight = Math.min((totalLoss / 10000000) * 30, 30);
  const areaWeight = Math.min((affectedArea / 1000) * 30, 30);
  return Math.round(eventWeight + lossWeight + areaWeight);
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function useClimateEvents(filters?: { 
  provinceId?: string; 
  severity?: string; 
  eventType?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['climate-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('climate_occurrences')
        .select(`
          id,
          title,
          occurrence_type,
          severity,
          report_date,
          affected_area_ha,
          affected_farmers_count,
          estimated_loss_aoa,
          latitude,
          longitude,
          province:provinces(name),
          municipality:municipalities(name)
        `)
        .order('report_date', { ascending: false });

      if (filters?.provinceId) {
        query = query.eq('province_id', filters.provinceId);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.eventType) {
        query = query.eq('occurrence_type', filters.eventType);
      }
      if (filters?.startDate) {
        query = query.gte('report_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('report_date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(event => ({
        id: event.id,
        title: event.title,
        occurrence_type: event.occurrence_type,
        severity: event.severity,
        report_date: event.report_date,
        province_name: (event.province as any)?.name || 'N/A',
        municipality_name: (event.municipality as any)?.name || 'N/A',
        affected_area_ha: event.affected_area_ha,
        affected_farmers_count: event.affected_farmers_count,
        estimated_loss_aoa: event.estimated_loss_aoa,
        latitude: event.latitude,
        longitude: event.longitude,
      })) as ClimateEvent[];
    },
  });
}

export function useProvinceRiskProfiles() {
  return useQuery({
    queryKey: ['province-risk-profiles'],
    queryFn: async () => {
      const { data: provinces } = await supabase
        .from('provinces')
        .select('id, name');

      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select('province_id, occurrence_type, affected_area_ha, affected_farmers_count, estimated_loss_aoa, severity');

      if (!provinces) return [];

      const profiles: ProvinceRiskProfile[] = provinces.map(province => {
        const provinceOccurrences = (occurrences || []).filter(o => o.province_id === province.id);
        const totalLoss = provinceOccurrences.reduce((sum, o) => sum + (o.estimated_loss_aoa || 0), 0);
        const totalArea = provinceOccurrences.reduce((sum, o) => sum + (o.affected_area_ha || 0), 0);
        const totalFarmers = provinceOccurrences.reduce((sum, o) => sum + (o.affected_farmers_count || 0), 0);

        // Find dominant event type
        const eventCounts: Record<string, number> = {};
        provinceOccurrences.forEach(o => {
          eventCounts[o.occurrence_type] = (eventCounts[o.occurrence_type] || 0) + 1;
        });
        const dominantType = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const riskScore = calculateRiskScore(provinceOccurrences.length, totalLoss, totalArea);

        return {
          province_id: province.id,
          province_name: province.name,
          events_count: provinceOccurrences.length,
          total_affected_area_ha: totalArea,
          total_loss_aoa: totalLoss,
          farmers_affected: totalFarmers,
          risk_score: riskScore,
          risk_level: getRiskLevel(riskScore),
          dominant_event_type: dominantType,
        };
      });

      return profiles.sort((a, b) => b.risk_score - a.risk_score);
    },
  });
}

export function useCropRiskProfiles() {
  return useQuery({
    queryKey: ['crop-risk-profiles'],
    queryFn: async () => {
      const { data: production } = await supabase
        .from('production_history')
        .select('crop_type, area_planted_ha, actual_yield_kg');

      const { data: farmers } = await supabase
        .from('farmers')
        .select('id, main_crops, cultivated_area_ha');

      // Aggregate production by crop
      const cropStats: Record<string, { area: number; production: number }> = {};
      (production || []).forEach(p => {
        if (!cropStats[p.crop_type]) {
          cropStats[p.crop_type] = { area: 0, production: 0 };
        }
        cropStats[p.crop_type].area += p.area_planted_ha || 0;
        cropStats[p.crop_type].production += p.actual_yield_kg || 0;
      });

      // Add crops from farmers
      (farmers || []).forEach(f => {
        (f.main_crops || []).forEach((crop: string) => {
          if (!cropStats[crop]) {
            cropStats[crop] = { area: 0, production: 0 };
          }
        });
      });

      // Simulated risk data based on crop type
      const cropRiskFactors: Record<string, number> = {
        'Milho': 0.7,
        'Arroz': 0.8,
        'Feijão': 0.5,
        'Mandioca': 0.3,
        'Banana': 0.6,
        'Café': 0.4,
        'Soja': 0.6,
        'Batata': 0.5,
      };

      const profiles: CropRiskProfile[] = Object.entries(cropStats).map(([crop, stats]) => {
        const riskFactor = cropRiskFactors[crop] || 0.5;
        const eventsCount = Math.round(riskFactor * 10);
        const totalLoss = stats.area * riskFactor * 50000;
        const riskScore = Math.round(riskFactor * 100);

        return {
          crop,
          total_area_ha: stats.area,
          total_production_kg: stats.production,
          events_count: eventsCount,
          total_loss_aoa: totalLoss,
          avg_loss_per_event: eventsCount > 0 ? totalLoss / eventsCount : 0,
          risk_score: riskScore,
          risk_level: getRiskLevel(riskScore),
        };
      });

      return profiles.sort((a, b) => b.risk_score - a.risk_score);
    },
  });
}

export function useClimateProductionCorrelation() {
  return useQuery({
    queryKey: ['climate-production-correlation'],
    queryFn: async () => {
      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select('report_date, severity')
        .order('report_date', { ascending: true });

      const { data: production } = await supabase
        .from('production_history')
        .select('harvest_date, actual_yield_kg')
        .not('harvest_date', 'is', null);

      // Group by year-month
      const monthlyData: Record<string, { events: number; production: number; severitySum: number }> = {};

      (occurrences || []).forEach(o => {
        const date = new Date(o.report_date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { events: 0, production: 0, severitySum: 0 };
        }
        monthlyData[key].events += 1;
        monthlyData[key].severitySum += o.severity === 'critico' ? 3 : o.severity === 'alto' ? 2 : 1;
      });

      (production || []).forEach(p => {
        if (p.harvest_date) {
          const date = new Date(p.harvest_date);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          if (!monthlyData[key]) {
            monthlyData[key] = { events: 0, production: 0, severitySum: 0 };
          }
          monthlyData[key].production += p.actual_yield_kg || 0;
        }
      });

      return Object.entries(monthlyData).map(([key, data]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          year,
          month,
          events_count: data.events,
          production_kg: data.production,
          avg_severity: data.events > 0 ? data.severitySum / data.events : 0,
        };
      }).sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
    },
  });
}

export function useClimateRiskStats() {
  return useQuery({
    queryKey: ['climate-risk-stats'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data: occurrences } = await supabase
        .from('climate_occurrences')
        .select('id, report_date, affected_area_ha, affected_farmers_count, estimated_loss_aoa, severity, province_id');

      const allOccurrences = occurrences || [];
      const thisYearOccurrences = allOccurrences.filter(o => 
        new Date(o.report_date).getFullYear() === currentYear
      );

      // Calculate high-risk provinces
      const provinceSeverity: Record<string, number> = {};
      allOccurrences.forEach(o => {
        if (o.province_id) {
          provinceSeverity[o.province_id] = (provinceSeverity[o.province_id] || 0) + 
            (o.severity === 'critico' ? 3 : o.severity === 'alto' ? 2 : 1);
        }
      });
      const highRiskProvinces = Object.values(provinceSeverity).filter(s => s >= 5).length;

      const stats: ClimateRiskStats = {
        total_events: allOccurrences.length,
        events_this_year: thisYearOccurrences.length,
        total_loss_aoa: allOccurrences.reduce((sum, o) => sum + (o.estimated_loss_aoa || 0), 0),
        total_affected_area_ha: allOccurrences.reduce((sum, o) => sum + (o.affected_area_ha || 0), 0),
        total_affected_farmers: allOccurrences.reduce((sum, o) => sum + (o.affected_farmers_count || 0), 0),
        high_risk_provinces: highRiskProvinces,
        pending_compensations: Math.round(thisYearOccurrences.length * 0.4),
        avg_monthly_events: allOccurrences.length / 12,
      };

      return stats;
    },
  });
}

export function simulateLoss(params: {
  eventType: string;
  severity: 'baixo' | 'medio' | 'alto' | 'critico';
  affectedProvinces: string[];
  crops: string[];
}): LossSimulation[] {
  const severityMultipliers = {
    baixo: 0.1,
    medio: 0.3,
    alto: 0.6,
    critico: 0.9,
  };

  const eventMultipliers: Record<string, number> = {
    seca: 0.8,
    inundacao: 0.7,
    pragas: 0.5,
    tempestade: 0.6,
    geada: 0.4,
  };

  const baseArea = params.affectedProvinces.length * 5000;
  const baseFarmers = params.affectedProvinces.length * 200;
  const baseLoss = baseArea * 75000;

  const multiplier = severityMultipliers[params.severity] * (eventMultipliers[params.eventType] || 0.5);

  return [
    {
      scenario: 'Pessimista',
      probability: 0.15,
      affected_area_ha: Math.round(baseArea * multiplier * 1.5),
      affected_farmers: Math.round(baseFarmers * multiplier * 1.5),
      estimated_loss_aoa: Math.round(baseLoss * multiplier * 1.5),
      crops_affected: params.crops,
    },
    {
      scenario: 'Realista',
      probability: 0.6,
      affected_area_ha: Math.round(baseArea * multiplier),
      affected_farmers: Math.round(baseFarmers * multiplier),
      estimated_loss_aoa: Math.round(baseLoss * multiplier),
      crops_affected: params.crops,
    },
    {
      scenario: 'Optimista',
      probability: 0.25,
      affected_area_ha: Math.round(baseArea * multiplier * 0.5),
      affected_farmers: Math.round(baseFarmers * multiplier * 0.5),
      estimated_loss_aoa: Math.round(baseLoss * multiplier * 0.5),
      crops_affected: params.crops,
    },
  ];
}
