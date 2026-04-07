import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Download, TrendingUp, Wheat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { usePublicIndicatorsByYear } from "@/hooks/usePublicRegistry";
import {
  usePublicAgricultureStats,
  usePublicForestryStats,
  usePublicCoffeeStats,
} from "@/hooks/usePublicStats";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0284c7"];

export default function PortalIndicators() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");

  const { data: indicators, isLoading } = usePublicIndicatorsByYear();
  const { data: agriStats } = usePublicAgricultureStats();
  const { data: forestStats } = usePublicForestryStats();
  const { data: coffeeStats } = usePublicCoffeeStats();

  const years = useMemo(() => {
    if (!indicators) return [];
    return [...new Set(indicators.map((i: any) => i.year))].sort((a, b) => b - a);
  }, [indicators]);

  const provinces = useMemo(() => {
    if (!indicators) return [];
    return [...new Set(indicators.filter((i: any) => i.province_name).map((i: any) => i.province_name))].sort();
  }, [indicators]);

  const filtered = useMemo(() => {
    if (!indicators) return [];
    return indicators.filter((i: any) => {
      if (yearFilter !== "all" && i.year !== Number(yearFilter)) return false;
      if (provinceFilter !== "all" && i.province_name !== provinceFilter) return false;
      return true;
    });
  }, [indicators, yearFilter, provinceFilter]);

  const productionByCrop = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((i: any) => {
      map[i.crop_type] = (map[i.crop_type] || 0) + Number(i.total_quantity_kg || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value / 1000) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  const areaByCrop = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((i: any) => {
      map[i.crop_type] = (map[i.crop_type] || 0) + Number(i.total_area_ha || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  const trendByYear = useMemo(() => {
    if (!indicators) return [];
    const map: Record<number, { area: number; production: number }> = {};
    const data = provinceFilter !== "all"
      ? indicators.filter((i: any) => i.province_name === provinceFilter)
      : indicators;
    data.forEach((i: any) => {
      if (!map[i.year]) map[i.year] = { area: 0, production: 0 };
      map[i.year].area += Number(i.total_area_ha || 0);
      map[i.year].production += Number(i.total_quantity_kg || 0);
    });
    return Object.entries(map)
      .map(([year, v]) => ({ year: Number(year), area: Math.round(v.area), production: Math.round(v.production / 1000) }))
      .sort((a, b) => a.year - b.year);
  }, [indicators, provinceFilter]);

  const handleExportCSV = () => {
    if (!filtered.length) return;
    const headers = "Ano,Cultura,Provincia,Registos,Area_ha,Producao_kg,Produtividade_kg_ha\n";
    const rows = filtered.map((i: any) =>
      `${i.year},${i.crop_type},${i.province_name || ""},${i.num_records},${i.total_area_ha},${i.total_quantity_kg},${Number(i.productivity_kg_ha).toFixed(1)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "indicadores_agroflorestais.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (n: any) => n == null ? "—" : Number(n).toLocaleString("pt-AO");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Indicadores & Estatísticas
          </h1>
          <p className="text-muted-foreground mt-1">Dados agregados do sector agroflorestal angolano</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Agricultores", value: fmt(agriStats?.total_farmers), icon: "👨‍🌾" },
          { label: "Hectares Cultivados", value: fmt(agriStats?.total_cultivated_ha), icon: "🌾" },
          { label: "Licenças Florestais", value: fmt(forestStats?.active_licenses), icon: "🌲" },
          { label: "Lotes de Café", value: fmt(coffeeStats?.total_lots), icon: "☕" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold font-['Outfit'] mt-1">{kpi.value}</p>
              <span className="text-2xl">{kpi.icon}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Ano" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            {years.map((y: any) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={provinceFilter} onValueChange={setProvinceFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Província" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as províncias</SelectItem>
            {provinces.map((p: any) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production by crop */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Wheat className="h-5 w-5 text-primary" />Produção por Cultura (ton)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionByCrop}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} />
                  <YAxis />
                  <Tooltip formatter={(v: any) => `${v.toLocaleString()} ton`} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Area by crop */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Área Cultivada por Cultura (ha)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={areaByCrop} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {areaByCrop.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v.toLocaleString()} ha`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trend */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Tendência Anual</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="area" stroke="hsl(var(--primary))" name="Área (ha)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="production" stroke="hsl(var(--accent))" name="Produção (ton)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
