import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Check, RefreshCw } from 'lucide-react';

interface FingerprintCaptureProps {
  value?: string | null;
  onChange: (data: string | null) => void;
  disabled?: boolean;
}

export const FingerprintCapture = ({ value, onChange, disabled }: FingerprintCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);

  // Simulated fingerprint capture - in production this would integrate with a real device
  const captureFingerprint = async () => {
    setIsCapturing(true);
    
    // Simulate device communication delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a simulated fingerprint hash
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const simulatedHash = `FP-${timestamp}-${randomPart}`.toUpperCase();
    
    onChange(simulatedHash);
    setIsCapturing(false);
  };

  const clearFingerprint = () => {
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Impressão Digital</label>
      
      <div className={`
        relative p-6 rounded-lg border-2 transition-all
        ${value 
          ? 'border-green-500 bg-green-500/5' 
          : 'border-dashed border-muted-foreground/25 bg-muted/50'
        }
      `}>
        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${value ? 'bg-green-500/20' : 'bg-muted'}
          `}>
            {value ? (
              <Check className="h-8 w-8 text-green-500" />
            ) : (
              <Fingerprint className={`h-8 w-8 ${isCapturing ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            )}
          </div>
          
          {value ? (
            <div className="text-center">
              <p className="text-sm font-medium text-green-600">Impressão Digital Capturada</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{value}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              {isCapturing 
                ? 'A capturar... Coloque o dedo no sensor' 
                : 'Nenhuma impressão digital capturada'
              }
            </p>
          )}
          
          {!disabled && (
            <div className="flex gap-2 mt-2">
              {value ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={captureFingerprint}
                  disabled={isCapturing}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recapturar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={captureFingerprint}
                  disabled={isCapturing}
                >
                  <Fingerprint className="h-4 w-4 mr-2" />
                  {isCapturing ? 'A capturar...' : 'Capturar Impressão'}
                </Button>
              )}
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFingerprint}
                >
                  Limpar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Conecte um dispositivo de leitura biométrica para capturar a impressão digital.
      </p>
    </div>
  );
};
