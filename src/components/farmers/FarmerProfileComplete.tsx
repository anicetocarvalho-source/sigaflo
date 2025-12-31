import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Wallet,
  FileCheck,
  CloudRain,
  BarChart3,
  Shield,
  Building2,
  Minus
} from 'lucide-react';
import { useFarmer } from '@/hooks/useFarmers';
import { useProductionHistory, useCertificates } from '@/hooks/useCertificates';
import { useFinancialProfile, useCreditSimulations, useProductionCertificates, useCreditDossiers, useInsuranceRiskScores } from '@/hooks/useCreditInsurance';
import { useAllocations } from '@/hooks/useIncentives';
import { useOccurrences } from '@/hooks/useOccurrences';
import { FarmerTypeIcon, getFarmerTypeLabel, getFarmerTypeColor } from './FarmerTypeIcon';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-green-600 bg-green-100';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getScoreIcon = (score: number) => {
  if (score >= 70) return <TrendingUp className="h-4 w-4" />;
  if (score >= 40) return <Minus className="h-4 w-4" />;
  return <TrendingDown className="h-4 w-4" />;
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'bg-green-100 text-green-700';
    case 'medium': return 'bg-yellow-100 text-yellow-700';
    case 'high': return 'bg-orange-100 text-orange-700';
    case 'very_high': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getRiskLabel = (risk: string) => {
  switch (risk) {
    case 'low': return 'Baixo';
    case 'medium': return 'Médio';
    case 'high': return 'Alto';
    case 'very_high': return 'Muito Alto';
    default: return risk;
  }
};

