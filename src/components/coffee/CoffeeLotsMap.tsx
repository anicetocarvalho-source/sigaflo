import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize2, Minimize2, Coffee, Layers } from 'lucide-react';
import { CoffeeLot } from '@/hooks/useCoffee';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  lots: CoffeeLot[];
  onSelectLot: (lot: CoffeeLot) => void;
}

// Province coordinates for Angola (approximate centers)
const provinceCoordinates: Record<string, [number, number]> = {
  'Bengo': [-8.8383, 13.7289],
  'Benguela': [-12.5763, 13.4055],
  'Bié': [-12.3781, 17.6687],
  'Cabinda': [-5.55, 12.2],
  'Cuando Cubango': [-15.75, 18.5],
  'Cuanza Norte': [-9.2399, 15.0313],
  'Cuanza Sul': [-10.8333, 15.0833],
  'Cunene': [-16.5333, 16.7333],
  'Huambo': [-12.7761, 15.7288],
  'Huíla': [-14.9258, 13.4929],
  'Luanda': [-8.8399, 13.2894],
  'Lunda Norte': [-8.3833, 19.1833],
  'Lunda Sul': [-10.7167, 20.4167],
  'Malanje': [-9.5403, 16.3411],
  'Moxico': [-11.3478, 20.3478],
  'Namibe': [-15.1961, 12.1522],
  'Uíge': [-7.6089, 15.0613],
  'Zaire': [-6.2694, 14.2422],
};

export function CoffeeLotsMap({ lots, onSelectLot }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Aggregate data by province
  const provinceData = lots.reduce((acc, lot) => {
    const provinceName = lot.origin_province?.name || 'Desconhecido';
    if (!acc[provinceName]) {
      acc[provinceName] = {
        name: provinceName,
        lots: [],
        totalVolume: 0,
        count: 0,
      };
    }
    acc[provinceName].lots.push(lot);
    acc[provinceName].totalVolume += lot.volume_kg;
    acc[provinceName].count += 1;
    return acc;
  }, {} as Record<string, { name: string; lots: CoffeeLot[]; totalVolume: number; count: number }>);

  const provinceList = Object.values(provinceData).sort((a, b) => b.totalVolume - a.totalVolume);

  const getVolumeColor = (volume: number) => {
    if (volume > 10000) return 'bg-amber-600';
    if (volume > 5000) return 'bg-amber-500';
    if (volume > 2000) return 'bg-amber-400';
    return 'bg-amber-300';
  };

  const getVolumeSize = (volume: number) => {
    if (volume > 10000) return 'h-12 w-12';
    if (volume > 5000) return 'h-10 w-10';
    if (volume > 2000) return 'h-8 w-8';
    return 'h-6 w-6';
  };

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              Mapa de Origens
            </CardTitle>
            <CardDescription>
              Distribuição geográfica dos lotes de café
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Map visualization (simplified without Mapbox) */}
          <div
            ref={mapRef}
            className="md:col-span-2 relative bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg overflow-hidden"
            style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '400px' }}
          >
            {/* Simple province markers */}
            <div className="absolute inset-0 p-4">
              <div className="relative w-full h-full">
                {provinceList.map((prov) => {
                  const coords = provinceCoordinates[prov.name];
                  if (!coords) return null;

                  // Normalize coordinates to percentage positions
                  // Angola roughly spans: Lat -5 to -18, Lon 12 to 24
                  const top = ((coords[0] + 5) / 13) * 100;
                  const left = ((coords[1] - 12) / 12) * 100;

                  return (
                    <div
                      key={prov.name}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                        selectedProvince === prov.name ? 'z-10 scale-125' : ''
                      }`}
                      style={{ top: `${top}%`, left: `${left}%` }}
                      onClick={() => setSelectedProvince(selectedProvince === prov.name ? null : prov.name)}
                    >
                      <div
                        className={`${getVolumeSize(prov.totalVolume)} ${getVolumeColor(prov.totalVolume)} rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800`}
                      >
                        <Coffee className="h-4 w-4 text-white" />
                      </div>
                      {selectedProvince === prov.name && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-popover border rounded-lg shadow-lg p-3 min-w-[180px] z-20">
                          <p className="font-medium text-sm">{prov.name}</p>
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <p>📦 {prov.count} lotes</p>
                            <p>⚖️ {(prov.totalVolume / 1000).toFixed(1)} toneladas</p>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Lotes recentes:</p>
                            {prov.lots.slice(0, 3).map((lot) => (
                              <Button
                                key={lot.id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectLot(lot);
                                }}
                              >
                                {lot.lot_code}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Legenda
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-amber-600" />
                  <span>&gt; 10t</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span>5-10t</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <span>2-5t</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-amber-300" />
                  <span>&lt; 2t</span>
                </div>
              </div>
            </div>
          </div>

          {/* Province list sidebar */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Províncias ({provinceList.length})
            </p>
            {provinceList.map((prov) => (
              <div
                key={prov.name}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedProvince === prov.name
                    ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedProvince(selectedProvince === prov.name ? null : prov.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getVolumeColor(prov.totalVolume)}`} />
                    <span className="font-medium text-sm">{prov.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {prov.count}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {(prov.totalVolume / 1000).toFixed(1)} toneladas
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
