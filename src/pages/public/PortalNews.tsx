import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Search, Calendar } from "lucide-react";
import { usePublicNews } from "@/hooks/usePublicNews";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const CATEGORY_LABELS: Record<string, string> = {
  general: "Geral",
  agriculture: "Agricultura",
  forestry: "Florestas",
  coffee: "Café",
  rice: "Arroz",
  policy: "Política",
  events: "Eventos",
};

export default function PortalNews() {
  const [search, setSearch] = useState("");
  const { data: news, isLoading } = usePublicNews({ search: search || undefined });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] flex items-center gap-2">
          <Newspaper className="h-8 w-8 text-primary" />
          Notícias
        </h1>
        <p className="text-muted-foreground mt-1">Últimas notícias do sector agroflorestal</p>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar notícias..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : !news?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma notícia publicada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item: any) => (
            <Link key={item.id} to={`/portal/noticias/${item.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                {item.image_url && (
                  <div className="h-44 overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[item.category] || item.category}</Badge>
                    {item.published_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.published_at), "d MMM yyyy", { locale: pt })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">{item.title}</h3>
                  {item.excerpt && <p className="text-xs text-muted-foreground line-clamp-3">{item.excerpt}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
