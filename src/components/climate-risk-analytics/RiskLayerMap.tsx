import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Layers,
  CloudRain,
  Droplets,
  Flame,
  Bug
} from 'lucide-react';
import { ClimateRiskMapData } from '@/hooks/useClimateRiskAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface RiskLayerMapProps {
  data?: ClimateRiskMapData[];
  isLoading: boolean;
}

type LayerType = 'drought' | 'flood' | 'fire' | 'pest' | 'all';

export function RiskLayerMap({ data, isLoading }: RiskLayerMapProps) {
  const [activeLayer, setActiveLayer] = useState<LayerType>('all');

  const layers = [
    { id: 'all' as LayerType, label: 'Todos', icon: Layers, color: 'bg-primary' },
    { id: 'drought' as LayerType, label: 'Secas', icon: CloudRain, color: 'bg-orange-500' },
    { id: 'flood' as LayerType, label: 'Cheias', icon: Droplets, color: 'bg-blue-500' },
    { id: 'fire' as LayerType, label: 'Incêndios', icon: Flame, color: 'bg-red-500' },
    { id: 'pest' as LayerType, label: 'Pragas', icon: Bug, color: 'bg-green-600' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      default: return 'bg-green-500 border-green-600';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      default: return 'Baixo';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'drought': return 'Seca';
      case 'flood': return 'Cheia';
      case 'fire': return 'Incêndio';
      case 'pest': return 'Praga';
      default: return type;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'drought': return 'bg-orange-100 text-orange-800';
      case 'flood': return 'bg-blue-100 text-blue-800';
      case 'fire': return 'bg-red-100 text-red-800';
      case 'pest': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96" />
        </CardContent>
      </Card>
    );
  }

  // Aggregate data for display
  const getDisplayData = () => {
    if (!data) return [];

    if (activeLayer === 'all') {
      // Combine all layers
      const provinceMap = new Map<string, {
        provinceName: string;
        events: { type: string; count: number; severity: string }[];
        totalArea: number;
        maxSeverity: string;
      }>();

      data.forEach(layerData => {
        layerData.provinces.forEach(p => {
          const existing = provinceMap.get(p.provinceId);
          if (existing) {
            existing.events.push({ 
              type: layerData.type, 
              count: p.eventCount, 
              severity: p.severity 
            });
            existing.totalArea += p.affectedArea;
            // Update max severity
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            if ((severityOrder[p.severity as keyof typeof severityOrder] || 0) > 
                (severityOrder[existing.maxSeverity as keyof typeof severityOrder] || 0)) {
              existing.maxSeverity = p.severity;
            }
          } else {
            provinceMap.set(p.provinceId, {
              provinceName: p.provinceName,
              events: [{ type: layerData.type, count: p.eventCount, severity: p.severity }],
              totalArea: p.affectedArea,
              maxSeverity: p.severity
            });
          }
        });
      });

      return Array.from(provinceMap.values())
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (severityOrder[b.maxSeverity as keyof typeof severityOrder] || 0) - 
                 (severityOrder[a.maxSeverity as keyof typeof severityOrder] || 0);
        });
    }

    // Single layer
    const layerData = data.find(d => d.type === activeLayer);
    return (layerData?.provinces || []).map(p => ({
      provinceName: p.provinceName,
      events: [{ type: activeLayer, count: p.eventCount, severity: p.severity }],
      totalArea: p.affectedArea,
      maxSeverity: p.severity
    }));
  };

  const displayData = getDisplayData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Risco Climático
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {layers.map(layer => {
              const IconComponent = layer.icon;
              return (
                <Button
                  key={layer.id}
                  variant={activeLayer === layer.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveLayer(layer.id)}
                  className="gap-1"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{layer.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sem dados de risco para o filtro seleccionado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayData.map((province, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getSeverityColor(province.maxSeverity)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-white truncate">
                    {province.provinceName}
                  </h4>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                    {getSeverityLabel(province.maxSeverity)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {province.events.map((event, i) => (
                      <Badge 
                        key={i} 
                        className={`text-xs ${getEventTypeColor(event.type)}`}
                      >
                        {getEventTypeLabel(event.type)}: {event.count}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-white/80">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {province.totalArea.toLocaleString()} ha afectados
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Severidade:</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs text-muted-foreground">Baixo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Médio</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-xs text-muted-foreground">Alto</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-xs text-muted-foreground">Crítico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
