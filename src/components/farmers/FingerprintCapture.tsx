import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FingerprintCaptureProps {
  value?: string | null;
  onChange: (data: string | null) => void;
  disabled?: boolean;
  userLabel?: string;
}

/**
 * Captura biométrica via WebAuthn (Touch ID / Face ID / Windows Hello / sensor Android).
 * O navegador delega ao autenticador da plataforma; nunca recebemos a digital crua.
 * Armazenamos apenas um identificador derivado do credentialId (hash) — suficiente
 * para auditoria e para reautenticar o mesmo dispositivo, sem expor biometria.
 */
export const FingerprintCapture = ({ value, onChange, disabled, userLabel }: FingerprintCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported =
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    !!navigator.credentials?.create;

  const toBase64Url = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const sha256Hex = async (input: string) => {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const captureFingerprint = async () => {
    setError(null);

    if (!supported) {
      const msg = 'O dispositivo/navegador não suporta leitor biométrico (WebAuthn).';
      setError(msg);
      toast({ title: 'Biometria indisponível', description: msg, variant: 'destructive' });
      return;
    }

    setIsCapturing(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'SIGAFLO' },
          user: {
            id: userId,
            name: userLabel || `agricultor-${Date.now()}`,
            displayName: userLabel || 'Agricultor SIGAFLO',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },   // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false,
          },
          timeout: 60000,
          attestation: 'none',
        },
      })) as PublicKeyCredential | null;

      if (!credential) throw new Error('Nenhuma credencial devolvida');

      const credId = toBase64Url(credential.rawId);
      const hash = (await sha256Hex(credId)).slice(0, 24).toUpperCase();
      onChange(`FP-${hash}`);
      toast({ title: 'Biometria capturada', description: 'Leitor biométrico validado com sucesso.' });
    } catch (err: any) {
      const name = err?.name || '';
      let msg = 'Não foi possível ler a biometria.';
      if (name === 'NotAllowedError') msg = 'Captura cancelada ou negada pelo utilizador.';
      else if (name === 'SecurityError') msg = 'Origem insegura — biometria requer HTTPS.';
      else if (name === 'NotSupportedError') msg = 'Este dispositivo não tem leitor biométrico compatível.';
      else if (name === 'InvalidStateError') msg = 'Esta biometria já está registada neste dispositivo.';
      setError(msg);
      toast({ title: 'Erro de captura', description: msg, variant: 'destructive' });
    } finally {
      setIsCapturing(false);
    }
  };

  const clearFingerprint = () => {
    onChange(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Impressão Digital</label>

      <div
        className={`relative p-6 rounded-lg border-2 transition-all ${
          value
            ? 'border-green-500 bg-green-500/5'
            : 'border-dashed border-muted-foreground/25 bg-muted/50'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              value ? 'bg-green-500/20' : 'bg-muted'
            }`}
          >
            {value ? (
              <Check className="h-8 w-8 text-green-500" />
            ) : (
              <Fingerprint
                className={`h-8 w-8 ${
                  isCapturing ? 'text-primary animate-pulse' : 'text-muted-foreground'
                }`}
              />
            )}
          </div>

          {value ? (
            <div className="text-center">
              <p className="text-sm font-medium text-green-600">Impressão Digital Capturada</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono break-all">{value}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              {isCapturing
                ? 'Aguardando leitor biométrico do dispositivo...'
                : 'Nenhuma impressão digital capturada'}
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs text-destructive max-w-xs text-center">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!disabled && (
            <div className="flex gap-2 mt-2">
              {value ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={captureFingerprint}
                    disabled={isCapturing || !supported}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recapturar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearFingerprint}>
                    Limpar
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={captureFingerprint}
                  disabled={isCapturing || !supported}
                >
                  <Fingerprint className="h-4 w-4 mr-2" />
                  {isCapturing ? 'A capturar...' : 'Capturar Impressão'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Usa o leitor biométrico do dispositivo (Touch ID, Face ID, Windows Hello ou sensor Android)
        via WebAuthn. A digital nunca sai do dispositivo — apenas um identificador seguro é
        guardado.
      </p>
    </div>
  );
};
