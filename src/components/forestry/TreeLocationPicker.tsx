import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Crosshair } from 'lucide-react';

interface TreeLocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, accuracyM?: number) => void;
  accuracyM?: number;
}

// Limites aproximados de Angola
const ANGOLA_BOUNDS = { minLat: -18.1, maxLat: -4.3, minLng: 11.6, maxLng: 24.1 };

const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

export function TreeLocationPicker({
  latitude,
  longitude,
  onChange,
  accuracyM,
}: TreeLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.functions
      .invoke('get-mapbox-token')
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data?.token) {
          setTokenError(true);
          return;
        }
        setToken(data.token);
      })
      .catch(() => active && setTokenError(true));
    return () => {
      active = false;
    };
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    const hasPoint = isValidLatLng(latitude, longitude);
    const center: [number, number] = hasPoint ? [longitude, latitude] : [17.5, -12.5];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom: hasPoint ? 16 : 5,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    const marker = new mapboxgl.Marker({ color: 'hsl(142 76% 36%)', draggable: true })
      .setLngLat(center)
      .addTo(map);

    marker.on('dragend', () => {
      const { lng, lat } = marker.getLngLat();
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    });

    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      onChange(Number(e.lngLat.lat.toFixed(6)), Number(e.lngLat.lng.toFixed(6)));
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Sincronizar marcador quando lat/lng mudam externamente (ex.: input manual ou GPS)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (!isValidLatLng(latitude, longitude)) return;
    const current = markerRef.current.getLngLat();
    if (
      Math.abs(current.lat - latitude) < 1e-6 &&
      Math.abs(current.lng - longitude) < 1e-6
    ) {
      return;
    }
    markerRef.current.setLngLat([longitude, latitude]);
    mapRef.current.easeTo({ center: [longitude, latitude], zoom: Math.max(mapRef.current.getZoom(), 15) });
  }, [latitude, longitude]);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não disponível neste dispositivo');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : undefined;
        if (
          lat < ANGOLA_BOUNDS.minLat ||
          lat > ANGOLA_BOUNDS.maxLat ||
          lng < ANGOLA_BOUNDS.minLng ||
          lng > ANGOLA_BOUNDS.maxLng
        ) {
          setGeoError('Coordenadas fora dos limites de Angola. Verifique o sinal GPS.');
        }
        onChange(lat, lng, acc);
        setLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Permissão de localização negada'
            : 'Falha ao obter localização GPS',
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const accuracyTone =
    accuracyM == null
      ? 'secondary'
      : accuracyM <= 10
      ? 'default'
      : accuracyM <= 30
      ? 'secondary'
      : 'destructive';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Toque no mapa ou arraste o marcador para ajustar.</span>
        </div>
        <div className="flex items-center gap-2">
          {accuracyM != null && (
            <Badge variant={accuracyTone as 'default' | 'secondary' | 'destructive'}>
              GPS ±{accuracyM} m
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleUseGps}
            disabled={locating}
          >
            {locating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="mr-2 h-4 w-4" />
            )}
            Usar GPS
          </Button>
        </div>
      </div>

      <div className="relative h-64 w-full overflow-hidden rounded-md border bg-muted">
        {tokenError ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            Mapa indisponível. Use os campos de latitude/longitude abaixo.
          </div>
        ) : !token ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div ref={containerRef} className="absolute inset-0" />
        )}
      </div>

      {geoError && <p className="text-xs text-destructive">{geoError}</p>}
      {isValidLatLng(latitude, longitude) && (
        <p className="text-xs text-muted-foreground">
          Lat: {latitude.toFixed(6)} • Lng: {longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
