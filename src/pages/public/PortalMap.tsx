import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  usePublicAgricultureStats,
  usePublicForestryStats,
} from "@/hooks/usePublicStats";

export default function PortalMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapToken, setMapToken] = useState<string | null>(null);
  const { data: agriStats } = usePublicAgricultureStats();
  const { data: forestStats } = usePublicForestryStats();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await supabase.functions.invoke("get-mapbox-token");
        if (data?.token) setMapToken(data.token);
      } catch {
        console.error("Failed to fetch map token");
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapToken || !mapContainer.current || mapLoaded) return;

    import("mapbox-gl").then((mapboxgl) => {
      (mapboxgl as any).accessToken = mapToken;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [17.87, -11.20],
        zoom: 5,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Angola provinces markers (approximate centroids)
      const provinces = [
        { name: "Luanda", lat: -8.84, lng: 13.23 },
        { name: "Benguela", lat: -12.58, lng: 13.40 },
        { name: "Huíla", lat: -14.92, lng: 13.53 },
        { name: "Huambo", lat: -12.78, lng: 15.73 },
        { name: "Bié", lat: -12.37, lng: 17.67 },
        { name: "Malanje", lat: -9.54, lng: 16.34 },
        { name: "Uíge", lat: -7.61, lng: 15.05 },
        { name: "Kwanza Sul", lat: -10.00, lng: 14.85 },
        { name: "Kwanza Norte", lat: -9.17, lng: 14.97 },
        { name: "Cabinda", lat: -5.56, lng: 12.20 },
        { name: "Zaire", lat: -6.27, lng: 14.24 },
        { name: "Lunda Norte", lat: -8.35, lng: 19.18 },
        { name: "Lunda Sul", lat: -10.72, lng: 20.39 },
        { name: "Moxico", lat: -13.43, lng: 21.43 },
        { name: "Cuando Cubango", lat: -16.00, lng: 18.50 },
        { name: "Cunene", lat: -16.80, lng: 15.75 },
        { name: "Namibe", lat: -15.20, lng: 12.15 },
        { name: "Bengo", lat: -8.55, lng: 13.83 },
      ];

      map.on("load", () => {
        provinces.forEach((prov) => {
          const el = document.createElement("div");
          el.className = "w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground shadow cursor-pointer";
          el.style.backgroundColor = "hsl(142, 71%, 45%)";

          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
            `<div class="p-2"><strong>${prov.name}</strong><p class="text-xs text-gray-500">Província de Angola</p></div>`
          );

          new mapboxgl.Marker(el)
            .setLngLat([prov.lng, prov.lat])
            .setPopup(popup)
            .addTo(map);
        });
        setMapLoaded(true);
      });
    });
  }, [mapToken, mapLoaded]);

  const fmt = (n: any) => n == null ? "—" : Number(n).toLocaleString("pt-AO");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] flex items-center gap-2">
          <MapPin className="h-8 w-8 text-primary" />
          Mapa Interactivo
        </h1>
        <p className="text-muted-foreground mt-1">Distribuição geográfica do sector agroflorestal angolano</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Agricultores", value: fmt(agriStats?.total_farmers) },
          { label: "Hectares", value: fmt(agriStats?.total_cultivated_ha) },
          { label: "Certificados", value: fmt(agriStats?.certificates_issued) },
          { label: "Licenças", value: fmt(forestStats?.active_licenses) },
        ].map((k, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">{k.label}</p>
              <p className="text-xl font-bold font-['Outfit']">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {!mapToken ? (
            <Skeleton className="h-[500px] w-full rounded-lg" />
          ) : (
            <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
