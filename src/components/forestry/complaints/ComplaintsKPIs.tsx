import { KPICard } from '@/components/dashboard/KPICard';
import { Megaphone, Clock, CheckCircle, AlertTriangle, Search, FileWarning } from 'lucide-react';

interface ComplaintsKPIsProps {
  stats: {
    totalComplaints: number;
    pendingComplaints: number;
    underInvestigation: number;
    resolvedComplaints: number;
    verifiedComplaints: number;
    anonymousComplaints: number;
  };
  isLoading: boolean;
}

export function ComplaintsKPIs({ stats, isLoading }: ComplaintsKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KPICard
        title="Total Denúncias"
        value={isLoading ? '...' : stats.totalComplaints.toLocaleString()}
        subtitle="Este ano"
        icon={<Megaphone className="h-5 w-5" />}
        variant="primary"
      />
      <KPICard
        title="Pendentes"
        value={isLoading ? '...' : stats.pendingComplaints.toLocaleString()}
        subtitle="Aguardam análise"
        icon={<Clock className="h-5 w-5" />}
        variant="warning"
      />
      <KPICard
        title="Em Investigação"
        value={isLoading ? '...' : stats.underInvestigation.toLocaleString()}
        subtitle="Em curso"
        icon={<Search className="h-5 w-5" />}
        variant="accent"
      />
      <KPICard
        title="Resolvidas"
        value={isLoading ? '...' : stats.resolvedComplaints.toLocaleString()}
        subtitle="Com decisão"
        icon={<CheckCircle className="h-5 w-5" />}
        variant="success"
      />
      <KPICard
        title="Confirmadas"
        value={isLoading ? '...' : stats.verifiedComplaints.toLocaleString()}
        subtitle="Geraram infração"
        icon={<FileWarning className="h-5 w-5" />}
        variant="warning"
      />
      <KPICard
        title="Anónimas"
        value={isLoading ? '...' : stats.anonymousComplaints.toLocaleString()}
        subtitle="Sem identificação"
        icon={<AlertTriangle className="h-5 w-5" />}
        variant="accent"
      />
    </div>
  );
}
