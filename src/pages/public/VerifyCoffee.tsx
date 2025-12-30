import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Coffee, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, User, Download, QrCode, Printer, Shield, Award, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QRCodeSVG } from "qrcode.react";
import type { CoffeeSemaphore } from "@/types";

interface CoffeeLotData {
  code: string;
  status: "valid" | "expired" | "invalid";
  semaphore: CoffeeSemaphore;
  producer: {
    name: string;
    cooperative?: string;
    province: string;
    municipality: string;
  };
  lot: {
    variety: string;
    weight: string;
    harvestDate: string;
    processingMethod: string;
    altitude: string;
  };
  quality: {
    grade: string;
    score: number;
    cupping: string;
    defects: string;
  };
  traceability: {
    stages: Array<{
      stage: string;
      date: string;
      location: string;
      status: "completed" | "current" | "pending";
    }>;
  };
  exportReady: boolean;
  certifiedBy: string;
  certificationDate: string;
}

const mockCoffeeLots: Record<string, CoffeeLotData> = {
  "CAFE-LOT-2024-1892": {
    code: "CAFE-LOT-2024-1892",
    status: "valid",
    semaphore: "green",
    producer: {
      name: "António Pedro Kalumba",
      cooperative: "Cooperativa Agrícola de Libolo",
      province: "Cuanza Sul",
      municipality: "Libolo"
    },
    lot: {
      variety: "Arábica Catimor",
      weight: "2.450 kg",
      harvestDate: "Junho 2024",
      processingMethod: "Lavado (Wet Process)",
      altitude: "1.250-1.400m"
    },
    quality: {
      grade: "Specialty",
      score: 85,
      cupping: "Notas de chocolate, frutos vermelhos, acidez cítrica",
      defects: "< 5 defeitos primários"
    },
    traceability: {
      stages: [
        { stage: "Colheita", date: "15/06/2024", location: "Libolo", status: "completed" },
        { stage: "Processamento", date: "18/06/2024", location: "Wako Kungo", status: "completed" },
        { stage: "Secagem", date: "25/06/2024", location: "Wako Kungo", status: "completed" },
        { stage: "Benefício", date: "10/07/2024", location: "Luanda", status: "completed" },
        { stage: "Certificação INCA", date: "15/07/2024", location: "INCA", status: "completed" },
        { stage: "Pronto para Exportação", date: "20/07/2024", location: "Porto de Luanda", status: "current" }
      ]
    },
    exportReady: true,
    certifiedBy: "Instituto Nacional do Café (INCA)",
    certificationDate: "15/07/2024"
  },
  "CAFE-LOT-2024-0567": {
    code: "CAFE-LOT-2024-0567",
    status: "valid",
    semaphore: "yellow",
    producer: {
      name: "Maria José Fernandes",
      province: "Uíge",
      municipality: "Negage"
    },
    lot: {
      variety: "Robusta",
      weight: "5.200 kg",
      harvestDate: "Maio 2024",
      processingMethod: "Natural (Dry Process)",
      altitude: "900-1.100m"
    },
    quality: {
      grade: "Commercial Plus",
      score: 78,
      cupping: "Corpo intenso, notas de cacau e nozes",
      defects: "< 15 defeitos primários"
    },
    traceability: {
      stages: [
        { stage: "Colheita", date: "20/05/2024", location: "Negage", status: "completed" },
        { stage: "Processamento", date: "25/05/2024", location: "Negage", status: "completed" },
        { stage: "Secagem", date: "05/06/2024", location: "Negage", status: "completed" },
        { stage: "Benefício", date: "Pendente", location: "-", status: "pending" },
        { stage: "Certificação INCA", date: "Pendente", location: "-", status: "pending" },
        { stage: "Pronto para Exportação", date: "Pendente", location: "-", status: "pending" }
      ]
    },
    exportReady: false,
    certifiedBy: "Instituto Nacional do Café (INCA)",
    certificationDate: "Pendente"
  }
};

