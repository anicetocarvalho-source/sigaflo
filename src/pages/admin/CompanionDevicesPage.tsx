import { ForestryModulePage } from '@/components/forestry/shared/ForestryModulePage';
import { useCompanionDevices } from '@/hooks/useForestryExtras';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function CompanionDevicesPage() {
  const { data = [], isLoading, isError, error } = useCompanionDevices();
  return (
    <ForestryModulePage
      title="Dispositivos Companion (Android)"
      subtitle="Equipamentos de campo com biometria e leitura NFC"
      isLoading={isLoading} isError={isError} error={error} isEmpty={data.length === 0}
    >
      <Table>
        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Serial</TableHead><TableHead>Capacidades</TableHead><TableHead>Último contacto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.map((d: any) => (
            <TableRow key={d.id}>
              <TableCell><Smartphone className="inline h-3 w-3 mr-1" />{d.device_name}</TableCell>
              <TableCell className="font-mono text-xs">{d.device_serial}</TableCell>
              <TableCell><div className="flex gap-1 flex-wrap">{(d.capabilities ?? []).map((c: string) => <Badge key={c} variant="outline">{c}</Badge>)}</div></TableCell>
              <TableCell>{d.last_seen_at ? format(new Date(d.last_seen_at), 'dd/MM/yyyy HH:mm') : '—'}</TableCell>
              <TableCell><Badge variant={d.status === 'active' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ForestryModulePage>
  );
}
