import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ForceUpdateButtonProps {
  className?: string;
  variant?: 'sidebar' | 'inline';
}

/**
 * Botão "Forçar atualização" — pede ao Service Worker para procurar nova versão,
 * limpa todas as caches e recarrega a página, garantindo que a PWA mostra
 * imediatamente o build mais recente.
 */
export function ForceUpdateButton({ className, variant = 'sidebar' }: ForceUpdateButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleForceUpdate = async () => {
    if (busy) return;
    setBusy(true);
    const t = toast.loading('A procurar nova versão…');
    try {
      // 1. Limpa todas as caches do Cache Storage (Workbox)
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // 2. Força o SW a verificar e activar nova versão
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          regs.map(async (reg) => {
            try {
              await reg.update();
              if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
            } catch {
              /* ignore */
            }
          }),
        );
      }

      toast.success('A recarregar com a versão mais recente…', { id: t });

      // 3. Reload forçado (bypass HTTP cache)
      setTimeout(() => {
        // @ts-ignore — forceReload é não-standard mas suportado em alguns browsers
        window.location.reload();
      }, 600);
    } catch (err) {
      console.error('[force-update] falhou:', err);
      toast.error('Não foi possível forçar a atualização', { id: t });
      setBusy(false);
    }
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleForceUpdate}
        disabled={busy}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50',
          className,
        )}
      >
        <RefreshCw className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
        {busy ? 'A atualizar…' : 'Forçar atualização'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleForceUpdate}
      disabled={busy}
      title="Limpar caches e carregar a versão mais recente"
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-50',
        className,
      )}
    >
      <RefreshCw className={cn('h-4 w-4', busy && 'animate-spin')} />
      {busy ? 'A atualizar…' : 'Forçar atualização'}
    </button>
  );
}
