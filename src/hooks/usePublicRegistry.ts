import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePublicRegistry(search?: string) {
  return useQuery({
    queryKey: ["public-registry", search],
    queryFn: async () => {
      if (!search || search.length < 3) return [];
      const { data, error } = await supabase
        .from("public_farmer_registry" as any)
        .select("*")
        .or(`registration_number.ilike.%${search}%,name.ilike.%${search}%`)
        .limit(20);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!search && search.length >= 3,
  });
}

export function usePublicIndicatorsByYear() {
  return useQuery({
    queryKey: ["public-indicators-by-year"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_indicators_by_year" as any)
        .select("*");
      if (error) throw error;
      return data as any[];
    },
  });
}
