import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  farmerId: string;
}

const PHASES = [
  'Preparação do Solo',
  'Sementeira',
  'Germinação',
  'Crescimento Vegetativo',
  'Floração',
  'Frutificação',
  'Maturação',
  'Colheita',
  'Pós-Colheita',
  'Comercialização',
];

const CROPS = ['Milho', 'Mandioca', 'Feijão', 'Arroz', 'Café', 'Banana', 'Batata-doce', 'Amendoim', 'Soja'];

export const FarmerCampaigns = ({ farmerId }: Props) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ crop: '', start_date: '', expected_harvest: '' });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['farmer-campaigns', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_campaigns')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('farmer_campaigns').insert({
        farmer_id: farmerId,
        crop: form.crop,
        start_date: form.start_date || new Date().toISOString().split('T')[0],
        expected_harvest: form.expected_harvest || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-campaigns', farmerId] });
      toast.success('Campanha criada');
      setOpen(false);
      setForm({ crop: '', start_date: '', expected_harvest: '' });
    },
    onError: () => toast.error('Erro ao criar campanha'),
  });

  const advancePhaseMutation = useMutation({
    mutationFn: async (campaign: { id: string; current_phase: number; total_phases: number }) => {
      const newPhase = campaign.current_phase + 1;
      const updates: Record<string, unknown> = { current_phase: newPhase };
      if (newPhase >= campaign.total_phases) updates.status = 'completed';
      const { error } = await supabase.from('farmer_campaigns').update(updates).eq('id', campaign.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-campaigns', farmerId] });
      toast.success('Fase avançada');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />Campanhas Produtivas
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Nova Campanha</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Iniciar Campanha</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Cultura *</Label>
                <Select value={form.crop} onValueChange={v => setForm(f => ({ ...f, crop: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cultura" /></SelectTrigger>
                  <SelectContent>{CROPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div>
                  <Label>Colheita Prevista</Label>
                  <Input type="date" value={form.expected_harvest} onChange={e => setForm(f => ({ ...f, expected_harvest: e.target.value }))} />
                </div>
              </div>
              <Button disabled={!form.crop || createMutation.isPending} onClick={() => createMutation.mutate()} className="w-full">
                {createMutation.isPending ? 'Criando...' : 'Iniciar Campanha'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Carregando...</p>
      ) : !campaigns?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">Nenhuma campanha registada</p>
          </CardContent>
        </Card>
      ) : (
        campaigns.map(c => (
          <Card key={c.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.crop}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(c.status)}>
                    {c.status === 'in_progress' ? 'Em Curso' : c.status === 'completed' ? 'Concluída' : 'Cancelada'}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-mono">
                    Fase {c.current_phase}/{c.total_phases}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={(c.current_phase / c.total_phases) * 100} className="h-2" />
              <div className="flex flex-wrap gap-1">
                {PHASES.map((phase, i) => (
                  <Badge
                    key={i}
                    variant={i < c.current_phase ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {i + 1}. {phase}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Início: {c.start_date ? new Date(c.start_date).toLocaleDateString('pt-AO') : '—'}</span>
                <span>Colheita: {c.expected_harvest ? new Date(c.expected_harvest).toLocaleDateString('pt-AO') : '—'}</span>
              </div>
              {c.status === 'in_progress' && c.current_phase < c.total_phases && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => advancePhaseMutation.mutate(c)}
                  disabled={advancePhaseMutation.isPending}
                >
                  <ChevronRight className="mr-1 h-4 w-4" />
                  Avançar para: {PHASES[c.current_phase] || 'Próxima'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
