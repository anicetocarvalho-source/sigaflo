import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Wheat, TreePine, Coffee, ShieldCheck, AlertTriangle,
  ArrowRight, Search, Leaf, BarChart3, Map, BookOpen, Newspaper, Users2,
  HelpCircle, Building2, MapPin
} from "lucide-react";
import {
  usePublicAgricultureStats,
  usePublicForestryStats,
  usePublicCoffeeStats,
  usePublicClimateAlerts,
} from "@/hooks/usePublicStats";
import { usePublicNews } from "@/hooks/usePublicNews";
import { usePublicLegislation } from "@/hooks/usePublicLegislation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function PortalHome() {
  const [searchCode, setSearchCode] = useState("");
  const navigate = useNavigate();
  const { data: agriStats, isLoading: loadingAgri } = usePublicAgricultureStats();
  const { data: forestStats, isLoading: loadingForest } = usePublicForestryStats();
  const { data: coffeeStats, isLoading: loadingCoffee } = usePublicCoffeeStats();
  const { data: alerts, isLoading: loadingAlerts } = usePublicClimateAlerts();
  const { data: news } = usePublicNews();
  const { data: legislation } = usePublicLegislation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      if (searchCode.startsWith("CERT")) navigate(`/portal/verificar/certificado/${searchCode}`);
      else if (searchCode.startsWith("L")) navigate(`/portal/verificar/licenca/${searchCode}`);
      else if (searchCode.startsWith("LOT")) navigate(`/portal/verificar/cafe/${searchCode}`);
      else navigate(`/portal/verificar/certificado/${searchCode}`);
    }
  };

  const fmt = (n: any) => n == null ? "—" : Number(n).toLocaleString("pt-AO");

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-primary-foreground font-['Outfit'] mb-4">
            Portal Nacional Agroflorestal
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            A plataforma oficial de informação, indicadores, legislação e serviços do sector agroflorestal de Angola.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Verificar certificado, licença ou lote..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-10 bg-primary-foreground/95 border-0 h-12"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary" className="h-12 px-6">
              Verificar
            </Button>
          </form>
        </div>
      </section>

      {/* KPIs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Agricultores Registados", value: loadingAgri ? null : fmt(agriStats?.total_farmers), icon: Users, color: "text-primary" },
            { label: "Hectares Cultivados", value: loadingAgri ? null : fmt(agriStats?.total_cultivated_ha), icon: Map, color: "text-accent-foreground" },
            { label: "Certificados Emitidos", value: loadingAgri ? null : fmt(agriStats?.certificates_issued), icon: ShieldCheck, color: "text-primary" },
            { label: "Licenças Florestais", value: loadingForest ? null : fmt(forestStats?.active_licenses), icon: TreePine, color: "text-primary" },
          ].map((kpi, i) => (
            <Card key={i} className="shadow-lg border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
                    {kpi.value === null ? <Skeleton className="h-8 w-20" /> : (
                      <p className="text-2xl sm:text-3xl font-bold font-['Outfit']">{kpi.value}</p>
                    )}
                  </div>
                  <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold font-['Outfit'] mb-6">Serviços Rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Verificação", path: "/portal/verificar", icon: ShieldCheck },
            { label: "Indicadores", path: "/portal/indicadores", icon: BarChart3 },
            { label: "Legislação", path: "/portal/legislacao", icon: BookOpen },
            { label: "Registos", path: "/portal/registos", icon: Users2 },
            { label: "Mapa", path: "/portal/mapa", icon: MapPin },
            { label: "FAQ", path: "/portal/faq", icon: HelpCircle },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer group h-full">
                <item.icon className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">{item.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-['Outfit'] mb-2">Sectores Agroflorestais</h2>
            <p className="text-muted-foreground">Explore os principais sectores produtivos de Angola</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Agricultura", desc: "Registo de agricultores, produção agrícola, cooperativas e escolas de campo.", icon: Wheat, path: "/portal/agricultura", stat: loadingAgri ? "..." : `${fmt(agriStats?.total_farmers)} agricultores`, gradient: "from-green-600 to-emerald-700" },
              { title: "Florestas", desc: "Licenciamento florestal, rastreabilidade de madeira e reflorestamento.", icon: TreePine, path: "/portal/florestal", stat: loadingForest ? "..." : `${fmt(forestStats?.total_licenses)} licenças`, gradient: "from-emerald-700 to-green-800" },
              { title: "Café", desc: "Cadeia de valor do café angolano — lotes, qualidade e exportação.", icon: Coffee, path: "/portal/cafe", stat: loadingCoffee ? "..." : `${fmt(coffeeStats?.total_lots)} lotes`, gradient: "from-amber-700 to-yellow-800" },
              { title: "Arroz", desc: "Produção nacional, importações, preços e políticas de soberania alimentar.", icon: Wheat, path: "/portal/arroz", stat: "Dados estratégicos", gradient: "from-lime-700 to-green-700" },
            ].map((sector) => (
              <Link key={sector.path} to={sector.path}>
                <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${sector.gradient}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sector.gradient} flex items-center justify-center`}>
                        <sector.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{sector.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{sector.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">{sector.stat}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News + Legislation side by side */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* News */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" /> Últimas Notícias
              </h2>
              <Link to="/portal/noticias" className="text-sm text-primary hover:underline">Ver todas →</Link>
            </div>
            {news && news.length > 0 ? (
              <div className="space-y-3">
                {news.slice(0, 4).map((item: any) => (
                  <Link key={item.id} to={`/portal/noticias/${item.id}`}>
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4 flex gap-3">
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                          {item.published_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(item.published_at), "d MMM yyyy", { locale: pt })}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Nenhuma notícia publicada</CardContent></Card>
            )}
          </div>

          {/* Legislation */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-['Outfit'] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Legislação Recente
              </h2>
              <Link to="/portal/legislacao" className="text-sm text-primary hover:underline">Ver toda →</Link>
            </div>
            {legislation && legislation.length > 0 ? (
              <div className="space-y-3">
                {legislation.slice(0, 4).map((doc: any) => (
                  <Link key={doc.id} to={`/portal/legislacao/${doc.id}`}>
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="text-xs shrink-0">{doc.legislation_type}</Badge>
                          <div className="min-w-0">
                            <p className="font-medium text-sm line-clamp-2">{doc.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(doc.published_date), "d MMM yyyy", { locale: pt })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Nenhuma legislação publicada</CardContent></Card>
            )}
          </div>
        </div>
      </section>

      {/* Climate Alerts */}
      {!loadingAlerts && alerts && alerts.length > 0 && (
        <section className="bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-bold font-['Outfit']">Alertas Climáticos Activos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.slice(0, 6).map((alert: any, i: number) => (
                <Card key={i} className="border-l-4 border-l-destructive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{alert.title}</h3>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                        {alert.severity === "critical" ? "Crítico" : "Alto"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{alert.province_name || "Nacional"}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.report_date ? format(new Date(alert.report_date), "d MMM yyyy", { locale: pt }) : ""}
                    </p>
                    {alert.affected_farmers_count > 0 && (
                      <p className="text-xs mt-1 text-destructive font-medium">
                        {fmt(alert.affected_farmers_count)} agricultores afectados
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Verification + Partners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-['Outfit'] mb-2">Verificação de Documentos</h2>
          <p className="text-muted-foreground">Verifique a autenticidade de certificados, licenças e lotes de café</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
          {[
            { label: "Certificados Agrícolas", path: "/portal/verificar/certificado", icon: ShieldCheck },
            { label: "Licenças Florestais", path: "/portal/verificar/licenca", icon: TreePine },
            { label: "Lotes de Café", path: "/portal/verificar/cafe", icon: Coffee },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <item.icon className="h-10 w-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-sm">{item.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Entidades Parceiras</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
            {["MINAGRIP", "INCA", "IDF", "INCER", "INE", "INAMET"].map((p) => (
              <div key={p} className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
