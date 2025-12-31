import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoffeeLots } from '@/hooks/useCoffee';
import { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  Warehouse, 
  Anchor, 
  Ship, 
  CheckCircle2, 
  Clock,
  Award,
  Leaf,
  FileCheck,
  Coffee
} from 'lucide-react';

const timelineStages = [
  { id: 'origin', label: 'Origem', icon: MapPin, description: 'Colheita e processamento' },
  { id: 'transport', label: 'Transporte', icon: Truck, description: 'Transporte interno' },
  { id: 'warehouse', label: 'Armazém', icon: Warehouse, description: 'Armazenamento e classificação' },
  { id: 'port', label: 'Porto', icon: Anchor, description: 'Preparação para exportação' },
  { id: 'export', label: 'Exportação', icon: Ship, description: 'Embarque internacional' },
];

const getStageIndex = (status: string) => {
  switch (status) {
    case 'registered': return 0;
    case 'dispatched': return 2;
    case 'at_port': return 3;
    case 'exported': return 4;
    default: return 0;
  }
};

export default function CoffeeTraceabilityPage() {
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const { data: lots } = useCoffeeLots();

  const selectedLot = lots?.find(lot => lot.id === selectedLotId);
  const currentStageIndex = selectedLot ? getStageIndex(selectedLot.status) : -1;

  // Mock data for demo purposes
  const certifications = [
    { name: 'UTZ Certified', status: 'active', validUntil: '2025-12-31' },
    { name: 'Rainforest Alliance', status: 'active', validUntil: '2025-06-30' },
    { name: 'Fair Trade', status: 'pending', validUntil: null },
  ];

  const sensoryProfile = {
    aroma: 8.2,
    flavor: 8.0,
    aftertaste: 7.8,
    acidity: 7.5,
    body: 8.1,
    balance: 7.9,
    uniformity: 10,
    cleanCup: 10,
    sweetness: 10,
    overall: 8.0,
    totalScore: 85.5,
    notes: ['Notas de chocolate', 'Frutas vermelhas', 'Caramelo suave'],
  };

  const eudrCompliance = {
    status: 'compliant',
    geolocalized: true,
    deforestationFree: true,
    legalCompliance: true,
    dueDiligenceDate: '2024-11-15',
    riskLevel: 'low',
  };

  return (
    <MainLayout title="Rastreio por Lote" subtitle="Acompanhe a jornada do café da origem à exportação">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Select value={selectedLotId} onValueChange={setSelectedLotId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um lote..." />
            </SelectTrigger>
            <SelectContent>
              {lots?.map((lot) => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.lot_code} - {lot.origin_province?.name || 'Sem província'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedLotId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Selecione um lote para ver o rastreio</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Linha Temporal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-0 right-0 top-8 h-1 bg-muted hidden md:block" />
                  <div 
                    className="absolute left-0 top-8 h-1 bg-primary hidden md:block transition-all duration-500"
                    style={{ width: `${(currentStageIndex / (timelineStages.length - 1)) * 100}%` }}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {timelineStages.map((stage, index) => {
                      const isCompleted = index <= currentStageIndex;
                      const isCurrent = index === currentStageIndex;
                      const Icon = stage.icon;
                      
                      return (
                        <div key={stage.id} className="flex flex-col items-center text-center relative">
                          <div 
                            className={`
                              w-16 h-16 rounded-full flex items-center justify-center z-10 transition-all duration-300
                              ${isCompleted 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                              }
                              ${isCurrent ? 'ring-4 ring-primary/30 scale-110' : ''}
                            `}
                          >
                            {isCompleted && index < currentStageIndex ? (
                              <CheckCircle2 className="h-8 w-8" />
                            ) : (
                              <Icon className="h-8 w-8" />
                            )}
                          </div>
                          <h3 className={`mt-3 font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {stage.label}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                          {isCurrent && (
                            <Badge className="mt-2" variant="default">Actual</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lot Info */}
            {selectedLot && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Lote</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="font-semibold">{selectedLot.lot_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Origem</p>
                      <p className="font-semibold">{selectedLot.origin_province?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-semibold">{selectedLot.volume_kg?.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Variedade</p>
                      <p className="font-semibold">{selectedLot.variety || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processamento</p>
                      <p className="font-semibold">{selectedLot.processing_method || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grau de Qualidade</p>
                      <p className="font-semibold">{selectedLot.quality_grade || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Safra</p>
                      <p className="font-semibold">{selectedLot.harvest_year || '-'} {selectedLot.harvest_season || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exportador</p>
                      <p className="font-semibold">{selectedLot.exporter_name || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        {cert.validUntil && (
                          <p className="text-xs text-muted-foreground">Válido até {cert.validUntil}</p>
                        )}
                      </div>
                      <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                        {cert.status === 'active' ? 'Activo' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Sensory Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    Perfil Sensorial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-primary">{sensoryProfile.totalScore}</span>
                    <span className="text-muted-foreground">/100</span>
                    <p className="text-sm text-muted-foreground">Pontuação SCA</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Aroma', value: sensoryProfile.aroma },
                      { label: 'Sabor', value: sensoryProfile.flavor },
                      { label: 'Acidez', value: sensoryProfile.acidity },
                      { label: 'Corpo', value: sensoryProfile.body },
                      { label: 'Equilíbrio', value: sensoryProfile.balance },
                    ].map((attr) => (
                      <div key={attr.label} className="flex items-center gap-2">
                        <span className="text-sm w-20">{attr.label}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(attr.value / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {sensoryProfile.notes.map((note, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{note}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* EUDR Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Conformidade EUDR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center
                      ${eudrCompliance.status === 'compliant' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}
                    `}>
                      <FileCheck className="h-10 w-10" />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <Badge variant={eudrCompliance.status === 'compliant' ? 'default' : 'secondary'} className="text-sm">
                      {eudrCompliance.status === 'compliant' ? 'Conforme' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Geolocalização</span>
                      <CheckCircle2 className={`h-5 w-5 ${eudrCompliance.geolocalized ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Livre de Desflorestação</span>
                      <CheckCircle2 className={`h-5 w-5 ${eudrCompliance.deforestationFree ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Conformidade Legal</span>
                      <CheckCircle2 className={`h-5 w-5 ${eudrCompliance.legalCompliance ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">Nível de Risco</span>
                      <Badge variant="outline" className="capitalize">{eudrCompliance.riskLevel === 'low' ? 'Baixo' : eudrCompliance.riskLevel}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Due Diligence: {eudrCompliance.dueDiligenceDate}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
