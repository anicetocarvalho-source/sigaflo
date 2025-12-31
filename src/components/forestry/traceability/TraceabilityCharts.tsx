import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ForestTree, ForestLog, ForestTransportPermit } from '@/hooks/useForestry';

interface TraceabilityChartsProps {
  trees: ForestTree[];
  logs: ForestLog[];
  transports: ForestTransportPermit[];
}

const COLORS = ['#16a34a', '#d97706', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function TraceabilityCharts({ trees, logs, transports }: TraceabilityChartsProps) {
  // Volume by month (last 6 months)
  const volumeByMonth = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthLogs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return isWithinInterval(logDate, { start, end });
      });
      
      const monthTransports = transports.filter(t => {
        if (!t.departure_at) return false;
        const tDate = new Date(t.departure_at);
        return isWithinInterval(tDate, { start, end });
      });

      months.push({
        month: format(date, 'MMM', { locale: pt }),
        toras: monthLogs.reduce((sum, l) => sum + l.volume_m3, 0),
        transportado: monthTransports.reduce((sum, t) => sum + (t.total_volume_m3 || 0), 0),
      });
    }
    return months;
  }, [logs, transports]);

  // Species distribution
  const speciesDistribution = useMemo(() => {
    const speciesMap: Record<string, number> = {};
    logs.forEach(log => {
      speciesMap[log.species] = (speciesMap[log.species] || 0) + log.volume_m3;
    });
    return Object.entries(speciesMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [logs]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const statusMap = {
      at_origin: { name: 'Na Origem', count: 0 },
      in_transport: { name: 'Em Trânsito', count: 0 },
      at_destination: { name: 'No Destino', count: 0 },
      processed: { name: 'Processada', count: 0 },
    };
    logs.forEach(log => {
      if (statusMap[log.status as keyof typeof statusMap]) {
        statusMap[log.status as keyof typeof statusMap].count += 1;
      }
    });
    return Object.values(statusMap).filter(s => s.count > 0);
  }, [logs]);

  // Origin/Destination flow
  const flowData = useMemo(() => {
    const origins: Record<string, number> = {};
    transports.forEach(t => {
      const origin = t.origin_location || 'Desconhecido';
      origins[origin] = (origins[origin] || 0) + (t.total_volume_m3 || 0);
    });
    return Object.entries(origins)
      .map(([name, volume]) => ({ name: name.substring(0, 15), volume: parseFloat(volume.toFixed(2)) }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, [transports]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Volume over time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Volume por Mês
          </CardTitle>
          <CardDescription>Toras registadas vs transportadas (m³)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeByMonth}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${v}`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)} m³`]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="toras" 
                  name="Toras" 
                  stroke="#16a34a" 
                  fill="#16a34a" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="transportado" 
                  name="Transportado" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Species distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Volume por Espécie
          </CardTitle>
          <CardDescription>Top espécies por volume (m³)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name.substring(0, 10)} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {speciesDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} m³`, 'Volume']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Estado das Toras
          </CardTitle>
          <CardDescription>Distribuição por estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution} layout="vertical">
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" width={80} fontSize={12} />
                <Tooltip formatter={(value: number) => [`${value} toras`]} />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Flow by origin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Volume por Origem
          </CardTitle>
          <CardDescription>Top origens de transporte (m³)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData} layout="vertical">
                <XAxis type="number" fontSize={12} tickFormatter={(v) => `${v}`} />
                <YAxis type="category" dataKey="name" width={100} fontSize={11} />
                <Tooltip formatter={(value: number) => [`${value} m³`, 'Volume']} />
                <Bar dataKey="volume" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
