import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RiceProduction {
  id: string;
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

export const useRiceProduction = (year?: number) => {
  return useQuery({
    queryKey: ['rice-production', year],
    queryFn: async () => {
      let query = supabase
        .from('rice_production')
        .select('*, provinces(name)')
        .order('year', { ascending: false });
      
      if (year) {
        query = query.eq('year', year);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RiceProduction[];
    },
  });
};

export const useRiceImports = (year?: number) => {
  return useQuery({
    queryKey: ['rice-imports', year],
    queryFn: async () => {
      let query = supabase
        .from('rice_imports')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (year) {
        query = query.eq('year', year);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RiceImport[];
    },
  });
};

export const useRicePrices = (limit?: number) => {
  return useQuery({
    queryKey: ['rice-prices', limit],
    queryFn: async () => {
      let query = supabase
        .from('rice_prices')
        .select('*, provinces(name)')
        .order('recorded_date', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RicePrice[];
    },
  });
};

export const useRiceConsumption = () => {
  return useQuery({
    queryKey: ['rice-consumption'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rice_consumption')
        .select('*, provinces(name)')
        .order('year', { ascending: false });
      
      if (error) throw error;
      return data as RiceConsumption[];
    },
  });
};

export const useRiceAlerts = (unreadOnly = false) => {
  return useQuery({
    queryKey: ['rice-alerts', unreadOnly],
    queryFn: async () => {
      let query = supabase
        .from('rice_alerts')
        .select('*, provinces(name)')
        .order('created_at', { ascending: false });
      
      if (unreadOnly) {
        query = query.eq('is_read', false);
      }
      
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

// Aggregated statistics
export const useRiceStats = () => {
  return useQuery({
    queryKey: ['rice-stats'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      
      // Get production totals
      const { data: production } = await supabase
        .from('rice_production')
        .select('year, production_tonnes, cultivated_area_ha, harvested_area_ha')
        .gte('year', currentYear - 5);
      
      // Get import totals
      const { data: imports } = await supabase
        .from('rice_imports')
        .select('year, volume_tonnes, total_value_usd')
        .gte('year', currentYear - 5);
      
      // Get latest prices
      const { data: prices } = await supabase
        .from('rice_prices')
        .select('retail_price_aoa, wholesale_price_aoa, recorded_date')
        .order('recorded_date', { ascending: false })
        .limit(10);
      
      // Get consumption data
      const { data: consumption } = await supabase
        .from('rice_consumption')
        .select('*')
        .is('province_id', null)
        .order('year', { ascending: false })
        .limit(1);
      
      // Get parameters
      const { data: parameters } = await supabase
        .from('rice_parameters')
        .select('*');
      
      // Calculate aggregates
      const productionByYear = production?.reduce((acc: Record<number, any>, p) => {
        if (!acc[p.year]) {
          acc[p.year] = { production: 0, area: 0, harvested: 0 };
        }
        acc[p.year].production += Number(p.production_tonnes);
        acc[p.year].area += Number(p.cultivated_area_ha);
        acc[p.year].harvested += Number(p.harvested_area_ha);
        return acc;
      }, {});
      
      const importsByYear = imports?.reduce((acc: Record<number, any>, i) => {
        if (!acc[i.year]) {
          acc[i.year] = { volume: 0, value: 0 };
        }
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
