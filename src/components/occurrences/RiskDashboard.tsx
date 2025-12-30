import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Ruler,
  DollarSign
} from 'lucide-react';
import { useProvinceRiskMetrics, useOccurrences } from '@/hooks/useOccurrences';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export function RiskDashboard() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [provinces, setProvinces] = useState<any[]>([]);

  const { data: riskMetrics } = useProvinceRiskMetrics(parseInt(selectedYear));
  const { data: occurrences } = useOccurrences();

  useEffect(() => {
    async function fetchProvinces() {
      const { data } = await supabase.from('provinces').select('*').order('name');
      if (data) setProvinces(data);
    }
    fetchProvinces();
  }, []);

  // Calculate totals
  const totalOccurrences = riskMetrics?.reduce((sum, m) => sum + (m.total_occurrences || 0), 0) || 0;
  const totalCritical = riskMetrics?.reduce((sum, m) => sum + (m.critical_occurrences || 0), 0) || 0;
  const totalAffectedArea = riskMetrics?.reduce((sum, m) => sum + (m.total_affected_area_ha || 0), 0) || 0;
  const totalAffectedFarmers = riskMetrics?.reduce((sum, m) => sum + (m.total_affected_farmers || 0), 0) || 0;
  const totalLoss = riskMetrics?.reduce((sum, m) => sum + (m.total_estimated_loss_aoa || 0), 0) || 0;

  // Severity distribution for pie chart
  const severityData = [
    { name: 'Crítico', value: totalCritical, color: '#ef4444' },
    { name: 'Alto', value: riskMetrics?.reduce((sum, m) => sum + (m.high_occurrences || 0), 0) || 0, color: '#f97316' },
    { name: 'Médio', value: riskMetrics?.reduce((sum, m) => sum + (m.medium_occurrences || 0), 0) || 0, color: '#eab308' },
    { name: 'Baixo', value: riskMetrics?.reduce((sum, m) => sum + (m.low_occurrences || 0), 0) || 0, color: '#22c55e' },
  ].filter(d => d.value > 0);

  // Occurrence types distribution
  const typeDistribution = occurrences?.reduce((acc, o) => {
    acc[o.occurrence_type] = (acc[o.occurrence_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Province risk ranking
  const provinceRanking = riskMetrics
    ?.map((m) => ({
      province: m.provinces?.name || 'Desconhecido',
      risk_score: m.risk_score || 0,
      occurrences: m.total_occurrences || 0,
    }))
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10) || [];

  const maxRiskScore = Math.max(...provinceRanking.map(p => p.risk_score), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Risco por Província</h2>
          <p className="text-muted-foreground">Visão geral das ocorrências e métricas de risco</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ocorrências</p>
                <p className="text-2xl font-bold">{totalOccurrences}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-destructive">{totalCritical}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Área Afetada</p>
                <p className="text-2xl font-bold">{totalAffectedArea.toLocaleString()} ha</p>
              </div>
              <Ruler className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agricultores</p>
                <p className="text-2xl font-bold">{totalAffectedFarmers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Perdas Est.</p>
                <p className="text-2xl font-bold">{(totalLoss / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Province Risk Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ranking de Risco por Província
            </CardTitle>
            <CardDescription>
              Províncias ordenadas por índice de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            {provinceRanking.length > 0 ? (
              <div className="space-y-4">
                {provinceRanking.map((province, index) => (
                  <div key={province.province} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{province.province}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{province.occurrences} ocorrências</span>
                        <Badge 
                          variant={province.risk_score > 200 ? 'destructive' : province.risk_score > 100 ? 'default' : 'secondary'}
                        >
                          {province.risk_score.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(province.risk_score / maxRiskScore) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Sem dados de risco registados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Severidade</CardTitle>
            <CardDescription>
              Proporção de ocorrências por nível de severidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Sem dados de severidade
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Occurrences by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Ocorrências por Tipo</CardTitle>
          <CardDescription>
            Distribuição das ocorrências por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typeData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    tickFormatter={(value) => {
                      const labels: Record<string, string> = {
                        drought: 'Seca',
                        flood: 'Inundação',
                        pest: 'Praga',
                        disease: 'Doença',
                        frost: 'Geada',
                        hail: 'Granizo',
                        fire: 'Incêndio',
                        other: 'Outro',
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              Sem ocorrências registadas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
