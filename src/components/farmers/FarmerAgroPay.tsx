import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface Props {
  farmerId: string;
  cultivatedAreaHa?: number;
}

export const FarmerAgroPay = ({ farmerId, cultivatedAreaHa }: Props) => {
  const { data: wallet } = useQuery({
    queryKey: ['farmer-wallet', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmer_wallets')
        .select('*')
        .eq('farmer_id', farmerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: sales } = useQuery({
    queryKey: ['farmer-sales', farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_sales')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const balance = wallet?.balance || 0;
  const limitPerHa = 50000; // AOA per ha
  const maxLimit = (cultivatedAreaHa || 0) * limitPerHa;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 text-center">
            <Wallet className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{balance.toLocaleString('pt-AO')} AOA</p>
            <p className="text-sm text-muted-foreground">Saldo Actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{maxLimit.toLocaleString('pt-AO')} AOA</p>
            <p className="text-sm text-muted-foreground">Limite ({cultivatedAreaHa?.toFixed(1) || 0} ha × {limitPerHa.toLocaleString()} AOA/ha)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{sales?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Transacções</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Transacções</CardTitle>
        </CardHeader>
        <CardContent>
          {!sales?.length ? (
            <p className="text-center py-8 text-muted-foreground">Sem transacções</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString('pt-AO')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1">
                        <ArrowDownRight className="h-3 w-3 text-destructive" />
                        {Number(s.total).toLocaleString('pt-AO')} AOA
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{Number(s.iva_total).toLocaleString('pt-AO')} AOA</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'completed' ? 'default' : 'secondary'}>{s.status}</Badge>
                    </TableCell>
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
