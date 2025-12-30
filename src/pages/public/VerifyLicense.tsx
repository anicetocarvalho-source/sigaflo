import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, TreePine, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, Building, Download, QrCode, Printer, Shield, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

interface LicenseData {
  code: string;
  type: "exploitation" | "transport" | "export";
  status: "valid" | "expired" | "invalid" | "suspended";
  holder: {
    name: string;
    nif: string;
    type: string;
  };
  location: {
    province: string;
    municipality: string;
    area?: string;
  };
  details: {
    species: string[];
    volume: string;
    purpose: string;
  };
  dates: {
    issued: string;
    expires: string;
  };
  issuedBy: string;
}

const mockLicenses: Record<string, LicenseData> = {
  "LIC-FL-2024-0234": {
    code: "LIC-FL-2024-0234",
    type: "exploitation",
    status: "valid",
    holder: {
      name: "Madeiras do Sul, Lda",
      nif: "5401234567",
      type: "Empresa Privada"
    },
    location: {
      province: "Cabinda",
      municipality: "Buco-Zau",
      area: "150 hectares"
    },
    details: {
      species: ["Pau-preto", "Tola", "Umbila"],
      volume: "2.500 m³",
      purpose: "Exploração comercial sustentável"
    },
    dates: {
      issued: "01/04/2024",
      expires: "31/03/2025"
    },
    issuedBy: "Instituto de Desenvolvimento Florestal"
  },
  "LIC-TR-2024-0891": {
    code: "LIC-TR-2024-0891",
    type: "transport",
    status: "valid",
    holder: {
      name: "TransLog Angola, SA",
      nif: "5409876543",
      type: "Transportadora"
    },
    location: {
      province: "Uíge",
      municipality: "Carmona",
    },
    details: {
      species: ["Tola"],
      volume: "80 m³",
      purpose: "Transporte de madeira serrada"
    },
    dates: {
      issued: "15/06/2024",
      expires: "14/07/2024"
    },
    issuedBy: "Instituto de Desenvolvimento Florestal"
  }
};

const VerifyLicense = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState(code || searchParams.get("code") || "");
  const [license, setLicense] = useState<LicenseData | null>(null);
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
    
    setTimeout(() => {
      const found = mockLicenses[codeToSearch.toUpperCase()];
      setLicense(found || null);
      setLoading(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      handleSearch(searchCode.trim());
    }
  };

  const getLicenseTypeInfo = (type: string) => {
    switch (type) {
      case "exploitation":
        return { label: "Licença de Exploração", icon: TreePine, color: "bg-primary text-primary-foreground" };
      case "transport":
        return { label: "Guia de Transporte", icon: Truck, color: "bg-info text-info-foreground" };
      case "export":
        return { label: "Licença de Exportação", icon: Package, color: "bg-accent text-accent-foreground" };
      default:
        return { label: "Licença", icon: TreePine, color: "bg-muted text-muted-foreground" };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "valid":
        return {
          icon: CheckCircle,
          label: "Licença Válida",
          description: "Esta licença está activa e em conformidade legal",
          color: "text-success",
          bg: "bg-success/10"
        };
      case "expired":
        return {
          icon: AlertTriangle,
          label: "Licença Expirada",
          description: "Esta licença ultrapassou a data de validade",
          color: "text-warning",
          bg: "bg-warning/10"
        };
      case "suspended":
        return {
          icon: AlertTriangle,
          label: "Licença Suspensa",
          description: "Esta licença está temporariamente suspensa por decisão administrativa",
          color: "text-warning",
          bg: "bg-warning/10"
        };
      case "invalid":
        return {
          icon: XCircle,
          label: "Licença Inválida",
          description: "Esta licença não é reconhecida pelo sistema",
          color: "text-destructive",
          bg: "bg-destructive/10"
        };
      default:
        return {
          icon: XCircle,
          label: "Não Encontrada",
          description: "Nenhuma licença encontrada com este código",
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TreePine className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Verificar Licença Florestal</h1>
                <p className="text-xs text-muted-foreground">Licenças de Exploração, Transporte e Exportação</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Pesquisar Licença</CardTitle>
            <CardDescription>
              Introduza o código da licença florestal para verificar a sua validade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: LIC-FL-2024-0234"
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
            {license ? (
              <div className="space-y-6 animate-fade-in">
                {/* Status Banner */}
                {(() => {
                  const statusInfo = getStatusInfo(license.status);
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

                {/* License Details */}
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      {(() => {
                        const typeInfo = getLicenseTypeInfo(license.type);
                        return (
                          <Badge className={`mb-2 ${typeInfo.color}`}>
                            <typeInfo.icon className="mr-1 h-3 w-3" />
                            {typeInfo.label}
                          </Badge>
                        );
                      })()}
                      <CardTitle className="text-lg">Licença Florestal</CardTitle>
                      <CardDescription className="font-mono text-base">
                        {license.code}
                      </CardDescription>
                    </div>
                    <QRCodeSVG
                      value={license.code}
                      size={80}
                      level="H"
                      className="rounded border border-border p-1"
                    />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Holder Info */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Building className="h-4 w-4" /> Titular
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Denominação</p>
                          <p className="font-medium text-foreground">{license.holder.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">NIF</p>
                          <p className="font-medium text-foreground">{license.holder.nif}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="font-medium text-foreground">{license.holder.type}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Location */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <MapPin className="h-4 w-4" /> Área de Exploração
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Província</p>
                          <p className="font-medium text-foreground">{license.location.province}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Município</p>
                          <p className="font-medium text-foreground">{license.location.municipality}</p>
                        </div>
                        {license.location.area && (
                          <div>
                            <p className="text-xs text-muted-foreground">Área</p>
                            <p className="font-medium text-foreground">{license.location.area}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Details */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <TreePine className="h-4 w-4" /> Detalhes da Licença
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Espécies Autorizadas</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {license.details.species.map((species) => (
                              <Badge key={species} variant="secondary">
                                {species}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Volume Autorizado</p>
                          <p className="font-medium text-foreground">{license.details.volume}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Finalidade</p>
                          <p className="font-medium text-foreground">{license.details.purpose}</p>
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
                          <p className="font-medium text-foreground">{license.dates.issued}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data de Expiração</p>
                          <p className="font-medium text-foreground">{license.dates.expires}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Issued By */}
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">Emitido por</p>
                      <p className="font-medium text-foreground">{license.issuedBy}</p>
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
                  <h2 className="text-xl font-bold text-destructive">Licença Não Encontrada</h2>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Não foi encontrada nenhuma licença com o código "{searchCode}".
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
              <p className="font-medium text-foreground">Combate à Exploração Ilegal</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Para denunciar actividades florestais ilegais ou documentos falsificados,
                contacte o IDF ou utilize o sistema de denúncias do SIGAFLO.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyLicense;
