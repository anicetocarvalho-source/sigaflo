import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePublicNews(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ["public-news", filters],
    queryFn: async () => {
      let query = supabase
        .from("portal_news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function usePublicNewsDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["public-news-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("portal_news")
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
