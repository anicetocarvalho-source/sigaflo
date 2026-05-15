import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wheat, Ship, TrendingUp, DollarSign } from "lucide-react";
import { usePublicRiceStats } from "@/hooks/usePublicStats";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PageHero } from "@/components/public/PageHero";
import { ImageGallery } from "@/components/public/ImageGallery";
import heroImage from "@/assets/portal/hero-rice.jpg";
import gFields from "@/assets/portal/hero-fields.jpg";
import gMarket from "@/assets/portal/gallery-market.jpg";
import gCoop from "@/assets/portal/gallery-cooperative.jpg";
import gMech from "@/assets/portal/gallery-mechanization.jpg";

export default function PortalRice() {
  const { data: stats, isLoading } = usePublicRiceStats();
  const fmt = (n: any) => (n == null ? "—" : Number(n).toLocaleString("pt-AO"));

  const comparisonData = stats ? [
    { name: "Produção Nacional", tonnes: Number(stats.total_production_tonnes) },
    { name: "Importações", tonnes: Number(stats.total_imports_tonnes) },
  ] : [];

  const selfSufficiency = stats && Number(stats.total_production_tonnes) + Number(stats.total_imports_tonnes) > 0
    ? Math.round((Number(stats.total_production_tonnes) / (Number(stats.total_production_tonnes) + Number(stats.total_imports_tonnes))) * 100)
    : 0;

  return (
    <>
      <PageHero
        image={heroImage}
        eyebrow="Sector"
        title="Arroz Nacional"
        subtitle="Produção, importações e indicadores de soberania alimentar"
        breadcrumbs={[{ label: "Arroz" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Produção (ton)", value: stats?.total_production_tonnes, icon: Wheat },
          { label: "Importações (ton)", value: stats?.total_imports_tonnes, icon: Ship },
          { label: "Área Cultivada (ha)", value: stats?.total_area_ha, icon: TrendingUp },
          { label: "Preço Médio (AOA)", value: stats?.avg_retail_price_aoa ? Number(stats.avg_retail_price_aoa).toFixed(0) : null, icon: DollarSign },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
              {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{fmt(kpi.value)}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production vs Imports */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Produção vs Importações</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString("pt-AO")} ton`} />
                  <Bar dataKey="tonnes" fill="hsl(152,45%,25%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Self-sufficiency */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Índice de Autossuficiência</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[280px]">
            {isLoading ? <Skeleton className="h-32 w-32 rounded-full" /> : (
              <>
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="hsl(152,45%,25%)"
                      strokeWidth="8"
                      strokeDasharray={`${selfSufficiency * 2.64} 264`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{selfSufficiency}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Percentagem da procura coberta pela produção nacional
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold font-['Outfit'] mb-4">Galeria do Arroz</h2>
        <ImageGallery items={[
          { src: gFields, alt: "Campos de arroz", caption: "Áreas de produção" },
          { src: gMech, alt: "Mecanização", caption: "Mecanização do cultivo" },
          { src: gMarket, alt: "Mercado", caption: "Comercialização interna" },
          { src: gCoop, alt: "Cooperativas", caption: "Cooperativas produtoras" },
        ]} />
      </section>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Sobre os Dados</h3>
          <p className="text-sm text-muted-foreground">
            Dados agregados do módulo estratégico do arroz, incluindo registos de produção por província, 
            importações por origem e preços de mercado. Informações sensíveis e comerciais são protegidas.
          </p>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
