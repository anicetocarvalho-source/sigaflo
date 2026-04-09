import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tractor, Factory, ClipboardList, TrendingUp, Gauge, MapPin } from 'lucide-react';
import { useMechanizationStats, useServiceOrders, SERVICE_TYPES } from '@/hooks/useMechanization';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export function MechanizationCharts() {
  const stats = useMechanizationStats();
  const { data: orders } = useServiceOrders();

  const serviceTypeData = SERVICE_TYPES.map(t => ({
    name: t.label,
    value: (orders || []).filter(o => o.service_type === t.value).length,
  })).filter(d => d.value > 0);

  const statusData = [
    { name: 'Solicitadas', value: stats.pendingOrders, fill: 'hsl(var(--primary))' },
    { name: 'Em Curso', value: stats.inProgressOrders, fill: '#f59e0b' },
    { name: 'Concluídas', value: stats.completedOrders, fill: '#10b981' },
  ];

  const kpis = [
    { label: 'Centros Activos', value: stats.activeCenters, total: stats.totalCenters, icon: Factory, color: 'text-primary' },
    { label: 'Máquinas Operacionais', value: stats.operationalMachines, total: stats.totalMachines, icon: Tractor, color: 'text-green-600' },
    { label: 'Ordens de Serviço', value: stats.totalOrders, icon: ClipboardList, color: 'text-blue-600' },
    { label: 'Área Total (ha)', value: stats.totalAreaHa.toFixed(0), icon: MapPin, color: 'text-orange-600' },
    { label: 'Taxa Conclusão', value: stats.totalOrders ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(0)}%` : '0%', icon: Gauge, color: 'text-purple-600' },
    { label: 'Receita (AOA)', value: stats.totalRevenue.toLocaleString('pt-AO'), icon: TrendingUp, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center gap-2 mb-1">
                <k.icon className={`h-4 w-4 ${k.color}`} />
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <p className="text-xl font-bold">
                {k.value}
                {k.total !== undefined && <span className="text-sm text-muted-foreground font-normal">/{k.total}</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Service type distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Ordens por Tipo de Serviço</CardTitle></CardHeader>
          <CardContent>
            {serviceTypeData.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={serviceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Distribuição por Estado</CardTitle></CardHeader>
          <CardContent>
            {statusData.every(d => d.value === 0) ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
