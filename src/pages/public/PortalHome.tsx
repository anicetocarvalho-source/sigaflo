import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Wheat, TreePine, Coffee, ShieldCheck, AlertTriangle,
  ArrowRight, Search, BarChart3, Map, BookOpen, Newspaper, Users2,
  HelpCircle, Building2, MapPin, Images,
} from "lucide-react";
import {
  usePublicAgricultureStats,
  usePublicForestryStats,
  usePublicCoffeeStats,
  usePublicClimateAlerts,
} from "@/hooks/usePublicStats";
import { usePublicNews } from "@/hooks/usePublicNews";
import { usePublicLegislation } from "@/hooks/usePublicLegislation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

import { HeroCarousel, type HeroSlide } from "@/components/public/HeroCarousel";
import { ContentCarousel } from "@/components/public/ContentCarousel";

import heroFields from "@/assets/portal/hero-fields.jpg";
import heroCoffee from "@/assets/portal/hero-coffee.jpg";
import heroForest from "@/assets/portal/hero-forest.jpg";
import heroRice from "@/assets/portal/hero-rice.jpg";
import heroFarmer from "@/assets/portal/hero-farmer.jpg";
import sectorAgricultura from "@/assets/portal/sector-agricultura.jpg";
import sectorFlorestas from "@/assets/portal/sector-florestas.jpg";
import sectorCafe from "@/assets/portal/sector-cafe.jpg";
import sectorArroz from "@/assets/portal/sector-arroz.jpg";
import gMarket from "@/assets/portal/gallery-market.jpg";
import gCooperative from "@/assets/portal/gallery-cooperative.jpg";
import gTechnician from "@/assets/portal/gallery-technician.jpg";
import gMechanization from "@/assets/portal/gallery-mechanization.jpg";
import gCoffeeDrying from "@/assets/portal/gallery-coffee-drying.jpg";
import gNursery from "@/assets/portal/gallery-nursery.jpg";
import gWomanFarmer from "@/assets/portal/gallery-woman-farmer.jpg";
import gTimber from "@/assets/portal/gallery-timber.jpg";

