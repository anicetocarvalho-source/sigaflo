import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, TreePine, CheckCircle, XCircle, AlertTriangle, Calendar, Download, QrCode, Printer, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface LicenseVerificationData {
  license_number: string;
  license_type: string;
  status: string;
  issue_date: string | null;
  expiry_date: string | null;
}

const getLicenseTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    exploitation: "Licença de Exploração",
    transport: "Guia de Transporte",
    export: "Licença de Exportação",
    processing: "Licença de Processamento",
  };
  return map[type] || type;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "active":
    case "approved":
      return {
        icon: CheckCircle,
        label: "Licença Válida",
        description: "Esta licença está activa e em conformidade legal",
        color: "text-success",
        bg: "bg-success/10",
        badgeClass: "bg-success text-success-foreground",
      };
    case "expired":
      return {
        icon: AlertTriangle,
        label: "Licença Expirada",
        description: "Esta licença ultrapassou a data de validade",
        color: "text-warning",
        bg: "bg-warning/10",
        badgeClass: "bg-warning text-warning-foreground",
      };
    case "suspended":
      return {
        icon: AlertTriangle,
        label: "Licença Suspensa",
        description: "Esta licença está temporariamente suspensa",
        color: "text-warning",
        bg: "bg-warning/10",
        badgeClass: "bg-warning text-warning-foreground",
      };
    case "submitted":
    case "pending":
      return {
        icon: AlertTriangle,
        label: "Em Análise",
        description: "Licença submetida e aguardando aprovação",
        color: "text-muted-foreground",
        bg: "bg-muted/30",
        badgeClass: "bg-muted text-muted-foreground",
      };
    case "revoked":
    case "rejected":
      return {
        icon: XCircle,
        label: "Licença Revogada",
        description: "Esta licença foi revogada ou rejeitada",
        color: "text-destructive",
        bg: "bg-destructive/10",
        badgeClass: "bg-destructive text-destructive-foreground",
      };
    default:
      return {
        icon: XCircle,
        label: "Estado Desconhecido",
        description: "Estado da licença não identificado",
        color: "text-muted-foreground",
        bg: "bg-muted/10",
        badgeClass: "bg-muted text-muted-foreground",
      };
  }
};

const VerifyLicense = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState(code || searchParams.get("code") || "");
  const [license, setLicense] = useState<LicenseVerificationData | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      handleSearch(code);
    }
  }, [code]);

  const handleSearch = async (codeToSearch: string) => {
    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      const { data, error: queryError } = await (supabase as any)
        .from('license_verification_public')
        .select('*')
        .eq('license_number', codeToSearch.toUpperCase())
        .maybeSingle();

      if (queryError) throw queryError;
      setLicense(data as LicenseVerificationData | null);
    } catch (err: any) {
      setError('Erro ao verificar a licença. Tente novamente.');
      setLicense(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      handleSearch(searchCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
                placeholder="Ex: LEX-2026-000001"
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

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="flex flex-col items-center py-8">
              <XCircle className="mb-4 h-12 w-12 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {searched && !loading && !error && (
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
                      <Badge className={`mb-2 ${getStatusInfo(license.status).badgeClass}`}>
                        <TreePine className="mr-1 h-3 w-3" />
                        {getLicenseTypeLabel(license.license_type)}
                      </Badge>
                      <CardTitle className="text-lg">Licença Florestal</CardTitle>
                      <CardDescription className="font-mono text-base">
                        {license.license_number}
                      </CardDescription>
                    </div>
                    <QRCodeSVG
                      value={license.license_number}
                      size={80}
                      level="H"
                      className="rounded border border-border p-1"
                    />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Type Info */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <TreePine className="h-4 w-4" /> Detalhes
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Tipo de Licença</p>
                          <p className="font-medium text-foreground">{getLicenseTypeLabel(license.license_type)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Estado</p>
                          <Badge variant="secondary">{getStatusInfo(license.status).label}</Badge>
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
                          <p className="font-medium text-foreground">
                            {license.issue_date
                              ? new Date(license.issue_date).toLocaleDateString('pt-PT')
                              : "Pendente"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Data de Expiração</p>
                          <p className="font-medium text-foreground">
                            {license.expiry_date
                              ? new Date(license.expiry_date).toLocaleDateString('pt-PT')
                              : "Pendente"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Issuer */}
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">Emitido por</p>
                      <p className="font-medium text-foreground">Instituto de Desenvolvimento Florestal</p>
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