import { KPICard } from '@/components/dashboard/KPICard';
import { AlertTriangle, FileWarning, CheckCircle, Clock, Ban, Scale } from 'lucide-react';

interface EnforcementKPIsProps {
  stats: {
    totalInfractions: number;
    pendingInfractions: number;
    resolvedInfractions: number;
    totalFinesAOA: number;
    activeInspections: number;
    seizures: number;
  };
  isLoading: boolean;
}

export function EnforcementKPIs({ stats, isLoading }: EnforcementKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KPICard
        title="Total Infrações"
        value={isLoading ? '...' : stats.totalInfractions.toLocaleString()}
        subtitle="Este ano"
        icon={<AlertTriangle className="h-5 w-5" />}
        variant="warning"
      />
      <KPICard
        title="Pendentes"
        value={isLoading ? '...' : stats.pendingInfractions.toLocaleString()}
        subtitle="A processar"
        icon={<Clock className="h-5 w-5" />}
        variant="accent"
      />
      <KPICard
        title="Resolvidas"
        value={isLoading ? '...' : stats.resolvedInfractions.toLocaleString()}
        subtitle="Com decisão"
        icon={<CheckCircle className="h-5 w-5" />}
        variant="success"
      />
      <KPICard
        title="Multas Aplicadas"
        value={isLoading ? '...' : `${(stats.totalFinesAOA / 1000000).toFixed(1)}M`}
        subtitle="AOA total"
        icon={<Scale className="h-5 w-5" />}
        variant="primary"
      />
      <KPICard
        title="Fiscalizações"
        value={isLoading ? '...' : stats.activeInspections.toLocaleString()}
        subtitle="Em curso"
        icon={<FileWarning className="h-5 w-5" />}
        variant="accent"
      />
      <KPICard
        title="Apreensões"
        value={isLoading ? '...' : stats.seizures.toLocaleString()}
        subtitle="Madeira apreendida"
        icon={<Ban className="h-5 w-5" />}
        variant="warning"
      />
    </div>
  );
}
