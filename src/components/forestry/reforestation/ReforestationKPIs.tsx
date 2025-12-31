import { KPICard } from '@/components/dashboard/KPICard';
import { Trees, Sprout, MapPin, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface ReforestationKPIsProps {
  stats: {
    totalPrograms: number;
    activePrograms: number;
    totalAreaHa: number;
    plantedTrees: number;
    survivalRate: number;
    nurseryStock: number;
  };
  isLoading: boolean;
}

export function ReforestationKPIs({ stats, isLoading }: ReforestationKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KPICard
        title="Programas Activos"
        value={isLoading ? '...' : stats.activePrograms.toLocaleString()}
        subtitle={`de ${stats.totalPrograms} total`}
        icon={<Trees className="h-5 w-5" />}
        variant="primary"
      />
      <KPICard
        title="Área Reflorestada"
        value={isLoading ? '...' : stats.totalAreaHa.toLocaleString()}
        subtitle="Hectares"
        icon={<MapPin className="h-5 w-5" />}
        variant="success"
      />
      <KPICard
        title="Árvores Plantadas"
        value={isLoading ? '...' : `${(stats.plantedTrees / 1000).toFixed(0)}K`}
        subtitle="Este ano"
        icon={<Sprout className="h-5 w-5" />}
        variant="accent"
      />
      <KPICard
        title="Taxa Sobrevivência"
        value={isLoading ? '...' : `${stats.survivalRate}%`}
        subtitle="Média geral"
        icon={<TrendingUp className="h-5 w-5" />}
        variant={stats.survivalRate >= 70 ? 'success' : 'warning'}
      />
      <KPICard
        title="Stock Viveiros"
        value={isLoading ? '...' : `${(stats.nurseryStock / 1000).toFixed(0)}K`}
        subtitle="Mudas disponíveis"
        icon={<Sprout className="h-5 w-5" />}
        variant="primary"
      />
      <KPICard
        title="Alertas"
        value={isLoading ? '...' : '3'}
        subtitle="Projectos críticos"
        icon={<AlertTriangle className="h-5 w-5" />}
        variant="warning"
      />
    </div>
  );
}
