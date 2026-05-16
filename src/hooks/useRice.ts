import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GrainType } from '@/lib/grains';

export interface RiceProduction {
  id: string;
  grain_type: GrainType;
  province_id: string | null;
  municipality_id: string | null;
  year: number;
  season: string;
  cultivated_area_ha: number;
  harvested_area_ha: number;
  production_tonnes: number;
  productivity_kg_ha: number;
  variety: string | null;
  irrigation_type: string | null;
  notes: string | null;
  created_at: string;
  provinces?: { name: string };
}

export interface RiceImport {
  id: string;
  grain_type: GrainType;
  year: number;
  month: number;
  origin_country: string;
  volume_tonnes: number;
  price_cif_usd: number | null;
  price_fob_usd: number | null;
  total_value_usd: number | null;
  importer_name: string | null;
  port_of_entry: string | null;
  rice_type: string | null;
  created_at: string;
}

export interface RicePrice {
  id: string;
  grain_type: GrainType;
  province_id: string | null;
  recorded_date: string;
  retail_price_aoa: number;
  wholesale_price_aoa: number | null;
  rice_type: string;
  market_name: string | null;
  exchange_rate_usd: number | null;
  provinces?: { name: string };
}

export interface RiceConsumption {
  id: string;
  grain_type: GrainType;
  year: number;
  province_id: string | null;
  population: number;
  per_capita_kg: number;
  total_consumption_tonnes: number;
  data_source: string | null;
  provinces?: { name: string };
}

export interface RiceAlert {
  id: string;
  grain_type: GrainType;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  metric_name: string | null;
  current_value: number | null;
  threshold_value: number | null;
  province_id: string | null;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  provinces?: { name: string };
}

export interface RiceParameter {
  id: string;
  parameter_name: string;
  parameter_value: number;
  unit: string | null;
  description: string | null;
}

type GrainFilter = GrainType | 'all' | undefined;

const grainFilterValue = (g: GrainFilter): GrainType | null =>
  g && g !== 'all' ? g : null;

export const useRiceProduction = (year?: number, grainType?: GrainFilter) => {
  return useQuery({
    queryKey: ['rice-production', year, grainType],
    queryFn: async () => {
      const g = grainFilterValue(grainType);
      let query = supabase
        .from('rice_production')
        .select('*, provinces(name)')
        .order('year', { ascending: false });

      if (year) query = query.eq('year', year);
      if (g) query = query.eq('grain_type', g);

      const { data, error } = await query;
      if (error) throw error;
      return data as RiceProduction[];
    },
  });
};

export const useRiceImports = (year?: number, grainType?: GrainFilter) => {
  return useQuery({
    queryKey: ['rice-imports', year, grainType],
    queryFn: async () => {
      const g = grainFilterValue(grainType);
      let query = supabase
        .from('rice_imports')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (year) query = query.eq('year', year);
      if (g) query = query.eq('grain_type', g);

      const { data, error } = await query;
      if (error) throw error;
      return data as RiceImport[];
    },
  });
};

export const useRicePrices = (limit?: number, grainType?: GrainFilter) => {
  return useQuery({
    queryKey: ['rice-prices', limit, grainType],
    queryFn: async () => {
      const g = grainFilterValue(grainType);
      let query = supabase
        .from('rice_prices')
        .select('*, provinces(name)')
        .order('recorded_date', { ascending: false });

      if (limit) query = query.limit(limit);
      if (g) query = query.eq('grain_type', g);

      const { data, error } = await query;
      if (error) throw error;
      return data as RicePrice[];
    },
  });
};

export const useRiceConsumption = (grainType?: GrainFilter) => {
  return useQuery({
    queryKey: ['rice-consumption', grainType],
    queryFn: async () => {
      const g = grainFilterValue(grainType);
      let query = supabase
        .from('rice_consumption')
        .select('*, provinces(name)')
        .order('year', { ascending: false });

      if (g) query = query.eq('grain_type', g);

      const { data, error } = await query;
      if (error) throw error;
      return data as RiceConsumption[];
    },
  });
};

export const useRiceAlerts = (unreadOnly = false, grainType?: GrainFilter) => {
  return useQuery({
    queryKey: ['rice-alerts', unreadOnly, grainType],
    queryFn: async () => {
      const g = grainFilterValue(grainType);
      let query = supabase
        .from('rice_alerts')
        .select('*, provinces(name)')
        .order('created_at', { ascending: false });

      if (unreadOnly) query = query.eq('is_read', false);
      if (g) query = query.eq('grain_type', g);

      const { data, error } = await query;
      if (error) throw error;
      return data as RiceAlert[];
    },
  });
};

export const useRiceParameters = () => {
  return useQuery({
    queryKey: ['rice-parameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rice_parameters')
        .select('*');

      if (error) throw error;
      return data as RiceParameter[];
    },
  });
};

// Convenience aliases to encourage migration to "grains" terminology
export const useGrainProduction = useRiceProduction;
export const useGrainImports = useRiceImports;
export const useGrainPrices = useRicePrices;
export const useGrainConsumption = useRiceConsumption;
export const useGrainAlerts = useRiceAlerts;

