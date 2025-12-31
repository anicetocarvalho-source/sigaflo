import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CloudRain, Thermometer, Bug, Wind, X } from 'lucide-react';
import { useState } from 'react';

interface ClimateAlert {
  id: string;
  type: 'seca' | 'inundacao' | 'pragas' | 'tempestade' | 'calor';
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  provinces: string[];
  expectedDate: string;
}

const mockAlerts: ClimateAlert[] = [
  {
    id: '1',
    type: 'seca',
    severity: 'critical',
    title: 'Alerta de Seca Severa',
    message: 'Previsão de seca prolongada nas próximas 4 semanas. Recomenda-se irrigação preventiva.',
    provinces: ['Huíla', 'Namibe', 'Cunene'],
    expectedDate: '2024-01-15',
  },
  {
    id: '2',
    type: 'inundacao',
    severity: 'warning',
    title: 'Risco de Inundação',
    message: 'Chuvas intensas previstas podem causar inundações em áreas baixas.',
    provinces: ['Luanda', 'Bengo'],
    expectedDate: '2024-01-10',
  },
  {
    id: '3',
    type: 'pragas',
    severity: 'warning',
    title: 'Surto de Pragas Detectado',
    message: 'Aumento da população de gafanhotos reportado. Monitorização em curso.',
    provinces: ['Malanje', 'Lunda Norte'],
    expectedDate: '2024-01-08',
  },
];

export function ClimateRiskAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const visibleAlerts = mockAlerts.filter(alert => !dismissedAlerts.includes(alert.id));

  if (visibleAlerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'seca': return <Thermometer className="h-5 w-5" />;
      case 'inundacao': return <CloudRain className="h-5 w-5" />;
      case 'pragas': return <Bug className="h-5 w-5" />;
      case 'tempestade': return <Wind className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    return severity === 'critical' 
      ? 'border-red-500/50 bg-red-500/10' 
      : 'border-yellow-500/50 bg-yellow-500/10';
  };

  const getIconColor = (severity: string) => {
    return severity === 'critical' ? 'text-red-500' : 'text-yellow-500';
  };

  return (
    <Card className="border-yellow-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Alertas Preventivos
          <Badge variant="secondary">{visibleAlerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-3 rounded-lg border ${getAlertColor(alert.severity)} relative`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-start gap-3 pr-8">
              <div className={`mt-0.5 ${getIconColor(alert.severity)}`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  {alert.severity === 'critical' && (
                    <Badge variant="destructive" className="text-xs">Crítico</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {alert.provinces.map((province) => (
                    <Badge key={province} variant="outline" className="text-xs">
                      {province}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
