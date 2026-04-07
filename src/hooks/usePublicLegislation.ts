import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePublicLegislation(filters?: {
  type?: string;
  sector?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["public-legislation", filters],
    queryFn: async () => {
      let query = supabase
        .from("legislation")
        .select("*")
        .eq("is_published", true)
        .order("published_date", { ascending: false });

      if (filters?.type) query = query.eq("legislation_type", filters.type);
      if (filters?.sector) query = query.eq("sector", filters.sector);
      if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function usePublicLegislationDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["public-legislation-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("legislation")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
