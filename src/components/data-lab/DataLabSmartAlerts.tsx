import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  TrendingDown,
  Database,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Alert {
  id: string;
  type: 'dataset_outdated' | 'unauthorized_access' | 'anomaly_detected' | 'export_limit' | 'session_expired';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

// Mock alerts for demonstration
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'dataset_outdated',
    severity: 'high',
    title: 'Dataset Desactualizado',
    description: 'O dataset "Produção Agrícola 2024" não é actualizado há 15 dias',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resolved: false,
    metadata: { dataset: 'prod_agricola_2024', days_stale: 15 }
  },
  {
    id: '2',
    type: 'unauthorized_access',
    severity: 'critical',
    title: 'Tentativa de Acesso Não Autorizado',
    description: 'Investigador tentou aceder a campos restritos no dataset "Agricultores"',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    resolved: false,
    metadata: { researcher: 'João Silva', dataset: 'farmers', fields: ['bi_nif', 'phone'] }
  },
  {
    id: '3',
    type: 'anomaly_detected',
    severity: 'medium',
    title: 'Anomalia Estatística Detectada',
    description: 'Variação atípica de 340% na produção de milho em Malanje (Q4 2024)',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    resolved: false,
    metadata: { province: 'Malanje', crop: 'Milho', variation: 340 }
  },
  {
    id: '4',
    type: 'export_limit',
    severity: 'low',
    title: 'Limite de Exportação Atingido',
    description: 'INE atingiu 90% do limite mensal de exportações',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    resolved: false,
    metadata: { organization: 'INE', usage: 90, limit: 100 }
  },
  {
    id: '5',
    type: 'dataset_outdated',
    severity: 'medium',
    title: 'Dataset com Dados Incompletos',
    description: 'Dataset "Clima 2024" tem apenas 67% dos registos esperados',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    resolved: true,
    metadata: { dataset: 'clima_2024', completeness: 67 }
  },
  {
    id: '6',
    type: 'session_expired',
    severity: 'low',
    title: 'Sessão Expirada',
    description: '3 sessões de investigadores expiraram sem actividade',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    resolved: true,
    metadata: { count: 3 }
  }
];

export function DataLabSmartAlerts() {
  const alerts = mockAlerts;
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalCount = unresolvedAlerts.filter(a => a.severity === 'critical').length;
  const highCount = unresolvedAlerts.filter(a => a.severity === 'high').length;

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'dataset_outdated': return <Clock className="h-4 w-4" />;
      case 'unauthorized_access': return <ShieldAlert className="h-4 w-4" />;
      case 'anomaly_detected': return <TrendingDown className="h-4 w-4" />;
      case 'export_limit': return <Database className="h-4 w-4" />;
      case 'session_expired': return <Eye className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-orange-500 bg-orange-500/5';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'high': return <Badge className="bg-orange-500">Alto</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-yellow-950">Médio</Badge>;
      case 'low': return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertas Inteligentes
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Crítico{criticalCount > 1 ? 's' : ''}</Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-orange-500">{highCount} Alto{highCount > 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${getSeverityStyles(alert.severity)} ${
                  alert.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'high' ? 'text-orange-500' :
                      alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-500'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{alert.title}</span>
                        {alert.resolved ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          getSeverityBadge(alert.severity)
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: pt })}
                      </p>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unresolvedAlerts.length} alerta{unresolvedAlerts.length !== 1 ? 's' : ''} activo{unresolvedAlerts.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm">
            Ver Histórico Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
