import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Coffee,
  TrendingUp,
  Award,
  Package,
} from 'lucide-react';
import { CoffeeLot } from '@/hooks/useCoffee';

interface Props {
  lots: CoffeeLot[];
}

type SemaphoreStatus = 'green' | 'yellow' | 'red' | 'unclassified';

const getSemaphoreStatus = (lot: CoffeeLot): SemaphoreStatus => {
  // Classification logic based on quality grade and documentation completeness
  const hasQuality = !!lot.quality_grade;
  const hasExporter = !!lot.exporter_name;
  const hasDestination = !!lot.destination_country;
  const hasDocuments = !!lot.transport_document_number || !!lot.export_declaration_number;
  const isPremium = lot.quality_grade?.includes('Premium') || lot.quality_grade?.includes('Especialidade');
  
  if (!hasQuality) return 'unclassified';
  
  // Green: Premium/Specialty quality + complete documentation
  if (isPremium && hasExporter && hasDestination && hasDocuments) {
    return 'green';
  }
  
  // Yellow: Commercial quality or incomplete documentation
  if (hasQuality && (hasExporter || hasDestination)) {
    return 'yellow';
  }
  
  // Red: Low quality or missing critical info
  return 'red';
};

export function CoffeeSemaphoreKPIs({ lots }: Props) {
  const statusCounts = lots.reduce((acc, lot) => {
    const status = getSemaphoreStatus(lot);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<SemaphoreStatus, number>);

  const totalVolume = lots.reduce((sum, lot) => sum + lot.volume_kg, 0);
  const greenVolume = lots
    .filter(lot => getSemaphoreStatus(lot) === 'green')
    .reduce((sum, lot) => sum + lot.volume_kg, 0);
  
  const certificationRate = lots.length > 0 
    ? ((statusCounts.green || 0) / lots.length * 100).toFixed(1)
    : '0';

  const kpis = [
    {
      title: 'Sinal Verde',
      value: statusCounts.green || 0,
      subtitle: 'Aprovados para exportação',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Sinal Amarelo',
      value: statusCounts.yellow || 0,
      subtitle: 'Requer atenção/documentação',
      icon: AlertTriangle,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Sinal Vermelho',
      value: statusCounts.red || 0,
      subtitle: 'Não aprovados',
      icon: XCircle,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Por Classificar',
      value: statusCounts.unclassified || 0,
      subtitle: 'Aguardando avaliação',
      icon: Package,
      bgColor: 'bg-slate-100 dark:bg-slate-900/30',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
    {
      title: 'Volume Premium',
      value: `${(greenVolume / 1000).toFixed(1)}t`,
      subtitle: 'Café certificado verde',
      icon: Coffee,
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Taxa Certificação',
      value: `${certificationRate}%`,
      subtitle: 'Lotes com sinal verde',
      icon: Award,
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { getSemaphoreStatus };
export type { SemaphoreStatus };
