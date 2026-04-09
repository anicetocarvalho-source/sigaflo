import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  farmerId: string;
}

export const FarmerPurchases = ({ farmerId }: Props) => {
  const { data: packages } = useQuery({
    queryKey: ['farmer-packages', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_packages')
        .select('*, purchase_package_items(*)')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: purchases } = useQuery({
    queryKey: ['farmer-purchases', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidized_purchases')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activePackage = packages?.find(p => p.status === 'active');
  const totalSubsidy = purchases?.reduce((s, p) => s + (p.subsidy_value || 0), 0) || 0;
  const totalCopay = purchases?.reduce((s, p) => s + (p.copayment_value || 0), 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-700">Aprovada</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700">Rejeitada</Badge>;
      case 'completed': return <Badge className="bg-blue-100 text-blue-700">Concluída</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{purchases?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Compras</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{totalSubsidy.toLocaleString('pt-AO')} AOA</p>
            <p className="text-sm text-muted-foreground">Valor Subsidiado (70%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{totalCopay.toLocaleString('pt-AO')} AOA</p>
            <p className="text-sm text-muted-foreground">Copagamento (30%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Package */}
      {activePackage && (
        <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5" />Pacote Activo: {activePackage.campaign}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => toast.info('Pedido de reforço enviado')}>
              <RefreshCw className="mr-1 h-4 w-4" />Pedir Reforço
            </Button>
          </CardHeader>
          <CardContent>
            {activePackage.purchase_package_items?.length ? (
              <div className="space-y-3">
                {activePackage.purchase_package_items.map((item: any) => {
                  const used = purchases?.filter(p => p.product === item.product_id && ['approved', 'pending'].includes(p.status)).length || 0;
                  const pct = item.max_quantity > 0 ? (used / item.max_quantity) * 100 : 0;
                  return (
                    <div key={item.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.product_id}</span>
                        <span className="text-muted-foreground">{used}/{item.max_quantity}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Sem itens no pacote</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-5 w-5" />Historial de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!purchases?.length ? (
            <p className="text-center py-8 text-muted-foreground">Sem compras registadas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Subsídio</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString('pt-AO')}</TableCell>
                    <TableCell>{p.product}</TableCell>
                    <TableCell>{p.supplier || '—'}</TableCell>
                    <TableCell className="font-medium">{Number(p.total_value).toLocaleString('pt-AO')} AOA</TableCell>
                    <TableCell className="text-green-600">{Number(p.subsidy_value).toLocaleString('pt-AO')} AOA</TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