export const FarmerProfileComplete = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  
  const { data: farmer, isLoading } = useFarmer(id!);
  const { data: productionHistory } = useProductionHistory(id);
  const { data: certificates } = useCertificates({ farmer_id: id });
  const { data: financialProfile } = useFinancialProfile(id!);
  const { data: creditSimulations } = useCreditSimulations(id);
  const { data: productionCertificates } = useProductionCertificates(id);
  const { data: creditDossiers } = useCreditDossiers({ farmerId: id });
  const { data: insuranceRiskScores } = useInsuranceRiskScores(id);
  const { data: allocations } = useAllocations(undefined, undefined);
  const { data: allOccurrences } = useOccurrences();

  // Filter allocations and occurrences for this farmer
  const farmerAllocations = allocations?.filter(a => a.farmer_id === id) || [];
  const farmerOccurrences = allOccurrences?.filter(o => 
    o.province_id === farmer?.province_id || 
    o.municipality_id === farmer?.municipality_id
  ) || [];

  // Calculate total incentives received
  const totalIncentivesReceived = farmerAllocations
    .filter(a => a.status === 'disbursed')
    .reduce((sum, a) => sum + (a.amount_aoa || 0), 0);

  // Fetch mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/get-mapbox-token');
        if (response.ok) {
          const data = await response.json();
          setMapboxToken(data.token);
        }
      } catch (error) {
        // Fallback - will show placeholder
        console.log('Mapbox token not available');
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !farmer?.latitude || !farmer?.longitude) return;
    if (map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [farmer.longitude, farmer.latitude],
      zoom: 14,
    });

    new mapboxgl.Marker({ color: '#16a34a' })
      .setLngLat([farmer.longitude, farmer.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${farmer.name}</strong>`))
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, farmer]);

  const handleGenerateCertificate = () => {
    navigate(`/certificados/novo?farmer_id=${id}`);
  };

  const handleGenerateDossier = () => {
    toast.info('Funcionalidade de geração de dossiê em desenvolvimento');
  };

  const handleReportOccurrence = () => {
    navigate(`/ocorrencias?report=true&province_id=${farmer?.province_id}`);
  };

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

  const creditScore = financialProfile?.credit_score || 0;
  const insuranceScore = insuranceRiskScores?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/agricultores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{farmer.name}</h1>
              <Badge className={getFarmerTypeColor(farmer.farmer_type)}>
                <FarmerTypeIcon type={farmer.farmer_type} className="mr-1 h-3 w-3" />
                {getFarmerTypeLabel(farmer.farmer_type)}
              </Badge>
              <WorkflowStatusBadge status={farmer.status} />
            </div>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {farmer.registration_number}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleReportOccurrence}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Reportar Ocorrência
          </Button>
          <Button variant="outline" onClick={handleGenerateDossier}>
            <FileCheck className="mr-2 h-4 w-4" />
            Gerar Dossiê Financeiro
          </Button>
          <Button onClick={handleGenerateCertificate}>
            <FileText className="mr-2 h-4 w-4" />
            Gerar Certificado
          </Button>
          <Link to={`/agricultores/${farmer.id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {farmer.cultivated_area_ha?.toFixed(1) || '—'} ha
                </p>
                <p className="text-sm text-muted-foreground">Área Cultivada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getScoreColor(creditScore)}`}>
                {getScoreIcon(creditScore)}
              </div>
              <div>
                <p className="text-2xl font-bold">{creditScore || '—'}</p>
                <p className="text-sm text-muted-foreground">Score Produtivo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalIncentivesReceived > 0 
                    ? `${(totalIncentivesReceived / 1000000).toFixed(1)}M` 
                    : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Incentivos (AOA)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CloudRain className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{farmerOccurrences.length}</p>
                <p className="text-sm text-muted-foreground">Ocorrências Climáticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="identification" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="identification" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Identificação</span>
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Produção</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Certificados</span>
          </TabsTrigger>
          <TabsTrigger value="occurrences" className="flex items-center gap-1">
            <CloudRain className="h-4 w-4" />
            <span className="hidden sm:inline">Ocorrências</span>
          </TabsTrigger>
          <TabsTrigger value="incentives" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Incentivos</span>
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Scores</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Identification & Location */}
        <TabsContent value="identification" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Identification Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados de Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {farmer.trade_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nome Comercial</p>
                      <p className="font-medium">{farmer.trade_name}</p>
                    </div>
                  )}
                  {farmer.bi_nif && (
                    <div>
                      <p className="text-sm text-muted-foreground">BI / NIF</p>
                      <p className="font-medium font-mono">{farmer.bi_nif}</p>
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
                  {farmer.registration_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Registo</p>
                      <p className="font-medium">
                        {new Date(farmer.registration_date).toLocaleDateString('pt-AO')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                {(farmer.latitude && farmer.longitude) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coordenadas</p>
                    <p className="font-mono text-sm">
                      {farmer.latitude?.toFixed(6)}, {farmer.longitude?.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização no Mapa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {farmer.latitude && farmer.longitude ? (
                <div 
                  ref={mapContainer} 
                  className="w-full h-[400px] rounded-lg border"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <div className="w-full h-[400px] rounded-lg border bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Coordenadas não registadas</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agricultural Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Dados Agrícolas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Área Total</p>
                  <p className="text-xl font-bold">{farmer.total_area_ha?.toFixed(2) || '—'} ha</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Área Cultivada</p>
                  <p className="text-xl font-bold">{farmer.cultivated_area_ha?.toFixed(2) || '—'} ha</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Irrigação</p>
                  <p className="text-xl font-bold">{farmer.irrigation_type || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Anos de Produção</p>
                  <p className="text-xl font-bold">{financialProfile?.production_years || '—'}</p>
                </div>
              </div>
              {farmer.main_crops && farmer.main_crops.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">Culturas Principais</p>
                  <div className="flex flex-wrap gap-2">
                    {farmer.main_crops.map((crop) => (
                      <Badge key={crop} variant="secondary" className="text-sm">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {farmer.secondary_crops && farmer.secondary_crops.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Culturas Secundárias</p>
                  <div className="flex flex-wrap gap-2">
                    {farmer.secondary_crops.map((crop) => (
                      <Badge key={crop} variant="outline" className="text-sm">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Production History */}
        <TabsContent value="production" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico de Produção
                </CardTitle>
                <CardDescription>
                  Linha temporal de todas as campanhas agrícolas
                </CardDescription>
              </div>
              <Link to={`/agricultores/${farmer.id}/producao/nova`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produção
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {productionHistory && productionHistory.length > 0 ? (
                <>
                  {/* Timeline View */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      {productionHistory.map((prod, index) => (
                        <div key={prod.id} className="relative pl-10">
                          <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                          <Card>
                            <CardContent className="pt-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{prod.year} - {prod.season}</Badge>
                                    <Badge>{prod.crop_type}</Badge>
                                    {prod.quality_grade && (
                                      <Badge variant="secondary">Qualidade: {prod.quality_grade}</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {prod.area_planted_ha?.toFixed(2)} ha plantados
                                  </p>
                                </div>
                                <div className="flex gap-6 text-right">
                                  <div>
                                    <p className="text-lg font-bold text-primary">
                                      {prod.actual_yield_kg?.toLocaleString()} kg
                                    </p>
                                    <p className="text-xs text-muted-foreground">Produção Total</p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold">
                                      {prod.yield_per_ha?.toFixed(0)} kg/ha
                                    </p>
                                    <p className="text-xs text-muted-foreground">Rendimento</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid gap-4 md:grid-cols-3 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {productionHistory.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Campanhas Registadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {productionHistory.reduce((sum, p) => sum + (p.actual_yield_kg || 0), 0).toLocaleString()} kg
                      </p>
                      <p className="text-sm text-muted-foreground">Produção Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {(productionHistory.reduce((sum, p) => sum + (p.yield_per_ha || 0), 0) / productionHistory.length).toFixed(0)} kg/ha
                      </p>
                      <p className="text-sm text-muted-foreground">Rendimento Médio</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum histórico de produção registado</p>
                  <Link to={`/agricultores/${farmer.id}/producao/nova`}>
                    <Button variant="link" className="mt-2">
                      Adicionar primeira produção
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Certificates */}
        <TabsContent value="certificates" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Official Certificates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certificados Oficiais
                  </CardTitle>
                  <CardDescription>Certificados agrícolas emitidos</CardDescription>
                </div>
                <Link to={`/certificados/novo?farmer_id=${farmer.id}`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {certificates && certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{cert.certificate_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.certificate_type} - {cert.year}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <WorkflowStatusBadge status={cert.status} />
                          <Link to={`/certificados/${cert.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhum certificado emitido
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Production Certificates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Certificados de Historial Produtivo
                </CardTitle>
                <CardDescription>Para instituições financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                {productionCertificates && productionCertificates.length > 0 ? (
                  <div className="space-y-3">
                    {productionCertificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{cert.certificate_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.period_start_year} - {cert.period_end_year}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cert.total_production_kg?.toLocaleString()} kg total
                          </p>
                        </div>
                        <Badge className={cert.is_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {cert.is_valid ? 'Válido' : 'Expirado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhum certificado de historial produtivo
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Credit Dossiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dossiês de Crédito
              </CardTitle>
              <CardDescription>Dossiês completos para instituições financeiras</CardDescription>
            </CardHeader>
            <CardContent>
              {creditDossiers && creditDossiers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Crédito Recomendado</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditDossiers.map((dossier) => (
                      <TableRow key={dossier.id}>
                        <TableCell className="font-mono">{dossier.dossier_number}</TableCell>
                        <TableCell>
                          {new Date(dossier.created_at).toLocaleDateString('pt-AO')}
                        </TableCell>
                        <TableCell>
                          {dossier.recommended_credit_aoa?.toLocaleString()} AOA
                        </TableCell>
                        <TableCell>
                          <Badge className={getScoreColor(dossier.credit_score || 0)}>
                            {dossier.credit_score}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{dossier.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum dossiê de crédito gerado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Climate Occurrences */}
        <TabsContent value="occurrences" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5" />
                  Ocorrências Climáticas
                </CardTitle>
                <CardDescription>
                  Eventos climáticos na região do agricultor
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleReportOccurrence}>
                <Plus className="mr-2 h-4 w-4" />
                Reportar Ocorrência
              </Button>
            </CardHeader>
            <CardContent>
              {farmerOccurrences.length > 0 ? (
                <div className="space-y-4">
                  {farmerOccurrences.slice(0, 10).map((occurrence) => (
                    <div key={occurrence.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          occurrence.severity === 'critical' ? 'bg-red-100' :
                          occurrence.severity === 'high' ? 'bg-orange-100' :
                          occurrence.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            occurrence.severity === 'critical' ? 'text-red-600' :
                            occurrence.severity === 'high' ? 'text-orange-600' :
                            occurrence.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{occurrence.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {occurrence.occurrence_type} - {new Date(occurrence.report_date).toLocaleDateString('pt-AO')}
                          </p>
                          {occurrence.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {occurrence.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={occurrence.status === 'resolved' ? 'default' : 'secondary'}>
                          {occurrence.status}
                        </Badge>
                        {occurrence.estimated_loss_aoa && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Perda: {(occurrence.estimated_loss_aoa / 1000000).toFixed(1)}M AOA
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma ocorrência climática registada na região</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Incentives */}
        <TabsContent value="incentives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Incentivos e Subsídios Recebidos
              </CardTitle>
              <CardDescription>
                Histórico de apoios financeiros e programas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {farmerAllocations.length > 0 ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        {farmerAllocations.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Total de Alocações</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {totalIncentivesReceived.toLocaleString()} AOA
                      </p>
                      <p className="text-sm text-muted-foreground">Total Recebido</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">
                        {farmerAllocations.filter(a => a.status === 'pending').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Programa</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmerAllocations.map((allocation) => (
                        <TableRow key={allocation.id}>
                          <TableCell>
                            <p className="font-medium">{allocation.program?.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {allocation.program?.code}
                            </p>
                          </TableCell>
                          <TableCell>
                            {new Date(allocation.allocation_date).toLocaleDateString('pt-AO')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {allocation.amount_aoa?.toLocaleString()} AOA
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              allocation.status === 'disbursed' ? 'bg-green-100 text-green-700' :
                              allocation.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                              allocation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {allocation.status === 'disbursed' ? 'Desembolsado' :
                               allocation.status === 'approved' ? 'Aprovado' :
                               allocation.status === 'pending' ? 'Pendente' :
                               allocation.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum incentivo ou subsídio registado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Scores */}
        <TabsContent value="scores" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Productive/Credit Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Score Produtivo e de Crédito
                </CardTitle>
                <CardDescription>
                  Avaliação da capacidade produtiva e creditícia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {financialProfile ? (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <div className={`inline-flex items-center gap-2 text-4xl font-bold ${
                        creditScore >= 70 ? 'text-green-600' :
                        creditScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {getScoreIcon(creditScore)}
                        {creditScore}
                      </div>
                      <Progress value={creditScore} className="mt-4 h-3" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Classificação: {financialProfile.risk_classification === 'low' ? 'Baixo Risco' :
                                        financialProfile.risk_classification === 'medium' ? 'Risco Médio' : 'Alto Risco'}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Anos de Produção</p>
                        <p className="text-xl font-bold">{financialProfile.production_years}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Estabilidade</p>
                        <p className="text-xl font-bold">{financialProfile.production_stability_pct?.toFixed(0)}%</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Produção Média Anual</p>
                        <p className="text-xl font-bold">
                          {financialProfile.average_annual_production_kg?.toLocaleString()} kg
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Risco Territorial</p>
                        <Badge className={getRiskColor(financialProfile.territorial_risk_level)}>
                          {getRiskLabel(financialProfile.territorial_risk_level)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Badge variant={financialProfile.is_credit_eligible ? 'default' : 'secondary'} className="flex-1 justify-center py-2">
                        {financialProfile.is_credit_eligible ? '✓ Elegível para Crédito' : '✗ Não Elegível para Crédito'}
                      </Badge>
                      <Badge variant={financialProfile.is_insurance_eligible ? 'default' : 'secondary'} className="flex-1 justify-center py-2">
                        {financialProfile.is_insurance_eligible ? '✓ Elegível para Seguro' : '✗ Não Elegível para Seguro'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Perfil financeiro não calculado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insurance Risk Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Score de Risco para Seguro
                </CardTitle>
                <CardDescription>
                  Avaliação de risco para seguro agrícola
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insuranceScore ? (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Classe de Risco</p>
                      <div className={`text-4xl font-bold ${
                        insuranceScore.insurable_risk_class === 'A' ? 'text-green-600' :
                        insuranceScore.insurable_risk_class === 'B' ? 'text-blue-600' :
                        insuranceScore.insurable_risk_class === 'C' ? 'text-yellow-600' :
                        insuranceScore.insurable_risk_class === 'D' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        Classe {insuranceScore.insurable_risk_class}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Score Geral: {insuranceScore.overall_risk_score?.toFixed(0)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Histórico Climático</span>
                          <span>{insuranceScore.climate_history_score?.toFixed(0)}</span>
                        </div>
                        <Progress value={insuranceScore.climate_history_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Frequência de Pragas</span>
                          <span>{insuranceScore.pest_frequency_score?.toFixed(0)}</span>
                        </div>
                        <Progress value={insuranceScore.pest_frequency_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risco da Cultura</span>
                          <span>{insuranceScore.crop_risk_score?.toFixed(0)}</span>
                        </div>
                        <Progress value={insuranceScore.crop_risk_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Práticas Agrícolas</span>
                          <span>{insuranceScore.practices_score?.toFixed(0)}</span>
                        </div>
                        <Progress value={insuranceScore.practices_score} className="h-2" />
                      </div>
                    </div>

                    {insuranceScore.suggested_coverage_types && insuranceScore.suggested_coverage_types.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Coberturas Sugeridas</p>
                        <div className="flex flex-wrap gap-2">
                          {insuranceScore.suggested_coverage_types.map((coverage, i) => (
                            <Badge key={i} variant="outline">{coverage}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Score de risco não calculado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Credit Simulations */}
          <Card>
            <CardHeader>
              <CardTitle>Simulações de Crédito</CardTitle>
              <CardDescription>Histórico de simulações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {creditSimulations && creditSimulations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cenário</TableHead>
                      <TableHead>Receita Esperada</TableHead>
                      <TableHead>Crédito Máximo</TableHead>
                      <TableHead>Crédito Recomendado</TableHead>
                      <TableHead>Prazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditSimulations.map((sim) => (
                      <TableRow key={sim.id}>
                        <TableCell>
                          {new Date(sim.simulation_date).toLocaleDateString('pt-AO')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {sim.scenario_type === 'normal' ? 'Normal' :
                             sim.scenario_type === 'adverse' ? 'Adverso' : 'Optimista'}
                          </Badge>
                        </TableCell>
                        <TableCell>{sim.expected_annual_revenue_aoa?.toLocaleString()} AOA</TableCell>
                        <TableCell>{sim.max_credit_amount_aoa?.toLocaleString()} AOA</TableCell>
                        <TableCell className="font-medium text-primary">
                          {sim.recommended_credit_amount_aoa?.toLocaleString()} AOA
                        </TableCell>
                        <TableCell>{sim.recommended_term_months} meses</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma simulação de crédito realizada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
