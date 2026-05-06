import { ForestryModulePage } from '@/components/forestry/shared/ForestryModulePage';
import { useFieldCaptures } from '@/hooks/useForestryExtras';
import { Badge } from '@/components/ui/badge';
import { Fingerprint } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function FieldCapturesAuditPage() {
  const { data = [], isLoading, isError, error } = useFieldCaptures();
  return (
    <ForestryModulePage
      title="Auditoria de Capturas de Campo"
      subtitle="Registo imutável de capturas biométricas e NFC pelos dispositivos Companion"
      isLoading={isLoading} isError={isError} error={error} isEmpty={data.length === 0}
    >
      <Table>
        <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>GPS</TableHead><TableHead>Match</TableHead><TableHead>Operador</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell className="text-xs"><Fingerprint className="inline h-3 w-3 mr-1" />{format(new Date(c.captured_at), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
              <TableCell><Badge variant="outline">{c.capture_type}</Badge></TableCell>
              <TableCell className="font-mono text-xs">{c.latitude && c.longitude ? `${Number(c.latitude).toFixed(4)}, ${Number(c.longitude).toFixed(4)}` : '—'}</TableCell>
              <TableCell>{c.match_score != null ? `${c.match_score}%` : '—'}</TableCell>
              <TableCell className="font-mono text-xs">{c.operator_id ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ForestryModulePage>
  );
}
