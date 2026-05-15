import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Sprout, Award, MapPin } from "lucide-react";
import { usePublicAgricultureStats, usePublicAgricultureByProvince } from "@/hooks/usePublicStats";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PageHero } from "@/components/public/PageHero";
import { SeoHead } from "@/components/public/SeoHead";
import { ImageGallery } from "@/components/public/ImageGallery";
import { buildSectorGallery } from "@/components/public/galleryUtils";
import heroImage from "@/assets/portal/sector-agricultura.jpg";
import gCoop from "@/assets/portal/gallery-cooperative.jpg";
import gMech from "@/assets/portal/gallery-mechanization.jpg";
import gWoman from "@/assets/portal/gallery-woman-farmer.jpg";
import gTech from "@/assets/portal/gallery-technician.jpg";

const COLORS = ["hsl(152,45%,25%)", "hsl(38,92%,50%)", "hsl(205,85%,45%)", "hsl(30,25%,55%)", "hsl(152,60%,40%)"];

export default function PortalAgriculture() {
  const { data: stats, isLoading } = usePublicAgricultureStats();
  const { data: byProvince, isLoading: loadingProv } = usePublicAgricultureByProvince();

  const fmt = (n: any) => (n == null ? "—" : Number(n).toLocaleString("pt-AO"));

  const typeData = stats ? [
    { name: "Individual", value: Number(stats.individual_farmers) },
    { name: "Familiar", value: Number(stats.family_farmers) },
    { name: "Cooperativa", value: Number(stats.cooperative_count) },
    { name: "Escola Campo", value: Number(stats.field_school_count) },
    { name: "Empresa", value: Number(stats.company_count) },
  ].filter(d => d.value > 0) : [];

  const provinceData = (byProvince || [])
    .filter((p: any) => Number(p.farmer_count) > 0)
    .slice(0, 10)
    .map((p: any) => ({ name: p.province_name, total: Number(p.farmer_count) }));

  return (
    <>
      <PageHero
        image={heroImage}
        eyebrow="Sector"
        title="Sector Agrícola"
        subtitle="Indicadores agregados da agricultura angolana"
        breadcrumbs={[{ label: "Agricultura" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Agricultores", value: stats?.total_farmers, icon: Users },
          { label: "Hectares Cultivados", value: stats?.total_cultivated_ha, icon: MapPin },
          { label: "Produção (kg)", value: stats?.total_production_kg, icon: Sprout },
          { label: "Certificados", value: stats?.certificates_issued, icon: Award },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{fmt(kpi.value)}</p>}
                </div>
                <kpi.icon className="h-6 w-6 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Agricultores por Tipo</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By Province */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Províncias por Nº de Agricultores</CardTitle></CardHeader>
          <CardContent>
            {loadingProv ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={provinceData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(152,45%,25%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <section className="mt-10">
        <h2 className="text-xl font-bold font-['Outfit'] mb-4">Galeria do Sector</h2>
        <ImageGallery
          ariaLabel="Galeria do sector agrícola"
          items={buildSectorGallery("Agricultura", [
            { src: gCoop, subject: "Cooperativa agrícola", caption: "Cooperativas locais" },
            { src: gMech, subject: "Mecanização agrícola", caption: "Tractores em operação" },
            { src: gWoman, subject: "Mulher agricultora", caption: "Agricultura familiar" },
            { src: gTech, subject: "Técnico de extensão", caption: "Assistência técnica no campo" },
          ])}
        />
      </section>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Sobre os Dados</h3>
          <p className="text-sm text-muted-foreground">
            Os indicadores apresentados são dados agregados do registo nacional de agricultores e produção agrícola. 
            Dados individuais são protegidos e não estão acessíveis publicamente. 
            Informações actualizadas periodicamente pelo Sistema Integrado de Gestão Agropecuária e Florestal (SIGAFLO).
          </p>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
