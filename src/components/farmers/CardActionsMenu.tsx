import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  MoreHorizontal, Eye, Printer, ScanLine, History, Bell, RefreshCw, XCircle, QrCode,
} from 'lucide-react';
import { useRevokeCard, useRegenerateQR } from '@/hooks/useFarmerCards';
import { useCreateNotification } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface Props {
  farmerId: string;
  farmerName: string;
  card?: { id: string; serial?: string; qr_token?: string; card_status?: string } | null;
  onPrint: () => void;
  onShowHistory: () => void;
}

export default function CardActionsMenu({ farmerId, farmerName, card, onPrint, onShowHistory }: Props) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [reason, setReason] = useState('');
  const revoke = useRevokeCard();
  const regenerate = useRegenerateQR();
  const createNotification = useCreateNotification();

  const verifyUrl = card?.qr_token ? `/verificacao/${card.qr_token}` : null;

  const handleNotify = async () => {
    if (!card) return;
    try {
      await createNotification.mutateAsync({
        title: `Cartão ${card.serial ?? ''} actualizado`,
        message: `O cartão SIGAFLO de ${farmerName} encontra-se no estado "${card.card_status}".`,
        type: 'info',
        category: 'farmers',
      } as any);
      toast.success('Notificação criada');
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao notificar');
    }
  };

  const handleRegenerate = async () => {
    if (!card) return;
    if (!confirm('Regenerar o QR invalida o cartão físico anterior. Continuar?')) return;
    await regenerate.mutateAsync({ cardId: card.id, farmerId });
  };

  const handleRevoke = async () => {
    if (!card) return;
    if (!reason.trim()) { toast.error('Indique o motivo'); return; }
    await revoke.mutateAsync({ cardId: card.id, reason, farmerId });
    setRevokeOpen(false);
    setReason('');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background z-50">
          <DropdownMenuLabel className="truncate">{farmerName}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to={`/agricultores/${farmerId}`}><Eye className="mr-2 h-4 w-4" /> Ver perfil</Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onPrint} disabled={!card}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir cartão
          </DropdownMenuItem>

          <DropdownMenuItem disabled={!verifyUrl} asChild>
            {verifyUrl ? (
              <a href={verifyUrl} target="_blank" rel="noreferrer">
                <ScanLine className="mr-2 h-4 w-4" /> Verificar QR público
              </a>
            ) : (
              <span><ScanLine className="mr-2 h-4 w-4" /> Verificar QR público</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onShowHistory}>
            <History className="mr-2 h-4 w-4" /> Histórico de eventos
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleNotify} disabled={!card || createNotification.isPending}>
            <Bell className="mr-2 h-4 w-4" /> Notificar agricultor
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleRegenerate} disabled={!card || regenerate.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" /> Regenerar QR
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setRevokeOpen(true)}
            disabled={!card || card.card_status === 'revogado'}
            className="text-destructive focus:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" /> Revogar cartão
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar cartão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção é irreversível. O cartão deixa de ser válido para verificação pública e POS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo da revogação (obrigatório)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-24"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revoke.isPending}>
              <QrCode className="mr-2 h-4 w-4" /> Confirmar revogação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
