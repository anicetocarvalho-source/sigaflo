import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  Trees,
  TreePine,
  Shield,
  Axe,
  Sprout,
  Leaf,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

const forestTypeLabels: Record<string, string> = {
  tropical_humid: 'Tropical Húmida',
  tropical_dry: 'Tropical Seca',
  miombo: 'Miombo',
  mangrove: 'Mangal',
  plantation: 'Plantação',
  gallery: 'Galeria',
};

const forestTypeColors: Record<string, string> = {
  tropical_humid: 'bg-green-600',
  tropical_dry: 'bg-amber-600',
  miombo: 'bg-emerald-600',
  mangrove: 'bg-cyan-600',
  plantation: 'bg-lime-600',
  gallery: 'bg-teal-600',
};

const forestStatusLabels: Record<string, string> = {
  exploitation: 'Exploração',
  conservation: 'Conservação',
  protection: 'Protecção',
  restoration: 'Restauração',
};

const forestStatusColors: Record<string, string> = {
  exploitation: 'bg-orange-100 text-orange-700',
  conservation: 'bg-green-100 text-green-700',
  protection: 'bg-blue-100 text-blue-700',
  restoration: 'bg-purple-100 text-purple-700',
};

const forestStatusIcons: Record<string, React.ReactNode> = {
  exploitation: <Axe className="h-3 w-3" />,
  conservation: <Shield className="h-3 w-3" />,
  protection: <TreePine className="h-3 w-3" />,
  restoration: <Sprout className="h-3 w-3" />,
};

function useInventoryItem(id: string | undefined) {
  return useQuery({
    queryKey: ['forest-inventory-item', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forest_inventory')
        .select('*, provinces(name), municipalities(name)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}

export default function InventoryProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading } = useInventoryItem(id);

  return (
    <MainLayout
      title="Perfil da Concessão"
      subtitle="Detalhes do inventário florestal"
    >
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/florestal/inventario')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Inventário
        </Button>

        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : !item ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Concessão não encontrada.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Trees className="h-6 w-6 text-primary" />
                      {item.concession_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {item.inventory_code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${forestTypeColors[item.forest_type]} text-white`}>
                      {forestTypeLabels[item.forest_type] || item.forest_type}
                    </Badge>
                    <Badge className={forestStatusColors[item.forest_status]}>
                      <span className="flex items-center gap-1">
                        {forestStatusIcons[item.forest_status]}
                        {forestStatusLabels[item.forest_status] || item.forest_status}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Província</Label>
                    <p className="font-medium">{item.provinces?.name || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Município</Label>
                    <p className="font-medium">{item.municipalities?.name || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Última Vistoria</Label>
                    <p className="font-medium">
                      {item.last_inventory_date
                        ? new Date(item.last_inventory_date).toLocaleDateString('pt-PT')
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado de Exploração</Label>
                    <p className="font-medium capitalize">{item.exploitation_status || '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{item.total_area_ha?.toLocaleString() || '—'}</p>
                    <p className="text-sm text-muted-foreground">Área Total (ha)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {item.estimated_standing_volume_m3?.toLocaleString() || '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">Volume Estimado (m³)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {item.harvestable_volume_m3?.toLocaleString() || '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">Volume Explorável (m³)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {item.harvested_volume_m3?.toLocaleString() || '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">Volume Colhido (m³)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {item.annual_allowable_cut_m3?.toLocaleString() || '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">Corte Anual Permitido (m³)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {item.reposition_rate_pct?.toFixed(1) || '—'}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taxa de Reposição</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Taxa de Reposição</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-2xl font-bold ${
                          (item.reposition_rate_pct || 0) < 50
                            ? 'text-destructive'
                            : 'text-green-600'
                        }`}
                      >
                        {item.reposition_rate_pct?.toFixed(1) || 0}%
                      </span>
                      {(item.reposition_rate_pct || 0) < 50 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Atenção Necessária
                        </Badge>
                      )}
                    </div>
                    <Progress
                      value={item.reposition_rate_pct || 0}
                      className={`h-3 ${
                        (item.reposition_rate_pct || 0) < 50
                          ? '[&>div]:bg-destructive'
                          : '[&>div]:bg-green-600'
                      }`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Árvores Plantadas: {item.trees_planted?.toLocaleString() || '—'}</span>
                      <span>Árvores Requeridas: {item.trees_required?.toLocaleString() || '—'}</span>
                    </div>
                  </div>
                </div>

                {item.dominant_species?.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Espécies Dominantes</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.dominant_species.map((species: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          <Leaf className="h-3 w-3 mr-1" />
                          {species}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {item.latitude && item.longitude && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {Number(item.latitude).toFixed(6)}, {Number(item.longitude).toFixed(6)}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
