import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, FileText, ExternalLink } from "lucide-react";
import { usePublicLegislation } from "@/hooks/usePublicLegislation";
import { SeoHead } from "@/components/public/SeoHead";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  decree: "Decreto",
  law: "Lei",
  notice: "Aviso",
  regulation: "Regulamento",
  resolution: "Resolução",
  directive: "Directiva",
};

const SECTOR_LABELS: Record<string, string> = {
  agriculture: "Agricultura",
  forestry: "Florestas",
  coffee: "Café",
  rice: "Arroz",
  general: "Geral",
};

export default function PortalLegislation() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const { data: legislation, isLoading } = usePublicLegislation({
    type: typeFilter !== "all" ? typeFilter : undefined,
    sector: sectorFilter !== "all" ? sectorFilter : undefined,
    search: search || undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SeoHead
        title="Legislação Agroflorestal — SIGAFLO"
        description="Base legal do sector agropecuário e florestal de Angola: decretos, leis, regulamentos e directivas."
        path="/portal/legislacao"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Legislação Agroflorestal
        </h1>
        <p className="text-muted-foreground mt-1">Base legal do sector agropecuário e florestal de Angola</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar legislação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os sectores</SelectItem>
            {Object.entries(SECTOR_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : !legislation?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum documento legislativo encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {legislation.map((doc: any) => (
            <Link key={doc.id} to={`/portal/legislacao/${doc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{doc.title}</h3>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant="secondary" className="text-xs">{TYPE_LABELS[doc.legislation_type] || doc.legislation_type}</Badge>
                        <Badge variant="outline" className="text-xs">{SECTOR_LABELS[doc.sector] || doc.sector}</Badge>
                      </div>
                    </div>
                    {doc.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.summary}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {doc.reference_number && <span>{doc.reference_number}</span>}
                      <span>{format(new Date(doc.published_date), "d MMM yyyy", { locale: pt })}</span>
                      {doc.pdf_url && (
                        <span className="flex items-center gap-1 text-primary">
                          <ExternalLink className="h-3 w-3" /> PDF
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
