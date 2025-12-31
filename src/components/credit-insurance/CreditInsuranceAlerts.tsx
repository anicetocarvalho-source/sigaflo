import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Mail
} from 'lucide-react';
import { useCreditInsuranceAlerts } from '@/hooks/useCreditInsurance';

interface Props {
  compact?: boolean;
  farmerId?: string;
}

export function CreditInsuranceAlerts({ compact = false, farmerId }: Props) {
  const { data: alerts, isLoading } = useCreditInsuranceAlerts({
    farmerId,
    unread: compact
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'credit_eligible':
        return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'score_improved':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'insurance_recommended':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'document_expiring':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'profile_updated':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'dossier_ready':
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'credit_eligible': 'Elegível para Crédito',
      'score_improved': 'Score Melhorou',
      'insurance_recommended': 'Seguro Recomendado',
      'document_expiring': 'Documento Expirando',
      'profile_updated': 'Perfil Actualizado',
      'dossier_ready': 'Dossiê Pronto'
    };
    return labels[type] || type;
  };

  if (compact) {
    const unreadAlerts = alerts?.filter(a => !a.read_at).slice(0, 3);
    
    if (!unreadAlerts || unreadAlerts.length === 0) return null;

    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                {unreadAlerts.length} alerta(s) não lido(s)
              </p>
              <p className="text-xs text-yellow-700">
                {unreadAlerts[0]?.title}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alertas de Crédito e Seguro</CardTitle>
          <Badge variant="outline">{alerts?.length || 0} alertas</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : alerts?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum alerta</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-lg ${!alert.read_at ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{alert.title}</h4>
                      {getPriorityBadge(alert.priority)}
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(alert.alert_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString('pt-AO')}
                      </span>
                      <div className="flex items-center gap-2">
                        {alert.send_sms && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Smartphone className="h-3 w-3" />
                            {alert.sms_sent_at ? 'Enviado' : 'Pendente'}
                          </div>
                        )}
                        {alert.send_email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {alert.email_sent_at ? 'Enviado' : 'Pendente'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {!alert.read_at && (
                    <Button size="sm" variant="ghost">
                      Marcar lido
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
