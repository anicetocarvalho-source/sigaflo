import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMonitoring } from '@/hooks/useMonitoring';
import { format } from 'date-fns';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Satellite, AlertTriangle, Leaf } from 'lucide-react';

const stressColors: Record<string, string> = {
  normal: 'bg-green-100 text-green-800',
  mild: 'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
};

const stressLabels: Record<string, string> = {
  normal: 'Normal',
  mild: 'Leve',
  moderate: 'Moderado',
  severe: 'Severo',
};

export default function NDVIPage() {
  const { ndviReadings, ndviLoading } = useMonitoring();

  // Aggregate by date for chart
  const dateMap = new Map<string, { date: string; avg: number; min: number; max: number; count: number }>();
  ndviReadings.forEach((r: any) => {
    const d = r.reading_date;
    const existing = dateMap.get(d);
    const val = Number(r.ndvi_value);
    if (existing) {
      existing.avg = (existing.avg * existing.count + val) / (existing.count + 1);
      existing.min = Math.min(existing.min, val);
      existing.max = Math.max(existing.max, val);
      existing.count++;
    } else {
      dateMap.set(d, { date: d, avg: val, min: val, max: val, count: 1 });
    }
  });
  const chartData = Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({ ...d, avg: Math.round(d.avg * 1000) / 1000, min: Math.round(d.min * 1000) / 1000, max: Math.round(d.max * 1000) / 1000 }));

  const stressCount = {
    normal: ndviReadings.filter((r: any) => r.stress_level === 'normal').length,
    mild: ndviReadings.filter((r: any) => r.stress_level === 'mild').length,
    moderate: ndviReadings.filter((r: any) => r.stress_level === 'moderate').length,
    severe: ndviReadings.filter((r: any) => r.stress_level === 'severe').length,
  };

  const avgNdvi = ndviReadings.length
    ? (ndviReadings.reduce((s: number, r: any) => s + Number(r.ndvi_value), 0) / ndviReadings.length).toFixed(3)
    : '—';

  return (
    <MainLayout title="NDVI Satélite" subtitle="Índice de vegetação e stress hídrico">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4 flex items-center gap-2"><Satellite className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Total Leituras</p><p className="text-2xl font-bold">{ndviReadings.length}</p></div></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">NDVI Médio</p><p className="text-2xl font-bold">{avgNdvi}</p></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" /><div><p className="text-sm text-muted-foreground">Normal</p><p className="text-2xl font-bold text-green-600">{stressCount.normal}</p></div></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Stress Leve</p><p className="text-2xl font-bold text-yellow-600">{stressCount.mild}</p></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><div><p className="text-sm text-muted-foreground">Stress Severo</p><p className="text-2xl font-bold text-destructive">{stressCount.severe}</p></div></CardContent></Card>
        </div>

        {/* NDVI Chart */}
        <Card>
          <CardHeader><CardTitle>Evolução Temporal NDVI</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Sem dados NDVI disponíveis</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={d => format(new Date(d), 'dd/MM')} />
                  <YAxis domain={[0, 1]} />
                  <Tooltip labelFormatter={d => format(new Date(d as string), 'dd/MM/yyyy')} />
                  <ReferenceLine y={0.3} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label="Stress" />
                  <ReferenceLine y={0.6} stroke="hsl(var(--chart-1))" strokeDasharray="3 3" label="Saudável" />
                  <Area type="monotone" dataKey="max" stroke="none" fill="hsl(var(--chart-1))" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="min" stroke="none" fill="hsl(var(--destructive))" fillOpacity={0.1} />
                  <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Média NDVI" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Readings Table */}
        <Card>
          <CardHeader><CardTitle>Leituras Recentes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agricultor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-center">NDVI</TableHead>
                  <TableHead>Stress</TableHead>
                  <TableHead>Fonte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ndviLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                ) : ndviReadings.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sem leituras</TableCell></TableRow>
                ) : ndviReadings.slice(0, 50).map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{(r.farmers as any)?.name || '—'}</TableCell>
                    <TableCell>{format(new Date(r.reading_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-center font-mono font-bold">{Number(r.ndvi_value).toFixed(3)}</TableCell>
                    <TableCell><Badge className={stressColors[r.stress_level]}>{stressLabels[r.stress_level] || r.stress_level}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{r.source}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
