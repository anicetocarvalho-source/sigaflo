import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Coffee, Package, Ship, Star, Search } from "lucide-react";
import { usePublicCoffeeStats } from "@/hooks/usePublicStats";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { PageHero } from "@/components/public/PageHero";
import { ImageGallery } from "@/components/public/ImageGallery";
import heroImage from "@/assets/portal/hero-coffee.jpg";
import gDrying from "@/assets/portal/gallery-coffee-drying.jpg";
import gMarket from "@/assets/portal/gallery-market.jpg";
import gWoman from "@/assets/portal/gallery-woman-farmer.jpg";
import gCoop from "@/assets/portal/gallery-cooperative.jpg";

const COLORS = ["hsl(38,92%,50%)", "hsl(152,45%,25%)", "hsl(205,85%,45%)", "hsl(30,25%,55%)"];

export default function PortalCoffee() {
  const { data: stats, isLoading } = usePublicCoffeeStats();
  const fmt = (n: any) => (n == null ? "—" : Number(n).toLocaleString("pt-AO"));

  const statusData = stats ? [
    { name: "Registados", value: Number(stats.registered_lots) },
    { name: "Em Trânsito", value: Number(stats.in_transit_lots) },
    { name: "Exportados", value: Number(stats.exported_lots) },
  ].filter(d => d.value > 0) : [];

  const qualityData = stats ? [
    { name: "Premium", valor: Number(stats.premium_lots) },
    { name: "Standard", valor: Number(stats.standard_lots) },
  ].filter(d => d.valor > 0) : [];

  return (
    <>
      <PageHero
        image={heroImage}
        eyebrow="Sector"
        title="Cadeia do Café"
        subtitle="Rastreabilidade e qualidade do café angolano"
        breadcrumbs={[{ label: "Café" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total de Lotes", value: stats?.total_lots, icon: Package },
          { label: "Volume Total (kg)", value: stats?.total_volume_kg, icon: Coffee },
          { label: "Lotes Exportados", value: stats?.exported_lots, icon: Ship },
          { label: "Variedades", value: stats?.varieties_count, icon: Star },
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
        <Card>
          <CardHeader><CardTitle className="text-lg">Lotes por Estado</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Classificação de Qualidade</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={qualityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification CTA */}
      <section className="mt-10">
        <h2 className="text-xl font-bold font-['Outfit'] mb-4">Galeria do Café</h2>
        <ImageGallery items={[
          { src: gDrying, alt: "Secagem do café", caption: "Secagem tradicional" },
          { src: gCoop, alt: "Cooperativa", caption: "Cooperativas cafeeiras" },
          { src: gMarket, alt: "Mercado", caption: "Comercialização" },
          { src: gWoman, alt: "Produtora", caption: "Produtoras locais" },
        ]} />
      </section>

      <Card className="mt-8">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Verificar Lote de Café</h3>
            <p className="text-sm text-muted-foreground">
              Confirme a autenticidade e rastreabilidade de qualquer lote de café angolano.
            </p>
          </div>
          <Link to="/portal/verificar/cafe">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Verificar Lote
            </Button>
          </Link>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
