import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Coffee,
  MapPin,
  Users,
  Package,
  Ship,
  Truck,
  Calendar,
  FileText,
  QrCode,
  Edit,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  Globe,
  Building2,
  Leaf,
  Award,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CoffeeLot } from '@/hooks/useCoffee';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Props {
  lot: CoffeeLot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (lot: CoffeeLot) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; color: string }> = {
  registered: { label: 'Registado', variant: 'outline', icon: Package, color: 'text-slate-600' },
  in_processing: { label: 'Em Processamento', variant: 'secondary', icon: Coffee, color: 'text-amber-600' },
  in_transit: { label: 'Em Trânsito', variant: 'default', icon: Truck, color: 'text-blue-600' },
  exported: { label: 'Exportado', variant: 'default', icon: Ship, color: 'text-emerald-600' },
  rejected: { label: 'Rejeitado', variant: 'destructive', icon: Package, color: 'text-red-600' },
};

const timelineStages = [
  { key: 'registered', label: 'Registo', icon: Package },
  { key: 'in_processing', label: 'Processamento', icon: Coffee },
  { key: 'in_transit', label: 'Trânsito', icon: Truck },
  { key: 'exported', label: 'Exportação', icon: Ship },
];

export function CoffeeLotDetail({ lot, open, onOpenChange, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState('info');

  if (!lot) return null;

  const status = statusConfig[lot.status] || statusConfig.registered;
  const StatusIcon = status.icon;
  const verificationUrl = `${window.location.origin}/verificar/cafe?code=${lot.lot_code}`;

  const getCurrentStageIndex = () => {
    return timelineStages.findIndex(s => s.key === lot.status);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Coffee className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <SheetTitle className="text-xl">{lot.lot_code}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Registado em {lot.registered_at ? format(new Date(lot.registered_at), "d 'de' MMMM 'de' yyyy", { locale: pt }) : '-'}
                </p>
              </div>
            </div>
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(lot)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Certificado
            </Button>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="timeline">Rastreio</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Origin */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Origem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Província</p>
                    <p className="font-medium">{lot.origin_province?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Município</p>
                    <p className="font-medium">{lot.origin_municipality?.name || '-'}</p>
                  </div>
                </div>
                {lot.origin_location && (
                  <div>
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="font-medium">{lot.origin_location}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Produtores</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {lot.producers_count} produtores
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                  Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="font-medium">{lot.volume_kg.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sacas</p>
                    <p className="font-medium">{lot.bags_count || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Variedade</p>
                    <p className="font-medium flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      {lot.variety || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Qualidade</p>
                    <p className="font-medium flex items-center gap-1">
                      <Award className="h-4 w-4 text-amber-600" />
                      {lot.quality_grade || '-'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Colheita</p>
                    <p className="font-medium">{lot.harvest_year} - {lot.harvest_season || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Processamento</p>
                    <p className="font-medium">{lot.processing_method || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  Exportação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Exportador</p>
                    <p className="font-medium flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {lot.exporter_name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Comprador</p>
                    <p className="font-medium">{lot.buyer_name || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">País de Destino</p>
                  <p className="font-medium flex items-center gap-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {lot.destination_country || '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            {(lot.transport_document_number || lot.export_declaration_number) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lot.transport_document_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">Doc. Transporte</p>
                      <p className="font-medium">{lot.transport_document_number}</p>
                    </div>
                  )}
                  {lot.export_declaration_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">Declaração Exportação</p>
                      <p className="font-medium">{lot.export_declaration_number}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {lot.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{lot.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Timeline de Rastreio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timelineStages.map((stage, index) => {
                    const StageIcon = stage.icon;
                    const currentIndex = getCurrentStageIndex();
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={stage.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                              isCompleted
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted-foreground/30 text-muted-foreground'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <StageIcon className="h-5 w-5" />
                            )}
                          </div>
                          {index < timelineStages.length - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                              {stage.label}
                            </p>
                            {isCurrent && (
                              <Badge variant="outline" className="text-xs">Atual</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isCompleted ? (
                              <>
                                {stage.key === 'registered' && lot.registered_at && (
                                  format(new Date(lot.registered_at), "d MMM yyyy, HH:mm", { locale: pt })
                                )}
                                {stage.key === 'in_transit' && lot.dispatched_at && (
                                  format(new Date(lot.dispatched_at), "d MMM yyyy, HH:mm", { locale: pt })
                                )}
                                {stage.key === 'exported' && lot.exported_at && (
                                  format(new Date(lot.exported_at), "d MMM yyyy, HH:mm", { locale: pt })
                                )}
                                {!lot.registered_at && !lot.dispatched_at && !lot.exported_at && 'Concluído'}
                              </>
                            ) : (
                              'Pendente'
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  QR Code de Verificação
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium">{lot.lot_code}</p>
                  <p className="text-sm text-muted-foreground">
                    Digitalize este código para verificar a autenticidade e rastreabilidade do lote
                  </p>
                </div>
                <Separator />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">URL de Verificação:</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                    {verificationUrl}
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
