import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { simulateLoss, LossSimulation } from '@/hooks/useClimateRisk';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, TrendingDown, AlertTriangle, Users, MapPin, Wheat } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'seca', label: 'Seca' },
  { value: 'inundacao', label: 'Inundação' },
  { value: 'pragas', label: 'Pragas' },
  { value: 'tempestade', label: 'Tempestade' },
  { value: 'geada', label: 'Geada' },
];

const CROPS = ['Milho', 'Arroz', 'Feijão', 'Mandioca', 'Banana', 'Café', 'Soja', 'Batata'];

export function LossSimulator() {
  const [eventType, setEventType] = useState('seca');
  const [severity, setSeverity] = useState<'baixo' | 'medio' | 'alto' | 'critico'>('medio');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Milho', 'Arroz']);
  const [results, setResults] = useState<LossSimulation[] | null>(null);

  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data } = await supabase.from('provinces').select('id, name').order('name');
      return data || [];
    },
  });

  const handleSimulate = () => {
    const simResults = simulateLoss({
      eventType,
      severity,
      affectedProvinces: selectedProvinces.length > 0 ? selectedProvinces : ['province1'],
      crops: selectedCrops,
    });
    setResults(simResults);
  };

  const toggleProvince = (provinceId: string) => {
    setSelectedProvinces(prev =>
      prev.includes(provinceId)
        ? prev.filter(p => p !== provinceId)
        : [...prev, provinceId]
    );
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev =>
      prev.includes(crop)
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} Mil Milhões Kz`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} Milhões Kz`;
    }
    return `${(value / 1000).toFixed(0)} Mil Kz`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Simulation Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Parâmetros de Simulação
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para simular perdas económicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Type */}
          <div className="space-y-2">
            <Label>Tipo de Evento</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Severidade</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixo">Baixa</SelectItem>
                <SelectItem value="medio">Média</SelectItem>
                <SelectItem value="alto">Alta</SelectItem>
                <SelectItem value="critico">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provinces */}
          <div className="space-y-2">
            <Label>Províncias Afectadas</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {provinces?.map(province => (
                <div key={province.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={province.id}
                    checked={selectedProvinces.includes(province.id)}
                    onCheckedChange={() => toggleProvince(province.id)}
                  />
                  <label htmlFor={province.id} className="text-sm cursor-pointer">
                    {province.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedProvinces.length} províncias seleccionadas
            </p>
          </div>

          {/* Crops */}
          <div className="space-y-2">
            <Label>Culturas Afectadas</Label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map(crop => (
                <Badge
                  key={crop}
                  variant={selectedCrops.includes(crop) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCrop(crop)}
                >
                  {crop}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleSimulate} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Simular Perdas
          </Button>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Resultados da Simulação
          </CardTitle>
          <CardDescription>
            Cenários de perdas estimadas com base nos parâmetros definidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!results ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Configure os parâmetros e clique em "Simular Perdas"
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((scenario, idx) => (
                <div 
                  key={scenario.scenario} 
                  className={`p-4 rounded-lg border ${
                    idx === 1 ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      {scenario.scenario === 'Pessimista' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {scenario.scenario === 'Realista' && <TrendingDown className="h-4 w-4 text-yellow-500" />}
                      {scenario.scenario === 'Optimista' && <TrendingDown className="h-4 w-4 text-green-500" />}
                      Cenário {scenario.scenario}
                    </h4>
                    <Badge variant="outline">
                      {(scenario.probability * 100).toFixed(0)}% probabilidade
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Área Afectada
                      </span>
                      <span className="font-medium">
                        {scenario.affected_area_ha.toLocaleString()} ha
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Agricultores
                      </span>
                      <span className="font-medium">
                        {scenario.affected_farmers.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Wheat className="h-3 w-3" /> Culturas
                      </span>
                      <span className="font-medium">
                        {scenario.crops_affected.join(', ')}
                      </span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Perda Estimada</span>
                        <span className="text-lg font-bold text-destructive">
                          {formatCurrency(scenario.estimated_loss_aoa)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-2">Resumo da Análise</h4>
                <p className="text-sm text-muted-foreground">
                  Com base nos parâmetros seleccionados, a perda esperada (cenário realista) 
                  é de <strong>{formatCurrency(results[1].estimated_loss_aoa)}</strong>, 
                  afectando aproximadamente <strong>{results[1].affected_farmers.toLocaleString()}</strong> agricultores 
                  em <strong>{results[1].affected_area_ha.toLocaleString()} hectares</strong>.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
