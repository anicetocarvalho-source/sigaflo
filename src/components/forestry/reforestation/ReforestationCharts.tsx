import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#8b5cf6', '#ec4899'];

interface ReforestationChartsProps {
  projectsByType: { type: string; count: number; area: number }[];
  projectsByProvince: { province: string; area: number; trees: number }[];
  progressByMonth: { month: string; planted: number; target: number }[];
  survivalBySpecies: { species: string; rate: number }[];
}

const typeLabels: Record<string, string> = {
  restoration: 'Restauração',
  afforestation: 'Florestação',
  community: 'Comunitária',
  commercial: 'Comercial',
  conservation: 'Conservação',
  agroforestry: 'Agroflorestal',
};

export function ReforestationCharts({
  projectsByType,
  projectsByProvince,
  progressByMonth,
  survivalBySpecies,
}: ReforestationChartsProps) {
  // Mock data if empty
  const typeData = projectsByType.length > 0 ? projectsByType : [
    { type: 'restoration', count: 12, area: 850 },
    { type: 'community', count: 8, area: 420 },
    { type: 'commercial', count: 5, area: 1200 },
    { type: 'conservation', count: 4, area: 650 },
    { type: 'agroforestry', count: 6, area: 380 },
  ];

  const provinceData = projectsByProvince.length > 0 ? projectsByProvince : [
    { province: 'Cabinda', area: 850, trees: 125000 },
    { province: 'Uíge', area: 620, trees: 95000 },
    { province: 'Zaire', area: 480, trees: 72000 },
    { province: 'Lunda Norte', area: 350, trees: 53000 },
    { province: 'Moxico', area: 280, trees: 42000 },
  ];

  const monthData = progressByMonth.length > 0 ? progressByMonth : [
    { month: 'Jan', planted: 12000, target: 15000 },
    { month: 'Fev', planted: 18000, target: 20000 },
    { month: 'Mar', planted: 25000, target: 25000 },
    { month: 'Abr', planted: 22000, target: 30000 },
    { month: 'Mai', planted: 35000, target: 35000 },
    { month: 'Jun', planted: 28000, target: 30000 },
    { month: 'Jul', planted: 15000, target: 20000 },
    { month: 'Ago', planted: 8000, target: 15000 },
    { month: 'Set', planted: 20000, target: 25000 },
    { month: 'Out', planted: 32000, target: 35000 },
    { month: 'Nov', planted: 40000, target: 40000 },
    { month: 'Dez', planted: 25000, target: 30000 },
  ];

  const speciesData = survivalBySpecies.length > 0 ? survivalBySpecies : [
    { species: 'Eucalipto', rate: 82 },
    { species: 'Pinheiro', rate: 75 },
    { species: 'Acácia', rate: 88 },
    { species: 'Mukwa', rate: 65 },
    { species: 'Mangueira', rate: 78 },
    { species: 'Cajueiro', rate: 72 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projectos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData.map(d => ({ ...d, name: typeLabels[d.type] || d.type }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="area"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {typeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} ha`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By Province */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Área por Província (ha)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={provinceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="province" type="category" fontSize={12} width={80} />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} ha`} />
              <Bar dataKey="area" name="Área" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progress by Month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plantação Mensal vs Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} árvores`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="target" 
                name="Meta" 
                stroke="hsl(var(--muted-foreground))" 
                fill="hsl(var(--muted))" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="planted" 
                name="Plantado" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Survival by Species */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Taxa de Sobrevivência por Espécie</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={speciesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="species" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar 
                dataKey="rate" 
                name="Sobrevivência" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
