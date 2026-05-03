import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreditCard, RefreshCw, ShieldX, Printer, PackageCheck, Sparkles, History } from 'lucide-react';
import {
  useActiveFarmerCard, useGenerateCard, useUpdateCardStatus, useRevokeCard, useRegenerateQR,
  useFarmerCardHistory, type CardStatus,
} from '@/hooks/useFarmerCards';
import type { Farmer } from '@/hooks/useFarmers';
import { format } from 'date-fns';
import { CardEligibilityPanel } from './CardEligibilityPanel';

const STATUS_LABELS: Record<CardStatus, string> = {
  rascunho: 'Rascunho', gerado: 'Gerado', impresso: 'Impresso', entregue: 'Entregue', revogado: 'Revogado',
};
const STATUS_COLORS: Record<CardStatus, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  gerado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  impresso: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  entregue: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  revogado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

interface Props { farmer: Farmer }

export const CardStatusBar = ({ farmer }: Props) => {
  const { data: card, isLoading } = useActiveFarmerCard(farmer.id);
  const { data: history } = useFarmerCardHistory(farmer.id);
  const generate = useGenerateCard();
  const updateStatus = useUpdateCardStatus();
  const revoke = useRevokeCard();
  const regenQR = useRegenerateQR();
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (isLoading) return null;

  const status = card?.card_status;
  const canPrint = status === 'gerado';
  const canDeliver = status === 'impresso';
  const canRevoke = card && status !== 'revogado';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Cartão de Identificação</div>
              {card ? (
                <div className="text-xs text-muted-foreground">
                  Série <span className="font-mono">{card.serial}</span> · v{card.version} ·
                  {' '}emitido {format(new Date(card.issued_at), 'dd/MM/yyyy')}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Sem cartão emitido</div>
              )}
            </div>
          </div>

          {status && (
            <Badge variant="secondary" className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {!card && (
              <Button size="sm" onClick={() => generate.mutate(farmer)} disabled={generate.isPending}>
                <Sparkles className="h-4 w-4" /> Gerar cartão
              </Button>
            )}
            {canPrint && (
              <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ cardId: card!.id, status: 'impresso', farmerId: farmer.id })}>
                <Printer className="h-4 w-4" /> Marcar impresso
              </Button>
            )}
            {canDeliver && (
              <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ cardId: card!.id, status: 'entregue', farmerId: farmer.id })}>
                <PackageCheck className="h-4 w-4" /> Marcar entregue
              </Button>
            )}
            {card && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4" /> Regenerar QR</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerar QR Code?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O QR atual deixará de funcionar. Cartões físicos já impressos terão de ser substituídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => regenQR.mutate({ cardId: card.id, farmerId: farmer.id })}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {canRevoke && (
              <Button size="sm" variant="destructive" onClick={() => setRevokeOpen(true)}>
                <ShieldX className="h-4 w-4" /> Revogar
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(true)}>
              <History className="h-4 w-4" /> Histórico
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <CardEligibilityPanel farmer={farmer} card={card} compact />
        </div>
      </CardContent>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar cartão</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Motivo da revogação</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: cartão perdido, dados desatualizados..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || revoke.isPending}
              onClick={async () => {
                await revoke.mutateAsync({ cardId: card!.id, reason: reason.trim(), farmerId: farmer.id });
                setRevokeOpen(false); setReason('');
              }}
            >Confirmar revogação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Histórico de cartões</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {(history ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sem cartões registados.</p>}
            {(history ?? []).map((c) => (
              <div key={c.id} className="border rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium font-mono">{c.serial}</div>
                  <Badge variant="secondary" className={STATUS_COLORS[c.card_status]}>{STATUS_LABELS[c.card_status]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  v{c.version} · emitido {format(new Date(c.issued_at), 'dd/MM/yyyy HH:mm')}
                  {c.revoked_at && <> · revogado {format(new Date(c.revoked_at), 'dd/MM/yyyy')}</>}
                </div>
                {c.revoked_reason && <div className="text-xs italic">Motivo: {c.revoked_reason}</div>}
                <div className="text-xs space-y-1">
                  {(c.events ?? []).map((e) => (
                    <div key={e.id} className="flex justify-between border-l-2 border-muted pl-2">
                      <span>{e.event_type}</span>
                      <span className="text-muted-foreground">{format(new Date(e.created_at), 'dd/MM HH:mm')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
