import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFarmerStats, useProvinces } from '@/hooks/useFarmers';
import { Users, Building2, GraduationCap, Factory, User, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

export const FarmersDashboard = () => {
  const { data: stats, isLoading } = useFarmerStats();
  const { data: provinces } = useProvinces();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const typeData = [
    { name: 'Pequenos', value: stats?.byType.individual || 0, icon: User },
    { name: 'Familiares', value: stats?.byType.family || 0, icon: Users },
    { name: 'Cooperativas', value: stats?.byType.cooperative || 0, icon: Building2 },
    { name: 'E. Campo', value: stats?.byType.field_school || 0, icon: GraduationCap },
    { name: 'Empresas', value: stats?.byType.company || 0, icon: Factory },
  ];

  const provinceData = Object.entries(stats?.byProvince || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const statusData = [
    { name: 'Rascunho', value: stats?.byStatus.draft || 0 },
    { name: 'Submetido', value: stats?.byStatus.submitted || 0 },
    { name: 'Validado', value: stats?.byStatus.validated || 0 },
    { name: 'Aprovado', value: stats?.byStatus.approved || 0 },
    { name: 'Activo', value: stats?.byStatus.issued || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {typeData.map((type) => (
          <Card key={type.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {type.name}
              </CardTitle>
              <type.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{type.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Total de Registos</CardTitle>
          <TrendingUp className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{stats?.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">agricultores e entidades registados</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Província</CardTitle>
          </CardHeader>
          <CardContent>
            {provinceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={provinceData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Sem dados de localização
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado dos Registos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
