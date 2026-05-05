import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'sigaflo:pwa-install-dismissed';

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Não mostrar dentro de iframe (preview Lovable)
    try { if (window.self !== window.top) return; } catch { return; }
    // Já instalado?
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Dispensado recentemente (7 dias)?
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 3600 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setVisible(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm p-4 shadow-lg border-primary/20">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Instalar SIGAFLO</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Acesse o sistema mesmo sem internet. Instale no seu dispositivo.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={install}>Instalar</Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>Agora não</Button>
          </div>
        </div>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
