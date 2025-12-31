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

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

interface ComplaintsChartsProps {
  complaintsByType: { type: string; count: number }[];
  complaintsByStatus: { status: string; count: number }[];
  complaintsByMonth: { month: string; received: number; resolved: number }[];
  complaintsByProvince: { province: string; count: number }[];
}

const typeLabels: Record<string, string> = {
  illegal_logging: 'Corte Ilegal',
  illegal_transport: 'Transporte',
  deforestation: 'Desmatamento',
  poaching: 'Caça Furtiva',
  fire: 'Queimada',
  encroachment: 'Invasão',
  pollution: 'Poluição',
  other: 'Outra',
};

const statusLabels: Record<string, string> = {
  received: 'Recebida',
  under_review: 'Em Análise',
  under_investigation: 'Investigação',
  verified: 'Verificada',
  unverified: 'Não Verificada',
  resolved: 'Resolvida',
  archived: 'Arquivada',
};

export function ComplaintsCharts({
  complaintsByType,
  complaintsByStatus,
  complaintsByMonth,
  complaintsByProvince,
}: ComplaintsChartsProps) {
  // Mock data if empty
  const typeData = complaintsByType.length > 0 ? complaintsByType : [
    { type: 'illegal_logging', count: 45 },
    { type: 'illegal_transport', count: 28 },
    { type: 'deforestation', count: 22 },
    { type: 'fire', count: 18 },
    { type: 'encroachment', count: 12 },
    { type: 'poaching', count: 8 },
    { type: 'other', count: 5 },
  ];

  const statusData = complaintsByStatus.length > 0 ? complaintsByStatus : [
    { status: 'received', count: 15 },
    { status: 'under_investigation', count: 22 },
    { status: 'verified', count: 35 },
    { status: 'unverified', count: 18 },
    { status: 'resolved', count: 48 },
  ];

  const monthData = complaintsByMonth.length > 0 ? complaintsByMonth : [
    { month: 'Jan', received: 12, resolved: 8 },
    { month: 'Fev', received: 15, resolved: 10 },
    { month: 'Mar', received: 18, resolved: 14 },
    { month: 'Abr', received: 14, resolved: 12 },
    { month: 'Mai', received: 22, resolved: 16 },
    { month: 'Jun', received: 19, resolved: 18 },
    { month: 'Jul', received: 25, resolved: 20 },
    { month: 'Ago', received: 16, resolved: 15 },
    { month: 'Set', received: 11, resolved: 14 },
    { month: 'Out', received: 13, resolved: 11 },
    { month: 'Nov', received: 17, resolved: 13 },
    { month: 'Dez', received: 9, resolved: 12 },
  ];

  const provinceData = complaintsByProvince.length > 0 ? complaintsByProvince : [
    { province: 'Cabinda', count: 38 },
    { province: 'Uíge', count: 28 },
    { province: 'Zaire', count: 22 },
    { province: 'Lunda Norte', count: 18 },
    { province: 'Moxico', count: 15 },
    { province: 'Cuando Cubango', count: 10 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Denúncias por Tipo</CardTitle>
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

      {/* By Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData.map(d => ({ ...d, name: statusLabels[d.status] || d.status }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" height={60} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" name="Denúncias" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="received" name="Recebidas" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="resolved" name="Resolvidas" stroke="hsl(var(--success))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By Province */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Províncias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={provinceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="province" type="category" fontSize={12} width={100} />
              <Tooltip />
              <Bar dataKey="count" name="Denúncias" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
