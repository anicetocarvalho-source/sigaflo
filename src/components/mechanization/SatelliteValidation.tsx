import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Satellite, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

// Shoelace formula for polygon area calculation
function calculatePolygonArea(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  area = Math.abs(area) / 2;
  // Convert from degrees² to hectares (approximate at Angola latitude ~-12°)
  const latRad = (-12 * Math.PI) / 180;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos(latRad);
  const areaM2 = area * mPerDegLat * mPerDegLng;
  return areaM2 / 10000; // m² to ha
}

export function SatelliteValidation() {
  const [polygonJson, setPolygonJson] = useState('');
  const [declaredArea, setDeclaredArea] = useState('');
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [deviation, setDeviation] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    try {
      const geojson = JSON.parse(polygonJson);
      let coords: [number, number][] = [];

      if (geojson.type === 'Polygon') {
        coords = geojson.coordinates[0];
      } else if (geojson.type === 'Feature' && geojson.geometry?.type === 'Polygon') {
        coords = geojson.geometry.coordinates[0];
      } else {
        setError('GeoJSON deve ser do tipo Polygon ou Feature com geometria Polygon');
        return;
      }

      const areaHa = calculatePolygonArea(coords);
      setCalculatedArea(areaHa);

      if (declaredArea) {
        const declared = parseFloat(declaredArea);
        const dev = ((areaHa - declared) / declared) * 100;
        setDeviation(dev);
      }
    } catch {
      setError('JSON inválido. Cole um GeoJSON Polygon válido.');
    }
  };

  const getDeviationStatus = (dev: number) => {
    const abs = Math.abs(dev);
    if (abs <= 5) return { label: 'Dentro da Tolerância (±5%)', variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' };
    if (abs <= 15) return { label: 'Desvio Moderado', variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' };
    return { label: 'Desvio Elevado', variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Satellite className="h-5 w-5" /> Validação por Satélite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Cole o polígono GeoJSON do trabalho realizado para calcular a área e comparar com a área declarada na ordem de serviço.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Polígono GeoJSON</Label>
              <Textarea
                placeholder='{"type":"Polygon","coordinates":[[[13.2,-8.8],[13.3,-8.8],[13.3,-8.9],[13.2,-8.9],[13.2,-8.8]]]}'
                value={polygonJson}
                onChange={e => setPolygonJson(e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>Área Declarada (ha)</Label>
              <Input type="number" step="0.1" value={declaredArea} onChange={e => setDeclaredArea(e.target.value)} placeholder="Ex: 5.0" />
            </div>
            <Button onClick={handleCalculate} disabled={!polygonJson} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Área (Shoelace)
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-4">
            {calculatedArea !== null && (
              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Área Calculada (satélite)</p>
                    <p className="text-3xl font-bold">{calculatedArea.toFixed(2)} ha</p>
                  </div>
                  {declaredArea && (
                    <div>
                      <p className="text-sm text-muted-foreground">Área Declarada</p>
                      <p className="text-xl">{parseFloat(declaredArea).toFixed(2)} ha</p>
                    </div>
                  )}
                  {deviation !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Desvio</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-xl font-semibold ${getDeviationStatus(deviation).color}`}>
                          {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                        </p>
                        <Badge variant={getDeviationStatus(deviation).variant}>
                          {getDeviationStatus(deviation).label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {calculatedArea === null && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <div className="text-center">
                  <Satellite className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Cole um GeoJSON e clique em "Calcular" para ver os resultados</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
