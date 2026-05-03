import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFarmerCardHistory } from '@/hooks/useFarmerCards';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle2, Printer, Truck, XCircle, RefreshCw, Sparkles, ScanLine } from 'lucide-react';

const EVENT_META: Record<string, { label: string; icon: any; tone: string }> = {
  generated:      { label: 'Gerado',         icon: Sparkles,    tone: 'text-blue-600' },
  printed:        { label: 'Impresso',       icon: Printer,     tone: 'text-purple-600' },
  delivered:      { label: 'Entregue',       icon: Truck,       tone: 'text-green-600' },
  revoked:        { label: 'Revogado',       icon: XCircle,     tone: 'text-destructive' },
  reissued:       { label: 'Reemitido',      icon: RefreshCw,   tone: 'text-amber-600' },
  qr_regenerated: { label: 'QR regenerado',  icon: RefreshCw,   tone: 'text-amber-600' },
  scanned:        { label: 'QR verificado',  icon: ScanLine,    tone: 'text-muted-foreground' },
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  farmerId?: string;
  farmerName?: string;
}

export default function CardHistoryDrawer({ open, onOpenChange, farmerId, farmerName }: Props) {
  const { data: cards = [], isLoading } = useFarmerCardHistory(farmerId);
  const events = cards.flatMap((c: any) =>
    (c.events ?? []).map((e: any) => ({ ...e, serial: c.serial, card_status: c.card_status }))
  ).sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Histórico do cartão</SheetTitle>
          <SheetDescription>{farmerName ?? 'Agricultor'}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-3">
          {isLoading && <div className="text-sm text-muted-foreground py-6 text-center">A carregar...</div>}
          {!isLoading && events.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">Sem eventos registados.</div>
          )}
          <ol className="relative border-l border-border ml-3 space-y-4 py-2">
            {events.map((e: any) => {
              const meta = EVENT_META[e.event_type] ?? { label: e.event_type, icon: CheckCircle2, tone: 'text-muted-foreground' };
              const Icon = meta.icon;
              return (
                <li key={e.id} className="ml-6">
                  <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border ${meta.tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{meta.label}</Badge>
                    {e.serial && <span className="text-xs font-mono text-muted-foreground">{e.serial}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(e.created_at), "dd 'de' MMMM yyyy 'às' HH:mm", { locale: pt })}
                  </p>
                  {e.metadata && Object.keys(e.metadata).length > 0 && (
                    <pre className="mt-1 text-[10px] bg-muted/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(e.metadata, null, 2)}
                    </pre>
                  )}
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
