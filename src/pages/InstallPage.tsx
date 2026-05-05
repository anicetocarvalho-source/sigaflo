import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, Smartphone, Wifi, WifiOff, Share } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore — iOS
      window.navigator.standalone === true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferred(null);
  };

  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Instalar SIGAFLO</h1>
        <p className="text-muted-foreground">
          Instale o sistema no seu dispositivo para acesso rápido e funcionamento offline.
        </p>
      </div>

      {(isStandalone || installed) && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            SIGAFLO já está instalado neste dispositivo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <WifiOff className="h-6 w-6 mx-auto text-primary" />
            <p className="text-sm font-medium">Funciona offline</p>
            <p className="text-xs text-muted-foreground">Cadastros sincronizam quando houver rede</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <Wifi className="h-6 w-6 mx-auto text-primary" />
            <p className="text-sm font-medium">Mais rápido</p>
            <p className="text-xs text-muted-foreground">Recursos cacheados localmente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <Smartphone className="h-6 w-6 mx-auto text-primary" />
            <p className="text-sm font-medium">Como um app</p>
            <p className="text-xs text-muted-foreground">Ícone no ecrã inicial</p>
          </CardContent>
        </Card>
      </div>

      {!isStandalone && !installed && (
        <Card>
          <CardHeader>
            <CardTitle>Como instalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deferred && (
              <Button size="lg" onClick={install} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Instalar agora
              </Button>
            )}

            {isIOS && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">No iPhone / iPad (Safari):</p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>Toque no botão <Share className="inline h-4 w-4" /> <strong>Partilhar</strong> na barra inferior</li>
                  <li>Selecione <strong>"Adicionar ao Ecrã Principal"</strong></li>
                  <li>Confirme em <strong>"Adicionar"</strong></li>
                </ol>
              </div>
            )}

            {isAndroid && !deferred && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">No Android (Chrome):</p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>Abra o menu (⋮) no canto superior direito</li>
                  <li>Toque em <strong>"Instalar aplicação"</strong> ou <strong>"Adicionar ao ecrã inicial"</strong></li>
                  <li>Confirme em <strong>"Instalar"</strong></li>
                </ol>
              </div>
            )}

            {!isIOS && !isAndroid && !deferred && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">No computador (Chrome / Edge):</p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>Procure o ícone de instalação <Download className="inline h-4 w-4" /> na barra de endereço</li>
                  <li>Clique e confirme <strong>"Instalar"</strong></li>
                </ol>
                <p className="text-xs text-muted-foreground pt-2">
                  Caso não veja o botão, o app pode já estar instalado ou o navegador não suporta instalação.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