const VerifyCoffee = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState(code || searchParams.get("code") || "");
  const [coffeeLot, setCoffeeLot] = useState<CoffeeLotData | null>(null);
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
      const found = mockCoffeeLots[codeToSearch.toUpperCase()];
      setCoffeeLot(found || null);
      setLoading(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      handleSearch(searchCode.trim());
    }
  };

  const getSemaphoreInfo = (semaphore: CoffeeSemaphore) => {
    switch (semaphore) {
      case "green":
        return {
          label: "Verde — Pronto para Exportação",
          description: "Lote aprovado e certificado pelo INCA, pronto para comercialização internacional",
          color: "bg-success text-success-foreground",
          iconColor: "text-success"
        };
      case "yellow":
        return {
          label: "Amarelo — Em Processamento",
          description: "Lote em fase de processamento ou aguardando certificação final",
          color: "bg-warning text-warning-foreground",
          iconColor: "text-warning"
        };
      case "red":
        return {
          label: "Vermelho — Não Aprovado",
          description: "Lote com problemas de qualidade ou documentação incompleta",
          color: "bg-destructive text-destructive-foreground",
          iconColor: "text-destructive"
        };
      default:
        return {
          label: "Desconhecido",
          description: "Estado não identificado",
          color: "bg-muted text-muted-foreground",
          iconColor: "text-muted-foreground"
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Coffee className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Rastreio de Lotes de Café</h1>
                <p className="text-xs text-muted-foreground">Sistema de Semaforização INCA</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Rastrear Lote de Café</CardTitle>
            <CardDescription>
              Introduza o código do lote para verificar origem, qualidade e estado de certificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: CAFE-LOT-2024-1892"
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

        {/* Results */}
        {searched && !loading && (
          <>
            {coffeeLot ? (
              <div className="space-y-6 animate-fade-in">
                {/* Semaphore Banner */}
                {(() => {
                  const semaphoreInfo = getSemaphoreInfo(coffeeLot.semaphore);
                  return (
                    <Card className={`${semaphoreInfo.color} border-none`}>
                      <CardContent className="flex items-center gap-4 py-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/20">
                          <div className={`h-10 w-10 rounded-full ${semaphoreInfo.color}`} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">
                            {semaphoreInfo.label}
                          </h2>
                          <p className="text-sm opacity-90">
                            {semaphoreInfo.description}
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
                        <Badge variant="secondary">{coffeeLot.lot.variety}</Badge>
                        {coffeeLot.exportReady && (
                          <Badge className="bg-success text-success-foreground">
                            <Package className="mr-1 h-3 w-3" /> Pronto para Exportação
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">Lote de Café Certificado</CardTitle>
                      <CardDescription className="font-mono text-base">
                        {coffeeLot.code}
                      </CardDescription>
                    </div>
                    <QRCodeSVG
                      value={coffeeLot.code}
                      size={80}
                      level="H"
                      className="rounded border border-border p-1"
                    />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Producer Info */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <User className="h-4 w-4" /> Produtor
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Nome</p>
                          <p className="font-medium text-foreground">{coffeeLot.producer.name}</p>
                        </div>
                        {coffeeLot.producer.cooperative && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">Cooperativa</p>
                            <p className="font-medium text-foreground">{coffeeLot.producer.cooperative}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Província</p>
                          <p className="font-medium text-foreground">{coffeeLot.producer.province}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Município</p>
                          <p className="font-medium text-foreground">{coffeeLot.producer.municipality}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Lot Details */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Coffee className="h-4 w-4" /> Características do Lote
                      </h3>
                      <div className="grid gap-2 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Variedade</p>
                          <p className="font-medium text-foreground">{coffeeLot.lot.variety}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Peso</p>
                          <p className="font-medium text-foreground">{coffeeLot.lot.weight}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Colheita</p>
                          <p className="font-medium text-foreground">{coffeeLot.lot.harvestDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Processamento</p>
                          <p className="font-medium text-foreground">{coffeeLot.lot.processingMethod}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Altitude</p>
                          <p className="font-medium text-foreground">{coffeeLot.lot.altitude}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Quality */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Award className="h-4 w-4" /> Qualidade
                      </h3>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Classificação</p>
                            <p className="text-lg font-bold text-foreground">{coffeeLot.quality.grade}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Pontuação</p>
                            <p className="text-2xl font-bold text-primary">{coffeeLot.quality.score}</p>
                          </div>
                        </div>
                        <Progress value={coffeeLot.quality.score} className="mb-4 h-2" />
                        <div className="grid gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Perfil de Prova (Cupping)</p>
                            <p className="text-sm text-foreground">{coffeeLot.quality.cupping}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Defeitos</p>
                            <p className="text-sm text-foreground">{coffeeLot.quality.defects}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Traceability */}
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Truck className="h-4 w-4" /> Rastreabilidade
                      </h3>
                      <div className="space-y-3">
                        {coffeeLot.traceability.stages.map((stage, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-4 rounded-lg p-3 ${
                              stage.status === "completed"
                                ? "bg-success/10"
                                : stage.status === "current"
                                ? "bg-primary/10 ring-1 ring-primary/30"
                                : "bg-muted/50"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                stage.status === "completed"
                                  ? "bg-success text-success-foreground"
                                  : stage.status === "current"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {stage.status === "completed" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <span className="text-xs font-bold">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{stage.stage}</p>
                              <p className="text-xs text-muted-foreground">
                                {stage.location} • {stage.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Certification */}
                    <div className="rounded-lg bg-primary/5 p-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <p className="font-medium text-foreground">Certificado por</p>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{coffeeLot.certifiedBy}</p>
                      <p className="text-xs text-muted-foreground">Data: {coffeeLot.certificationDate}</p>
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

        {/* Info */}
        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Café Angolano Certificado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                O sistema de semaforização do INCA garante a rastreabilidade do café angolano 
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
