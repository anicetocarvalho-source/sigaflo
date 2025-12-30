import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, QrCode, Upload, Shield, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const QRScanner = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop?.();
      }
    };
  }, []);

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
          html5QrCode.stop();
          setIsScanning(false);
        },
        () => {}
      );
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("Não foi possível aceder à câmara. Verifique as permissões.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop?.();
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (code: string) => {
    setScanResult(code);
    toast.success("QR Code lido com sucesso!");
    
    // Parse and redirect based on code format
    setTimeout(() => {
      if (code.startsWith("CERT-")) {
        navigate(`/verificar/certificado/${code}`);
      } else if (code.startsWith("LIC-")) {
        navigate(`/verificar/licenca/${code}`);
      } else if (code.startsWith("CAFE-")) {
        navigate(`/verificar/cafe/${code}`);
      } else {
        navigate(`/verificar/resultado?code=${encodeURIComponent(code)}`);
      }
    }, 1000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader-file");
      
      const result = await html5QrCode.scanFile(file, true);
      handleScanSuccess(result);
    } catch (error) {
      console.error("Error scanning file:", error);
      toast.error("Não foi possível ler o QR Code da imagem.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanSuccess(manualCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/verificar">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-foreground">Escanear QR Code</h1>
                <p className="text-xs text-muted-foreground">Portal de Verificação SIGAFLO</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Scanner Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner de QR Code
            </CardTitle>
            <CardDescription>
              Aponte a câmara para o QR Code do documento para verificar a sua autenticidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scanResult ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <p className="text-lg font-medium text-foreground">Código detectado!</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{scanResult}</p>
                <p className="mt-4 text-sm text-muted-foreground">A redirecionar...</p>
              </div>
            ) : (
              <>
                <div 
                  id="qr-reader" 
                  className={`relative mx-auto overflow-hidden rounded-lg bg-muted ${isScanning ? 'h-[300px]' : 'h-0'}`}
                />
                <div id="qr-reader-file" className="hidden" />

                {!isScanning && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                      <QrCode className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Clique no botão abaixo para iniciar o scanner
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {isScanning ? (
                    <Button onClick={stopScanning} variant="outline" className="flex-1">
                      Parar Scanner
                    </Button>
                  ) : (
                    <Button onClick={startScanning} className="flex-1 bg-primary text-primary-foreground">
                      <Camera className="mr-2 h-4 w-4" />
                      Iniciar Câmara
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Carregar Imagem
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Manual Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inserir Código Manualmente</CardTitle>
            <CardDescription>
              Se preferir, pode digitar o código do documento directamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: CERT-2024-00123"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!manualCode.trim()}>
                Verificar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Verificação Segura</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Todos os documentos verificados são autenticados contra a base de dados oficial do SIGAFLO.
                A verificação é gratuita e instantânea.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRScanner;
