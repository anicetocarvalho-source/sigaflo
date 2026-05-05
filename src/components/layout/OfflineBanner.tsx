import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Banner global persistente que aparece quando o dispositivo perde rede.
 * Permite ao utilizador navegar até /offline para ver o que está disponível.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const on = () => {
      setOnline(true);
      setDismissed(false);
    };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-destructive/30 bg-destructive text-destructive-foreground px-4 py-2 shadow-lg"
    >
      <div className="container max-w-6xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            Sem ligação à internet. As alterações ficam guardadas localmente e enviadas quando voltar
            online.
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button asChild size="sm" variant="secondary">
            <Link to="/offline">Ver opções</Link>
          </Button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dispensar"
            className="p-1 rounded hover:bg-destructive-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
