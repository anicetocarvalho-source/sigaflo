import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";
import { usePublicNewsDetail } from "@/hooks/usePublicNews";
import { SeoHead } from "@/components/public/SeoHead";
import type { OgSector } from "@/lib/seo/ogImageRegistry";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const CATEGORY_TO_SECTOR: Record<string, OgSector> = {
  agriculture: "agriculture",
  forestry: "forestry",
  coffee: "coffee",
  rice: "rice",
  general: "general",
  policy: "general",
  events: "general",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "Geral", agriculture: "Agricultura", forestry: "Florestas", coffee: "Café", rice: "Arroz", policy: "Política", events: "Eventos",
};

export default function PortalNewsDetail() {
  const { id } = useParams();
  const { data: item, isLoading } = usePublicNewsDetail(id);

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-64 mb-4" />
      <Skeleton className="h-96" />
    </div>
  );

  if (!item) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <p className="text-lg font-semibold">Notícia não encontrada</p>
      <Link to="/portal/noticias"><Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SeoHead
        title={`${item.title} — SIGAFLO`}
        description={item.excerpt || item.title}
        path={`/portal/noticias/${item.id}`}
        type="article"
        image={item.image_url || undefined}
        dynamic={!item.image_url ? {
          title: item.title,
          subtitle: item.excerpt || "Notícia · SIGAFLO",
          sector: CATEGORY_TO_SECTOR[item.category] || "general",
        } : undefined}
      />
      <Link to="/portal/noticias" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar às Notícias
      </Link>

      {item.image_url && (
        <div className="rounded-xl overflow-hidden mb-6 max-h-96">
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Badge>{CATEGORY_LABELS[item.category] || item.category}</Badge>
        {item.published_at && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(item.published_at), "d 'de' MMMM 'de' yyyy", { locale: pt })}
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold font-['Outfit'] mb-4">{item.title}</h1>

      {item.excerpt && (
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{item.excerpt}</p>
      )}

      {item.content && (
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">{item.content}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
