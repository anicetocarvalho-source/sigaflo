import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileCheck, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, User, Download, QrCode, Printer, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";

interface CertificateData {
  code: string;
  type: string;
  status: "valid" | "expired" | "invalid" | "suspended";
  farmer: {
    name: string;
    document: string;
    type: string;
  };
  location: {
    province: string;
    municipality: string;
    commune?: string;
  };
  details: {
    product: string;
    area: string;
    season: string;
  };
  dates: {
    issued: string;
    expires: string;
  };
  issuedBy: string;
}

const mockCertificates: Record<string, CertificateData> = {
  "CERT-2024-00891": {
    code: "CERT-2024-00891",
    type: "Certificado de Produção Agrícola",
    status: "valid",
    farmer: {
      name: "João Manuel da Silva",
      document: "000123456LA041",
      type: "Pequeno Agricultor"
    },
    location: {
      province: "Huambo",
      municipality: "Bailundo",
      commune: "Bimbe"
    },
    details: {
      product: "Milho, Feijão",
      area: "5,2 hectares",
      season: "2024/2025"
    },
    dates: {
      issued: "15/03/2024",
      expires: "14/03/2025"
    },
    issuedBy: "Direcção Provincial da Agricultura do Huambo"
  },
  "CERT-2024-00456": {
    code: "CERT-2024-00456",
    type: "Certificado de Produção Agrícola",
    status: "expired",
    farmer: {
      name: "Maria Francisca Lopes",
      document: "000789012LA023",
      type: "Agricultura Familiar"
    },
    location: {
      province: "Malanje",
      municipality: "Cacuso",
    },
    details: {
      product: "Mandioca",
      area: "2,8 hectares",
      season: "2023/2024"
    },
    dates: {
      issued: "20/01/2023",
      expires: "19/01/2024"
    },
    issuedBy: "Direcção Provincial da Agricultura de Malanje"
  }
};

const VerifyCertificate = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState(code || searchParams.get("code") || "");
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (code) {
      handleSearch(code);
    }
  }, [code]);

  const handleSearch = (codeToSearch: string) => {
    setLoading(true);
    setSearched(true);
    
    // Simulate API call
    setTimeout(() => {
      const found = mockCertificates[codeToSearch.toUpperCase()];
      setCertificate(found || null);
      setLoading(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      handleSearch(searchCode.trim());
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "valid":
        return {
          icon: CheckCircle,
          label: "Certificado Válido",
          description: "Este certificado está activo e em conformidade",
          color: "text-success",
          bg: "bg-success/10"
        };
      case "expired":
        return {
          icon: AlertTriangle,
          label: "Certificado Expirado",
          description: "Este certificado ultrapassou a data de validade",
          color: "text-warning",
          bg: "bg-warning/10"
        };
      case "suspended":
        return {
          icon: AlertTriangle,
          label: "Certificado Suspenso",
          description: "Este certificado está temporariamente suspenso",
          color: "text-warning",
          bg: "bg-warning/10"
        };
      case "invalid":
        return {
          icon: XCircle,
          label: "Certificado Inválido",
          description: "Este certificado não é reconhecido pelo sistema",
          color: "text-destructive",
          bg: "bg-destructive/10"
        };
      default:
        return {
          icon: XCircle,
          label: "Não Encontrado",
          description: "Nenhum certificado encontrado com este código",
          color: "text-destructive",
          bg: "bg-destructive/10"
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/verificar">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <FileCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Verificar Certificado</h1>
                <p className="text-xs text-muted-foreground">Certificados de Produção Agrícola</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Pesquisar Certificado</CardTitle>
            <CardDescription>
              Introduza o código do certificado para verificar a sua autenticidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: CERT-2024-00891"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 font-mono"
              />
              <Button type="submit" disabled={!searchCode.trim() || loading}>
                {loading ? "A verificar..." : "Verificar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && !loading && (
          <>
            {certificate ? (
              <div className="space-y-6 animate-fade-in">
                {/* Status Banner */}
                {(() => {
                  const statusInfo = getStatusInfo(certificate.status);
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
                      <CardTitle>{certificate.type}</CardTitle>
                      <CardDescription className="font-mono text-base">
                        {certificate.code}
                      </CardDescription>
                    </div>
                    <QRCodeSVG
                      value={certificate.code}
                      size={80}
                      level="H"
                      className="rounded border border-border p-1"
                    />
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
                          <p className="font-medium text-foreground">{certificate.farmer.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Documento</p>
                          <p className="font-medium text-foreground">{certificate.farmer.document}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="font-medium text-foreground">{certificate.farmer.type}</p>
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
                          <p className="font-medium text-foreground">{certificate.location.province}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Município</p>
                          <p className="font-medium text-foreground">{certificate.location.municipality}</p>
                        </div>
                        {certificate.location.commune && (
                          <div>
                            <p className="text-xs text-muted-foreground">Comuna</p>
                            <p className="font-medium text-foreground">{certificate.location.commune}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Details */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <FileCheck className="h-4 w-4" /> Detalhes da Produção
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Produtos</p>
                          <p className="font-medium text-foreground">{certificate.details.product}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Área</p>
                          <p className="font-medium text-foreground">{certificate.details.area}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Campanha</p>
                          <p className="font-medium text-foreground">{certificate.details.season}</p>
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
                          <p className="font-medium text-foreground">{certificate.dates.issued}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data de Expiração</p>
                          <p className="font-medium text-foreground">{certificate.dates.expires}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Issued By */}
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">Emitido por</p>
                      <p className="font-medium text-foreground">{certificate.issuedBy}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:flex-row">
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
                    Não foi encontrado nenhum certificado com o código "{searchCode}".
                    <br />
                    Verifique se o código está correcto e tente novamente.
                  </p>
                  <Link to="/verificar/scanner" className="mt-6">
                    <Button variant="outline">
                      <QrCode className="mr-2 h-4 w-4" />
                      Escanear QR Code
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Security Notice */}
        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Verificação Oficial</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta verificação é realizada em tempo real contra a base de dados oficial do SIGAFLO.
                Para denunciar documentos falsificados, contacte o MINAGRIF.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyCertificate;
