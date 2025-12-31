import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Coffee, TrendingUp, MapPin, Award } from 'lucide-react';
import { CoffeeLot } from '@/hooks/useCoffee';
import { getSemaphoreStatus, SemaphoreStatus } from './CoffeeSemaphoreKPIs';

interface Props {
  lots: CoffeeLot[];
}

const SEMAPHORE_COLORS: Record<SemaphoreStatus, string> = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  unclassified: '#94a3b8',
};

const SEMAPHORE_LABELS: Record<SemaphoreStatus, string> = {
  green: 'Verde',
  yellow: 'Amarelo',
  red: 'Vermelho',
  unclassified: 'Por Classificar',
};

export function CoffeeSemaphoreCharts({ lots }: Props) {
  // Semaphore distribution
  const semaphoreDistribution = lots.reduce((acc, lot) => {
    const status = getSemaphoreStatus(lot);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<SemaphoreStatus, number>);

  const distributionData = Object.entries(semaphoreDistribution).map(([status, count]) => ({
    name: SEMAPHORE_LABELS[status as SemaphoreStatus],
    value: count,
    color: SEMAPHORE_COLORS[status as SemaphoreStatus],
  }));

  // Volume by semaphore
  const volumeBySemaphore = lots.reduce((acc, lot) => {
    const status = getSemaphoreStatus(lot);
    acc[status] = (acc[status] || 0) + lot.volume_kg;
    return acc;
  }, {} as Record<SemaphoreStatus, number>);

  const volumeData = Object.entries(volumeBySemaphore).map(([status, volume]) => ({
    name: SEMAPHORE_LABELS[status as SemaphoreStatus],
    volume: volume / 1000,
    fill: SEMAPHORE_COLORS[status as SemaphoreStatus],
  }));

  // By province with semaphore breakdown
  const provinceBreakdown = lots.reduce((acc, lot) => {
    const province = lot.origin_province?.name || 'Desconhecido';
    const status = getSemaphoreStatus(lot);
    
    if (!acc[province]) {
      acc[province] = { province, green: 0, yellow: 0, red: 0, unclassified: 0, total: 0 };
    }
    acc[province][status] += 1;
    acc[province].total += 1;
    return acc;
  }, {} as Record<string, any>);

  const provinceData = Object.values(provinceBreakdown)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Compliance score
  const getComplianceScore = (lot: CoffeeLot) => {
    let score = 0;
    if (lot.quality_grade) score += 20;
    if (lot.exporter_name) score += 20;
    if (lot.destination_country) score += 20;
    if (lot.transport_document_number) score += 20;
    if (lot.export_declaration_number) score += 20;
    return score;
  };

  const avgComplianceScore = lots.length > 0
    ? lots.reduce((sum, lot) => sum + getComplianceScore(lot), 0) / lots.length
    : 0;

  const complianceRadialData = [
    {
      name: 'Conformidade',
      value: Math.round(avgComplianceScore),
      fill: avgComplianceScore >= 80 ? '#10b981' : avgComplianceScore >= 50 ? '#f59e0b' : '#ef4444',
    },
  ];

  // Quality distribution
  const qualityDistribution = lots.reduce((acc, lot) => {
    const grade = lot.quality_grade || 'Não Classificado';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const qualityData = Object.entries(qualityDistribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Semaphore Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            🚦 Distribuição por Sinal
          </CardTitle>
          <CardDescription>Classificação dos lotes de café</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600" />
            Índice de Conformidade
          </CardTitle>
          <CardDescription>Média de conformidade documental</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={complianceRadialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      background={{ fill: '#e2e8f0' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{Math.round(avgComplianceScore)}%</span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {avgComplianceScore >= 80 
                  ? 'Excelente conformidade' 
                  : avgComplianceScore >= 50 
                    ? 'Conformidade moderada' 
                    : 'Requer atenção'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume by Semaphore */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Coffee className="h-4 w-4 text-amber-600" />
            Volume por Classificação
          </CardTitle>
          <CardDescription>Toneladas de café por sinal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}t`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}t`, 'Volume']}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Province Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            Semaforização por Província
          </CardTitle>
          <CardDescription>Distribuição de sinais por região</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="province" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="green" stackId="a" fill="#10b981" name="Verde" />
                <Bar dataKey="yellow" stackId="a" fill="#f59e0b" name="Amarelo" />
                <Bar dataKey="red" stackId="a" fill="#ef4444" name="Vermelho" />
                <Bar dataKey="unclassified" stackId="a" fill="#94a3b8" name="Por Classificar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quality Distribution */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            Distribuição por Grau de Qualidade
          </CardTitle>
          <CardDescription>Classificação de qualidade dos lotes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Lotes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