// Breakdown agregado por tipo de grão, opcionalmente filtrado por intervalo de anos.
export interface GrainsOverviewFilters {
  yearFrom?: number;
  yearTo?: number;
}

export const useGrainsOverview = (filters: GrainsOverviewFilters = {}) => {
  const { yearFrom, yearTo } = filters;
  return useQuery({
    queryKey: ['grains-overview', yearFrom ?? null, yearTo ?? null],
    queryFn: async () => {
      let prodQ = supabase.from('rice_production').select('grain_type, production_tonnes, cultivated_area_ha, year');
      let impQ = supabase.from('rice_imports').select('grain_type, volume_tonnes, total_value_usd, year');
      let priceQ = supabase.from('rice_prices').select('grain_type, retail_price_aoa, recorded_date').order('recorded_date', { ascending: false }).limit(500);
      if (yearFrom != null) {
        prodQ = prodQ.gte('year', yearFrom);
        impQ = impQ.gte('year', yearFrom);
        priceQ = priceQ.gte('recorded_date', `${yearFrom}-01-01`);
      }
      if (yearTo != null) {
        prodQ = prodQ.lte('year', yearTo);
        impQ = impQ.lte('year', yearTo);
        priceQ = priceQ.lte('recorded_date', `${yearTo}-12-31`);
      }
      const [{ data: production }, { data: imports }, { data: prices }] = await Promise.all([prodQ, impQ, priceQ]);

      const byGrain: Record<string, { production: number; area: number; imports: number; importValue: number; avgPrice: number; priceSamples: number }> = {};
      const ensure = (g: string) => {
        if (!byGrain[g]) byGrain[g] = { production: 0, area: 0, imports: 0, importValue: 0, avgPrice: 0, priceSamples: 0 };
        return byGrain[g];
      };
      (production || []).forEach((p: any) => {
        const b = ensure(p.grain_type || 'arroz');
        b.production += Number(p.production_tonnes || 0);
        b.area += Number(p.cultivated_area_ha || 0);
      });
      (imports || []).forEach((i: any) => {
        const b = ensure(i.grain_type || 'arroz');
        b.imports += Number(i.volume_tonnes || 0);
        b.importValue += Number(i.total_value_usd || 0);
      });
      (prices || []).forEach((p: any) => {
        const b = ensure(p.grain_type || 'arroz');
        b.avgPrice = (b.avgPrice * b.priceSamples + Number(p.retail_price_aoa || 0)) / (b.priceSamples + 1);
        b.priceSamples += 1;
      });

      return byGrain;
    },
  });
};

// Aggregated statistics
export const useRiceStats = (grainType?: GrainFilter) => {
  return useQuery({
    queryKey: ['rice-stats', grainType],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const g = grainType && grainType !== 'all' ? grainType : null;

      let prodQ = supabase
        .from('rice_production')
        .select('year, production_tonnes, cultivated_area_ha, harvested_area_ha, grain_type')
        .gte('year', currentYear - 5);
      if (g) prodQ = prodQ.eq('grain_type', g);
      const { data: production } = await prodQ;

      let impQ = supabase
        .from('rice_imports')
        .select('year, volume_tonnes, total_value_usd, grain_type')
        .gte('year', currentYear - 5);
      if (g) impQ = impQ.eq('grain_type', g);
      const { data: imports } = await impQ;

      let pricesQ = supabase
        .from('rice_prices')
        .select('retail_price_aoa, wholesale_price_aoa, recorded_date, grain_type')
        .order('recorded_date', { ascending: false })
        .limit(10);
      if (g) pricesQ = pricesQ.eq('grain_type', g);
      const { data: prices } = await pricesQ;

      let consQ = supabase
        .from('rice_consumption')
        .select('*')
        .is('province_id', null)
        .order('year', { ascending: false })
        .limit(1);
      if (g) consQ = consQ.eq('grain_type', g);
      const { data: consumption } = await consQ;

      const { data: parameters } = await supabase
        .from('rice_parameters')
        .select('*');

      const productionByYear = production?.reduce((acc: Record<number, any>, p) => {
        if (!acc[p.year]) acc[p.year] = { production: 0, area: 0, harvested: 0 };
        acc[p.year].production += Number(p.production_tonnes);
        acc[p.year].area += Number(p.cultivated_area_ha);
        acc[p.year].harvested += Number(p.harvested_area_ha);
        return acc;
      }, {});

      const importsByYear = imports?.reduce((acc: Record<number, any>, i) => {
        if (!acc[i.year]) acc[i.year] = { volume: 0, value: 0 };
        acc[i.year].volume += Number(i.volume_tonnes);
        acc[i.year].value += Number(i.total_value_usd || 0);
        return acc;
      }, {});

      const avgRetailPrice = prices?.length
        ? prices.reduce((sum, p) => sum + Number(p.retail_price_aoa), 0) / prices.length
        : 0;

      const latestConsumption = consumption?.[0];
      const paramsMap = parameters?.reduce((acc: Record<string, number>, p) => {
        acc[p.parameter_name] = p.parameter_value;
        return acc;
      }, {});

      return {
        productionByYear,
        importsByYear,
        avgRetailPrice,
        latestConsumption,
        parameters: paramsMap,
        rawProduction: production,
        rawImports: imports,
        rawPrices: prices,
      };
    },
  });
};
