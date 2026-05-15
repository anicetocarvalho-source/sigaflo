import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TreePine, FileText, AlertTriangle, Sprout } from "lucide-react";
import { usePublicForestryStats } from "@/hooks/usePublicStats";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PageHero } from "@/components/public/PageHero";
import { ImageGallery } from "@/components/public/ImageGallery";
import heroImage from "@/assets/portal/hero-forest.jpg";
import gTimber from "@/assets/portal/gallery-timber.jpg";
import gNursery from "@/assets/portal/gallery-nursery.jpg";
import gTech from "@/assets/portal/gallery-technician.jpg";
import gFields from "@/assets/portal/hero-fields.jpg";

export default function PortalForestry() {
  const { data: stats, isLoading } = usePublicForestryStats();
  const fmt = (n: any) => (n == null ? "—" : Number(n).toLocaleString("pt-AO"));

  const plantedPct = stats && Number(stats.target_seedlings) > 0
    ? Math.round((Number(stats.planted_seedlings) / Number(stats.target_seedlings)) * 100)
    : 0;

  const chartData = stats ? [
    { name: "Licenças Activas", valor: Number(stats.active_licenses) },
    { name: "Programas Reflorest.", valor: Number(stats.reforestation_programs) },
    { name: "Infracções", valor: Number(stats.total_infractions) },
    { name: "Denúncias", valor: Number(stats.total_complaints) },
  ] : [];

  return (
    <>
      <PageHero
        image={heroImage}
        eyebrow="Sector"
        title="Sector Florestal"
        subtitle="Gestão florestal, licenciamento e reflorestamento em Angola"
        breadcrumbs={[{ label: "Florestas" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Licenças Activas", value: stats?.active_licenses, icon: FileText },
          { label: "Árvores Registadas", value: stats?.total_trees_registered, icon: TreePine },
          { label: "Programas Reflorest.", value: stats?.reforestation_programs, icon: Sprout },
          { label: "Infracções", value: stats?.total_infractions, icon: AlertTriangle },
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
        {/* Reforestation Progress */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Progresso do Reflorestamento Nacional</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mudas Plantadas</span>
                  <span className="font-semibold">{fmt(stats?.planted_seedlings)} / {fmt(stats?.target_seedlings)}</span>
                </div>
                <Progress value={plantedPct} className="h-3" />
                <p className="text-center text-lg font-bold text-primary">{plantedPct}% do objectivo</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Área Alvo</p>
                    <p className="font-semibold">{fmt(stats?.target_reforestation_ha)} ha</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Área Plantada</p>
                    <p className="font-semibold">{fmt(stats?.planted_area_ha)} ha</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Visão Geral Florestal</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="hsl(152,45%,25%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold font-['Outfit'] mb-4">Galeria Florestal</h2>
        <ImageGallery items={[
          { src: gTimber, alt: "Madeira", caption: "Cadeia da madeira" },
          { src: gNursery, alt: "Viveiro", caption: "Viveiros de mudas" },
          { src: gFields, alt: "Cobertura florestal", caption: "Cobertura florestal" },
          { src: gTech, alt: "Fiscalização", caption: "Fiscalização e monitoria" },
        ]} />
      </section>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Sobre os Dados</h3>
          <p className="text-sm text-muted-foreground">
            Dados agregados do sistema de gestão florestal. Informações sobre operadores e concessionários individuais 
            estão protegidas. O sector florestal é gerido em coordenação com o Instituto de Desenvolvimento Florestal (IDF).
          </p>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
