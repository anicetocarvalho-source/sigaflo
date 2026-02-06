import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Coffee, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, Download, QrCode, Printer, Shield, Award, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface CoffeeVerificationData {
  lot_code: string;
  status: string;
  variety: string | null;
  processing_method: string | null;
  quality_grade: string | null;
  origin_location: string | null;
  harvest_year: number | null;
  harvest_season: string | null;
}

const VerifyCoffee = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState(code || searchParams.get("code") || "");
  const [coffeeLot, setCoffeeLot] = useState<CoffeeVerificationData | null>(null);
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
        .from('coffee_verification_public')
        .select('*')
        .eq('lot_code', codeToSearch.toUpperCase())
        .maybeSingle();

      if (queryError) throw queryError;
      setCoffeeLot(data as CoffeeVerificationData | null);
    } catch (err: any) {
      setError('Erro ao verificar o lote. Tente novamente.');
      setCoffeeLot(null);
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "exported":
      case "delivered":
        return {
          icon: CheckCircle,
          label: "Exportado",
          description: "Lote exportado com sucesso",
          color: "text-success",
          bg: "bg-success/10",
          semaphore: "Verde — Exportado"
        };
      case "in_transit":
        return {
          icon: Package,
          label: "Em Trânsito",
          description: "Lote em trânsito para o destino",
          color: "text-primary",
          bg: "bg-primary/10",
          semaphore: "Azul — Em Trânsito"
        };
      case "registered":
      case "processing":
        return {
          icon: AlertTriangle,
          label: "Em Processamento",
          description: "Lote registado e aguardando certificação",
          color: "text-warning",
          bg: "bg-warning/10",
          semaphore: "Amarelo — Em Processamento"
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Rejeitado",
          description: "Lote não aprovado para exportação",
          color: "text-destructive",
          bg: "bg-destructive/10",
          semaphore: "Vermelho — Rejeitado"
        };
      default:
        return {
          icon: AlertTriangle,
          label: status || "Desconhecido",
          description: "Estado em verificação",
          color: "text-muted-foreground",
          bg: "bg-muted/10",
          semaphore: status || "Desconhecido"
        };
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Coffee className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Rastreio de Lotes de Café</h1>
                <p className="text-xs text-muted-foreground">Sistema de Verificação INCA</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Rastrear Lote de Café</CardTitle>
            <CardDescription>
              Introduza o código do lote para verificar origem, qualidade e estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: CAFE-2024-001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 font-mono"
              />
              <Button type="submit" disabled={!searchCode.trim() || loading}>
                {loading ? "A rastrear..." : "Rastrear"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
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
            {coffeeLot ? (
              <div className="space-y-6 animate-fade-in">
                {/* Status Banner */}
                {(() => {
                  const statusInfo = getStatusInfo(coffeeLot.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <Card className={`${statusInfo.bg} border-none`}>
                      <CardContent className="flex items-center gap-4 py-6">
                        <StatusIcon className={`h-12 w-12 ${statusInfo.color}`} />
                        <div>
                          <h2 className={`text-xl font-bold ${statusInfo.color}`}>
                            {statusInfo.semaphore}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {statusInfo.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Lot Details */}
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {coffeeLot.variety && (
                          <Badge variant="secondary">{coffeeLot.variety}</Badge>
                        )}
                        {coffeeLot.quality_grade && (
                          <Badge className="bg-primary/10 text-primary">
                            <Award className="mr-1 h-3 w-3" /> {coffeeLot.quality_grade}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">Lote de Café</CardTitle>
                      <CardDescription className="font-mono text-base">
                        {coffeeLot.lot_code}
                      </CardDescription>
                    </div>
                    <QRCodeSVG
                      value={coffeeLot.lot_code}
                      size={80}
                      level="H"
                      className="rounded border border-border p-1"
                    />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Origin & Details */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <MapPin className="h-4 w-4" /> Origem e Detalhes
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        {coffeeLot.origin_location && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">Localização de Origem</p>
                            <p className="font-medium text-foreground">{coffeeLot.origin_location}</p>
                          </div>
                        )}
                        {coffeeLot.variety && (
                          <div>
                            <p className="text-xs text-muted-foreground">Variedade</p>
                            <p className="font-medium text-foreground">{coffeeLot.variety}</p>
                          </div>
                        )}
                        {coffeeLot.processing_method && (
                          <div>
                            <p className="text-xs text-muted-foreground">Processamento</p>
                            <p className="font-medium text-foreground">{coffeeLot.processing_method}</p>
                          </div>
                        )}
                        {coffeeLot.quality_grade && (
                          <div>
                            <p className="text-xs text-muted-foreground">Classificação</p>
                            <p className="font-medium text-foreground">{coffeeLot.quality_grade}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Harvest Info */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Calendar className="h-4 w-4" /> Colheita
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        {coffeeLot.harvest_year && (
                          <div>
                            <p className="text-xs text-muted-foreground">Ano</p>
                            <p className="font-medium text-foreground">{coffeeLot.harvest_year}</p>
                          </div>
                        )}
                        {coffeeLot.harvest_season && (
                          <div>
                            <p className="text-xs text-muted-foreground">Campanha</p>
                            <p className="font-medium text-foreground">{coffeeLot.harvest_season}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Certification */}
                    <div className="rounded-lg bg-primary/5 p-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <p className="font-medium text-foreground">Verificado pelo SIGAFLO</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Dados oficiais do sistema de rastreabilidade do café angolano
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Certificado PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir Rastreio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="flex flex-col items-center py-12">
                  <XCircle className="mb-4 h-16 w-16 text-destructive" />
                  <h2 className="text-xl font-bold text-destructive">Lote Não Encontrado</h2>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Não foi encontrado nenhum lote de café com o código "{searchCode}".
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
              <p className="font-medium text-foreground">Café Angolano Certificado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                O sistema de rastreabilidade do INCA garante a verificação do café angolano
                desde a origem até à exportação, assegurando qualidade e transparência.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyCoffee;