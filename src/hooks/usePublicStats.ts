import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePublicAgricultureStats = () => {
  return useQuery({
    queryKey: ["public-agriculture-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_agriculture_stats" as any)
        .select("*")
        .single();
      if (error) throw error;
      return data as any;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicAgricultureByProvince = () => {
  return useQuery({
    queryKey: ["public-agriculture-by-province"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_agriculture_by_province" as any)
        .select("*");
      if (error) throw error;
      return (data || []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicForestryStats = () => {
  return useQuery({
    queryKey: ["public-forestry-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_forestry_stats" as any)
        .select("*")
        .single();
      if (error) throw error;
      return data as any;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicCoffeeStats = () => {
  return useQuery({
    queryKey: ["public-coffee-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_coffee_stats" as any)
        .select("*")
        .single();
      if (error) throw error;
      return data as any;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicRiceStats = () => {
  return useQuery({
    queryKey: ["public-rice-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_rice_stats" as any)
        .select("*")
        .single();
      if (error) throw error;
      return data as any;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicClimateAlerts = () => {
  return useQuery({
    queryKey: ["public-climate-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_climate_alerts" as any)
        .select("*");
      if (error) throw error;
      return (data || []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
