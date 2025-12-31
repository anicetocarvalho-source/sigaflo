import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  QrCode, 
  ExternalLink, 
  Coffee, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  MapPin,
  Calendar,
  Award,
  Truck,
  RefreshCw,
  Download,
  Printer,
  Shield
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useCoffeeLots } from "@/hooks/useCoffee";
import { toast } from "sonner";

interface VerificationResult {
  found: boolean;
  status: "valid" | "pending" | "invalid";
  lot?: {
    id: string;
    lot_code: string;
    variety: string | null;
    volume_kg: number;
    quality_grade: string | null;
    status: string;
    harvest_year: number | null;
    harvest_season: string | null;
    processing_method: string | null;
    exporter_name: string | null;
    destination_country: string | null;
    origin_province?: { name: string } | null;
    origin_municipality?: { name: string } | null;
    registered_at: string | null;
    dispatched_at: string | null;
    exported_at: string | null;
  };
}

const CoffeeVerificationPage = () => {
  const [searchCode, setSearchCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  
  const { data: coffeeLots } = useCoffeeLots();

  const recentVerifications = [
    { code: "CAFE-LOT-2024-1892", status: "valid", time: "há 2 min", variety: "Arábica" },
    { code: "CAFE-LOT-2024-0567", status: "valid", time: "há 5 min", variety: "Robusta" },
    { code: "CAFE-LOT-2024-0234", status: "pending", time: "há 12 min", variety: "Arábica" },
    { code: "CAFE-LOT-2024-0089", status: "invalid", time: "há 25 min", variety: "Robusta" },
  ];

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast.error("Digite um código de lote para verificar");
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Search in actual coffee lots
    const found = coffeeLots?.find(lot => 
      lot.lot_code.toLowerCase() === searchCode.toLowerCase()
    );

    if (found) {
      const status = found.status === 'exported' ? 'valid' : 
                     found.status === 'rejected' ? 'invalid' : 'pending';
      
      setVerificationResult({
        found: true,
        status,
        lot: found as any
      });
      toast.success("Lote encontrado!");
    } else {
      setVerificationResult({
        found: false,
        status: "invalid"
      });
      toast.error("Lote não encontrado no sistema");
    }

    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "valid":
        return {
          label: "Verificado e Válido",
          description: "Lote certificado e pronto para exportação",
          color: "bg-success text-success-foreground",
          icon: CheckCircle,
          iconColor: "text-success"
        };
      case "pending":
        return {
          label: "Em Processamento",
          description: "Lote aguardando certificação ou validação",
          color: "bg-warning text-warning-foreground",
          icon: AlertTriangle,
          iconColor: "text-warning"
        };
      case "invalid":
        return {
          label: "Não Válido",
          description: "Lote não encontrado ou com problemas",
          color: "bg-destructive text-destructive-foreground",
          icon: XCircle,
          iconColor: "text-destructive"
        };
      default:
        return {
          label: "Desconhecido",
          description: "Estado não identificado",
          color: "bg-muted text-muted-foreground",
          icon: AlertTriangle,
          iconColor: "text-muted-foreground"
        };
    }
  };

  const getSemaphoreColor = (grade: string | null) => {
    if (!grade) return "bg-muted";
    if (grade.toLowerCase().includes("specialty") || grade.toLowerCase().includes("premium")) {
      return "bg-success";
    }
    if (grade.toLowerCase().includes("commercial")) {
      return "bg-warning";
    }
    return "bg-destructive";
  };

  const clearSearch = () => {
    setSearchCode("");
    setVerificationResult(null);
  };

  return (
    <MainLayout
      title="Portal de Verificação de Café"
      subtitle="Verifique a autenticidade e rastreabilidade dos lotes de café certificados"
    >
      <div className="space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                  <Coffee className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>Verificar Lote de Café</CardTitle>
                  <CardDescription>
                    Insira o código do lote ou escaneie o QR Code para verificar origem e certificação
                  </CardDescription>
                </div>
              </div>
              <Link to="/verificar/cafe" target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Portal Público
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ex: CAFE-LOT-2024-1892"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 pl-10 font-mono"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchCode.trim()}
                className="h-12 px-6"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    A verificar...
                  </>
                ) : (
                  "Verificar"
                )}
              </Button>
              <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-12 px-4">
                    <QrCode className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Escanear QR Code</DialogTitle>
                    <DialogDescription>
                      Use a câmera para escanear o QR Code do lote de café
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50">
                      <QrCode className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Funcionalidade de câmera não disponível nesta versão.
                      <br />
                      Use o <Link to="/verificar/scanner" className="text-primary hover:underline">scanner público</Link> ou insira o código manualmente.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {verificationResult && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  Limpar pesquisa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Result */}
        {verificationResult && (
          <div className="animate-fade-in space-y-6">
            {verificationResult.found && verificationResult.lot ? (
              <>
                {/* Status Banner */}
                {(() => {
                  const statusInfo = getStatusInfo(verificationResult.status);
                  return (
                    <Card className={`${statusInfo.color} border-none`}>
                      <CardContent className="flex items-center gap-4 py-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/20">
                          <statusInfo.icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold">{statusInfo.label}</h2>
                          <p className="text-sm opacity-90">{statusInfo.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" className="gap-2">
                            <Printer className="h-4 w-4" />
                            Imprimir
                          </Button>
                          <Button variant="secondary" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
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
                        {verificationResult.lot.variety && (
                          <Badge variant="secondary">{verificationResult.lot.variety}</Badge>
                        )}
                        {verificationResult.lot.quality_grade && (
                          <Badge className={getSemaphoreColor(verificationResult.lot.quality_grade)}>
                            {verificationResult.lot.quality_grade}
                          </Badge>
                        )}
                        {verificationResult.lot.status === 'exported' && (
                          <Badge className="bg-success text-success-foreground">
                            <Package className="mr-1 h-3 w-3" /> Exportado
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">Lote de Café</CardTitle>
                      <CardDescription className="font-mono text-base">
                        {verificationResult.lot.lot_code}
                      </CardDescription>
                    </div>
                    <QRCodeSVG
                      value={`${window.location.origin}/verificar/cafe/${verificationResult.lot.lot_code}`}
                      size={80}
                      level="H"
                      className="rounded border border-border p-1"
                    />
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Detalhes</TabsTrigger>
                        <TabsTrigger value="origin">Origem</TabsTrigger>
                        <TabsTrigger value="export">Exportação</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="details" className="mt-4 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Coffee className="h-4 w-4" />
                              Variedade
                            </div>
                            <p className="mt-1 text-lg font-semibold">
                              {verificationResult.lot.variety || "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Package className="h-4 w-4" />
                              Volume
                            </div>
                            <p className="mt-1 text-lg font-semibold">
                              {verificationResult.lot.volume_kg.toLocaleString()} kg
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Award className="h-4 w-4" />
                              Classificação
                            </div>
                            <p className="mt-1 text-lg font-semibold">
                              {verificationResult.lot.quality_grade || "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              Colheita
                            </div>
                            <p className="mt-1 text-lg font-semibold">
                              {verificationResult.lot.harvest_season || ""} {verificationResult.lot.harvest_year || "—"}
                            </p>
                          </div>
                        </div>
                        {verificationResult.lot.processing_method && (
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              Método de Processamento
                            </div>
                            <p className="mt-1 font-semibold">
                              {verificationResult.lot.processing_method}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="origin" className="mt-4 space-y-4">
                        <div className="rounded-lg bg-muted/50 p-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            Localização de Origem
                          </div>
                          <p className="mt-2 text-lg font-semibold">
                            {verificationResult.lot.origin_municipality?.name || "—"}
                          </p>
                          <p className="text-muted-foreground">
                            {verificationResult.lot.origin_province?.name || "—"}
                          </p>
                        </div>
                        {verificationResult.lot.registered_at && (
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              Data de Registo
                            </div>
                            <p className="mt-1 font-semibold">
                              {new Date(verificationResult.lot.registered_at).toLocaleDateString('pt-AO')}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="export" className="mt-4 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Truck className="h-4 w-4" />
                              Exportador
                            </div>
                            <p className="mt-1 text-lg font-semibold">
                              {verificationResult.lot.exporter_name || "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              País de Destino
                            </div>
                            <p className="mt-1 text-lg font-semibold">
                              {verificationResult.lot.destination_country || "—"}
                            </p>
                          </div>
                        </div>
                        {verificationResult.lot.dispatched_at && (
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              Data de Despacho
                            </div>
                            <p className="mt-1 font-semibold">
                              {new Date(verificationResult.lot.dispatched_at).toLocaleDateString('pt-AO')}
                            </p>
                          </div>
                        )}
                        {verificationResult.lot.exported_at && (
                          <div className="rounded-lg bg-muted/50 p-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              Data de Exportação
                            </div>
                            <p className="mt-1 font-semibold">
                              {new Date(verificationResult.lot.exported_at).toLocaleDateString('pt-AO')}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Lote Não Encontrado</h3>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    O código <span className="font-mono font-bold">{searchCode}</span> não foi encontrado no sistema.
                    Verifique se o código está correto e tente novamente.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={clearSearch}>
                    Tentar Novamente
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recent Verifications & Quick Links */}
        {!verificationResult && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verificações Recentes</CardTitle>
                <CardDescription>
                  Últimas consultas realizadas nesta sessão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentVerifications.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchCode(item.code);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Coffee className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium">{item.code}</p>
                          <p className="text-xs text-muted-foreground">{item.variety}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.status === "valid" && (
                          <Badge variant="outline" className="border-success text-success">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Válido
                          </Badge>
                        )}
                        {item.status === "pending" && (
                          <Badge variant="outline" className="border-warning text-warning">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Pendente
                          </Badge>
                        )}
                        {item.status === "invalid" && (
                          <Badge variant="outline" className="border-destructive text-destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inválido
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acesso Rápido</CardTitle>
                <CardDescription>
                  Outras funcionalidades do módulo Café
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/cafe/lotes" className="block">
                    <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Gestão de Lotes</p>
                        <p className="text-sm text-muted-foreground">
                          Consulte e gerencie todos os lotes registados
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link to="/cafe/semaforizacao" className="block">
                    <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                        <Shield className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Semaforização</p>
                        <p className="text-sm text-muted-foreground">
                          Sistema de classificação de qualidade
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link to="/cafe/rastreio" className="block">
                    <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                        <Truck className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Rastreabilidade</p>
                        <p className="text-sm text-muted-foreground">
                          Timeline completo do lote
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link to="/verificar/cafe" target="_blank" className="block">
                    <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <ExternalLink className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Portal Público</p>
                        <p className="text-sm text-muted-foreground">
                          Verificação pública de lotes
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats */}
        {!verificationResult && (
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coffeeLots?.filter(l => l.status === 'exported').length || 0}</p>
                  <p className="text-sm text-muted-foreground">Lotes Exportados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coffeeLots?.filter(l => l.status === 'pending').length || 0}</p>
                  <p className="text-sm text-muted-foreground">Em Processamento</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coffeeLots?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total de Lotes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                  <Award className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {coffeeLots?.filter(l => l.quality_grade?.toLowerCase().includes('specialty')).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Specialty Grade</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CoffeeVerificationPage;
