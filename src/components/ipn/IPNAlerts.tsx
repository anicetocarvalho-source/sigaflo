import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  FileWarning,
  Bell,
  ChevronRight,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface IPNAlert {
  id: string;
  type: 'productivity_drop' | 'subsidy_no_impact' | 'compliance_risk' | 'certification_expiry' | 'sanction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: Date;
  metadata?: Record<string, any>;
}

interface IPNAlertsProps {
  profileId: string;
  productionScore: number;
  complianceScore: number;
  certificationScore: number;
  subsidiesReceived?: number;
  productionChange?: number; // percentage change from last year
  certificationExpiryDays?: number;
  sanctions?: number;
}

export function IPNAlerts({
  profileId,
  productionScore,
  complianceScore,
  certificationScore,
  subsidiesReceived = 0,
  productionChange = 0,
  certificationExpiryDays = 999,
  sanctions = 0
}: IPNAlertsProps) {
  
  // Generate alerts based on profile data
  const generateAlerts = (): IPNAlert[] => {
    const alerts: IPNAlert[] = [];
    
    // Queda abrupta de produtividade
    if (productionChange < -20) {
      alerts.push({
        id: `alert-prod-${profileId}`,
        type: 'productivity_drop',
        severity: productionChange < -40 ? 'critical' : 'high',
        title: 'Queda abrupta de produtividade',
        description: `Redução de ${Math.abs(productionChange)}% na produção em relação ao período anterior`,
        date: new Date(),
        metadata: { change: productionChange }
      });
    }
    
    // Subvenção sem impacto
    if (subsidiesReceived > 0 && productionScore < 40) {
      alerts.push({
        id: `alert-subsidy-${profileId}`,
        type: 'subsidy_no_impact',
        severity: 'high',
        title: 'Subvenção sem impacto mensurável',
        description: `Recebeu ${subsidiesReceived.toLocaleString()} Kz em subsídios mas score produtivo permanece baixo (${productionScore})`,
        date: new Date(),
        metadata: { subsidy: subsidiesReceived, score: productionScore }
      });
    }
    
    // Risco elevado de incumprimento
    if (complianceScore < 40) {
      alerts.push({
        id: `alert-compliance-${profileId}`,
        type: 'compliance_risk',
        severity: complianceScore < 20 ? 'critical' : 'high',
        title: 'Risco elevado de incumprimento',
        description: `Score de conformidade de ${complianceScore}% indica alto risco de não cumprimento de obrigações`,
        date: new Date(),
        metadata: { score: complianceScore }
      });
    }
    
    // Certificação a expirar
    if (certificationExpiryDays <= 30) {
      alerts.push({
        id: `alert-cert-expiry-${profileId}`,
        type: 'certification_expiry',
        severity: certificationExpiryDays <= 7 ? 'critical' : 'medium',
        title: 'Certificação próxima de expirar',
        description: `Certificado expira em ${certificationExpiryDays} dias. Recomenda-se renovação imediata.`,
        date: new Date(),
        metadata: { days: certificationExpiryDays }
      });
    }
    
    // Sanções ativas
    if (sanctions > 0) {
      alerts.push({
        id: `alert-sanction-${profileId}`,
        type: 'sanction',
        severity: sanctions > 2 ? 'critical' : 'high',
        title: 'Sanções activas',
        description: `Produtor possui ${sanctions} sanção(ões) activa(s) no sistema`,
        date: new Date(),
        metadata: { count: sanctions }
      });
    }
    
    // Low overall score warning
    if (productionScore + complianceScore + certificationScore < 120) {
      alerts.push({
        id: `alert-overall-${profileId}`,
        type: 'compliance_risk',
        severity: 'medium',
        title: 'Perfil requer atenção',
        description: 'Múltiplos indicadores abaixo da média. Recomenda-se acompanhamento técnico.',
        date: new Date()
      });
    }
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: IPNAlert['type']) => {
    switch (type) {
      case 'productivity_drop':
        return <TrendingDown className="h-5 w-5" />;
      case 'subsidy_no_impact':
        return <DollarSign className="h-5 w-5" />;
      case 'compliance_risk':
        return <ShieldAlert className="h-5 w-5" />;
      case 'certification_expiry':
        return <FileWarning className="h-5 w-5" />;
      case 'sanction':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityStyles = (severity: IPNAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'bg-red-100 text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'bg-orange-100 text-orange-600',
          badge: 'bg-orange-100 text-orange-800'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'bg-yellow-100 text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const getSeverityLabel = (severity: IPNAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas do Perfil
          </CardTitle>
          {alerts.length > 0 && (
            <Badge variant="destructive">
              {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">Sem alertas activos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Este perfil está em conformidade
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${styles.bg} transition-colors hover:opacity-90`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${styles.icon}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.title}</span>
                        <Badge className={styles.badge}>
                          {getSeverityLabel(alert.severity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(alert.date, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
