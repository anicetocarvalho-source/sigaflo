import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  User, 
  Download, 
  Printer,
  Shield,
  FileCheck,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { useCertificateByNumber } from '@/hooks/useCertificates';
import { WorkflowStatusBadge } from '@/components/farmers/WorkflowStatusBadge';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const CertificateVerificationPage = () => {
  const [searchCode, setSearchCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  
  const { data: certificate, isLoading, isFetched } = useCertificateByNumber(submittedCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      setSubmittedCode(searchCode.trim().toUpperCase());
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'issued':
        return {
          icon: CheckCircle,
          label: 'Certificado Válido',
          description: 'Este certificado foi emitido e está activo',
          color: 'text-green-600',
          bg: 'bg-green-50 dark:bg-green-950/30'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Certificado Aprovado',
          description: 'Este certificado foi aprovado e aguarda emissão',
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-950/30'
        };
      case 'validated':
        return {
          icon: AlertTriangle,
          label: 'Em Validação',
          description: 'Este certificado está em processo de validação',
          color: 'text-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-950/30'
        };
      case 'submitted':
        return {
          icon: AlertTriangle,
          label: 'Submetido',
          description: 'Este certificado foi submetido e aguarda validação',
          color: 'text-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-950/30'
        };
      case 'draft':
        return {
          icon: AlertTriangle,
          label: 'Rascunho',
          description: 'Este certificado ainda está em elaboração',
          color: 'text-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-950/30'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Certificado Rejeitado',
          description: 'Este certificado foi rejeitado',
          color: 'text-red-600',
          bg: 'bg-red-50 dark:bg-red-950/30'
        };
      default:
        return {
          icon: XCircle,
          label: 'Estado Desconhecido',
          description: 'Não foi possível determinar o estado',
          color: 'text-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-950/30'
        };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
    } catch {
      return dateString;
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'production': 'Produção',
      'organic': 'Orgânico',
      'quality': 'Qualidade',
      'origin': 'Origem',
      'good_practices': 'Boas Práticas'
    };
    return types[type] || type;
  };

  const isExpired = certificate?.expiry_date 
    ? new Date(certificate.expiry_date) < new Date() 
    : false;

  return (
    <MainLayout 
      title="Verificação de Certificados" 
      subtitle="Verifique a autenticidade de certificados agrícolas"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pesquisar Certificado
            </CardTitle>
            <CardDescription>
              Introduza o número do certificado para verificar a sua autenticidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: CERT-2024-000001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 font-mono"
              />
              <Button type="submit" disabled={!searchCode.trim() || isLoading}>
                {isLoading ? 'A verificar...' : 'Verificar'}
              </Button>
            </form>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/verificar/scanner">
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR Code
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/verificar/certificado">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Portal Público
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isFetched && submittedCode && (
          <>
            {certificate ? (
              <div className="space-y-6 animate-fade-in">
                {/* Status Banner */}
                {(() => {
                  const statusInfo = isExpired 
                    ? {
                        icon: AlertTriangle,
                        label: 'Certificado Expirado',
                        description: 'Este certificado ultrapassou a data de validade',
                        color: 'text-amber-600',
                        bg: 'bg-amber-50 dark:bg-amber-950/30'
                      }
                    : getStatusInfo(certificate.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <Card className={`${statusInfo.bg} border-none`}>
                      <CardContent className="flex items-center gap-4 py-6">
                        <StatusIcon className={`h-12 w-12 ${statusInfo.color}`} />
                        <div>
                          <h2 className={`text-xl font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {statusInfo.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Certificate Details */}
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>Certificado de {getCertificateTypeLabel(certificate.certificate_type)}</CardTitle>
                      <CardDescription className="font-mono text-base">
                        {certificate.certificate_number}
                      </CardDescription>
                    </div>
                    {certificate.qr_code_data && (
                      <QRCodeSVG
                        value={certificate.verification_url || certificate.certificate_number}
                        size={80}
                        level="H"
                        className="rounded border border-border p-1"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Farmer Info */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <User className="h-4 w-4" /> Titular
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Nome</p>
                          <p className="font-medium">{certificate.farmers?.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Nº de Registo</p>
                          <p className="font-medium font-mono">{certificate.farmers?.registration_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="font-medium">{certificate.farmers?.farmer_type || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">BI/NIF</p>
                          <p className="font-medium">{certificate.farmers?.bi_nif || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Location */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <MapPin className="h-4 w-4" /> Localização
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Província</p>
                          <p className="font-medium">{certificate.farmers?.provinces?.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Município</p>
                          <p className="font-medium">{certificate.farmers?.municipalities?.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Comuna</p>
                          <p className="font-medium">{certificate.farmers?.communes?.name || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Production Details */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <FileCheck className="h-4 w-4" /> Detalhes da Produção
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Culturas</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {certificate.crops?.map((crop) => (
                              <Badge key={crop} variant="secondary" className="text-xs">
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Área Total</p>
                          <p className="font-medium">{certificate.total_area_ha ? `${certificate.total_area_ha} ha` : '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Produção Total</p>
                          <p className="font-medium">{certificate.total_quantity_kg ? `${certificate.total_quantity_kg.toLocaleString()} kg` : '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ano</p>
                          <p className="font-medium">{certificate.year}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Campanha</p>
                          <p className="font-medium">{certificate.season}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Estado</p>
                          <WorkflowStatusBadge status={certificate.status} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Calendar className="h-4 w-4" /> Validade
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Data de Emissão</p>
                          <p className="font-medium">{formatDate(certificate.issue_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data de Expiração</p>
                          <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                            {formatDate(certificate.expiry_date)}
                            {isExpired && <span className="ml-2 text-xs">(Expirado)</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:flex-row pt-4">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link to={`/certificados/${certificate.id}`}>
                          <FileCheck className="mr-2 h-4 w-4" />
                          Ver Detalhes Completos
                        </Link>
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Descarregar PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="flex flex-col items-center py-12">
                  <XCircle className="mb-4 h-16 w-16 text-destructive" />
                  <h2 className="text-xl font-bold text-destructive">Certificado Não Encontrado</h2>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Não foi encontrado nenhum certificado com o número "{submittedCode}".
                    <br />
                    Verifique se o número está correcto e tente novamente.
                  </p>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link to="/verificar/scanner">
                      <QrCode className="mr-2 h-4 w-4" />
                      Escanear QR Code
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Security Notice */}
        <Card className="bg-muted/30">
          <CardContent className="flex items-start gap-3 py-4">
            <Shield className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Verificação Oficial</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta verificação é realizada em tempo real contra a base de dados oficial do SIGAFLO.
                Para denunciar documentos falsificados, contacte o MINAGRIF.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CertificateVerificationPage;
