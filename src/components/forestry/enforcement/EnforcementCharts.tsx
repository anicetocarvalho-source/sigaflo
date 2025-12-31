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
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

interface EnforcementChartsProps {
  infractionsByType: { type: string; count: number }[];
  infractionsBySeverity: { severity: string; count: number }[];
  infractionsByMonth: { month: string; count: number; fines: number }[];
  infractionsByProvince: { province: string; count: number }[];
}

const typeLabels: Record<string, string> = {
  illegal_logging: 'Corte Ilegal',
  transport_violation: 'Transporte',
  license_violation: 'Licença',
  protected_species: 'Esp. Protegida',
  unauthorized_area: 'Área N/ Autor.',
  document_fraud: 'Fraude Doc.',
  volume_excess: 'Excesso Vol.',
  other: 'Outra',
};

const severityLabels: Record<string, string> = {
  minor: 'Leve',
  moderate: 'Moderada',
  serious: 'Grave',
  very_serious: 'Muito Grave',
};

export function EnforcementCharts({
  infractionsByType,
  infractionsBySeverity,
  infractionsByMonth,
  infractionsByProvince,
}: EnforcementChartsProps) {
  // Mock data if empty
  const typeData = infractionsByType.length > 0 ? infractionsByType : [
    { type: 'illegal_logging', count: 45 },
    { type: 'transport_violation', count: 32 },
    { type: 'license_violation', count: 28 },
    { type: 'protected_species', count: 15 },
    { type: 'volume_excess', count: 12 },
    { type: 'other', count: 8 },
  ];

  const severityData = infractionsBySeverity.length > 0 ? infractionsBySeverity : [
    { severity: 'minor', count: 25 },
    { severity: 'moderate', count: 45 },
    { severity: 'serious', count: 35 },
    { severity: 'very_serious', count: 15 },
  ];

  const monthData = infractionsByMonth.length > 0 ? infractionsByMonth : [
    { month: 'Jan', count: 12, fines: 2500000 },
    { month: 'Fev', count: 8, fines: 1800000 },
    { month: 'Mar', count: 15, fines: 3200000 },
    { month: 'Abr', count: 10, fines: 2100000 },
    { month: 'Mai', count: 18, fines: 4500000 },
    { month: 'Jun', count: 14, fines: 3000000 },
    { month: 'Jul', count: 20, fines: 5200000 },
    { month: 'Ago', count: 16, fines: 3800000 },
    { month: 'Set', count: 11, fines: 2400000 },
    { month: 'Out', count: 9, fines: 1900000 },
    { month: 'Nov', count: 13, fines: 2800000 },
    { month: 'Dez', count: 7, fines: 1500000 },
  ];

  const provinceData = infractionsByProvince.length > 0 ? infractionsByProvince : [
    { province: 'Cabinda', count: 35 },
    { province: 'Uíge', count: 28 },
    { province: 'Zaire', count: 22 },
    { province: 'Lunda Norte', count: 18 },
    { province: 'Lunda Sul', count: 15 },
    { province: 'Moxico', count: 12 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Infrações por Tipo</CardTitle>
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
                dataKey="count"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {typeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By Severity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Gravidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityData.map(d => ({ ...d, name: severityLabels[d.severity] || d.severity }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" name="Infrações" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By Month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number, name: string) => 
                name === 'Multas' ? `${(value/1000000).toFixed(2)}M AOA` : value
              } />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" name="Infrações" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="fines" name="Multas" stroke="hsl(var(--destructive))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By Province */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Províncias com Infrações</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={provinceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="province" type="category" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="count" name="Infrações" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
