import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Loader2, Plus, MousePointer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOccurrences } from '@/hooks/useOccurrences';
import { OccurrenceForm } from './OccurrenceForm';

// Angola province coordinates (approximate centroids)
const PROVINCE_COORDINATES: Record<string, [number, number]> = {
  'Bengo': [13.83, -8.83],
  'Benguela': [13.40, -12.58],
  'Bié': [17.67, -12.58],
  'Cabinda': [12.19, -5.55],
  'Cuando Cubango': [18.67, -16.17],
  'Cuanza Norte': [15.17, -9.25],
  'Cuanza Sul': [15.17, -10.92],
  'Cunene': [16.00, -16.50],
  'Huambo': [15.73, -12.78],
  'Huíla': [14.92, -14.92],
  'Luanda': [13.23, -8.84],
  'Lunda Norte': [19.17, -8.42],
  'Lunda Sul': [20.00, -10.33],
  'Malanje': [16.33, -9.53],
  'Moxico': [21.42, -13.42],
  'Namibe': [12.00, -15.20],
  'Uíge': [15.08, -7.62],
  'Zaire': [13.00, -6.50],
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const OCCURRENCE_TYPE_ICONS: Record<string, string> = {
  drought: '☀️',
  flood: '🌊',
  pest: '🐛',
  disease: '🦠',
  frost: '❄️',
  hail: '🌨️',
  fire: '🔥',
  other: '⚠️',
};

export function OccurrencesMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clickMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Record<string, string>>({});
  const [clickMode, setClickMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const { data: occurrences } = useOccurrences();

  // Fetch Mapbox token
  useEffect(() => {
    async function fetchToken() {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setError('Token do Mapbox não configurado');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar mapa');
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, []);

  // Fetch provinces
  useEffect(() => {
    async function fetchProvinces() {
      const { data } = await supabase.from('provinces').select('id, name');
      if (data) {
        const provinceMap: Record<string, string> = {};
        data.forEach(p => { provinceMap[p.id] = p.name; });
        setProvinces(provinceMap);
      }
    }
    fetchProvinces();
  }, []);

  // Handle map click
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!clickMode) return;
    
    const { lng, lat } = e.lngLat;
    setClickCoordinates({ lat, lng });
    
    // Remove previous click marker
    if (clickMarkerRef.current) {
      clickMarkerRef.current.remove();
    }
    
    // Create new click marker
    const el = document.createElement('div');
    el.className = 'relative';
    el.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
    `;
    
    clickMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current!);
    
    // Open form
    setShowForm(true);
    setClickMode(false);
  }, [clickMode]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [17.5, -12.5], // Center of Angola
      zoom: 5,
      pitch: 30,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.addControl(
      new mapboxgl.ScaleControl(),
      'bottom-left'
    );

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add click handler
  useEffect(() => {
    if (!map.current) return;
    
    map.current.on('click', handleMapClick);
    
    // Change cursor based on click mode
    if (clickMode) {
      map.current.getCanvas().style.cursor = 'crosshair';
    } else {
      map.current.getCanvas().style.cursor = '';
    }
    
    return () => {
      map.current?.off('click', handleMapClick);
    };
  }, [handleMapClick, clickMode]);

  // Handle form close
  const handleFormClose = (open: boolean) => {
    setShowForm(open);
    if (!open) {
      setClickCoordinates(null);
      if (clickMarkerRef.current) {
        clickMarkerRef.current.remove();
        clickMarkerRef.current = null;
      }
    }
  };

  // Add markers for occurrences
  useEffect(() => {
    if (!map.current || !occurrences) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Group occurrences by province
    const occurrencesByProvince: Record<string, typeof occurrences> = {};
    occurrences.forEach(occ => {
      const provinceId = occ.province_id;
      if (provinceId) {
        if (!occurrencesByProvince[provinceId]) {
          occurrencesByProvince[provinceId] = [];
        }
        occurrencesByProvince[provinceId].push(occ);
      }
    });

    // Create markers for each province with occurrences
    Object.entries(occurrencesByProvince).forEach(([provinceId, provOccurrences]) => {
      const provinceName = provinces[provinceId];
      if (!provinceName) return;

      const coords = PROVINCE_COORDINATES[provinceName];
      if (!coords) return;

      // Find most severe occurrence
      const severityOrder = ['critical', 'high', 'medium', 'low'];
      const mostSevere = provOccurrences.reduce((worst, curr) => {
        const worstIndex = severityOrder.indexOf(worst.severity);
        const currIndex = severityOrder.indexOf(curr.severity);
        return currIndex < worstIndex ? curr : worst;
      }, provOccurrences[0]);

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 max-w-xs';
      popupContent.innerHTML = `
        <h3 class="font-bold text-lg mb-2">${provinceName}</h3>
        <p class="text-sm text-muted-foreground mb-3">${provOccurrences.length} ocorrência(s)</p>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          ${provOccurrences.slice(0, 5).map(occ => `
            <div class="flex items-center gap-2 text-sm border-b pb-1">
              <span>${OCCURRENCE_TYPE_ICONS[occ.occurrence_type] || '⚠️'}</span>
              <span class="flex-1 truncate">${occ.title}</span>
              <span class="px-1.5 py-0.5 rounded text-xs" style="background: ${SEVERITY_COLORS[occ.severity]}20; color: ${SEVERITY_COLORS[occ.severity]}">
                ${occ.severity}
              </span>
            </div>
          `).join('')}
          ${provOccurrences.length > 5 ? `<p class="text-xs text-muted-foreground">+${provOccurrences.length - 5} mais...</p>` : ''}
        </div>
      `;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'relative cursor-pointer';
      el.innerHTML = `
        <div class="relative">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-110"
            style="background: ${SEVERITY_COLORS[mostSevere.severity]}; box-shadow: 0 0 20px ${SEVERITY_COLORS[mostSevere.severity]}80;"
          >
            ${provOccurrences.length}
          </div>
          ${mostSevere.severity === 'critical' ? `
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
          ` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setDOMContent(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [occurrences, provinces]);

  if (loading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="h-96 flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mapa de Ocorrências
              </CardTitle>
              <CardDescription>
                Visualização geográfica das ocorrências por província
              </CardDescription>
            </div>
            <Button
              variant={clickMode ? "default" : "outline"}
              size="sm"
              onClick={() => setClickMode(!clickMode)}
              className="gap-2"
            >
              {clickMode ? (
                <>
                  <MousePointer className="h-4 w-4" />
                  Clique no mapa...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Nova no Mapa
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {clickMode && (
              <div className="absolute top-0 left-0 right-0 z-10 bg-primary text-primary-foreground text-center py-2 text-sm animate-pulse">
                Clique no mapa para selecionar a localização da ocorrência
              </div>
            )}
            <div ref={mapContainer} className="h-[500px] rounded-b-lg" />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <p className="text-xs font-medium mb-2">Severidade</p>
              <div className="space-y-1">
                {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
                  <div key={severity} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="capitalize">{severity === 'critical' ? 'Crítico' : severity === 'high' ? 'Alto' : severity === 'medium' ? 'Médio' : 'Baixo'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{occurrences?.length || 0} Ocorrências</Badge>
                <Badge variant="destructive">
                  {occurrences?.filter(o => o.severity === 'critical').length || 0} Críticas
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <OccurrenceForm 
        open={showForm} 
        onOpenChange={handleFormClose}
        initialCoordinates={clickCoordinates}
      />
    </>
  );
}
