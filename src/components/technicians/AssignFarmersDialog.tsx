import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AssignFarmersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicianId: string;
  technicianName: string;
  onAssign: (farmerIds: string[]) => void;
  isAssigning: boolean;
}

export function AssignFarmersDialog({ open, onOpenChange, technicianId, technicianName, onAssign, isAssigning }: AssignFarmersDialogProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const { data: unassignedFarmers = [], isLoading } = useQuery({
    queryKey: ['unassigned_farmers', technicianId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmers')
        .select('id, name, registration_number, farmer_type, provinces(name)')
        .is('technician_id', null)
        .in('farmer_type', ['individual', 'family'])
        .order('name')
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = unassignedFarmers.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.registration_number?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssign = () => {
    onAssign(selected);
    setSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atribuir Agricultores a {technicianName}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou nº registo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[300px] border rounded-md p-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">A carregar...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum agricultor disponível</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((farmer: any) => (
                <label
                  key={farmer.id}
                  className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(farmer.id)}
                    onCheckedChange={() => toggle(farmer.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{farmer.name}</p>
                    <p className="text-xs text-muted-foreground">{farmer.registration_number}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {(farmer.provinces as any)?.name || '—'}
                  </Badge>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{selected.length} seleccionado(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleAssign} disabled={selected.length === 0 || isAssigning}>
              {isAssigning ? 'A atribuir...' : `Atribuir ${selected.length}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
