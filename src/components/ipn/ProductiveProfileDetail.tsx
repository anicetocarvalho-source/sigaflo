import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  ArrowLeft,
  FileCheck,
  Wheat,
  TrendingUp,
  AlertTriangle,
  Award
} from 'lucide-react';
import { useProductiveProfile } from '@/hooks/useIPN';
import { ReputationScore, ScoreBreakdown } from './ReputationScore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProductiveProfileDetailProps {
  profileId: string;
  onBack: () => void;
}

export function ProductiveProfileDetail({ profileId, onBack }: ProductiveProfileDetailProps) {
  const { data, isLoading } = useProductiveProfile(profileId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Perfil não encontrado</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const { profile, productionHistory, certificationHistory, incentivesHistory } = data;

  const getTypeIcon = () => {
    switch (profile.type) {
      case 'cooperative':
        return <Users className="h-6 w-6" />;
      case 'company':
        return <Building2 className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getTypeLabel = () => {
    switch (profile.type) {
      case 'cooperative':
        return 'Cooperativa';
      case 'company':
        return 'Empresa';
      default:
        return 'Produtor Individual';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      validated: 'bg-cyan-100 text-cyan-800',
      approved: 'bg-green-100 text-green-800',
      issued: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      submitted: 'Submetido',
      validated: 'Validado',
      approved: 'Aprovado',
      issued: 'Emitido',
      rejected: 'Rejeitado'
    };
    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          {profile.tradeName && (
            <p className="text-muted-foreground">{profile.tradeName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getTypeIcon()}
                </div>
                <div>
                  <CardTitle>Perfil Produtivo</CardTitle>
                  <p className="text-sm text-muted-foreground">{getTypeLabel()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {profile.isActive ? (
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nº Registo</p>
                <p className="font-medium">{profile.registrationNumber || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">BI/NIF</p>
                <p className="font-medium">{profile.biNif || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Data de Registo</p>
                <p className="font-medium">
                  {profile.registrationDate 
                    ? format(new Date(profile.registrationDate), 'dd/MM/yyyy')
                    : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Área Total</p>
                <p className="font-medium">{profile.totalArea?.toLocaleString() || 0} ha</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Contactos</h4>
              <div className="grid grid-cols-2 gap-4">
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Localização</h4>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{[profile.province, profile.municipality, profile.commune].filter(Boolean).join(', ')}</p>
                  {profile.village && <p className="text-sm text-muted-foreground">{profile.village}</p>}
                  {profile.address && <p className="text-sm text-muted-foreground">{profile.address}</p>}
                </div>
              </div>
            </div>

            {profile.mainCrops && profile.mainCrops.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Culturas Principais</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.mainCrops.map((crop, i) => (
                    <Badge key={i} variant="secondary">{crop}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reputation Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Reputação Produtiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBreakdown
              production={profile.productionScore}
              compliance={profile.complianceScore}
              certification={profile.certificationScore}
              overall={profile.overallScore}
            />
          </CardContent>
        </Card>
      </div>

      {/* History Tabs */}
      <Tabs defaultValue="production">
        <TabsList>
          <TabsTrigger value="production" className="gap-2">
            <Wheat className="h-4 w-4" />
            Produção ({productionHistory.length})
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Certificações ({certificationHistory.length})
          </TabsTrigger>
          <TabsTrigger value="incentives" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Incentivos ({incentivesHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Produção</CardTitle>
            </CardHeader>
            <CardContent>
              {productionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wheat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sem registos de produção</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Época</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Qualidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.year}</TableCell>
                        <TableCell>{record.season || '-'}</TableCell>
                        <TableCell>{record.product}</TableCell>
                        <TableCell>{record.quantity.toLocaleString()} {record.unit}</TableCell>
                        <TableCell>
                          {record.quality ? (
                            <Badge variant="outline">{record.quality}</Badge>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Certificações</CardTitle>
            </CardHeader>
            <CardContent>
              {certificationHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sem certificados emitidos</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data Emissão</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Culturas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificationHistory.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-sm">{cert.number}</TableCell>
                        <TableCell className="capitalize">{cert.type}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell>
                          {cert.issueDate 
                            ? format(new Date(cert.issueDate), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {cert.expiryDate 
                            ? format(new Date(cert.expiryDate), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {cert.crops?.slice(0, 2).map((crop, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{crop}</Badge>
                            ))}
                            {(cert.crops?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(cert.crops?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incentives">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Incentivos e Sanções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Módulo de incentivos não configurado</p>
                <p className="text-sm">Esta funcionalidade será integrada futuramente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
