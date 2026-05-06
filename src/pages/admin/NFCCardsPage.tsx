import { ForestryModulePage } from '@/components/forestry/shared/ForestryModulePage';
import { useOperatorNFCCards } from '@/hooks/useForestryExtras';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  active: 'bg-green-600', revoked: 'bg-red-600', lost: 'bg-amber-600', replaced: 'bg-blue-600', expired: 'bg-muted',
};

export default function NFCCardsPage() {
  const { data = [], isLoading, isError, error } = useOperatorNFCCards();
  return (
    <ForestryModulePage
      title="Cartões NFC de Operadores"
      subtitle="Identificação física dos operadores florestais"
      isLoading={isLoading} isError={isError} error={error} isEmpty={data.length === 0}
    >
      <Table>
        <TableHeader><TableRow><TableHead>UID</TableHead><TableHead>Operador</TableHead><TableHead>Emitido</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs"><CreditCard className="inline h-3 w-3 mr-1" />{c.nfc_uid}</TableCell>
              <TableCell>{c.forest_operators?.name ?? '—'}</TableCell>
              <TableCell>{format(new Date(c.issued_at), 'dd/MM/yyyy')}</TableCell>
              <TableCell><Badge className={statusColor[c.status]}>{c.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ForestryModulePage>
  );
}
