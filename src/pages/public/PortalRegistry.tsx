import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, UserCheck } from "lucide-react";
import { usePublicRegistry } from "@/hooks/usePublicRegistry";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  family: "Familiar",
  cooperative: "Cooperativa",
  field_school: "Escola de Campo",
  company: "Empresa",
};

export default function PortalRegistry() {
  const [search, setSearch] = useState("");
  const { data: results, isLoading } = usePublicRegistry(search);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Consulta de Registos
        </h1>
        <p className="text-muted-foreground mt-1">Pesquise produtores e cooperativas registados no SIGAFLO</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por número de registo ou nome (mín. 3 caracteres)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Exemplo: AGR-000001, COOP-000001, ou nome do produtor</p>
        </CardContent>
      </Card>

      {isLoading && search.length >= 3 ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-3">
          {results.map((r: any, i: number) => (
            <Card key={i} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <Badge variant="secondary" className="text-xs">{TYPE_LABELS[r.farmer_type] || r.farmer_type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="font-mono">{r.registration_number}</span>
                    {r.province_name && <span>{r.province_name}</span>}
                    {r.municipality_name && <span>• {r.municipality_name}</span>}
                    {r.registration_date && <span>• {format(new Date(r.registration_date), "MMM yyyy", { locale: pt })}</span>}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-primary border-primary">Registado</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : search.length >= 3 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum registo encontrado para "{search}"</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
