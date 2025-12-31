import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Leaf, 
  FileText,
  Plus,
  ArrowLeft,
  CreditCard,
  Fingerprint,
  Eye
} from 'lucide-react';
import { useFarmer } from '@/hooks/useFarmers';
import { useProductionHistory, useCertificates } from '@/hooks/useCertificates';
import { FarmerTypeIcon, getFarmerTypeLabel, getFarmerTypeColor } from './FarmerTypeIcon';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { FarmerCard } from './FarmerCard';

export const FarmerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: farmer, isLoading } = useFarmer(id!);
  const { data: productionHistory } = useProductionHistory(id);
  const { data: certificates } = useCertificates({ farmer_id: id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Registo não encontrado</p>
        <Link to="/agricultores">
          <Button variant="link">Voltar à lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/agricultores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{farmer.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">
              {farmer.registration_number}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/agricultores/${farmer.id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link to={`/certificados/novo?farmer_id=${farmer.id}`}>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Emitir Certificado
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getFarmerTypeColor(farmer.farmer_type)}>
              <FarmerTypeIcon type={farmer.farmer_type} className="mr-1 h-4 w-4" />
              {getFarmerTypeLabel(farmer.farmer_type)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowStatusBadge status={farmer.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Área Cultivada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {farmer.cultivated_area_ha?.toFixed(2) || '—'} <span className="text-sm font-normal text-muted-foreground">ha</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          {(farmer.farmer_type === 'individual' || farmer.farmer_type === 'family') && (
            <TabsTrigger value="card">Cartão</TabsTrigger>
          )}
          <TabsTrigger value="production">Histórico de Produção</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados de Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Photo for individual/family farmers */}
                {(farmer.farmer_type === 'individual' || farmer.farmer_type === 'family') && farmer.photo_url && (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={farmer.photo_url} 
                      alt="Foto do agricultor"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                  </div>
                )}
                {farmer.trade_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nome Comercial</p>
                    <p className="font-medium">{farmer.trade_name}</p>
                  </div>
                )}
                {farmer.bi_nif && (
                  <div>
                    <p className="text-sm text-muted-foreground">BI / NIF</p>
                    <p className="font-medium">{farmer.bi_nif}</p>
                  </div>
                )}
                {farmer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{farmer.phone}</p>
                  </div>
                )}
                {farmer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{farmer.email}</p>
                  </div>
                )}

                {/* Biometrics and documents for individual/family */}
                {(farmer.farmer_type === 'individual' || farmer.farmer_type === 'family') && (
                  <div className="pt-4 border-t space-y-3">
                    {farmer.fingerprint_data && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Fingerprint className="h-4 w-4" />
                        <span className="text-sm">Impressão digital registada</span>
                      </div>
                    )}
                    {farmer.document_bi_url && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">BI digitalizado</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(farmer.document_bi_url, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {farmer.provinces && (
                  <div>
                    <p className="text-sm text-muted-foreground">Província</p>
                    <p className="font-medium">{farmer.provinces.name}</p>
                  </div>
                )}
                {farmer.municipalities && (
                  <div>
                    <p className="text-sm text-muted-foreground">Município</p>
                    <p className="font-medium">{farmer.municipalities.name}</p>
                  </div>
                )}
                {farmer.communes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Comuna</p>
                    <p className="font-medium">{farmer.communes.name}</p>
                  </div>
                )}
                {farmer.village && (
                  <div>
                    <p className="text-sm text-muted-foreground">Aldeia</p>
                    <p className="font-medium">{farmer.village}</p>
                  </div>
                )}
                {(farmer.latitude && farmer.longitude) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Coordenadas</p>
                    <p className="font-mono text-sm">
                      {farmer.latitude?.toFixed(6)}, {farmer.longitude?.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Dados Agrícolas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Área Total</p>
                    <p className="font-medium">{farmer.total_area_ha?.toFixed(2) || '—'} ha</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Área Cultivada</p>
                    <p className="font-medium">{farmer.cultivated_area_ha?.toFixed(2) || '—'} ha</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Irrigação</p>
                    <p className="font-medium">{farmer.irrigation_type || '—'}</p>
                  </div>
                  {farmer.main_crops && farmer.main_crops.length > 0 && (
                    <div className="md:col-span-3">
                      <p className="text-sm text-muted-foreground mb-2">Culturas Principais</p>
                      <div className="flex flex-wrap gap-2">
                        {farmer.main_crops.map((crop) => (
                          <Badge key={crop} variant="secondary">{crop}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Farmer Card Tab - only for individual/family farmers */}
        {(farmer.farmer_type === 'individual' || farmer.farmer_type === 'family') && (
          <TabsContent value="card">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Cartão do Agricultor
                </h3>
                {farmer.status === 'approved' || farmer.status === 'issued' ? (
                  <FarmerCard farmer={farmer} />
                ) : (
                  <Card className="p-6">
                    <div className="text-center text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Cartão não disponível</p>
                      <p className="text-sm mt-2">
                        O cartão do agricultor será gerado automaticamente após a validação do registo.
                      </p>
                      <Badge variant="outline" className="mt-4">
                        Estado atual: {farmer.status}
                      </Badge>
                    </div>
                  </Card>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Documentos Anexados</h4>
                {farmer.document_bi_url ? (
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">Bilhete de Identidade</p>
                          <p className="text-xs text-muted-foreground">Documento digitalizado</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(farmer.document_bi_url, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum documento anexado</p>
                )}
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="production">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Produção</CardTitle>
              <Link to={`/agricultores/${farmer.id}/producao/nova`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produção
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {productionHistory && productionHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Cultura</TableHead>
                      <TableHead>Área (ha)</TableHead>
                      <TableHead>Produção (kg)</TableHead>
                      <TableHead>Rendimento (kg/ha)</TableHead>
                      <TableHead>Qualidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionHistory.map((prod) => (
                      <TableRow key={prod.id}>
                        <TableCell>{prod.year}</TableCell>
                        <TableCell>{prod.season}</TableCell>
                        <TableCell>{prod.crop_type}</TableCell>
                        <TableCell>{prod.area_planted_ha?.toFixed(2)}</TableCell>
                        <TableCell>{prod.actual_yield_kg?.toLocaleString()}</TableCell>
                        <TableCell>{prod.yield_per_ha?.toFixed(2)}</TableCell>
                        <TableCell>
                          {prod.quality_grade && (
                            <Badge variant="outline">{prod.quality_grade}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum histórico de produção registado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Certificados Emitidos</CardTitle>
              <Link to={`/certificados/novo?farmer_id=${farmer.id}`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Certificado
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {certificates && certificates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Culturas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono">{cert.certificate_number}</TableCell>
                        <TableCell>{cert.certificate_type}</TableCell>
                        <TableCell>{cert.year}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {cert.crops?.slice(0, 3).map((crop) => (
                              <Badge key={crop} variant="outline" className="text-xs">
                                {crop}
                              </Badge>
                            ))}
                            {cert.crops?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{cert.crops.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <WorkflowStatusBadge status={cert.status} />
                        </TableCell>
                        <TableCell>
                          <Link to={`/certificados/${cert.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum certificado emitido
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
