import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMonitoring } from '@/hooks/useMonitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const complianceColors: Record<string, string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

const complianceLabels: Record<string, string> = {
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function AgriculturalScorePage() {
  const { scores, scoresLoading, scoreStats } = useMonitoring();
  const [search, setSearch] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('all');

  const filtered = scores.filter((s: any) => {
    const matchSearch = (s.farmers as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (s.farmers as any)?.registration_number?.toLowerCase().includes(search.toLowerCase());
    const matchCompliance = complianceFilter === 'all' || s.compliance_level === complianceFilter;
    return matchSearch && matchCompliance;
  });

  const pieData = [
    { name: 'Alto', value: scoreStats.highCompliance },
    { name: 'Médio', value: scoreStats.mediumCompliance },
    { name: 'Baixo', value: scoreStats.lowCompliance },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Plantio', value: scores.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.planting_score || 0), 0) / scores.length) : 0 },
    { name: 'Pacote', value: scores.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.package_score || 0), 0) / scores.length) : 0 },
    { name: 'Mecanização', value: scores.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.mechanization_score || 0), 0) / scores.length) : 0 },
    { name: 'Produção', value: scores.length ? Math.round(scores.reduce((s: number, x: any) => s + Number(x.production_score || 0), 0) / scores.length) : 0 },
  ];

  return (
    <MainLayout title="Score Agrícola" subtitle="Conformidade e desempenho dos agricultores">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Avaliados</p><p className="text-2xl font-bold">{scoreStats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Score Médio</p><p className="text-2xl font-bold">{scoreStats.avgScore}%</p></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /><div><p className="text-sm text-muted-foreground">Alto</p><p className="text-2xl font-bold text-green-600">{scoreStats.highCompliance}</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-2"><Minus className="h-5 w-5 text-yellow-600" /><div><p className="text-sm text-muted-foreground">Médio</p><p className="text-2xl font-bold text-yellow-600">{scoreStats.mediumCompliance}</p></div></CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-2"><TrendingDown className="h-5 w-5 text-destructive" /><div><p className="text-sm text-muted-foreground">Baixo</p><p className="text-2xl font-bold text-destructive">{scoreStats.lowCompliance}</p></div></CardContent></Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Média por Critério</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Distribuição de Conformidade</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar agricultor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={complianceFilter} onValueChange={setComplianceFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Conformidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="low">Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agricultor</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead className="text-center">Plantio</TableHead>
                  <TableHead className="text-center">Pacote</TableHead>
                  <TableHead className="text-center">Mecanização</TableHead>
                  <TableHead className="text-center">Produção</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead>Conformidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoresLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">A carregar...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum score encontrado</TableCell></TableRow>
                ) : filtered.map((score: any) => (
                  <TableRow key={score.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{(score.farmers as any)?.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{(score.farmers as any)?.registration_number}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{score.season}</Badge></TableCell>
                    <TableCell className="text-center font-mono">{Number(score.planting_score).toFixed(0)}%</TableCell>
                    <TableCell className="text-center font-mono">{Number(score.package_score).toFixed(0)}%</TableCell>
                    <TableCell className="text-center font-mono">{Number(score.mechanization_score).toFixed(0)}%</TableCell>
                    <TableCell className="text-center font-mono">{Number(score.production_score).toFixed(0)}%</TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-bold">{Number(score.total_score).toFixed(0)}%</span>
                    </TableCell>
                    <TableCell><Badge className={complianceColors[score.compliance_level]}>{complianceLabels[score.compliance_level] || score.compliance_level}</Badge></TableCell>
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
