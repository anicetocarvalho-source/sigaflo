import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QrCode, Search, TreePine, Logs, Truck, CheckCircle, XCircle, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
}

interface ScanResult {
  type: 'tree' | 'log' | 'transport' | 'unknown';
  valid: boolean;
  data: Record<string, unknown> | null;
  message: string;
}

export function QRScanner({ open, onClose }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanning && open) {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        async (decodedText) => {
          scanner?.clear();
          setScanning(false);
          await verifyCode(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [scanning, open]);

  const verifyCode = async (code: string) => {
    setLoading(true);
    setResult(null);

    try {
      // Try to parse as JSON first
      let parsedData: Record<string, unknown> | null = null;
      let searchCode = code;

      try {
        parsedData = JSON.parse(code);
        searchCode = (parsedData?.code as string) || code;
      } catch {
        // Not JSON, use as-is
      }

      // Search for tree
      const { data: tree } = await supabase
        .from('forest_trees')
        .select('*')
        .eq('tree_code', searchCode)
        .maybeSingle();

      if (tree) {
        setResult({
          type: 'tree',
          valid: true,
          data: tree,
          message: `Árvore ${tree.tree_code} verificada com sucesso`,
        });
        setLoading(false);
        return;
      }

      // Search for log
      const { data: log } = await supabase
        .from('forest_logs')
        .select('*')
        .eq('log_code', searchCode)
        .maybeSingle();

      if (log) {
        setResult({
          type: 'log',
          valid: true,
          data: log,
          message: `Tora ${log.log_code} verificada com sucesso`,
        });
        setLoading(false);
        return;
      }

      // Search for transport permit
      const { data: permit } = await supabase
        .from('forest_transport_permits')
        .select('*')
        .eq('permit_number', searchCode)
        .maybeSingle();

      if (permit) {
        const now = new Date();
        const validUntil = new Date(permit.valid_until);
        const isValid = validUntil > now && permit.status !== 'cancelled';

        setResult({
          type: 'transport',
          valid: isValid,
          data: permit,
          message: isValid 
            ? `Guia ${permit.permit_number} válida` 
            : `Guia ${permit.permit_number} expirada ou cancelada`,
        });
        setLoading(false);
        return;
      }

      // Not found
      setResult({
        type: 'unknown',
        valid: false,
        data: null,
        message: 'Código não encontrado no sistema',
      });
    } catch (error) {
      toast.error('Erro ao verificar código');
      setResult({
        type: 'unknown',
        valid: false,
        data: null,
        message: 'Erro ao verificar código',
      });
    }

    setLoading(false);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      verifyCode(manualCode.trim());
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tree': return <TreePine className="h-6 w-6" />;
      case 'log': return <Logs className="h-6 w-6" />;
      case 'transport': return <Truck className="h-6 w-6" />;
      default: return <QrCode className="h-6 w-6" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Verificação de QR Code
          </DialogTitle>
          <DialogDescription>
            Leia um código QR ou introduza o código manualmente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner */}
          {scanning ? (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setScanning(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar Scanner
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full"
              onClick={() => setScanning(true)}
            >
              <Camera className="mr-2 h-4 w-4" />
              Abrir Câmara
            </Button>
          )}

          {/* Manual input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleManualSearch} className="flex gap-2">
            <Input
              placeholder="Código da árvore, tora ou guia..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Result */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}

          {result && (
            <Card className={result.valid ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/50 bg-destructive/5'}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${result.valid ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                    {result.valid ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(result.type)}
                      <Badge variant={result.valid ? 'default' : 'destructive'}>
                        {result.type === 'tree' ? 'Árvore' : 
                         result.type === 'log' ? 'Tora' : 
                         result.type === 'transport' ? 'Guia' : 'Desconhecido'}
                      </Badge>
                    </div>
                    <p className={`font-medium ${result.valid ? 'text-green-700' : 'text-destructive'}`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <div className="mt-3 text-sm text-muted-foreground space-y-1">
                        {result.type === 'tree' && (
                          <>
                            <p>Espécie: {(result.data as Record<string, unknown>).species as string}</p>
                            <p>Estado: {(result.data as Record<string, unknown>).status as string}</p>
                          </>
                        )}
                        {result.type === 'log' && (
                          <>
                            <p>Espécie: {(result.data as Record<string, unknown>).species as string}</p>
                            <p>Volume: {(result.data as Record<string, unknown>).volume_m3 as number} m³</p>
                          </>
                        )}
                        {result.type === 'transport' && (
                          <>
                            <p>Motorista: {(result.data as Record<string, unknown>).driver_name as string}</p>
                            <p>Veículo: {(result.data as Record<string, unknown>).vehicle_plate as string}</p>
                            <p>Volume: {(result.data as Record<string, unknown>).total_volume_m3 as number} m³</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