const galleryFeatured = [
  { src: gMarket, caption: "Mercados rurais activos em todo o país" },
  { src: gCooperative, caption: "Cooperativas a transformar comunidades" },
  { src: gTechnician, caption: "Assistência técnica de proximidade" },
  { src: gMechanization, caption: "Mecanização para maior produtividade" },
  { src: gCoffeeDrying, caption: "Café angolano em secagem tradicional" },
  { src: gNursery, caption: "Viveiros para o reflorestamento" },
  { src: gWomanFarmer, caption: "Mulheres rurais no centro da produção" },
  { src: gTimber, caption: "Madeira certificada e rastreável" },
];

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
    if (!searchCode.trim()) return;
    if (searchCode.startsWith("CERT")) navigate(`/portal/verificar/certificado/${searchCode}`);
    else if (searchCode.startsWith("L")) navigate(`/portal/verificar/licenca/${searchCode}`);
    else if (searchCode.startsWith("LOT")) navigate(`/portal/verificar/cafe/${searchCode}`);
    else navigate(`/portal/verificar/certificado/${searchCode}`);
  };

  const fmt = (n: any) => (n == null ? "—" : Number(n).toLocaleString("pt-AO"));

  const slides: HeroSlide[] = [
    {
      image: heroFields,
      eyebrow: "Portal Oficial",
      title: "Portal Nacional Agroflorestal",
      subtitle: "Informação, indicadores, legislação e serviços do sector agroflorestal de Angola — num só lugar.",
      children: (
        <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Verificar certificado, licença ou lote..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="h-12 border-0 bg-background/95 pl-10 text-foreground"
            />
          </div>
          <Button type="submit" size="lg" variant="secondary" className="h-12 px-6">
            Verificar
          </Button>
        </form>
      ),
    },
    {
      image: heroCoffee,
      eyebrow: "Cadeia de Valor",
      title: "Café de Angola",
      subtitle: "Rastreabilidade, qualidade e exportação do café angolano com a marca INCA.",
      ctaLabel: "Explorar o sector do café",
      ctaHref: "/portal/cafe",
    },
    {
      image: heroForest,
      eyebrow: "Florestas Sustentáveis",
      title: "Gestão Florestal Responsável",
      subtitle: "Licenciamento, fiscalização e programas nacionais de reflorestamento conduzidos pelo IDF.",
      ctaLabel: "Conhecer o sector florestal",
      ctaHref: "/portal/florestal",
    },
    {
      image: heroRice,
      eyebrow: "Soberania Alimentar",
      title: "Arroz para Angola",
      subtitle: "Produção nacional, importações e estratégias para a segurança alimentar.",
      ctaLabel: "Ver indicadores do arroz",
      ctaHref: "/portal/arroz",
    },
    {
      image: heroFarmer,
      eyebrow: "Confiança Pública",
      title: "Verifique Documentos Oficiais",
      subtitle: "Confirme em segundos a autenticidade de certificados, licenças florestais e lotes de café.",
      ctaLabel: "Aceder à verificação",
      ctaHref: "/portal/verificar",
    },
  ];

  return (
    <div>
      {/* Hero carousel */}
      <HeroCarousel slides={slides} />

      {/* KPIs overlapping the hero */}
      <section className="relative z-20 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Agricultores Registados", value: loadingAgri ? null : fmt(agriStats?.total_farmers), icon: Users },
            { label: "Hectares Cultivados", value: loadingAgri ? null : fmt(agriStats?.total_cultivated_ha), icon: Map },
            { label: "Certificados Emitidos", value: loadingAgri ? null : fmt(agriStats?.certificates_issued), icon: ShieldCheck },
            { label: "Licenças Florestais", value: loadingForest ? null : fmt(forestStats?.active_licenses), icon: TreePine },
          ].map((kpi, i) => (
            <Card key={i} className="border-0 shadow-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                    {kpi.value === null ? (
                      <Skeleton className="mt-1 h-8 w-20" />
                    ) : (
                      <p className="mt-1 font-['Outfit'] text-2xl sm:text-3xl font-bold">{kpi.value}</p>
                    )}
                  </div>
                  <kpi.icon className="h-8 w-8 shrink-0 text-primary opacity-70" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick services */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-['Outfit'] text-xl font-bold">Serviços Rápidos</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Verificação", path: "/portal/verificar", icon: ShieldCheck },
            { label: "Indicadores", path: "/portal/indicadores", icon: BarChart3 },
            { label: "Legislação", path: "/portal/legislacao", icon: BookOpen },
            { label: "Registos", path: "/portal/registos", icon: Users2 },
            { label: "Mapa", path: "/portal/mapa", icon: MapPin },
            { label: "Galeria", path: "/portal/galeria", icon: Images },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="group h-full cursor-pointer p-4 text-center transition-shadow hover:shadow-md">
                <item.icon className="mx-auto mb-2 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <p className="text-sm font-medium">{item.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Sectors with imagery */}
      <section className="bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-2 font-['Outfit'] text-2xl sm:text-3xl font-bold">Sectores Agroflorestais</h2>
            <p className="text-muted-foreground">Explore os principais sectores produtivos de Angola</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Agricultura", desc: "Registo de agricultores, produção, cooperativas e escolas de campo.", icon: Wheat, path: "/portal/agricultura", stat: loadingAgri ? "..." : `${fmt(agriStats?.total_farmers)} agricultores`, image: sectorAgricultura },
              { title: "Florestas", desc: "Licenciamento florestal, rastreabilidade de madeira e reflorestamento.", icon: TreePine, path: "/portal/florestal", stat: loadingForest ? "..." : `${fmt(forestStats?.total_licenses)} licenças`, image: sectorFlorestas },
              { title: "Café", desc: "Cadeia de valor do café angolano — lotes, qualidade e exportação.", icon: Coffee, path: "/portal/cafe", stat: loadingCoffee ? "..." : `${fmt(coffeeStats?.total_lots)} lotes`, image: sectorCafe },
              { title: "Arroz", desc: "Produção nacional, importações, preços e soberania alimentar.", icon: Wheat, path: "/portal/arroz", stat: "Dados estratégicos", image: sectorArroz },
            ].map((sector) => (
              <Link key={sector.path} to={sector.path} className="group">
                <Card className="h-full overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={sector.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/90 backdrop-blur">
                        <sector.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-['Outfit'] text-lg font-bold text-primary-foreground drop-shadow">
                        {sector.title}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{sector.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">{sector.stat}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured gallery carousel */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold">Angola Agroflorestal em Imagens</h2>
            <p className="mt-1 text-muted-foreground">Comunidades, paisagens e cadeias produtivas pelo país</p>
          </div>
          <Link to="/portal/galeria" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
            Ver galeria completa →
          </Link>
        </div>
        <ContentCarousel itemClassName="basis-4/5 sm:basis-1/2 lg:basis-1/3">
          {galleryFeatured.map((g, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl shadow-md">
              <img
                src={g.src}
                alt={g.caption}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white drop-shadow">
                {g.caption}
              </p>
            </div>
          ))}
        </ContentCarousel>
      </section>

      {/* News + Legislation */}
      <section className="bg-muted/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-['Outfit'] text-xl font-bold">
                <Newspaper className="h-5 w-5 text-primary" /> Últimas Notícias
              </h2>
              <Link to="/portal/noticias" className="text-sm text-primary hover:underline">Ver todas →</Link>
            </div>
            {news && news.length > 0 ? (
              <div className="space-y-3">
                {news.slice(0, 4).map((item: any) => (
                  <Link key={item.id} to={`/portal/noticias/${item.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex gap-3 p-4">
                        {item.image_url && (
                          <img src={item.image_url} alt="" loading="lazy" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                          {item.published_at && (
                            <p className="mt-1 text-xs text-muted-foreground">
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

          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-['Outfit'] text-xl font-bold">
                <BookOpen className="h-5 w-5 text-primary" /> Legislação Recente
              </h2>
              <Link to="/portal/legislacao" className="text-sm text-primary hover:underline">Ver toda →</Link>
            </div>
            {legislation && legislation.length > 0 ? (
              <div className="space-y-3">
                {legislation.slice(0, 4).map((doc: any) => (
                  <Link key={doc.id} to={`/portal/legislacao/${doc.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="shrink-0 text-xs">{doc.legislation_type}</Badge>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium">{doc.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
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

      {/* Impact band */}
      <section className="relative overflow-hidden">
        <img src={heroFarmer} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center text-primary-foreground">
            <h2 className="mb-3 font-['Outfit'] text-2xl sm:text-3xl font-bold">
              Um sistema nacional ao serviço do agricultor angolano
            </h2>
            <p className="mb-8 text-primary-foreground/85">
              O SIGAFLO conecta instituições, técnicos e produtores num ecossistema digital comum
              — promovendo transparência, rastreabilidade e desenvolvimento rural sustentável.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-center text-primary-foreground sm:grid-cols-4">
            {[
              { value: loadingAgri ? "—" : fmt(agriStats?.total_farmers), label: "Agricultores" },
              { value: loadingForest ? "—" : fmt(forestStats?.total_licenses), label: "Licenças florestais" },
              { value: loadingCoffee ? "—" : fmt(coffeeStats?.total_lots), label: "Lotes de café" },
              { value: "18", label: "Províncias cobertas" },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-['Outfit'] text-3xl sm:text-4xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-primary-foreground/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Climate alerts */}
      {!loadingAlerts && alerts && alerts.length > 0 && (
        <section className="bg-muted">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="font-['Outfit'] text-xl font-bold">Alertas Climáticos Activos</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alerts.slice(0, 6).map((alert: any, i: number) => (
                <Card key={i} className="border-l-4 border-l-destructive">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-sm font-semibold">{alert.title}</h3>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                        {alert.severity === "critical" ? "Crítico" : "Alto"}
                      </Badge>
                    </div>
                    <p className="mb-1 text-xs text-muted-foreground">{alert.province_name || "Nacional"}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.report_date ? format(new Date(alert.report_date), "d MMM yyyy", { locale: pt }) : ""}
                    </p>
                    {alert.affected_farmers_count > 0 && (
                      <p className="mt-1 text-xs font-medium text-destructive">
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
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-['Outfit'] text-2xl font-bold">Verificação de Documentos</h2>
          <p className="text-muted-foreground">Verifique a autenticidade de certificados, licenças e lotes de café</p>
        </div>
        <div className="mx-auto mb-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Certificados Agrícolas", path: "/portal/verificar/certificado", icon: ShieldCheck },
            { label: "Licenças Florestais", path: "/portal/verificar/licenca", icon: TreePine },
            { label: "Lotes de Café", path: "/portal/verificar/cafe", icon: Coffee },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="group cursor-pointer p-6 text-center transition-shadow hover:shadow-lg">
                <item.icon className="mx-auto mb-3 h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                <p className="text-sm font-semibold">{item.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Entidades Parceiras</p>
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
